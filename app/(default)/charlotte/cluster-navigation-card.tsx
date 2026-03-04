'use client'

import { useState, useEffect } from 'react'

interface Cluster {
  id: string
  name: string
  count: number
  color: string
  lastUpdated: string
  topics: string[]
}

export default function ClusterNavigationCard() {
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null)

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const response = await fetch('/api/charlotte/clusters')
        const result = await response.json()
        
        if (result.status === 'success') {
          setClusters(result.data)
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch clusters:', error)
        setLoading(false)
      }
    }

    fetchClusters()
    // Refresh every 5 minutes
    const interval = setInterval(fetchClusters, 300000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="col-span-full xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Memory Clusters</h2>
        <button className="text-sm text-violet-500 hover:text-violet-600 font-medium">
          View All
        </button>
      </header>
      <div className="p-3">
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        )}

        {/* Clusters List */}
        {!loading && <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {clusters.map((cluster) => (
            <div 
              key={cluster.id}
              onClick={() => setSelectedCluster(selectedCluster === cluster.id ? null : cluster.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedCluster === cluster.id 
                  ? 'bg-violet-50 dark:bg-violet-400/10 border-2 border-violet-500' 
                  : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`w-3 h-3 rounded-full ${cluster.color}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 dark:text-gray-100 truncate">
                      {cluster.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {cluster.count} entries • {cluster.lastUpdated}
                    </div>
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${selectedCluster === cluster.id ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Expanded Topics */}
              {selectedCluster === cluster.id && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Top Topics:</div>
                  <div className="flex flex-wrap gap-2">
                    {cluster.topics.map((topic, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 text-xs font-medium rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  <button className="w-full mt-3 px-3 py-2 text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-400/10 rounded transition-colors">
                    Explore Cluster →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>}

        {/* Quick Stats */}
        {!loading && <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {clusters.reduce((sum, c) => sum + c.count, 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Entries</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {clusters.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Active Clusters</div>
            </div>
          </div>
        </div>}

      </div>
    </div>
  )
}
