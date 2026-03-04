'use client'

import { useEffect, useState } from 'react'

interface MemoryStats {
  healthScore: number
  recommendations: string[]
  recentFiles: Array<{
    date: string
    importance?: string
    tags?: string[]
    wordCount: number
  }>
}

export default function MemoryHealthCard() {
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
      <div className="col-span-full xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Attention'
  }

  return (
    <div className="col-span-full xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Memory Health</h2>
      </header>
      <div className="p-5">
        
        {/* Health Score */}
        <div className="text-center mb-6">
          <div className={`text-5xl font-bold ${getHealthColor(stats.healthScore)} mb-2`}>
            {stats.healthScore}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Health Score: {getHealthLabel(stats.healthScore)}
          </div>
          
          {/* Visual health bar */}
          <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                stats.healthScore >= 80 ? 'bg-green-500' :
                stats.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${stats.healthScore}%` }}
            ></div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
            {stats.recommendations.length > 1 && stats.recommendations[0] !== 'Memory system is well organized! 🎉'
              ? 'Recommendations'
              : 'Status'}
          </h3>
          <ul className="space-y-2">
            {stats.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="mt-0.5">
                  {rec.includes('🎉') ? '✨' : '💡'}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Activity */}
        {stats.recentFiles && stats.recentFiles.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Recent Activity (Last 7 Days)
            </h3>
            <div className="space-y-2">
              {stats.recentFiles.slice(0, 5).map((file, idx) => (
                <a
                  key={idx}
                  href={`/charlotte/memory/browser?date=${file.date}`}
                  className="block p-2 bg-gray-50 dark:bg-gray-700/50 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {file.date}
                    </span>
                    {file.importance && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        file.importance === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        file.importance === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      }`}>
                        {file.importance}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {file.wordCount} words
                    {file.tags && file.tags.length > 0 && (
                      <span className="ml-2">• {file.tags.slice(0, 3).join(', ')}</span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
