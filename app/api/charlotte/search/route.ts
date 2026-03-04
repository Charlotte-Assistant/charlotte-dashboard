import { NextResponse } from 'next/server'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query || query.trim() === '') {
      return NextResponse.json({
        status: 'success',
        data: []
      })
    }

    const workspacePath = process.env.HOME + '/.openclaw/workspace/memory'
    const files = await readdir(workspacePath)
    
    const results: Array<{
      id: string
      content: string
      source: string
      timestamp: string
      relevance: number
    }> = []

    // Search through markdown files
    const searchQuery = query.toLowerCase()
    let resultId = 0

    for (const file of files) {
      if (!file.endsWith('.md')) continue

      try {
        const filePath = join(workspacePath, file)
        const content = await readFile(filePath, 'utf-8')
        const lines = content.split('\n')

        // Search for matching lines
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()
          if (line.length === 0) continue

          const lowerLine = line.toLowerCase()
          if (lowerLine.includes(searchQuery)) {
            // Calculate simple relevance score
            const exactMatch = lowerLine === searchQuery
            const startsWithQuery = lowerLine.startsWith(searchQuery)
            const wordMatch = lowerLine.split(/\s+/).some(word => word === searchQuery)
            
            let relevance = 50
            if (exactMatch) relevance = 100
            else if (startsWithQuery) relevance = 90
            else if (wordMatch) relevance = 80
            else {
              // Partial match - score based on position
              const position = lowerLine.indexOf(searchQuery)
              relevance = Math.max(50, 75 - Math.floor(position / 10))
            }

            // Extract context (the line and maybe surrounding lines)
            let contextContent = line
            
            // Try to get a bit more context if the line is short
            if (line.length < 100 && i + 1 < lines.length) {
              const nextLine = lines[i + 1].trim()
              if (nextLine.length > 0 && !nextLine.startsWith('#') && !nextLine.startsWith('---')) {
                contextContent = `${line} ${nextLine}`
              }
            }

            // Limit content length
            if (contextContent.length > 200) {
              const queryPos = contextContent.toLowerCase().indexOf(searchQuery)
              const start = Math.max(0, queryPos - 80)
              const end = Math.min(contextContent.length, queryPos + 120)
              contextContent = (start > 0 ? '...' : '') + 
                              contextContent.substring(start, end) + 
                              (end < contextContent.length ? '...' : '')
            }

            results.push({
              id: `${resultId++}`,
              content: contextContent,
              source: `memory/${file}`,
              timestamp: file.match(/\d{4}-\d{2}-\d{2}/) ? file.replace('.md', '') : 'N/A',
              relevance
            })

            // Limit results per file to avoid overwhelming
            if (results.length >= 20) break
          }
        }

        if (results.length >= 20) break
      } catch (error) {
        console.error(`Error reading file ${file}:`, error)
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance)

    // Return top 10 results
    const topResults = results.slice(0, 10)

    return NextResponse.json({
      status: 'success',
      data: topResults
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({
      status: 'error',
      error: 'Failed to search memory files'
    }, { status: 500 })
  }
}
