'use client'

import { useState, useEffect } from 'react'

interface Task {
  id: string
  title: string
  description: string
  status: 'backlog' | 'todo' | 'in_progress' | 'completed'
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: string
  assigned_to: string
  created_date: string
  updated_date: string
  completed_date: string | null
  estimated_hours: number
  actual_hours: number
  tags: string[]
}

interface TasksData {
  tasks: Task[]
  categories: Array<{ id: string; name: string; color: string; description: string }>
  priorities: Record<string, { label: string; color: string; order: number }>
  statuses: Record<string, { label: string; order: number }>
  stats: {
    backlog: number
    todo: number
    in_progress: number
    completed: number
    total: number
    byPriority: Record<string, number>
    byCategory: Record<string, number>
  }
}

const priorityColors = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
}

const categoryColors: Record<string, string> = {
  Memory: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  Dashboard: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Infrastructure: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Integration: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Automation: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  'Etc.': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

export default function TasksCard() {
  const [tasksData, setTasksData] = useState<TasksData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [updating, setUpdating] = useState<string | null>(null)

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

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    setUpdating(taskId)
    try {
      const response = await fetch('/api/charlotte/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          updates: { status: newStatus }
        })
      })
      
      if (response.ok) {
        await fetchTasks()
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    } finally {
      setUpdating(null)
    }
  }

  const filterTasks = (tasks: Task[]) => {
    return tasks.filter(task => {
      const categoryMatch = filterCategory === 'all' || task.category.toLowerCase() === filterCategory.toLowerCase()
      const priorityMatch = filterPriority === 'all' || task.priority === filterPriority
      return categoryMatch && priorityMatch
    })
  }

  const renderColumn = (status: 'backlog' | 'todo' | 'in_progress' | 'completed', title: string) => {
    if (!tasksData) return null

    const columnTasks = filterTasks(tasksData.tasks.filter(t => t.status === status))
    const count = columnTasks.length

    return (
      <div className="flex flex-col min-w-[280px] max-w-[320px]">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4 px-3">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {title}
          </h3>
          <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {count}
          </span>
        </div>

        {/* Tasks List */}
        <div className="flex-1 space-y-3 min-h-[200px]">
          {columnTasks.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">
              No tasks
            </div>
          ) : (
            columnTasks.map(task => (
              <div
                key={task.id}
                className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow ${
                  updating === task.id ? 'opacity-50' : ''
                }`}
              >
                {/* Priority Badge */}
                <div className="flex items-start justify-between mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  {/* Quick Status Buttons */}
                  <div className="flex gap-1">
                    {status !== 'backlog' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'backlog')}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Move to Backlog"
                      >
                        ⏪
                      </button>
                    )}
                    {status !== 'completed' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, status === 'backlog' ? 'todo' : status === 'todo' ? 'in_progress' : 'completed')}
                        className="text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                        title="Move Forward"
                      >
                        ▶️
                      </button>
                    )}
                  </div>
                </div>

                {/* Task Title */}
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {task.title}
                </h4>

                {/* Task Description */}
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {task.description}
                </p>

                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${categoryColors[task.category] || categoryColors['Etc.']}`}>
                    {task.category}
                  </span>
                </div>

                {/* Time Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>⏱️ {task.estimated_hours}h est.</span>
                  {task.actual_hours > 0 && (
                    <span className="text-blue-600 dark:text-blue-400">
                      {task.actual_hours}h actual
                    </span>
                  )}
                </div>

                {/* Completed Date */}
                {task.completed_date && (
                  <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                    ✓ {new Date(task.completed_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="col-span-full bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
        <div className="px-5 py-4">
          <div className="animate-pulse flex items-center justify-center h-64">
            <div className="text-gray-400 dark:text-gray-500">Loading tasks...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!tasksData) {
    return (
      <div className="col-span-full bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
        <div className="px-5 py-4">
          <div className="text-center text-red-600 dark:text-red-400">
            Failed to load tasks
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="col-span-full bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">
              📋 Task Management
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {tasksData.stats.total} total tasks • {tasksData.stats.in_progress} in progress • {tasksData.stats.completed} completed
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="all">All Categories</option>
              {tasksData.categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-5">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {renderColumn('backlog', '🗂️ Backlog')}
          {renderColumn('todo', '📝 To Do')}
          {renderColumn('in_progress', '🚀 In Progress')}
          {renderColumn('completed', '✅ Completed')}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex gap-4">
            <span className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-red-600 dark:text-red-400">{tasksData.stats.byPriority.critical}</span> Critical
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-orange-600 dark:text-orange-400">{tasksData.stats.byPriority.high}</span> High
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-yellow-600 dark:text-yellow-400">{tasksData.stats.byPriority.medium}</span> Medium
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-green-600 dark:text-green-400">{tasksData.stats.byPriority.low}</span> Low
            </span>
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            Last updated: {new Date(tasksData.tasks[0]?.updated_date || Date.now()).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  )
}
