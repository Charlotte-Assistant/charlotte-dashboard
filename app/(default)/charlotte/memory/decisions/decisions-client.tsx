'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Decision {
  title: string
  date: string | null
  status: string
  tags: string[]
  content: string
}

export default function DecisionsClient() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchDecisions = async () => {
      try {
        const response = await fetch('/api/charlotte/memory/decisions')
        const result = await response.json()
        
        if (result.status === 'success') {
          setDecisions(result.data.decisions)
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch decisions:', error)
        setLoading(false)
      }
    }

    fetchDecisions()
  }, [])

  const filteredDecisions = decisions.filter(d => {
    if (filter === 'all') return true
    return d.status.toLowerCase().replace(/\s+/g, '') === filter
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'implemented':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
      case 'under review':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      case 'revisited':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
      default:
        return 'bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">

      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            ⚖️ Decision Log
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Major decisions with rationale and outcomes
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

      {/* Status Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All', count: decisions.length },
          { key: 'implemented', label: 'Implemented', count: decisions.filter(d => d.status === 'Implemented').length },
          { key: 'pending', label: 'Pending', count: decisions.filter(d => d.status === 'Pending').length },
          { key: 'underreview', label: 'Under Review', count: decisions.filter(d => d.status === 'Under Review').length },
          { key: 'revisited', label: 'Revisited', count: decisions.filter(d => d.status === 'Revisited').length }
        ].map(status => (
          <button
            key={status.key}
            onClick={() => setFilter(status.key)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === status.key
                ? 'bg-violet-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {status.label} ({status.count})
          </button>
        ))}
      </div>

      {/* Decisions */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
        </div>
      ) : filteredDecisions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'all' ? 'No decisions found' : `No ${filter} decisions`}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Important decisions are logged in DECISIONS.md
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDecisions.map((decision, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {decision.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    {decision.date && (
                      <span>📅 {decision.date}</span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(decision.status)}`}>
                      {decision.status}
                    </span>
                  </div>
                </div>
              </div>

              {decision.tags && decision.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {decision.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="prose dark:prose-invert max-w-none">
                <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-sans">
                  {decision.content.split('\n').slice(0, 10).join('\n')}
                  {decision.content.split('\n').length > 10 && '\n...'}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
