import { useEffect, useState } from 'react'

function Home() {
  const [disasters, setDisasters] = useState([])
  const [news, setNews] = useState([])
  const [disasterNews, setDisasterNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const fetchJson = (url) =>
      fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null)

    Promise.all([
      fetchJson('/api/v1/disasters/active'),
      fetchJson('/api/v1/news?limit=30'),
      fetchJson('/api/v1/news/disaster?limit=20'),
    ]).then(([disasterData, newsData, disNewsData]) => {
      setDisasters(Array.isArray(disasterData) ? disasterData : [])
      setNews(newsData?.data || [])
      setDisasterNews(disNewsData?.data || [])
      setLoading(false)
    })
  }, [])

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch { return '' }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-500">Loading data...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Disaster Events */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Active Disasters</h2>
        <p className="text-gray-500 text-sm mb-4">Current disaster events across Nepal</p>
        {disasters.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No active disasters currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disasters.map(d => (
              <div key={d.id} className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg text-gray-800">{d.title}</h3>
                  <span className={`${getRiskColor(d.risk_level)} text-white text-xs px-2 py-1 rounded-full uppercase font-bold`}>
                    {d.risk_level}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{d.summary}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="capitalize font-medium">{d.disaster_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Risk Score:</span>
                    <span className="font-medium">{d.risk_score}/100</span>
                  </div>
                  {d.location && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Location:</span>
                      <span className="font-medium">{d.location.name}</span>
                    </div>
                  )}
                  {d.affected_people && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Affected:</span>
                      <span className="font-medium">{d.affected_people.toLocaleString()} people</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* News */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Latest News</h2>
            <p className="text-gray-500 text-sm">Real-time news from Nepali news sources</p>
          </div>
          <div className="flex gap-2">
            {['all', 'disaster'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {tab === 'all' ? 'All News' : 'Disaster Related'}
              </button>
            ))}
          </div>
        </div>

        {(activeTab === 'all' ? news : disasterNews).length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Loading news... Please wait.
          </div>
        ) : (
          <div className="space-y-3">
            {(activeTab === 'all' ? news : disasterNews).map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition border-l-4 border-blue-500"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 hover:text-blue-600">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                      {item.summary}
                    </p>
                  </div>
                  <div className="flex flex-col items-end shrink-0 text-xs text-gray-400">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mb-1">
                      {item.source}
                    </span>
                    <span>{formatDate(item.pubDate)}</span>
                    {item.disasterRelated && (
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full mt-1">
                        Disaster
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Home