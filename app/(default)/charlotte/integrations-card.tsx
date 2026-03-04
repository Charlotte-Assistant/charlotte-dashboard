'use client'

import { useEffect, useState } from 'react'

interface Integration {
  name: string
  type: string
  status: 'connected' | 'disconnected' | 'available' | 'error'
  icon: string
  details?: {
    authenticated?: boolean
    available?: boolean
    version?: string
    lastSync?: string
    lastChecked?: string
    error?: string
  }
}

export default function IntegrationsCard() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const response = await fetch('/api/charlotte/integrations')
        const result = await response.json()
        
        if (result.status === 'success') {
          setIntegrations(result.data)
          setError(null)
        } else {
          setError(result.error || 'Failed to fetch integrations')
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch integrations:', error)
        setError('Network error')
        setLoading(false)
      }
    }

    fetchIntegrations()
    // Refresh every 30 seconds
    const interval = setInterval(fetchIntegrations, 30000)
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
      case 'available':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-400/10 dark:text-blue-400">
            <span className="mr-1">○</span> Available
          </span>
        )
      case 'disconnected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            <span className="mr-1">○</span> Not Configured
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'cli':
        return 'CLI Tool'
      case 'api':
        return 'API'
      default:
        return type
    }
  }

  return (
    <div className="col-span-full xl:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">🔧 Active Integrations</h2>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Tools & APIs
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

        {/* Integrations List */}
        {!loading && !error && integrations.length > 0 && (
          <div className="space-y-2">
            {integrations.map((integration, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <span className="text-2xl">{integration.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <div className="font-medium text-gray-800 dark:text-gray-100">
                        {integration.name}
                      </div>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        {getTypeLabel(integration.type)}
                      </span>
                    </div>
                    {integration.details && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {integration.details.version && (
                          <span className="mr-2">v{integration.details.version}</span>
                        )}
                        {integration.details.lastSync && (
                          <span className="mr-2">{integration.details.lastSync}</span>
                        )}
                        {integration.details.authenticated !== undefined && (
                          <span>
                            {integration.details.authenticated ? '✓ Authenticated' : '○ Not authenticated'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-3">
                  {getStatusBadge(integration.status)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Integrations */}
        {!loading && !error && integrations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <p className="text-sm">No integrations available</p>
          </div>
        )}

      </div>
    </div>
  )
}
