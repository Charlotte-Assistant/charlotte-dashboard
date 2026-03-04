import { NextResponse } from 'next/server'
import { readScheduledJobsData } from '@/lib/scheduled-jobs-store'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit') || '50')

    const { data } = await readScheduledJobsData()
    const job = data.jobs.find(item => item.id === id)

    if (!job) {
      return NextResponse.json({ status: 'error', error: 'Job not found' }, { status: 404 })
    }

    const logs = data.logs
      .filter(log => log.jobId === id)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, Math.min(Math.max(limit, 1), 500))

    return NextResponse.json({
      status: 'success',
      data: {
        jobId: id,
        logs,
      },
    })
  } catch (error) {
    console.error('Failed to fetch scheduled job logs:', error)
    return NextResponse.json(
      { status: 'error', error: 'Failed to fetch scheduled job logs' },
      { status: 500 },
    )
  }
}
