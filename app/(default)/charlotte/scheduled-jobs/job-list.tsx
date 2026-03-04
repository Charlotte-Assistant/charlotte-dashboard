'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ScheduledJob, ScheduledJobsStats } from './types'

interface JobsResponse {
  status: 'success' | 'error'
  data?: {
    jobs: ScheduledJob[]
    stats: ScheduledJobsStats
  }
}

const healthClass: Record<string, string> = {
  healthy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export default function JobList() {
  const [jobs, setJobs] = useState<ScheduledJob[]>([])
  const [stats, setStats] = useState<ScheduledJobsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'error'>('all')
  const [pendingId, setPendingId] = useState<string | null>(null)

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (query.trim()) params.set('q', query.trim())
      const response = await fetch(`/api/charlotte/scheduled-jobs?${params.toString()}`)
      const result = (await response.json()) as JobsResponse
      if (result.status === 'success' && result.data) {
        setJobs(result.data.jobs)
        setStats(result.data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch scheduled jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 30000)
    return () => clearInterval(interval)
  }, [statusFilter])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return jobs
    return jobs.filter(job =>
      job.name.toLowerCase().includes(q) ||
      job.description.toLowerCase().includes(q) ||
      job.command.toLowerCase().includes(q) ||
      job.tags.some(tag => tag.toLowerCase().includes(q)),
    )
  }, [jobs, query])

  const runJobNow = async (id: string) => {
    setPendingId(id)
    try {
      await fetch(`/api/charlotte/scheduled-jobs/${id}/run`, { method: 'POST' })
      await fetchJobs()
    } catch (error) {
      console.error('Failed to run job:', error)
    } finally {
      setPendingId(null)
    }
  }

  const toggleActive = async (job: ScheduledJob) => {
    setPendingId(job.id)
    try {
      await fetch(`/api/charlotte/scheduled-jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !job.active }),
      })
      await fetchJobs()
    } catch (error) {
      console.error('Failed to update job:', error)
    } finally {
      setPendingId(null)
    }
  }

  const deleteJob = async (jobId: string) => {
    if (!window.confirm('Delete this scheduled job?')) return
    setPendingId(jobId)
    try {
      await fetch(`/api/charlotte/scheduled-jobs/${jobId}`, { method: 'DELETE' })
      await fetchJobs()
    } catch (error) {
      console.error('Failed to delete job:', error)
    } finally {
      setPendingId(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 p-6">
        <div className="animate-pulse text-gray-400 dark:text-gray-500">Loading scheduled jobs...</div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Jobs</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {stats ? `${stats.total} total • ${stats.active} active • ${stats.errors} with issues` : 'Scheduled jobs'}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search jobs"
              className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'paused' | 'error')}
              className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="error">With Issues</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full dark:text-gray-300">
          <thead className="text-xs uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-y border-gray-200 dark:border-gray-700/60">
            <tr>
              <th className="px-4 py-3 text-left">Job</th>
              <th className="px-4 py-3 text-left">Schedule</th>
              <th className="px-4 py-3 text-left">Last Run</th>
              <th className="px-4 py-3 text-left">Health</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-200 dark:divide-gray-700/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No jobs found.
                </td>
              </tr>
            ) : (
              filtered.map(job => (
                <tr key={job.id} className={pendingId === job.id ? 'opacity-60' : ''}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800 dark:text-gray-100">
                      <Link href={`/charlotte/scheduled-jobs/${job.id}`} className="hover:text-violet-500">
                        {job.name}
                      </Link>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{job.description}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{job.command}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                    <div>{job.cron}</div>
                    <div className="mt-1">{job.timezone}</div>
                    {job.nextRunAt && <div className="mt-1">Next: {new Date(job.nextRunAt).toLocaleString()}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                    {job.lastRunAt ? (
                      <>
                        <div>{new Date(job.lastRunAt).toLocaleString()}</div>
                        <div className="mt-1">{job.lastRunStatus || 'unknown'} • {job.lastDurationMs ?? 0} ms</div>
                      </>
                    ) : (
                      <span>Never</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${healthClass[job.health] || healthClass.healthy}`}>
                        {job.health}
                      </span>
                      {!job.active && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300">
                          paused
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2 text-xs">
                      <button onClick={() => runJobNow(job.id)} className="px-2 py-1 rounded bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50">
                        Run
                      </button>
                      <button onClick={() => toggleActive(job)} className="px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50">
                        {job.active ? 'Pause' : 'Resume'}
                      </button>
                      <button onClick={() => deleteJob(job.id)} className="px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
