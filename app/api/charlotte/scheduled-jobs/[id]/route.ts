import { NextResponse } from 'next/server'
import {
  calculateStats,
  readScheduledJobsData,
  ScheduledJob,
  writeScheduledJobsData,
} from '@/lib/scheduled-jobs-store'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params
    const { data } = await readScheduledJobsData()
    const job = data.jobs.find(item => item.id === id)

    if (!job) {
      return NextResponse.json({ status: 'error', error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({
      status: 'success',
      data: {
        job,
        logs: data.logs.filter(log => log.jobId === id).slice(0, 100),
      },
    })
  } catch (error) {
    console.error('Failed to fetch scheduled job:', error)
    return NextResponse.json(
      { status: 'error', error: 'Failed to fetch scheduled job' },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params
    const updates = (await request.json()) as Partial<ScheduledJob>
    const { filePath, data } = await readScheduledJobsData()

    const index = data.jobs.findIndex(item => item.id === id)
    if (index === -1) {
      return NextResponse.json({ status: 'error', error: 'Job not found' }, { status: 404 })
    }

    const current = data.jobs[index]
    const updated: ScheduledJob = {
      ...current,
      ...updates,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    }

    data.jobs[index] = updated
    const saved = await writeScheduledJobsData(filePath, data)

    return NextResponse.json({
      status: 'success',
      data: {
        job: updated,
        stats: calculateStats(saved),
      },
    })
  } catch (error) {
    console.error('Failed to update scheduled job:', error)
    return NextResponse.json(
      { status: 'error', error: 'Failed to update scheduled job' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params
    const { filePath, data } = await readScheduledJobsData()

    const index = data.jobs.findIndex(item => item.id === id)
    if (index === -1) {
      return NextResponse.json({ status: 'error', error: 'Job not found' }, { status: 404 })
    }

    const [removed] = data.jobs.splice(index, 1)
    data.logs = data.logs.filter(log => log.jobId !== id)

    const saved = await writeScheduledJobsData(filePath, data)

    return NextResponse.json({
      status: 'success',
      data: {
        removed,
        stats: calculateStats(saved),
      },
    })
  } catch (error) {
    console.error('Failed to delete scheduled job:', error)
    return NextResponse.json(
      { status: 'error', error: 'Failed to delete scheduled job' },
      { status: 500 },
    )
  }
}
