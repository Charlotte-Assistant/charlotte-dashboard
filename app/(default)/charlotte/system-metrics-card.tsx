'use client'

import { useEffect, useState } from 'react'

interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: {
    in: string
    out: string
  }
}

export default function SystemMetricsCard() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: {
      in: '0 MB/s',
      out: '0 MB/s'
    }
  })
  const [loading, setLoading] = useState(true)

  const getUsageColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getUsageTextColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600 dark:text-red-400'
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  useEffect(() => {
    // Fetch real system metrics
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/charlotte/status')
        const result = await response.json()
        
        if (result.status === 'success' && result.data.metrics) {
          setMetrics(result.data.metrics)
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch system metrics:', error)
        setLoading(false)
      }
    }

    fetchMetrics()
    // Refresh every 10 seconds
    const interval = setInterval(fetchMetrics, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="col-span-full bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">System Metrics</h2>
      </header>
      <div className="p-5">
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        )}

        {!loading && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* CPU Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">CPU Usage</span>
              <span className={`text-lg font-bold ${getUsageTextColor(metrics.cpu)}`}>
                {metrics.cpu}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full ${getUsageColor(metrics.cpu)} transition-all duration-500 rounded-full`}
                style={{ width: `${metrics.cpu}%` }}
              ></div>
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              Mac Mini M2
            </div>
          </div>

          {/* Memory Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Memory</span>
              <span className={`text-lg font-bold ${getUsageTextColor(metrics.memory)}`}>
                {metrics.memory}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full ${getUsageColor(metrics.memory)} transition-all duration-500 rounded-full`}
                style={{ width: `${metrics.memory}%` }}
              ></div>
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              6.7 GB / 16 GB
            </div>
          </div>

          {/* Disk Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Disk</span>
              <span className={`text-lg font-bold ${getUsageTextColor(metrics.disk)}`}>
                {metrics.disk}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full ${getUsageColor(metrics.disk)} transition-all duration-500 rounded-full`}
                style={{ width: `${metrics.disk}%` }}
              ></div>
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              190 GB / 500 GB
            </div>
          </div>

          {/* Network Activity */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Network</span>
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 9a1 1 0 011 1v.01a1 1 0 11-2 0V10a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">↓ Download</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {metrics.network.in}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">↑ Upload</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {metrics.network.out}
                </span>
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Active
            </div>
          </div>

        </div>}

      </div>
    </div>
  )
}
