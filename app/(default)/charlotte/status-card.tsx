'use client'

import { useEffect, useState } from 'react'

interface SystemStatus {
  openclaw: 'online' | 'offline' | 'degraded'
  gateway: 'running' | 'stopped'
  uptime: string
  lastHeartbeat: string
}

export default function StatusCard() {
  const [status, setStatus] = useState<SystemStatus>({
    openclaw: 'online',
    gateway: 'running',
    uptime: '3d 14h 22m',
    lastHeartbeat: 'Just now'
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch real status from OpenClaw API
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/charlotte/status')
        const result = await response.json()
        
        if (result.status === 'success') {
          setStatus({
            openclaw: result.data.openclaw,
            gateway: result.data.gateway,
            uptime: result.data.uptime,
            lastHeartbeat: result.data.lastHeartbeat
          })
        } else {
          throw new Error('API returned error status')
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch status:', error)
        setStatus({
          openclaw: 'offline',
          gateway: 'stopped',
          uptime: 'N/A',
          lastHeartbeat: 'Unknown'
        })
        setLoading(false)
      }
    }

    fetchStatus()
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (statusType: string) => {
    switch (statusType) {
      case 'online':
      case 'running':
        return 'text-green-600 dark:text-green-400'
      case 'degraded':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'offline':
      case 'stopped':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusBg = (statusType: string) => {
    switch (statusType) {
      case 'online':
      case 'running':
        return 'bg-green-100 dark:bg-green-400/10'
      case 'degraded':
        return 'bg-yellow-100 dark:bg-yellow-400/10'
      case 'offline':
      case 'stopped':
        return 'bg-red-100 dark:bg-red-400/10'
      default:
        return 'bg-gray-100 dark:bg-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="col-span-full bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <div className="px-5 py-6">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="col-span-full bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">System Status</h2>
      </header>
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* OpenClaw Status */}
          <div className={`${getStatusBg(status.openclaw)} rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">OpenClaw</span>
              <div className={`w-3 h-3 rounded-full ${status.openclaw === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(status.openclaw)}`}>
              {status.openclaw.toUpperCase()}
            </div>
          </div>

          {/* Gateway Status */}
          <div className={`${getStatusBg(status.gateway)} rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Gateway</span>
              <svg className={`w-5 h-5 ${getStatusColor(status.gateway)}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(status.gateway)}`}>
              {status.gateway.toUpperCase()}
            </div>
          </div>

          {/* Uptime */}
          <div className="bg-violet-100 dark:bg-violet-400/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Uptime</span>
              <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              {status.uptime}
            </div>
          </div>

          {/* Last Heartbeat */}
          <div className="bg-blue-100 dark:bg-blue-400/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Last Heartbeat</span>
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {status.lastHeartbeat}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
