import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

const MEMORY_PATH = path.join(process.env.HOME || '', '.openclaw/workspace/memory')

export async function GET() {
  try {
    const decisionsPath = path.join(MEMORY_PATH, 'DECISIONS.md')
    
    try {
      const content = await fs.readFile(decisionsPath, 'utf-8')
      const parsed = matter(content)
      
      // Parse decisions from content
      // Looking for pattern: ### [Decision Title]
      const sections = parsed.content.split(/(?=^### )/m).filter(s => s.trim())
      
      const decisions = sections.map(section => {
        const lines = section.split('\n')
        const title = lines[0].replace(/^###\s*/, '').trim()
        
        // Extract metadata
        const dateMatch = section.match(/\*\*Date\*\*:\s*(\d{4}-\d{2}-\d{2})/)
        const statusMatch = section.match(/\*\*Status\*\*:\s*\[(.*?)\]/)
        const tagsMatch = section.match(/\*\*Tags\*\*:\s*\[(.*?)\]/)
        
        return {
          title,
          date: dateMatch?.[1] || null,
          status: statusMatch?.[1] || 'Unknown',
          tags: tagsMatch?.[1]?.split(',').map(t => t.trim()) || [],
          content: section
        }
      }).filter(d => d.title && d.title.length > 0)

      return NextResponse.json({
        status: 'success',
        data: {
          decisions,
          total: decisions.length,
          byStatus: {
            implemented: decisions.filter(d => d.status === 'Implemented').length,
            pending: decisions.filter(d => d.status === 'Pending').length,
            underReview: decisions.filter(d => d.status === 'Under Review').length,
            revisited: decisions.filter(d => d.status === 'Revisited').length
          }
        }
      })
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return NextResponse.json({
          status: 'success',
          data: {
            decisions: [],
            total: 0,
            byStatus: { implemented: 0, pending: 0, underReview: 0, revisited: 0 }
          }
        })
      }
      throw error
    }
  } catch (error) {
    console.error('Error fetching decisions:', error)
    return NextResponse.json(
      { status: 'error', error: 'Failed to fetch decisions' },
      { status: 500 }
    )
  }
}
