export const metadata = {
  title: 'Charlotte Health Status - Mosaic',
  description: 'Charlotte AI Assistant Health Dashboard',
}

import StatusCard from './status-card'
import ChannelsCard from './channels-card'
import IntegrationsCard from './integrations-card'
import MemoryStatsCard from './memory-stats-card'
import MemorySearchCard from './memory-search-card'
import ClusterNavigationCard from './cluster-navigation-card'
import SystemMetricsCard from './system-metrics-card'
import TasksSummaryCard from './tasks-summary-card'
import ProjectsCard from './projects-card'

export default function CharlotteHealth() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">

      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">

        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            🦞 Charlotte Health Status
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor OpenClaw systems, integrations, and memory clusters
          </p>
        </div>

        {/* Right: Actions */}
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
            <svg className="fill-current shrink-0" width="16" height="16" viewBox="0 0 16 16">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1Z" />
            </svg>
            <span className="ml-2">Run Diagnostics</span>
          </button>
        </div>

      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* System Status - Full Width */}
        <StatusCard />

        {/* System Metrics */}
        <SystemMetricsCard />

        {/* Channels Display (Messaging Platforms) */}
        <ChannelsCard />

        {/* Integrations Display (Tools & APIs) */}
        <IntegrationsCard />

        {/* Task Management - Summary Card */}
        <TasksSummaryCard />

        {/* Projects Management Card */}
        <ProjectsCard />

        {/* Memory Stats */}
        <MemoryStatsCard />

        {/* Memory Search Interface */}
        <MemorySearchCard />

        {/* Cluster Navigation */}
        <ClusterNavigationCard />

      </div>
    </div>
  )
}
