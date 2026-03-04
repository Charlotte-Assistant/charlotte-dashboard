import { NextResponse } from 'next/server'
import {
  calculateStats,
  readScheduledJobsData,
  ScheduledJob,
  writeScheduledJobsData,
} from '@/lib/scheduled-jobs-store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const query = searchParams.get('q')?.toLowerCase().trim()

    const { data } = await readScheduledJobsData()

    const jobs = data.jobs.filter(job => {
      const statusMatch =
        !status ||
        status === 'all' ||
        (status === 'active' && job.active) ||
        (status === 'paused' && !job.active) ||
        (status === 'error' && (job.health === 'error' || job.lastRunStatus === 'failed'))

      const queryMatch =
        !query ||
        job.name.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.command.toLowerCase().includes(query) ||
        job.tags.some(tag => tag.toLowerCase().includes(query))

      return statusMatch && queryMatch
    })

    return NextResponse.json({
      status: 'success',
      data: {
        jobs,
        stats: calculateStats(data),
        lastUpdated: data.lastUpdated,
      },
    })
  } catch (error) {
    console.error('Failed to fetch scheduled jobs:', error)
    return NextResponse.json(
      { status: 'error', error: 'Failed to fetch scheduled jobs' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ScheduledJob>
    if (!body.name || !body.cron || !body.command) {
      return NextResponse.json(
        { status: 'error', error: 'name, cron, and command are required' },
        { status: 400 },
      )
    }

    const { filePath, data } = await readScheduledJobsData()
    const now = new Date().toISOString()

    const newJob: ScheduledJob = {
      id: body.id || `job-${Date.now().toString(36)}`,
      name: body.name,
      description: body.description || '',
      cron: body.cron,
      timezone: body.timezone || 'UTC',
      command: body.command,
      active: body.active ?? true,
      health: body.health || 'healthy',
      tags: Array.isArray(body.tags) ? body.tags : [],
      createdAt: now,
      updatedAt: now,
      lastRunAt: null,
      nextRunAt: body.nextRunAt || null,
      lastRunStatus: null,
      lastDurationMs: null,
      runCount: 0,
      successCount: 0,
      failureCount: 0,
    }

    data.jobs.unshift(newJob)
    const saved = await writeScheduledJobsData(filePath, data)

    return NextResponse.json(
      {
        status: 'success',
        data: {
          job: newJob,
          stats: calculateStats(saved),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Failed to create scheduled job:', error)
    return NextResponse.json(
      { status: 'error', error: 'Failed to create scheduled job' },
      { status: 500 },
    )
  }
}
