'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface TimelineEntry {
  date: string
  filename: string
  importance?: string
  tags: string[]
  wordCount: number
  title: string
}

interface TimelinePeriod {
  period: string
  entries: TimelineEntry[]
  totalWords: number
  tags: string[]
}

export default function MemoryTimelineClient() {
  const [timeline, setTimeline] = useState<TimelinePeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [groupBy, setGroupBy] = useState('day')

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/charlotte/memory/timeline?groupBy=${groupBy}`)
        const result = await response.json()
        
        if (result.status === 'success') {
          setTimeline(result.data.timeline)
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch timeline:', error)
        setLoading(false)
      }
    }

    fetchTimeline()
  }, [groupBy])

  const formatPeriod = (period: string) => {
    if (groupBy === 'month') {
      const [year, month] = period.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1)
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
    return period
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">

      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            📅 Memory Timeline
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Chronological view of all memories
          </p>
        </div>

        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <Link
            href="/charlotte/memory"
            className="btn border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
          >
            ← Back to Memory
          </Link>
        </div>
      </div>

      {/* Group By Controls */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setGroupBy('day')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            groupBy === 'day'
              ? 'bg-violet-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          By Day
        </button>
        <button
          onClick={() => setGroupBy('week')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            groupBy === 'week'
              ? 'bg-violet-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          By Week
        </button>
        <button
          onClick={() => setGroupBy('month')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            groupBy === 'month'
              ? 'bg-violet-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          By Month
        </button>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
        </div>
      ) : timeline.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No timeline data found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {timeline.map((period, idx) => (
            <div key={idx} className="relative pl-8 border-l-2 border-violet-200 dark:border-violet-800">
              
              {/* Period Marker */}
              <div className="absolute left-0 top-0 -ml-2 w-4 h-4 rounded-full bg-violet-600 border-4 border-white dark:border-gray-900"></div>

              {/* Period Header */}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {formatPeriod(period.period)}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span>📝 {period.entries.length} entries</span>
                  <span>💬 {(period.totalWords / 1000).toFixed(1)}k words</span>
                  <span>🏷️ {period.tags.length} tags</span>
                </div>
              </div>

              {/* Entries */}
              <div className="space-y-3">
                {period.entries.map((entry, eidx) => (
                  <div
                    key={eidx}
                    className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                            {entry.title}
                          </h3>
                          {entry.importance && (
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              entry.importance === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                              entry.importance === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                              'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            }`}>
                              {entry.importance}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {entry.date} • {entry.wordCount} words
                        </div>
                      </div>
                    </div>

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.slice(0, 5).map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {entry.tags.length > 5 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{entry.tags.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  )
}
