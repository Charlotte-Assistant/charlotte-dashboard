'use client'

import { useState } from 'react'
import Link from 'next/link'

interface SearchResult {
  filename: string
  date: string
  importance?: string
  tags: string[]
  related: string[]
  matches: string[]
  score: number
}

export default function MemorySearchClient() {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('')
  const [importance, setImportance] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSearched(true)

    try {
      const params = new URLSearchParams()
      if (query) params.append('q', query)
      if (tag) params.append('tag', tag)
      if (importance) params.append('importance', importance)
      if (dateFrom) params.append('from', dateFrom)
      if (dateTo) params.append('to', dateTo)

      const response = await fetch(`/api/charlotte/memory/search?${params}`)
      const result = await response.json()
      
      if (result.status === 'success') {
        setResults(result.data.results)
      }
      setLoading(false)
    } catch (error) {
      console.error('Search failed:', error)
      setLoading(false)
    }
  }

  const handleReset = () => {
    setQuery('')
    setTag('')
    setImportance('')
    setDateFrom('')
    setDateTo('')
    setResults([])
    setSearched(false)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">

      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            🔍 Memory Search
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Search across all memory files with advanced filters
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

      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          
          {/* Text Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Query
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for keywords, phrases, or content..."
              className="form-input w-full"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tag
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g., setup, lesson, decision"
                className="form-input w-full"
              />
            </div>

            {/* Importance Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Importance
              </label>
              <select
                value={importance}
                onChange={(e) => setImportance(e.target.value)}
                className="form-select w-full"
              >
                <option value="">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="form-input flex-1"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="form-input flex-1"
                  placeholder="To"
                />
              </div>
            </div>

          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="btn bg-violet-600 hover:bg-violet-700 text-white"
              disabled={loading || (!query && !tag && !importance)}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
            >
              Reset
            </button>
          </div>

        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
        </div>
      ) : searched && results.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No results found</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {result.filename}
                    </h3>
                    {result.importance && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        result.importance === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        result.importance === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      }`}>
                        {result.importance}
                      </span>
                    )}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Score: {result.score}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    📅 {result.date}
                  </div>
                </div>
              </div>

              {result.tags && result.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {result.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {result.matches && result.matches.length > 0 && (
                <div className="space-y-2">
                  {result.matches.map((match, midx) => (
                    <div
                      key={midx}
                      className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-400 dark:border-yellow-600"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {match}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}

    </div>
  )
}
