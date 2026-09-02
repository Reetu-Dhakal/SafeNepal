const Parser = require('rss-parser');
const https = require('https');
const http = require('http');

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'SafeNepal/1.0' },
  customFields: { item: ['pubDate', 'dc:date', 'published', 'updated'] },
});

const NEWS_SOURCES = [
  { name: 'The Kathmandu Post', url: 'https://kathmandupost.com/feed', type: 'english' },
  { name: 'Republica', url: 'https://www.myrepublica.com/feed', type: 'english' },
  { name: 'Setopati', url: 'https://www.setopati.com/feed', type: 'nepali' },
  { name: 'Online Khabar', url: 'https://www.onlinekhabar.com/feed', type: 'nepali' },
  { name: 'Ratopati', url: 'https://ratopati.com/feed', type: 'nepali' },
  { name: 'Nepal Khabar', url: 'https://nepalkhabar.com/feed', type: 'nepali' },
  { name: 'Google News Nepal', url: 'https://news.google.com/rss/search?q=Nepal+disaster&hl=en&gl=NP&ceid=NP:en', type: 'english' },
  { name: 'Google News Nepal Nepali', url: 'https://news.google.com/rss/search?q=%E0%A4%A8%E0%A5%87%E0%A4%AA%E0%A4%BE%E0%A4%B2+%E0%A4%AC%E0%A4%BE%E0%A4%9D%E0%A5%80&hl=ne&gl=NP&ceid=NP:ne', type: 'nepali' },
  { name: 'Google News Earthquake', url: 'https://news.google.com/rss/search?q=Nepal+earthquake&hl=en&gl=NP&ceid=NP:en', type: 'english' },
  { name: 'Google News Flood', url: 'https://news.google.com/rss/search?q=Nepal+flood&hl=en&gl=NP&ceid=NP:en', type: 'english' },
  { name: 'Google News Landslide', url: 'https://news.google.com/rss/search?q=Nepal+landslide&hl=en&gl=NP&ceid=NP:en', type: 'english' },
  { name: 'Google News Monsoon', url: 'https://news.google.com/rss/search?q=Nepal+monsoon+rain&hl=en&gl=NP&ceid=NP:en', type: 'english' },
  { name: 'Google News Rescue', url: 'https://news.google.com/rss/search?q=Nepal+rescue+relief&hl=en&gl=NP&ceid=NP:en', type: 'english' },
];

const DISASTER_KEYWORDS = [
  'flood', 'बाढी', 'earthquake', 'भूकम्प', 'landslide', 'पहिरो',
  'storm', 'तुफान', 'disaster', 'विपत्ति', 'rain', 'वर्षा',
  'cloudburst', 'avalanche', 'हिमपहिरो', 'drought', 'खडेरी',
  'fire', 'आगलागी', 'tremor', 'कम्पन', 'casualties', 'death toll',
  'rescue', 'उद्धार', 'relief', 'राहत', 'evacuate', 'affected',
  'प्रभावित', 'victim', 'पीडित', 'emergency', 'monsoon', 'मनसुन',
  'collapse', 'destroy', 'kill', 'injure', 'घाइते', 'damage', 'क्षति',
  'tsunami', 'cyclone', 'mudslide', 'GLOF', 'missing', 'trapped',
  'evacuation', 'shelter', 'displaced', 'ndma', 'red cross',
];

function isDisasterRelated(title, content) {
  const text = `${title || ''} ${content || ''}`.toLowerCase();
  return DISASTER_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function filterByTimeRange(articles, hours) {
  if (!hours) return articles;
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return articles.filter((a) => {
    const d = parseDate(a.pubDate);
    return d && d >= cutoff;
  });
}

function extractImage(item) {
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image')) return item.enclosure.url;
  if (item['media:content']?.['@_url']) return item['media:content']['@_url'];
  if (item['media:thumbnail']?.['@_url']) return item['media:thumbnail']['@_url'];
  const content = item.content || item['content:encoded'] || '';
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch) return imgMatch[1];
  return null;
}

function fetchOGImage(url) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), 8000);
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        clearTimeout(timeout);
        return fetchOGImage(res.headers.location).then(resolve);
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        clearTimeout(timeout);
        const patterns = [
          /property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
          /content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
          /name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
          /content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i,
        ];
        for (const pat of patterns) {
          const m = data.match(pat);
          if (m) return resolve(m[1]);
        }
        resolve(null);
      });
    }).on('error', () => { clearTimeout(timeout); resolve(null); });
  });
}

async function fetchFromSource(source) {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items || []).map((item) => {
      const pubDate = item.pubDate || item.isoDate || '';
      const parsed = parseDate(pubDate);
      return {
        title: item.title || '',
        link: item.link || '',
        summary: (item.contentSnippet || item.content || '').substring(0, 300),
        image: extractImage(item),
        pubDate: parsed ? parsed.toISOString() : new Date().toISOString(),
        timestamp: parsed ? parsed.getTime() : Date.now(),
        source: source.name,
        sourceType: source.type,
        disasterRelated: isDisasterRelated(item.title, item.contentSnippet),
      };
    });
  } catch (err) {
    console.warn(`[NEWS] Failed: ${source.name} - ${err.message}`);
    return [];
  }
}

async function fetchAllNews() {
  const results = await Promise.allSettled(
    NEWS_SOURCES.map((s) => fetchFromSource(s))
  );
  const allNews = results.filter((r) => r.status === 'fulfilled').flatMap((r) => r.value);

  const seen = new Set();
  const unique = allNews.filter((item) => {
    const key = item.title.toLowerCase().trim().substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort((a, b) => b.timestamp - a.timestamp);
  return unique;
}

async function enrichWithOGImages(articles, batchSize = 5) {
  const withoutImages = articles.filter((a) => !a.image && a.link);
  let fetched = 0;
  for (let i = 0; i < withoutImages.length && fetched < 20; i += batchSize) {
    const batch = withoutImages.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (article) => {
        const img = await fetchOGImage(article.link);
        if (img) {
          article.image = img;
          fetched++;
        }
      })
    );
  }
  return articles;
}

module.exports = {
  fetchAllNews,
  fetchFromSource,
  filterByTimeRange,
  enrichWithOGImages,
  fetchOGImage,
  parseDate,
  NEWS_SOURCES,
  DISASTER_KEYWORDS,
};