'use client'

import { useEffect, useState } from 'react'

interface Channel {
  name: string
  type: string
  status: 'connected' | 'disconnected' | 'error'
  icon: string
  details?: {
    enabled?: boolean
    hasToken?: boolean
    configured?: boolean
    lastChecked?: string
  }
}

export default function ChannelsCard() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch('/api/charlotte/channels')
        const result = await response.json()
        
        if (result.status === 'success') {
          setChannels(result.data)
          setError(null)
        } else {
          setError(result.error || 'Failed to fetch channels')
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch channels:', error)
        setError('Network error')
        setLoading(false)
      }
    }

    fetchChannels()
    // Refresh every 30 seconds
    const interval = setInterval(fetchChannels, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-400/10 dark:text-green-400">
            <span className="mr-1">●</span> Connected
          </span>
        )
      case 'disconnected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            <span className="mr-1">○</span> Disconnected
          </span>
        )
      case 'error':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-400">
            <span className="mr-1">⚠</span> Error
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="col-span-full xl:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">📱 Channels</h2>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Messaging Platforms
        </div>
      </header>
      <div className="p-3">
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center py-8 text-red-500 dark:text-red-400">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Channels List */}
        {!loading && !error && channels.length > 0 && (
          <div className="space-y-2">
            {channels.map((channel, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{channel.icon}</span>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-100">
                      {channel.name}
                    </div>
                    {channel.details && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {channel.details.enabled !== undefined && (
                          <span className="mr-2">
                            {channel.details.enabled ? '✓ Enabled' : '✗ Disabled'}
                          </span>
                        )}
                        {channel.details.hasToken !== undefined && (
                          <span>
                            {channel.details.hasToken ? '🔑 Token OK' : '⚠️ No Token'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(channel.status)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Channels */}
        {!loading && !error && channels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">No messaging channels configured</p>
          </div>
        )}

      </div>
    </div>
  )
}
