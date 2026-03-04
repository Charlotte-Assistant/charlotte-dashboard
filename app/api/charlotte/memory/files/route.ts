import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

const MEMORY_PATH = path.join(process.env.HOME || '', '.openclaw/workspace/memory')

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'daily', 'digest', 'special', or 'all'
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const files = await fs.readdir(MEMORY_PATH)
    const results: any[] = []

    // Process daily files
    if (!type || type === 'all' || type === 'daily') {
      const dailyFiles = files.filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
      
      for (const file of dailyFiles) {
        try {
          const filePath = path.join(MEMORY_PATH, file)
          const content = await fs.readFile(filePath, 'utf-8')
          const stats = await fs.stat(filePath)
          const parsed = matter(content)

          results.push({
            type: 'daily',
            filename: file,
            date: file.replace('.md', ''),
            importance: parsed.data.importance,
            tags: parsed.data.tags || [],
            related: parsed.data.related || [],
            wordCount: content.split(/\s+/).length,
            size: stats.size,
            modified: stats.mtime.toISOString(),
            preview: parsed.content.substring(0, 200)
          })
        } catch (error) {
          console.error(`Error processing ${file}:`, error)
        }
      }
    }

    // Process digests
    if (!type || type === 'all' || type === 'digest') {
      try {
        const digestPath = path.join(MEMORY_PATH, 'digests')
        const digestFiles = await fs.readdir(digestPath)
        
        for (const file of digestFiles.filter(f => f.endsWith('.md'))) {
          try {
            const filePath = path.join(digestPath, file)
            const content = await fs.readFile(filePath, 'utf-8')
            const stats = await fs.stat(filePath)
            const parsed = matter(content)

            results.push({
              type: 'digest',
              filename: file,
              date: parsed.data.date || file.replace('.md', ''),
              period: parsed.data.period,
              tags: parsed.data.tags || [],
              wordCount: content.split(/\s+/).length,
              size: stats.size,
              modified: stats.mtime.toISOString(),
              preview: parsed.content.substring(0, 200)
            })
          } catch (error) {
            console.error(`Error processing digest ${file}:`, error)
          }
        }
      } catch {}
    }

    // Process special files
    if (!type || type === 'all' || type === 'special') {
      const specialFiles = [
        'MEMORY.md',
        'DECISIONS.md',
        'CLUSTERS.md',
        'CLUSTER_MAP.md',
        'RECALLS.md',
        'SEARCH.md',
        'INDEX.md',
        'README.md'
      ]

      for (const file of specialFiles) {
        try {
          const filePath = path.join(MEMORY_PATH, file)
          const content = await fs.readFile(filePath, 'utf-8')
          const stats = await fs.stat(filePath)

          results.push({
            type: 'special',
            filename: file,
            wordCount: content.split(/\s+/).length,
            size: stats.size,
            modified: stats.mtime.toISOString(),
            preview: content.substring(0, 200)
          })
        } catch {}
      }
    }

    // Sort by date/modified (newest first)
    results.sort((a, b) => {
      const dateA = a.date || a.modified
      const dateB = b.date || b.modified
      return dateB.localeCompare(dateA)
    })

    // Apply pagination
    const paginated = results.slice(offset, offset + limit)

    return NextResponse.json({
      status: 'success',
      data: {
        files: paginated,
        total: results.length,
        limit,
        offset
      }
    })
  } catch (error) {
    console.error('Error fetching memory files:', error)
    return NextResponse.json(
      { status: 'error', error: 'Failed to fetch memory files' },
      { status: 500 }
    )
  }
}
