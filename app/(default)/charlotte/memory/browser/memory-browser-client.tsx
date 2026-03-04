'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface MemoryFile {
  type: string
  filename: string
  date?: string
  importance?: string
  tags?: string[]
  related?: string[]
  wordCount: number
  size: number
  modified: string
  preview: string
}

export default function MemoryBrowserClient() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'all'
  const [files, setFiles] = useState<MemoryFile[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(type)

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/charlotte/memory/files?type=${filter}&limit=100`)
        const result = await response.json()
        
        if (result.status === 'success') {
          setFiles(result.data.files)
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch memory files:', error)
        setLoading(false)
      }
    }

    fetchFiles()
  }, [filter])

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">

      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            📁 Memory Browser
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse all memory files by type
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

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Files', icon: '📄' },
            { key: 'daily', label: 'Daily Logs', icon: '📝' },
            { key: 'digest', label: 'Digests', icon: '📊' },
            { key: 'special', label: 'Special Files', icon: '⭐' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                filter === tab.key
                  ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Files List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No files found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {file.filename}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      file.type === 'daily' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      file.type === 'digest' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    }`}>
                      {file.type}
                    </span>
                    {file.importance && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        file.importance === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        file.importance === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      }`}>
                        {file.importance}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    {file.date && (
                      <span>📅 {file.date}</span>
                    )}
                    <span>📝 {file.wordCount} words</span>
                    <span>💾 {formatSize(file.size)}</span>
                    <span>🕐 {formatDate(file.modified)}</span>
                  </div>
                </div>
              </div>

              {file.tags && file.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {file.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {file.preview}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
