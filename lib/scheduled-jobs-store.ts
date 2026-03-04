import fs from 'fs/promises'
import path from 'path'

export type JobHealth = 'healthy' | 'warning' | 'error'
export type JobRunStatus = 'success' | 'failed' | 'running' | 'skipped'

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
  lastRunStatus: JobRunStatus | null
  lastDurationMs: number | null
  runCount: number
  successCount: number
  failureCount: number
}

export interface ScheduledJobLog {
  id: string
  jobId: string
  timestamp: string
  status: JobRunStatus
  durationMs: number
  message: string
}

export interface ScheduledJobsData {
  version: number
  lastUpdated: string
  jobs: ScheduledJob[]
  logs: ScheduledJobLog[]
}

const home = process.env.HOME || ''
const CANDIDATE_PATHS = [
  path.join(home, '.openclaw', 'workspace', 'SCHEDULED_JOBS.json'),
  path.join(home, '.openclaw', 'cron', 'SCHEDULED_JOBS.json'),
  path.join(process.cwd(), 'SCHEDULED_JOBS.json'),
]

const DEFAULT_DATA: ScheduledJobsData = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  jobs: [],
  logs: [],
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export async function resolveScheduledJobsPath() {
  for (const filePath of CANDIDATE_PATHS) {
    if (await fileExists(filePath)) {
      return filePath
    }
  }

  return path.join(process.cwd(), 'SCHEDULED_JOBS.json')
}

function normalizeJob(input: Partial<ScheduledJob>, now: string): ScheduledJob {
  return {
    id: input.id || `job-${Math.random().toString(36).slice(2, 10)}`,
    name: input.name || 'Untitled Job',
    description: input.description || '',
    cron: input.cron || '0 * * * *',
    timezone: input.timezone || 'UTC',
    command: input.command || '',
    active: input.active ?? true,
    health: input.health || 'healthy',
    tags: Array.isArray(input.tags) ? input.tags : [],
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
    lastRunAt: input.lastRunAt ?? null,
    nextRunAt: input.nextRunAt ?? null,
    lastRunStatus: input.lastRunStatus ?? null,
    lastDurationMs: input.lastDurationMs ?? null,
    runCount: Number.isFinite(input.runCount) ? Number(input.runCount) : 0,
    successCount: Number.isFinite(input.successCount) ? Number(input.successCount) : 0,
    failureCount: Number.isFinite(input.failureCount) ? Number(input.failureCount) : 0,
  }
}

function normalizeLog(input: Partial<ScheduledJobLog>, now: string): ScheduledJobLog {
  return {
    id: input.id || `log-${Math.random().toString(36).slice(2, 10)}`,
    jobId: input.jobId || '',
    timestamp: input.timestamp || now,
    status: input.status || 'success',
    durationMs: Number.isFinite(input.durationMs) ? Number(input.durationMs) : 0,
    message: input.message || '',
  }
}

export function calculateStats(data: ScheduledJobsData) {
  const active = data.jobs.filter(job => job.active).length
  const paused = data.jobs.filter(job => !job.active).length
  const errors = data.jobs.filter(job => job.health === 'error' || job.lastRunStatus === 'failed').length
  const totalRuns = data.jobs.reduce((sum, job) => sum + job.runCount, 0)
  const successCount = data.jobs.reduce((sum, job) => sum + job.successCount, 0)
  const successRate = totalRuns > 0 ? Math.round((successCount / totalRuns) * 100) : 0

  const nextRuns = data.jobs
    .filter(job => job.nextRunAt && job.active)
    .sort((a, b) => String(a.nextRunAt).localeCompare(String(b.nextRunAt)))

  return {
    total: data.jobs.length,
    active,
    paused,
    errors,
    totalRuns,
    successRate,
    nextRun: nextRuns[0] || null,
  }
}

export async function readScheduledJobsData() {
  const filePath = await resolveScheduledJobsPath()
  const now = new Date().toISOString()

  if (!(await fileExists(filePath))) {
    await fs.writeFile(filePath, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8')
    return { filePath, data: DEFAULT_DATA }
  }

  const content = await fs.readFile(filePath, 'utf-8')
  const parsed = JSON.parse(content) as Partial<ScheduledJobsData>

  const data: ScheduledJobsData = {
    version: Number(parsed.version) || 1,
    lastUpdated: parsed.lastUpdated || now,
    jobs: Array.isArray(parsed.jobs) ? parsed.jobs.map(job => normalizeJob(job, now)) : [],
    logs: Array.isArray(parsed.logs) ? parsed.logs.map(log => normalizeLog(log, now)) : [],
  }

  return { filePath, data }
}

export async function writeScheduledJobsData(filePath: string, data: ScheduledJobsData) {
  const updated: ScheduledJobsData = {
    ...data,
    lastUpdated: new Date().toISOString(),
  }

  await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8')
  return updated
}

export function addJobLog(
  data: ScheduledJobsData,
  input: { jobId: string; status: JobRunStatus; durationMs: number; message: string; timestamp?: string },
) {
  const log: ScheduledJobLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    jobId: input.jobId,
    timestamp: input.timestamp || new Date().toISOString(),
    status: input.status,
    durationMs: input.durationMs,
    message: input.message,
  }

  data.logs.unshift(log)
  data.logs = data.logs.slice(0, 300)

  return log
}

export function updateJobAfterRun(data: ScheduledJobsData, jobId: string, status: JobRunStatus, durationMs: number, message: string) {
  const now = new Date().toISOString()
  const job = data.jobs.find(item => item.id === jobId)
  if (!job) return null

  job.lastRunAt = now
  job.updatedAt = now
  job.lastRunStatus = status
  job.lastDurationMs = durationMs
  job.runCount += 1

  if (status === 'success') {
    job.successCount += 1
    job.health = 'healthy'
  }

  if (status === 'failed') {
    job.failureCount += 1
    job.health = 'error'
  }

  addJobLog(data, { jobId, status, durationMs, message, timestamp: now })
  return job
}
