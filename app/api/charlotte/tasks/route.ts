import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const TASKS_FILE = join(process.env.HOME!, '.openclaw/workspace/TASKS.json')

export async function GET() {
  try {
    const content = await readFile(TASKS_FILE, 'utf-8')
    const data = JSON.parse(content)
    
    // Calculate statistics
    const stats = {
      backlog: data.tasks.filter((t: any) => t.status === 'backlog').length,
      todo: data.tasks.filter((t: any) => t.status === 'todo').length,
      in_progress: data.tasks.filter((t: any) => t.status === 'in_progress').length,
      completed: data.tasks.filter((t: any) => t.status === 'completed').length,
      total: data.tasks.length,
      byPriority: {
        critical: data.tasks.filter((t: any) => t.priority === 'critical').length,
        high: data.tasks.filter((t: any) => t.priority === 'high').length,
        medium: data.tasks.filter((t: any) => t.priority === 'medium').length,
        low: data.tasks.filter((t: any) => t.priority === 'low').length,
      },
      byCategory: {} as Record<string, number>
    }

    // Count by category
    data.categories.forEach((cat: any) => {
      stats.byCategory[cat.id] = data.tasks.filter((t: any) => 
        t.category.toLowerCase() === cat.name.toLowerCase()
      ).length
    })

    return NextResponse.json({
      status: 'success',
      data: {
        ...data,
        stats
      }
    })
  } catch (error) {
    console.error('Failed to read tasks:', error)
    return NextResponse.json({
      status: 'error',
      error: 'Failed to fetch tasks'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { taskId, updates } = body

    if (!taskId) {
      return NextResponse.json({
        status: 'error',
        error: 'taskId is required'
      }, { status: 400 })
    }

    const content = await readFile(TASKS_FILE, 'utf-8')
    const data = JSON.parse(content)

    const taskIndex = data.tasks.findIndex((t: any) => t.id === taskId)
    if (taskIndex === -1) {
      return NextResponse.json({
        status: 'error',
        error: 'Task not found'
      }, { status: 404 })
    }

    // Update task
    data.tasks[taskIndex] = {
      ...data.tasks[taskIndex],
      ...updates,
      updated_date: new Date().toISOString()
    }

    // If status changed to completed, set completed_date
    if (updates.status === 'completed' && !data.tasks[taskIndex].completed_date) {
      data.tasks[taskIndex].completed_date = new Date().toISOString()
    }

    // If status changed from completed, clear completed_date
    if (updates.status && updates.status !== 'completed') {
      data.tasks[taskIndex].completed_date = null
    }

    // Update lastUpdated timestamp
    data.lastUpdated = new Date().toISOString()

    await writeFile(TASKS_FILE, JSON.stringify(data, null, 2), 'utf-8')

    return NextResponse.json({
      status: 'success',
      data: {
        task: data.tasks[taskIndex]
      }
    })
  } catch (error) {
    console.error('Failed to update task:', error)
    return NextResponse.json({
      status: 'error',
      error: 'Failed to update task'
    }, { status: 500 })
  }
}
