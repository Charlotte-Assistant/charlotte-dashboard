'use client'

import { Calendar } from '@/components/ui/calendar'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ScheduledJob } from './types'

interface JobsResponse {
  status: 'success' | 'error'
  data?: {
    jobs: ScheduledJob[]
  }
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export default function CalendarView() {
  const [jobs, setJobs] = useState<ScheduledJob[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/charlotte/scheduled-jobs?status=active')
      const result = (await response.json()) as JobsResponse
      if (result.status === 'success' && result.data) {
        setJobs(result.data.jobs)
      }
    } catch (error) {
      console.error('Failed to fetch jobs for calendar:', error)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const runsByDay = useMemo(() => {
    const map = new Map<string, ScheduledJob[]>()
    for (const job of jobs) {
      if (!job.nextRunAt) continue
      const key = dateKey(new Date(job.nextRunAt))
      const existing = map.get(key) || []
      existing.push(job)
      map.set(key, existing)
    }
    return map
  }, [jobs])

  const selectedRuns = useMemo(() => {
    return runsByDay.get(dateKey(selectedDate)) || []
  }, [runsByDay, selectedDate])

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
      <header className="px-5 py-4 border-b border-gray-200 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Calendar</h2>
      </header>
      <div className="p-5 grid lg:grid-cols-[320px,1fr] gap-6 items-start">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700/60">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={date => setSelectedDate(date || new Date())}
            modifiers={{
              hasRuns: Array.from(runsByDay.keys()).map(key => new Date(`${key}T00:00:00`)),
            }}
            modifiersClassNames={{
              hasRuns: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded-md',
            }}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
            {selectedDate.toLocaleDateString()} ({selectedRuns.length} run{selectedRuns.length === 1 ? '' : 's'})
          </h3>
          <div className="space-y-3">
            {selectedRuns.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">No runs scheduled for this day.</div>
            ) : (
              selectedRuns.map(job => (
                <div key={job.id} className="rounded-lg border border-gray-200 dark:border-gray-700/60 p-3">
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    <Link href={`/charlotte/scheduled-jobs/${job.id}`} className="hover:text-violet-500">
                      {job.name}
                    </Link>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{job.nextRunAt ? new Date(job.nextRunAt).toLocaleTimeString() : 'Unknown time'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{job.cron}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
