'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface MemoryStats {
  totalEntries: number
  totalWords: number
  dailyFiles: number
  healthScore: number
  recentFiles: Array<{
    date: string
    importance?: string
    wordCount: number
  }>
}

export default function MemorySummaryCard() {
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
      <div className="col-span-full xl:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
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

  return (
    <div className="col-span-full xl:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">🧠 Memory System</h2>
        <Link
          href="/charlotte/memory"
          className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
        >
          View All →
        </Link>
      </header>
      <div className="p-5">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="text-center">
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              {stats.totalEntries}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Entries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {(stats.totalWords / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Words</div>
          </div>
          <div className={`text-center ${getHealthColor(stats.healthScore)}`}>
            <div className="text-2xl font-bold">
              {stats.healthScore}
            </div>
            <div className="text-xs opacity-75">Health</div>
          </div>
        </div>

        {/* Recent Activity */}
        {stats.recentFiles && stats.recentFiles.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Recent Activity
            </h3>
            <div className="space-y-2">
              {stats.recentFiles.slice(0, 3).map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-600 dark:text-gray-400">{file.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-500 text-xs">
                      {file.wordCount}w
                    </span>
                    {file.importance && (
                      <span className={`w-2 h-2 rounded-full ${
                        file.importance === 'high' ? 'bg-red-500' :
                        file.importance === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link
            href="/charlotte/memory/search"
            className="flex-1 btn-sm bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50"
          >
            🔍 Search
          </Link>
          <Link
            href="/charlotte/memory/browser"
            className="flex-1 btn-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
          >
            📁 Browse
          </Link>
          <Link
            href="/charlotte/memory/timeline"
            className="flex-1 btn-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
          >
            📅 Timeline
          </Link>
        </div>

      </div>
    </div>
  )
}
