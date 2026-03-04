import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

const MEMORY_PATH = path.join(process.env.HOME || '', '.openclaw/workspace/memory')

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const tag = searchParams.get('tag')
    const importance = searchParams.get('importance')
    const dateFrom = searchParams.get('from')
    const dateTo = searchParams.get('to')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!query && !tag && !importance) {
      return NextResponse.json({
        status: 'error',
        error: 'Query parameter required (q, tag, or importance)'
      }, { status: 400 })
    }

    const files = await fs.readdir(MEMORY_PATH)
    const dailyFiles = files.filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    const results: any[] = []

    for (const file of dailyFiles) {
      try {
        const date = file.replace('.md', '')
        
        // Date filtering
        if (dateFrom && date < dateFrom) continue
        if (dateTo && date > dateTo) continue

        const filePath = path.join(MEMORY_PATH, file)
        const content = await fs.readFile(filePath, 'utf-8')
        const parsed = matter(content)

        // Tag filtering
        if (tag && (!parsed.data.tags || !parsed.data.tags.includes(tag))) continue

        // Importance filtering
        if (importance && parsed.data.importance?.toLowerCase() !== importance.toLowerCase()) continue

        // Text search
        if (query) {
          const searchText = query.toLowerCase()
          const haystack = `${parsed.content} ${(parsed.data.tags || []).join(' ')}`.toLowerCase()
          
          if (!haystack.includes(searchText)) continue

          // Find matching snippets
          const lines = parsed.content.split('\n')
          const matches: string[] = []
          
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().includes(searchText)) {
              // Get context (line before and after)
              const start = Math.max(0, i - 1)
              const end = Math.min(lines.length, i + 2)
              matches.push(lines.slice(start, end).join('\n'))
            }
          }

          results.push({
            filename: file,
            date,
            importance: parsed.data.importance,
            tags: parsed.data.tags || [],
            related: parsed.data.related || [],
            matches: matches.slice(0, 3), // Top 3 matches
            score: matches.length
          })
        } else {
          // No text search, just return matching files
          results.push({
            filename: file,
            date,
            importance: parsed.data.importance,
            tags: parsed.data.tags || [],
            related: parsed.data.related || [],
            matches: [],
            score: 1
          })
        }
      } catch (error) {
        console.error(`Error searching ${file}:`, error)
      }
    }

    // Sort by score (relevance)
    results.sort((a, b) => b.score - a.score)

    return NextResponse.json({
      status: 'success',
      data: {
        query,
        filters: { tag, importance, dateFrom, dateTo },
        results: results.slice(0, limit),
        total: results.length
      }
    })
  } catch (error) {
    console.error('Error searching memory:', error)
    return NextResponse.json(
      { status: 'error', error: 'Failed to search memory' },
      { status: 500 }
    )
  }
}
