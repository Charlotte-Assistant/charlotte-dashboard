import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

const MEMORY_PATH = path.join(process.env.HOME || '', '.openclaw/workspace/memory')

export async function GET() {
  try {
    const files = await fs.readdir(MEMORY_PATH)
    const dailyFiles = files.filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    
    const tagFreq: { [key: string]: number } = {}
    const tagFiles: { [key: string]: string[] } = {}

    for (const file of dailyFiles) {
      try {
        const filePath = path.join(MEMORY_PATH, file)
        const content = await fs.readFile(filePath, 'utf-8')
        const parsed = matter(content)

        if (parsed.data.tags && Array.isArray(parsed.data.tags)) {
          parsed.data.tags.forEach((tag: string) => {
            tagFreq[tag] = (tagFreq[tag] || 0) + 1
            if (!tagFiles[tag]) tagFiles[tag] = []
            tagFiles[tag].push(file)
          })
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error)
      }
    }

    const tags = Object.entries(tagFreq)
      .map(([tag, count]) => ({
        tag,
        count,
        files: tagFiles[tag]
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      status: 'success',
      data: {
        tags,
        total: tags.length,
        mostUsed: tags.slice(0, 10)
      }
    })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { status: 'error', error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}
