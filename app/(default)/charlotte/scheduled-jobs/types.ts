export type JobHealth = 'healthy' | 'warning' | 'error'
export type JobRunStatus = 'success' | 'failed' | 'running' | 'skipped' | null

export interface ScheduledJob {
  id: string
  name: string
  description: string
  cron: string
  timezone: string
  command: string
  active: boolean
  health: JobHealth
  tags: string[]
  createdAt: string
  updatedAt: string
  lastRunAt: string | null
  nextRunAt: string | null
  lastRunStatus: JobRunStatus
  lastDurationMs: number | null
  runCount: number
  successCount: number
  failureCount: number
}

export interface ScheduledJobLog {
  id: string
  jobId: string
  timestamp: string
  status: Exclude<JobRunStatus, null>
  durationMs: number
  message: string
}

export interface ScheduledJobsStats {
  total: number
  active: number
  paused: number
  errors: number
  totalRuns: number
  successRate: number
  nextRun: ScheduledJob | null
}
