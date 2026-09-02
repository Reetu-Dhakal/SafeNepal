const Parser = require('rss-parser');
const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'SafeNepal/1.0',
    Accept: 'application/rss+xml, application/xml, text/xml',
  },
  customFields: {
    item: ['pubDate', 'dc:date', 'published', 'updated'],
  },
});

const NEWS_SOURCES = [
  // English
  { name: 'The Kathmandu Post', url: 'https://kathmandupost.com/feed', type: 'english' },
  { name: 'The Himalayan Times', url: 'https://www.thehimalayantimes.com/feed', type: 'english' },
  { name: 'Republica', url: 'https://www.myrepublica.com/feed', type: 'english' },
  { name: 'Nepal Times', url: 'https://www.nepaltimes.com/feed', type: 'english' },
  // Nepali
  { name: 'Setopati', url: 'https://www.setopati.com/feed', type: 'nepali' },
  { name: 'Kantipur Daily', url: 'https://kantipurdaily.com/rss', type: 'nepali' },
  { name: 'Online Khabar', url: 'https://www.onlinekhabar.com/feed', type: 'nepali' },
  { name: 'Ratopati', url: 'https://ratopati.com/feed', type: 'nepali' },
  { name: 'Nepal Khabar', url: 'https://nepalkhabar.com/feed', type: 'nepali' },
  { name: 'Gorkhapatra', url: 'https://www.gorkhapatraonline.com/feed', type: 'nepali' },
  { name: 'Annapurna Post', url: 'https://www.annapurnapost.com/feed', type: 'nepali' },
  { name: 'Ukera', url: 'https://www.ukera.com/feed', type: 'nepali' },
  { name: 'Aarthik News', url: 'https://www.aarthiknews.com/feed', type: 'nepali' },
  // Google News (Nepal) - has the most articles
  { name: 'Google News Nepal', url: 'https://news.google.com/rss/search?q=Nepal+disaster&hl=en&gl=NP&ceid=NP:en', type: 'english' },
  { name: 'Google News Nepal Nepali', url: 'https://news.google.com/rss/search?q=%E0%A4%A8%E0%A5%87%E0%A4%AA%E0%A4%BE%E0%A4%B2+%E0%A4%AC%E0%A4%BE%E0%A4%9D%E0%A5%80&hl=ne&gl=NP&ceid=NP:ne', type: 'nepali' },
  { name: 'Google News Earthquake', url: 'https://news.google.com/rss/search?q=Nepal+earthquake&hl=en&gl=NP&ceid=NP:en', type: 'english' },
  { name: 'Google News Flood', url: 'https://news.google.com/rss/search?q=Nepal+flood&hl=en&gl=NP&ceid=NP:en', type: 'english' },
  { name: 'Google News Landslide', url: 'https://news.google.com/rss/search?q=Nepal+landslide&hl=en&gl=NP&ceid=NP:en', type: 'english' },
  // RSS feeds for specific disaster topics
  { name: 'Google News Nepal Monsoon', url: 'https://news.google.com/rss/search?q=Nepal+monsoon+rain&hl=en&gl=NP&ceid=NP:en', type: 'english' },
  { name: 'Google News Nepal Rescue', url: 'https://news.google.com/rss/search?q=Nepal+rescue+relief&hl=en&gl=NP&ceid=NP:en', type: 'english' },
];

const DISASTER_KEYWORDS = [
  'flood', 'बाढी', 'earthquake', 'भूकम्प', 'earthquake', 'quake',
  'landslide', 'पहिरो', 'storm', 'तुफान', 'disaster', 'विपत्ति',
  'rain', 'वर्षा', 'heavy rain', 'मुसलधन वर्षा', 'cloudburst',
  'avalanche', 'हिमपहिरो', 'drought', 'खडेरी', 'fire', 'आगलागी',
  'tremor', 'कम्पन', 'casualties', 'मृत्यु', 'death toll',
  'rescue', 'उद्धार', 'relief', 'राहत', 'evacuate',
  'affected', 'प्रभावित', 'victim', 'पीडित', 'emergency',
  'monsoon', 'मनसुन', 'inundation', 'collapse', 'destroy',
  'kill', 'injure', 'घाइते', 'damage', 'क्षति',
  'devastation', '灾', 'tsunami', 'cyclone', 'typhoon',
  'mudslide', 'rockfall', 'avalanche', 'glacial lake',
  'GLOF', 'dam', 'breach', 'overflow', 'submerge',
  'missing', 'trapped', 'evacuation', 'shelter', 'displaced',
  'ndma', 'red cross', 'ifrc', 'un ocha',
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

async function fetchFromSource(source) {
  try {
    const feed = await parser.parseURL(source.url);
    const items = (feed.items || []).map((item) => {
      const pubDate = item.pubDate || item.isoDate || item['dc:date'] || item.published || item.updated || '';
      const parsed = parseDate(pubDate);
      return {
        title: item.title || '',
        link: item.link || '',
        summary: (item.contentSnippet || item.content || item.description || '').substring(0, 300),
        pubDate: parsed ? parsed.toISOString() : new Date().toISOString(),
        timestamp: parsed ? parsed.getTime() : Date.now(),
        source: source.name,
        sourceType: source.type,
        disasterRelated: isDisasterRelated(item.title, item.contentSnippet),
      };
    });
    return items;
  } catch (err) {
    console.warn(`[NEWS] Failed: ${source.name} - ${err.message}`);
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

  // Deduplicate by title similarity
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

module.exports = {
  fetchAllNews,
  fetchFromSource,
  filterByTimeRange,
  parseDate,
  NEWS_SOURCES,
  DISASTER_KEYWORDS,
};