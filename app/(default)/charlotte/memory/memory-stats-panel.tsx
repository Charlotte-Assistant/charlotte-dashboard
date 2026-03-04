'use client'

import { useEffect, useState } from 'react'

interface MemoryStats {
  totalEntries: number
  totalWords: number
  totalSize: string
  dailyFiles: number
  digests: number
  clusters: number
  decisions: number
  tags: string[]
  topTags: Array<{ tag: string; count: number }>
  importance: {
    high: number
    medium: number
    low: number
    untagged: number
  }
  recentFiles: Array<any>
  healthScore: number
  recommendations: string[]
}

export default function MemoryStatsPanel() {
  const [stats, setStats] = useState<MemoryStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/charlotte/memory/stats')
        const result = await response.json()
        
        if (result.status === 'success') {
          setStats(result.data)
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch memory stats:', error)
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="col-span-full xl:col-span-8 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="col-span-full xl:col-span-8 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <div className="p-8 text-center text-gray-500">Failed to load memory statistics</div>
      </div>
    )
  }

  return (
    <div className="col-span-full xl:col-span-8 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Memory Statistics</h2>
      </header>
      <div className="p-5">
        
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalEntries}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Entries</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {(stats.totalWords / 1000).toFixed(1)}k
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Words</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.dailyFiles}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Daily Logs</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {stats.totalSize}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Storage Used</div>
          </div>
        </div>

        {/* File Type Breakdown */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">File Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Daily Files</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">{stats.dailyFiles}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Digests</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">{stats.digests}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Clusters</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">{stats.clusters}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Decisions</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">{stats.decisions}</span>
            </div>
          </div>
        </div>

        {/* Importance Distribution */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Importance Distribution</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-20 text-sm text-gray-600 dark:text-gray-400">High</div>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(stats.importance.high / stats.totalEntries) * 100}%` }}
                ></div>
              </div>
              <div className="w-12 text-right text-sm font-semibold text-gray-800 dark:text-gray-100">
                {stats.importance.high}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 text-sm text-gray-600 dark:text-gray-400">Medium</div>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${(stats.importance.medium / stats.totalEntries) * 100}%` }}
                ></div>
              </div>
              <div className="w-12 text-right text-sm font-semibold text-gray-800 dark:text-gray-100">
                {stats.importance.medium}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 text-sm text-gray-600 dark:text-gray-400">Low</div>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(stats.importance.low / stats.totalEntries) * 100}%` }}
                ></div>
              </div>
              <div className="w-12 text-right text-sm font-semibold text-gray-800 dark:text-gray-100">
                {stats.importance.low}
              </div>
            </div>
            {stats.importance.untagged > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-20 text-sm text-gray-600 dark:text-gray-400">Untagged</div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gray-400 h-2 rounded-full"
                    style={{ width: `${(stats.importance.untagged / stats.totalEntries) * 100}%` }}
                  ></div>
                </div>
                <div className="w-12 text-right text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {stats.importance.untagged}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Tags */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Top Tags</h3>
          <div className="flex flex-wrap gap-2">
            {stats.topTags.map(({ tag, count }) => (
              <a
                key={tag}
                href={`/charlotte/memory/search?tag=${encodeURIComponent(tag)}`}
                className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-sm hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
              >
                <span>{tag}</span>
                <span className="text-xs opacity-75">({count})</span>
              </a>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {stats.tags.length} unique tags total
          </div>
        </div>

      </div>
    </div>
  )
}
