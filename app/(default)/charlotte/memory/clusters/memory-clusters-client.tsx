'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Cluster {
  name: string
  tags: string[]
  entries: number
  lastUpdated: string | null
  preview: string
}

export default function MemoryClustersClient() {
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const response = await fetch('/api/charlotte/memory/clusters')
        const result = await response.json()
        
        if (result.status === 'success') {
          setClusters(result.data.clusters)
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch clusters:', error)
        setLoading(false)
      }
    }

    fetchClusters()
  }, [])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">

      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            🔗 Memory Clusters
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Topic-based organization of memories
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

      {/* Clusters */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
        </div>
      ) : clusters.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No clusters found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Clusters are created in CLUSTERS.md to organize memories by topic
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clusters.map((cluster, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
                  {cluster.name}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>📝 {cluster.entries} entries</span>
                  {cluster.lastUpdated && (
                    <span>🕐 {cluster.lastUpdated}</span>
                  )}
                </div>
              </div>

              {cluster.tags && cluster.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {cluster.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {cluster.preview.replace(/^##\s*.*\n+/, '').substring(0, 150)}...
              </p>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={`/charlotte/memory/search?tag=${encodeURIComponent(cluster.tags[0] || cluster.name.toLowerCase())}`}
                  className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
                >
                  View related memories →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
