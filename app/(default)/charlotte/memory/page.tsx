export const metadata = {
  title: 'Memory System - Charlotte Dashboard',
  description: 'Charlotte AI Memory System Overview',
}

import MemoryArchitectureDiagram from './memory-architecture-diagram'
import MemoryStatsPanel from './memory-stats-panel'
import MemoryHealthCard from './memory-health-card'
import QuickActionsCard from './quick-actions-card'

export default function MemoryPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">

      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">

        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            🧠 Memory System
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Charlotte's memory architecture, statistics, and management
          </p>
        </div>

        {/* Right: Actions */}
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <a
            href="/charlotte/memory/search"
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
          >
            <svg className="fill-current shrink-0" width="16" height="16" viewBox="0 0 16 16">
              <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
              <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
            </svg>
            <span className="ml-2">Search Memory</span>
          </a>
          <a
            href="/charlotte/memory/browser"
            className="btn border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
          >
            <span>Browse Files</span>
          </a>
        </div>

      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Memory Architecture Diagram - Full Width */}
        <div className="col-span-full">
          <MemoryArchitectureDiagram />
        </div>

        {/* Memory Statistics Panel */}
        <MemoryStatsPanel />

        {/* Memory Health Card */}
        <MemoryHealthCard />

        {/* Quick Actions */}
        <QuickActionsCard />

      </div>
    </div>
  )
}
