export const metadata = {
  title: 'Scheduled Job Details - Charlotte Dashboard',
  description: 'Inspect a scheduled job, run history, and logs',
}

import Link from 'next/link'
import JobDetails from '../job-details'

export default async function ScheduledJobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">⚙️ Job Details</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configuration, execution history, and logs
          </p>
        </div>
        <Link href="/charlotte/scheduled-jobs" className="btn border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300">
          ← Back to Jobs
        </Link>
      </div>

      <JobDetails jobId={id} />
    </div>
  )
}
