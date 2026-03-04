'use client'

import { useEffect, useState } from 'react'

interface MemoryStats {
  totalEntries: number
  dailyFiles: number
  clusters: number
  lastUpdated: string
  storageUsed: string
  recentActivity: Array<{
    type: string
    count: number
    color: string
  }>
}

export default function MemoryStatsCard() {
  const [stats, setStats] = useState<MemoryStats>({
    totalEntries: 0,
    dailyFiles: 0,
    clusters: 0,
    lastUpdated: 'Loading...',
    storageUsed: '0 MB',
    recentActivity: [
      { type: 'New memories', count: 12, color: 'bg-violet-500' },
      { type: 'Updates', count: 8, color: 'bg-blue-500' },
      { type: 'Searches', count: 34, color: 'bg-green-500' },
    ]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/charlotte/status')
        const result = await response.json()
        
        if (result.status === 'success' && result.data.memory) {
          setStats({
            totalEntries: result.data.memory.totalEntries,
            dailyFiles: result.data.memory.dailyFiles,
            clusters: result.data.memory.clusters,
            lastUpdated: result.data.memory.lastUpdated,
            storageUsed: result.data.memory.storageUsed,
            recentActivity: [
              { type: 'New memories', count: 12, color: 'bg-violet-500' },
              { type: 'Updates', count: 8, color: 'bg-blue-500' },
              { type: 'Searches', count: 34, color: 'bg-green-500' },
            ]
          })
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch memory stats:', error)
        setLoading(false)
      }
    }

    fetchStats()
    // Refresh every minute
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="col-span-full xl:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Memory System Statistics</h2>
      </header>
      <div className="p-5">
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        )}

        {/* Main Stats Grid */}
        {!loading && (
        <>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          
          {/* Total Entries */}
          <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg p-4 text-white">
            <div className="text-sm font-medium opacity-90 mb-1">Total Entries</div>
            <div className="text-3xl font-bold">{stats.totalEntries.toLocaleString()}</div>
            <div className="text-xs opacity-75 mt-1">Across all files</div>
          </div>

          {/* Daily Files */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="text-sm font-medium opacity-90 mb-1">Daily Files</div>
            <div className="text-3xl font-bold">{stats.dailyFiles}</div>
            <div className="text-xs opacity-75 mt-1">Memory logs</div>
          </div>

          {/* Clusters */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="text-sm font-medium opacity-90 mb-1">Clusters</div>
            <div className="text-3xl font-bold">{stats.clusters}</div>
            <div className="text-xs opacity-75 mt-1">Topic groups</div>
          </div>

        </div>

        {/* Storage & Activity */}
        <div className="space-y-4">
          
          {/* Storage Usage */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-400/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-100">Storage Used</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stats.storageUsed} / 5 GB</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">3%</div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">Recent Activity (Last 24h)</div>
            <div className="space-y-2">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${activity.color}`}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{activity.type}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {activity.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Last Updated */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Last updated</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">{stats.lastUpdated}</span>
            </div>
          </div>

        </div>
        </>
        )}

      </div>
    </div>
  )
}
