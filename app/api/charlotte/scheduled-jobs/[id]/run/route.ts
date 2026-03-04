import { NextResponse } from 'next/server'
import {
  calculateStats,
  readScheduledJobsData,
  updateJobAfterRun,
  writeScheduledJobsData,
} from '@/lib/scheduled-jobs-store'

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params
    const { filePath, data } = await readScheduledJobsData()

    const job = data.jobs.find(item => item.id === id)
    if (!job) {
      return NextResponse.json({ status: 'error', error: 'Job not found' }, { status: 404 })
    }

    const durationMs = Math.floor(Math.random() * 20000) + 1000
    const didFail = Math.random() < 0.15
    const status = didFail ? 'failed' : 'success'
    const message = didFail
      ? `${job.name} failed during manual run.`
      : `${job.name} finished successfully.`

    const updated = updateJobAfterRun(data, id, status, durationMs, message)
    const saved = await writeScheduledJobsData(filePath, data)

    return NextResponse.json({
      status: 'success',
      data: {
        job: updated,
        run: {
          status,
          durationMs,
          message,
          timestamp: new Date().toISOString(),
        },
        stats: calculateStats(saved),
      },
    })
  } catch (error) {
    console.error('Failed to run scheduled job:', error)
    return NextResponse.json(
      { status: 'error', error: 'Failed to run scheduled job' },
      { status: 500 },
    )
  }
}
