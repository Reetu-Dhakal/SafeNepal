const Parser = require('rss-parser');
const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'SafeNepal/1.0',
    Accept: 'application/rss+xml, application/xml, text/xml',
  },
});

const NEWS_SOURCES = [
  {
    name: 'The Kathmandu Post',
    url: 'https://kathmandupost.com/feed',
    type: 'english',
  },
  {
    name: 'The Himalayan Times',
    url: 'https://www.thehimalayantimes.com/feed',
    type: 'english',
  },
  {
    name: 'Setopati',
    url: 'https://www.setopati.com/feed',
    type: 'nepali',
  },
  {
    name: 'Kantipur Daily',
    url: 'https://kantipurdaily.com/rss',
    type: 'nepali',
  },
  {
    name: 'Online Khabar',
    url: 'https://www.onlinekhabar.com/feed',
    type: 'nepali',
  },
  {
    name: 'Ratopati',
    url: 'https://ratopati.com/feed',
    type: 'nepali',
  },
  {
    name: 'Nepal Khabar',
    url: 'https://nepalkhabar.com/feed',
    type: 'nepali',
  },
  {
    name: 'Gorkhapatra',
    url: 'https://www.gorkhapatraonline.com/feed',
    type: 'nepali',
  },
  {
    name: 'Republica',
    url: 'https://www.myrepublica.com/feed',
    type: 'english',
  },
  {
    name: 'Annnapurna Post',
    url: 'https://www.annapurnapost.com/feed',
    type: 'nepali',
  },
];

const DISASTER_KEYWORDS = [
  'flood', 'बाढी',
  'earthquake', 'भूकम्प',
  'landslide', 'पहिरो',
  'storm', 'तुफान',
  'disaster', 'विपत्ति',
  'rain', 'वर्षा',
  'heavy rain', 'मुसलधन वर्षा',
  'cloudburst', 'बादल फाट्ने',
  'avalanche', 'हिमपहिरो',
  'drought', 'खडेरी',
  'fire', 'आगलागी',
  'wind', 'हावा',
  'tremor', 'कम्पन',
  'casualties', 'मृत्यु',
  'death', 'मृत्यु',
  'damage', 'क्षति',
  'rescue', 'उद्धार',
  'relief', 'राहत',
  'evacuate', 'स्थानान्तरण',
  'affected', 'प्रभावित',
  'victim', 'पीडित',
  'emergency', 'आपतकाल',
  'red cross', 'रेडक्रस',
  'NDMA', 'राष्ट्रिय विपत्ति व्यवस्थापन प्राधिकरण',
  'nepal earthquake', 'नेपाल भूकम्प',
  'monsoon', 'मनसुन',
  'inundation', 'बाढी',
  'collapse', 'भत्किने',
  'damage', 'बिग्रने',
  'destroy', 'नष्ट',
  'kill', 'मार्ने',
  'injure', 'घाइते',
];

function isDisasterRelated(title, content) {
  const text = `${title || ''} ${content || ''}`.toLowerCase();
  return DISASTER_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

async function fetchFromSource(source) {
  try {
    const feed = await parser.parseURL(source.url);
    const items = (feed.items || []).map((item) => ({
      title: item.title || '',
      link: item.link || '',
      summary: item.contentSnippet || item.content || item.description || '',
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      source: source.name,
      sourceType: source.type,
      disasterRelated: isDisasterRelated(item.title, item.contentSnippet),
    }));
    return items;
  } catch (err) {
    console.warn(`Failed to fetch from ${source.name}: ${err.message}`);
    return [];
  }
}

async function fetchAllNews() {
  const results = await Promise.allSettled(
    NEWS_SOURCES.map((source) => fetchFromSource(source))
  );
  const allNews = results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  return allNews;
}

async function fetchDisasterNews() {
  const allNews = await fetchAllNews();
  return allNews.filter((item) => item.disasterRelated);
}

module.exports = {
  fetchAllNews,
  fetchDisasterNews,
  fetchFromSource,
  NEWS_SOURCES,
  DISASTER_KEYWORDS,
};