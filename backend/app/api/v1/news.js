const express = require('express');
const router = express.Router();
const { fetchAllNews, filterByTimeRange, enrichWithOGImages, NEWS_SOURCES } = require('../../services/news');

let newsCache = [];
let lastFetched = 0;
const CACHE_TTL = 3 * 60 * 1000;
let fetching = false;
let enriching = false;

async function refreshCache() {
  if (fetching) return;
  fetching = true;
  try {
    newsCache = await fetchAllNews();
    lastFetched = Date.now();
    console.log(`[NEWS] Fetched ${newsCache.length} articles`);
    // Enrich with images in background
    enrichImages();
  } catch (err) {
    console.warn('[NEWS] Refresh failed:', err.message);
  } finally {
    fetching = false;
  }
}

async function enrichImages() {
  if (enriching) return;
  enriching = true;
  try {
    await enrichWithOGImages(newsCache);
    console.log(`[NEWS] Enriched with images`);
  } catch (err) {
    console.warn('[NEWS] Enrich failed:', err.message);
  } finally {
    enriching = false;
  }
}

refreshCache();
setInterval(refreshCache, CACHE_TTL);

router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const hours = parseInt(req.query.hours) || 0;
  const source = req.query.source || '';
  const disasterOnly = req.query.disaster === 'true';
  const search = (req.query.q || '').toLowerCase();

  let results = [...newsCache];
  if (hours > 0) results = filterByTimeRange(results, hours);
  if (disasterOnly) results = results.filter((n) => n.disasterRelated);
  if (source) results = results.filter((n) => n.source.toLowerCase().includes(source.toLowerCase()));
  if (search) results = results.filter((n) => n.title.toLowerCase().includes(search) || n.summary.toLowerCase().includes(search));

  const total = results.length;
  const offset = (page - 1) * limit;
  res.json({
    total,
    page,
    limit,
    hours: hours || 'all',
    cached: Date.now() - lastFetched < CACHE_TTL,
    enriching,
    data: results.slice(offset, offset + limit),
  });
});

router.get('/disaster', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const hours = parseInt(req.query.hours) || 0;

  let results = newsCache.filter((n) => n.disasterRelated);
  if (hours > 0) results = filterByTimeRange(results, hours);

  res.json({
    total: results.length,
    page,
    limit,
    hours: hours || 'all',
    data: results.slice((page - 1) * limit, (page - 1) * limit + limit),
  });
});

router.get('/sources', (req, res) => {
  res.json(NEWS_SOURCES.map((s) => ({ name: s.name, type: s.type })));
});

router.post('/refresh', async (req, res) => {
  await refreshCache();
  res.json({ message: 'Refreshed', total: newsCache.length });
});

module.exports = router;