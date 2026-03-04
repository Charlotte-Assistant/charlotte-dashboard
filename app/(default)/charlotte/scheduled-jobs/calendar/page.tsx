export const metadata = {
  title: 'Scheduled Jobs Calendar - Charlotte Dashboard',
  description: 'Calendar view for all upcoming scheduled jobs',
}

import Link from 'next/link'
import CalendarView from '../calendar-view'

export default function ScheduledJobsCalendarPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">📅 Scheduled Jobs Calendar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visualize upcoming execution windows across all active jobs
          </p>
        </div>
        <Link href="/charlotte/scheduled-jobs" className="btn border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300">
          ← Back to Jobs
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-full">
          <CalendarView />
        </div>
      </div>
    </div>
  )
}
