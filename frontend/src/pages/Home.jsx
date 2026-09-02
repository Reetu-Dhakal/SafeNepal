import { useEffect, useState } from 'react'

const API = 'http://localhost:8000'

function Home() {
  const [disasters, setDisasters] = useState([])
  const [news, setNews] = useState([])
  const [disasterNews, setDisasterNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [timeRange, setTimeRange] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchNews = (hours = 0, q = '') => {
    let url = `${API}/api/v1/news?limit=50`
    if (hours > 0) url += `&hours=${hours}`
    if (q) url += `&q=${encodeURIComponent(q)}`
    return fetch(url).then((r) => (r.ok ? r.json() : { data: [] })).catch(() => ({ data: [] }))
  }

  const fetchDisasterNews = (hours = 0) => {
    let url = `${API}/api/v1/news/disaster?limit=50`
    if (hours > 0) url += `&hours=${hours}`
    return fetch(url).then((r) => (r.ok ? r.json() : { data: [] })).catch(() => ({ data: [] }))
  }

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/v1/disasters/active`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetchNews(),
      fetchDisasterNews(),
    ]).then(([d, n, dn]) => {
      setDisasters(Array.isArray(d) ? d : [])
      setNews(n.data || [])
      setDisasterNews(dn.data || [])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    fetchNews(timeRange, searchQuery).then((n) => setNews(n.data || []))
    fetchDisasterNews(timeRange).then((dn) => setDisasterNews(dn.data || []))
  }, [timeRange, searchQuery])

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
      const now = new Date()
      const diffMs = now - d
      const diffMin = Math.floor(diffMs / 60000)
      const diffHr = Math.floor(diffMs / 3600000)
      const diffDay = Math.floor(diffMs / 86400000)
      if (diffMin < 1) return 'Just now'
      if (diffMin < 60) return `${diffMin}m ago`
      if (diffHr < 24) return `${diffHr}h ago`
      if (diffDay < 7) return `${diffDay}d ago`
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">No active disasters.</div>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* News Section */}
      <section>
        {/* Header + Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">News Feed</h2>
            <p className="text-gray-500 text-sm">Live news from 15+ Nepali sources</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Time Range */}
            {[
              { label: 'All', val: 0 },
              { label: '1h', val: 1 },
              { label: '6h', val: 6 },
              { label: '24h', val: 24 },
              { label: '3d', val: 72 },
              { label: '7d', val: 168 },
            ].map(({ label, val }) => (
              <button
                key={val}
                onClick={() => setTimeRange(val)}
                className={`px-2 py-1 rounded text-xs font-medium transition ${
                  timeRange === val
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {label}
              </button>
            ))}

            {/* Tab Toggle */}
            {['all', 'disaster'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2 py-1 rounded text-xs font-medium transition ${
                  activeTab === tab
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {tab === 'all' ? 'All' : 'Disaster'}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* News List */}
        {(activeTab === 'all' ? news : disasterNews).length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Loading news...
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
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 hover:text-blue-600 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                      {item.summary}
                    </p>
                  </div>
                  <div className="flex flex-col items-end shrink-0 text-xs text-gray-400 gap-1">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {item.source}
                    </span>
                    <span>{formatDate(item.pubDate)}</span>
                    {item.disasterRelated && (
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
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