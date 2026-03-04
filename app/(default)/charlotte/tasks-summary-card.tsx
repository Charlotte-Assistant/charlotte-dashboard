'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface TasksData {
  tasks: Array<{
    id: string
    status: 'backlog' | 'todo' | 'in_progress' | 'completed'
    priority: 'critical' | 'high' | 'medium' | 'low'
    estimated_hours: number
  }>
  stats: {
    backlog: number
    todo: number
    in_progress: number
    completed: number
    total: number
    byPriority: Record<string, number>
  }
}

export default function TasksSummaryCard() {
  const [tasksData, setTasksData] = useState<TasksData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/charlotte/tasks')
      const result = await response.json()
      if (result.status === 'success') {
        setTasksData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
    // Refresh every 30 seconds
    const interval = setInterval(fetchTasks, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="col-span-full xl:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
        <div className="px-5 py-4">
          <div className="animate-pulse flex items-center justify-center h-32">
            <div className="text-gray-400 dark:text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!tasksData) {
    return (
      <div className="col-span-full xl:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
        <div className="px-5 py-4">
          <div className="text-center text-red-600 dark:text-red-400">
            Failed to load tasks
          </div>
        </div>
      </div>
    )
  }

  const completionPercentage = tasksData.stats.total > 0 
    ? Math.round((tasksData.stats.completed / tasksData.stats.total) * 100) 
    : 0

  const totalEstimatedHours = tasksData.tasks.reduce((sum, task) => sum + task.estimated_hours, 0)

  return (
    <div className="col-span-full xl:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700/60">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">
            📋 Tasks Overview
          </h2>
          <Link 
            href="/charlotte/tasks"
            className="text-sm font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
          >
            View All →
          </Link>
        </div>
      </div>

      {/* Card Content */}
      <div className="px-5 py-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Overall Progress
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {tasksData.stats.completed} / {tasksData.stats.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-violet-500 to-violet-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
            {completionPercentage}% complete
          </div>
        </div>

        {/* Status Counts Grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
              {tasksData.stats.backlog}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              🗂️ Backlog
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {tasksData.stats.todo}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              📝 To Do
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {tasksData.stats.in_progress}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              🚀 In Progress
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {tasksData.stats.completed}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ✅ Done
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700/60">
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{tasksData.stats.byPriority.critical || 0}</span> Critical
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{tasksData.stats.byPriority.high || 0}</span> High
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            ⏱️ {totalEstimatedHours}h total
          </div>
        </div>
      </div>
    </div>
  )
}
