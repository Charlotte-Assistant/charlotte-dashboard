export const metadata = {
  title: 'Scheduled Jobs - Charlotte Dashboard',
  description: 'Manage recurring automations and cron workloads',
}

import Link from 'next/link'
import CalendarView from './calendar-view'
import JobList from './job-list'

export default function ScheduledJobsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">⏱️ Scheduled Jobs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage, run, and monitor all recurring jobs in one place
          </p>
        </div>
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <Link href="/charlotte/scheduled-jobs/calendar" className="btn border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300">
            📅 Full Calendar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-full xl:col-span-7">
          <JobList />
        </div>
        <div className="col-span-full xl:col-span-5">
          <CalendarView />
        </div>
      </div>
    </div>
  )
}
