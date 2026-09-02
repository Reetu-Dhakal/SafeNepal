const express = require('express');
const router = express.Router();
const { fetchAllNews, NEWS_SOURCES } = require('../../services/news');

let newsCache = [];
let lastFetched = 0;
const CACHE_TTL = 5 * 60 * 1000;
let fetching = false;

async function refreshCache() {
  if (fetching) return;
  fetching = true;
  try {
    newsCache = await fetchAllNews();
    lastFetched = Date.now();
    console.log(`[NEWS] Fetched ${newsCache.length} articles`);
  } catch (err) {
    console.warn('[NEWS] Fetch failed:', err.message);
  } finally {
    fetching = false;
  }
}

refreshCache();
setInterval(refreshCache, CACHE_TTL);

router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  res.json({
    total: newsCache.length,
    page,
    limit,
    data: newsCache.slice(offset, offset + limit),
  });
});

router.get('/disaster', (req, res) => {
  const filtered = newsCache.filter((n) => n.disasterRelated);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  res.json({
    total: filtered.length,
    page,
    limit,
    data: filtered.slice(offset, offset + limit),
  });
});

router.get('/sources', (req, res) => {
  res.json(NEWS_SOURCES.map((s) => ({ name: s.name, type: s.type })));
});

router.post('/refresh', async (req, res) => {
  refreshCache();
  res.json({ message: 'Refresh triggered' });
});

module.exports = router;