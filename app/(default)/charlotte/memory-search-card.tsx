'use client'

import { useState } from 'react'

interface SearchResult {
  id: string
  content: string
  source: string
  timestamp: string
  relevance: number
}

export default function MemorySearchCard() {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setSearching(true)
    
    try {
      const response = await fetch(`/api/charlotte/search?q=${encodeURIComponent(query)}`)
      const result = await response.json()
      
      if (result.status === 'success') {
        setResults(result.data)
      } else {
        setResults([])
      }
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    }
    
    setSearching(false)
  }

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 90) return 'text-green-600 dark:text-green-400'
    if (relevance >= 70) return 'text-blue-600 dark:text-blue-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className="col-span-full xl:col-span-8 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Memory Search</h2>
      </header>
      <div className="p-5">
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across all memory files..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setResults([]) }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Search Filters */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button type="button" className="px-3 py-1 text-xs font-medium rounded-full bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-400/20">
              All Files
            </button>
            <button type="button" className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
              Daily Only
            </button>
            <button type="button" className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
              MEMORY.md
            </button>
            <button type="button" className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
              Last 7 Days
            </button>
          </div>
        </form>

        {/* Loading State */}
        {searching && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        )}

        {/* Results */}
        {!searching && results.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Found {results.length} results
            </div>
            {results.map((result) => (
              <div 
                key={result.id}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-gray-100 mb-2">
                      {result.content}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {result.source}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {result.timestamp}
                      </span>
                    </div>
                  </div>
                  <div className={`ml-4 text-sm font-semibold ${getRelevanceColor(result.relevance)}`}>
                    {result.relevance}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!searching && results.length === 0 && query === '' && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">
              Search across all memory files to find specific conversations, events, or context
            </p>
          </div>
        )}

        {/* No Results */}
        {!searching && results.length === 0 && query !== '' && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No results found for "<span className="font-semibold">{query}</span>"
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
