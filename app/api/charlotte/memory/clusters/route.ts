import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

const MEMORY_PATH = path.join(process.env.HOME || '', '.openclaw/workspace/memory')

export async function GET() {
  try {
    const clustersPath = path.join(MEMORY_PATH, 'CLUSTERS.md')
    const clusterMapPath = path.join(MEMORY_PATH, 'CLUSTER_MAP.md')
    
    const clusters: any[] = []
    
    // Read CLUSTERS.md
    try {
      const content = await fs.readFile(clustersPath, 'utf-8')
      const parsed = matter(content)
      
      // Parse cluster sections (looking for ## [Cluster Name])
      const sections = parsed.content.split(/(?=^## )/m).filter(s => s.trim())
      
      sections.forEach(section => {
        const lines = section.split('\n')
        const titleLine = lines[0]
        if (!titleLine.startsWith('##')) return
        
        const name = titleLine.replace(/^##\s*/, '').replace(/\s*\[.*?\]\s*$/, '').trim()
        
        // Extract metadata
        const tagsMatch = section.match(/\*\*Tags\*\*:\s*`(.*?)`/)
        const entriesMatch = section.match(/\*\*Entries\*\*:\s*(\d+)/)
        const lastUpdatedMatch = section.match(/\*\*Last Updated\*\*:\s*(\d{4}-\d{2}-\d{2})/)
        
        clusters.push({
          name,
          tags: tagsMatch?.[1]?.split(',').map(t => t.trim()) || [],
          entries: parseInt(entriesMatch?.[1] || '0'),
          lastUpdated: lastUpdatedMatch?.[1] || null,
          preview: section.substring(0, 300)
        })
      })
    } catch (error: any) {
      if (error.code !== 'ENOENT') throw error
    }
    
    // Read CLUSTER_MAP.md for relationships
    let relationships: any[] = []
    try {
      const mapContent = await fs.readFile(clusterMapPath, 'utf-8')
      // Parse relationships if needed (simplified for now)
      relationships = []
    } catch {}

    return NextResponse.json({
      status: 'success',
      data: {
        clusters,
        total: clusters.length,
        relationships,
        totalEntries: clusters.reduce((sum, c) => sum + c.entries, 0)
      }
    })
  } catch (error) {
    console.error('Error fetching clusters:', error)
    return NextResponse.json(
      { status: 'error', error: 'Failed to fetch clusters' },
      { status: 500 }
    )
  }
}
