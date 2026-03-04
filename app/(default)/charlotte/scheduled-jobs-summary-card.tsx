'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ScheduledJobsStats } from './scheduled-jobs/types'

interface ScheduledJobsResponse {
  status: 'success' | 'error'
  data?: {
    stats: ScheduledJobsStats
  }
}

export default function ScheduledJobsSummaryCard() {
  const [stats, setStats] = useState<ScheduledJobsStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/charlotte/scheduled-jobs')
      const result = (await response.json()) as ScheduledJobsResponse
      if (result.status === 'success' && result.data) {
        setStats(result.data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch scheduled jobs stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const nextRunLabel = useMemo(() => {
    if (!stats?.nextRun?.nextRunAt) return 'No upcoming run'
    return new Date(stats.nextRun.nextRunAt).toLocaleString()
  }, [stats])

  if (loading) {
    return (
      <div className="col-span-full xl:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
        <div className="px-5 py-4">
          <div className="animate-pulse flex items-center justify-center h-32 text-gray-400 dark:text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="col-span-full xl:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700/60">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">⏱️ Scheduled Jobs</h2>
          <Link href="/charlotte/scheduled-jobs" className="text-sm font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400">
            View All →
          </Link>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.total}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.paused}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Paused</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.errors}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Issues</div>
          </div>
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700/60 pt-3 space-y-1">
          <div className="flex justify-between gap-4">
            <span>Success Rate</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.successRate}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Total Runs</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.totalRuns}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Next Run</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-right">{nextRunLabel}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/charlotte/scheduled-jobs" className="flex-1 btn-sm bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50 text-center">
            Jobs
          </Link>
          <Link href="/charlotte/scheduled-jobs/calendar" className="flex-1 btn-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-center">
            Calendar
          </Link>
        </div>
      </div>
    </div>
  )
}
