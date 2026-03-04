'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ScheduledJob, ScheduledJobLog } from './types'

interface JobResponse {
  status: 'success' | 'error'
  data?: {
    job: ScheduledJob
    logs: ScheduledJobLog[]
  }
  error?: string
}

export default function JobDetails({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<ScheduledJob | null>(null)
  const [logs, setLogs] = useState<ScheduledJobLog[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/charlotte/scheduled-jobs/${jobId}`)
      const result = (await response.json()) as JobResponse
      if (result.status === 'success' && result.data) {
        setJob(result.data.job)
        setLogs(result.data.logs)
      }
    } catch (error) {
      console.error('Failed to fetch job:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJob()
    const interval = setInterval(fetchJob, 30000)
    return () => clearInterval(interval)
  }, [jobId])

  const runNow = async () => {
    setPending(true)
    try {
      await fetch(`/api/charlotte/scheduled-jobs/${jobId}/run`, { method: 'POST' })
      await fetchJob()
    } catch (error) {
      console.error('Failed to run job:', error)
    } finally {
      setPending(false)
    }
  }

  const toggleActive = async () => {
    if (!job) return
    setPending(true)
    try {
      await fetch(`/api/charlotte/scheduled-jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !job.active }),
      })
      await fetchJob()
    } catch (error) {
      console.error('Failed to update job:', error)
    } finally {
      setPending(false)
    }
  }

  if (loading) {
    return <div className="text-gray-500 dark:text-gray-400">Loading job details...</div>
  }

  if (!job) {
    return (
      <div className="text-red-600 dark:text-red-400">
        Job not found. <Link href="/charlotte/scheduled-jobs" className="underline">Back to list</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700/60 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">{job.name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{job.description}</p>
          </div>
          <div className="flex gap-2">
            <button disabled={pending} onClick={runNow} className="btn-sm bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50">
              Run Now
            </button>
            <button disabled={pending} onClick={toggleActive} className="btn-sm border-gray-200 dark:border-gray-700/60 text-gray-700 dark:text-gray-300">
              {job.active ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">Schedule</div>
            <div className="font-semibold text-gray-800 dark:text-gray-100 mt-1">{job.cron}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{job.timezone}</div>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">Last Run</div>
            <div className="font-semibold text-gray-800 dark:text-gray-100 mt-1">{job.lastRunAt ? new Date(job.lastRunAt).toLocaleString() : 'Never'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Status: {job.lastRunStatus || 'n/a'}</div>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">Run Stats</div>
            <div className="font-semibold text-gray-800 dark:text-gray-100 mt-1">{job.runCount} runs</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{job.successCount} success / {job.failureCount} failed</div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700/60 p-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Command</div>
            <code>{job.command}</code>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700/60">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">Recent Logs</h3>
        </div>
        <div className="p-5 space-y-3">
          {logs.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">No logs yet.</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="rounded-lg border border-gray-200 dark:border-gray-700/60 p-3">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{new Date(log.timestamp).toLocaleString()}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded ${log.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                    {log.status}
                  </span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{log.message}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Duration: {log.durationMs} ms</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
