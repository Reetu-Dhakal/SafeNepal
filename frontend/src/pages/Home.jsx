import { useEffect, useState } from 'react'

function Home() {
  const [disasters, setDisasters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/v1/disasters/active')
      .then(res => res.json())
      .then(data => {
        setDisasters(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching disasters:', err)
        setError(err.message)
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-500">Loading disasters...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Active Disasters</h2>
        <p className="text-gray-500">Current disaster events across Nepal</p>
      </div>

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
                <div className="flex justify-between">
                  <span className="text-gray-500">Confidence:</span>
                  <span className="capitalize font-medium">{d.confidence}</span>
                </div>
              </div>

              {d.sources && d.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <span className="text-xs text-gray-400">Sources: {d.sources.join(', ')}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home