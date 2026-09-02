const express = require('express');
const router = express.Router();
const { fetchAllNews, fetchDisasterNews, NEWS_SOURCES } = require('../../services/news');

let newsCache = null;
let lastFetched = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function getNews(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && newsCache && now - lastFetched < CACHE_TTL) {
    return newsCache;
  }
  newsCache = await fetchAllNews();
  lastFetched = now;
  return newsCache;
}

router.get('/', async (req, res) => {
  try {
    const force = req.query.refresh === 'true';
    const news = await getNews(force);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    res.json({
      total: news.length,
      page,
      limit,
      data: news.slice(offset, offset + limit),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news', message: err.message });
  }
});

router.get('/disaster', async (req, res) => {
  try {
    const force = req.query.refresh === 'true';
    const allNews = await getNews(force);
    const disasterNews = allNews.filter((n) => n.disasterRelated);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    res.json({
      total: disasterNews.length,
      page,
      limit,
      data: disasterNews.slice(offset, offset + limit),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch disaster news', message: err.message });
  }
});

router.get('/sources', (req, res) => {
  res.json(
    NEWS_SOURCES.map((s) => ({
      name: s.name,
      type: s.type,
    }))
  );
});

module.exports = router;