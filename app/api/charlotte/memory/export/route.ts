import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

const MEMORY_PATH = path.join(process.env.HOME || '', '.openclaw/workspace/memory')

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const format = body.format || 'json' // json, markdown, or text
    const includeTypes = body.types || ['daily', 'digests', 'special']

    const exportData: any = {
      exported: new Date().toISOString(),
      version: '1.0',
      entries: []
    }

    const files = await fs.readdir(MEMORY_PATH)

    // Export daily files
    if (includeTypes.includes('daily')) {
      const dailyFiles = files.filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
      
      for (const file of dailyFiles) {
        const filePath = path.join(MEMORY_PATH, file)
        const content = await fs.readFile(filePath, 'utf-8')
        const parsed = matter(content)

        exportData.entries.push({
          type: 'daily',
          filename: file,
          date: file.replace('.md', ''),
          metadata: parsed.data,
          content: parsed.content
        })
      }
    }

    // Export digests
    if (includeTypes.includes('digests')) {
      try {
        const digestPath = path.join(MEMORY_PATH, 'digests')
        const digestFiles = await fs.readdir(digestPath)
        
        for (const file of digestFiles.filter(f => f.endsWith('.md'))) {
          const filePath = path.join(digestPath, file)
          const content = await fs.readFile(filePath, 'utf-8')
          const parsed = matter(content)

          exportData.entries.push({
            type: 'digest',
            filename: file,
            metadata: parsed.data,
            content: parsed.content
          })
        }
      } catch {}
    }

    // Export special files
    if (includeTypes.includes('special')) {
      const specialFiles = ['MEMORY.md', 'DECISIONS.md', 'CLUSTERS.md', 'CLUSTER_MAP.md', 'RECALLS.md', 'SEARCH.md']
      
      for (const file of specialFiles) {
        try {
          const filePath = path.join(MEMORY_PATH, file)
          const content = await fs.readFile(filePath, 'utf-8')
          
          exportData.entries.push({
            type: 'special',
            filename: file,
            content
          })
        } catch {}
      }
    }

    // Format output
    if (format === 'json') {
      return NextResponse.json({
        status: 'success',
        data: exportData
      })
    } else if (format === 'markdown') {
      let markdown = `# Memory Export\n\nExported: ${exportData.exported}\n\n---\n\n`
      
      exportData.entries.forEach((entry: any) => {
        markdown += `## ${entry.filename}\n\n`
        if (entry.metadata) {
          markdown += `**Metadata:**\n\`\`\`json\n${JSON.stringify(entry.metadata, null, 2)}\n\`\`\`\n\n`
        }
        markdown += `${entry.content}\n\n---\n\n`
      })

      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="memory-export-${Date.now()}.md"`
        }
      })
    } else {
      // Plain text
      let text = `Memory Export\nExported: ${exportData.exported}\n\n${'='.repeat(80)}\n\n`
      
      exportData.entries.forEach((entry: any) => {
        text += `File: ${entry.filename}\n${'-'.repeat(80)}\n\n`
        text += `${entry.content}\n\n${'='.repeat(80)}\n\n`
      })

      return new NextResponse(text, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="memory-export-${Date.now()}.txt"`
        }
      })
    }
  } catch (error) {
    console.error('Error exporting memory:', error)
    return NextResponse.json(
      { status: 'error', error: 'Failed to export memory' },
      { status: 500 }
    )
  }
}
