import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

const MEMORY_PATH = path.join(process.env.HOME || '', '.openclaw/workspace/memory')

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const groupBy = searchParams.get('groupBy') || 'day' // day, week, month

    const files = await fs.readdir(MEMORY_PATH)
    const dailyFiles = files.filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    
    const entries: any[] = []

    for (const file of dailyFiles) {
      try {
        const filePath = path.join(MEMORY_PATH, file)
        const content = await fs.readFile(filePath, 'utf-8')
        const stats = await fs.stat(filePath)
        const parsed = matter(content)

        const date = file.replace('.md', '')
        const dateObj = new Date(date)

        let groupKey = date
        if (groupBy === 'week') {
          const weekStart = new Date(dateObj)
          weekStart.setDate(dateObj.getDate() - dateObj.getDay())
          groupKey = weekStart.toISOString().split('T')[0]
        } else if (groupBy === 'month') {
          groupKey = date.substring(0, 7) // YYYY-MM
        }

        entries.push({
          date,
          groupKey,
          filename: file,
          importance: parsed.data.importance,
          tags: parsed.data.tags || [],
          related: parsed.data.related || [],
          wordCount: content.split(/\s+/).length,
          modified: stats.mtime.toISOString(),
          title: parsed.content.split('\n').find(l => l.startsWith('# '))?.replace('# ', '') || `Memory: ${date}`
        })
      } catch (error) {
        console.error(`Error processing ${file}:`, error)
      }
    }

    // Group entries
    const grouped: { [key: string]: any[] } = {}
    entries.forEach(entry => {
      if (!grouped[entry.groupKey]) grouped[entry.groupKey] = []
      grouped[entry.groupKey].push(entry)
    })

    // Sort groups by date (newest first)
    const timeline = Object.entries(grouped)
      .map(([key, items]) => ({
        period: key,
        entries: items,
        totalWords: items.reduce((sum, item) => sum + item.wordCount, 0),
        tags: Array.from(new Set(items.flatMap(item => item.tags)))
      }))
      .sort((a, b) => b.period.localeCompare(a.period))

    return NextResponse.json({
      status: 'success',
      data: {
        timeline,
        groupBy,
        totalEntries: entries.length
      }
    })
  } catch (error) {
    console.error('Error fetching timeline:', error)
    return NextResponse.json(
      { status: 'error', error: 'Failed to fetch timeline' },
      { status: 500 }
    )
  }
}
