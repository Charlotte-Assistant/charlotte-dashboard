import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

const MEMORY_PATH = path.join(process.env.HOME || '', '.openclaw/workspace/memory')

interface MemoryEntry {
  date: string
  importance?: string
  tags?: string[]
  related?: string[]
  content: string
  wordCount: number
}

export async function GET() {
  try {
    // Check if memory directory exists
    try {
      await fs.access(MEMORY_PATH)
    } catch {
      return NextResponse.json({
        status: 'success',
        data: {
          totalEntries: 0,
          totalWords: 0,
          totalSize: '0 B',
          dailyFiles: 0,
          digests: 0,
          clusters: 0,
          decisions: 0,
          tags: [],
          topTags: [],
          importance: { high: 0, medium: 0, low: 0, untagged: 0 },
          recentFiles: [],
          healthScore: 0,
          recommendations: ['Memory system not initialized. Create memory directory to get started.']
        }
      })
    }

    const files = await fs.readdir(MEMORY_PATH)
    const entries: MemoryEntry[] = []
    const allTags: string[] = []
    const importance = { high: 0, medium: 0, low: 0, untagged: 0 }
    let totalWords = 0
    let totalSize = 0

    // Count different file types
    const dailyFiles = files.filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    let digestCount = 0
    let clusterCount = 0
    let decisionCount = 0

    // Check for digests
    try {
      const digestPath = path.join(MEMORY_PATH, 'digests')
      const digestFiles = await fs.readdir(digestPath)
      digestCount = digestFiles.filter(f => f.endsWith('.md')).length
    } catch {}

    // Check for specific files
    const specialFiles = ['CLUSTERS.md', 'CLUSTER_MAP.md', 'DECISIONS.md', 'RECALLS.md', 'SEARCH.md']
    for (const file of specialFiles) {
      try {
        await fs.access(path.join(MEMORY_PATH, file))
        if (file === 'CLUSTERS.md' || file === 'CLUSTER_MAP.md') clusterCount++
        if (file === 'DECISIONS.md') decisionCount++
      } catch {}
    }

    // Parse daily files for metadata
    for (const file of dailyFiles) {
      try {
        const filePath = path.join(MEMORY_PATH, file)
        const content = await fs.readFile(filePath, 'utf-8')
        const stats = await fs.stat(filePath)
        totalSize += stats.size

        const parsed = matter(content)
        const wordCount = content.split(/\s+/).length
        totalWords += wordCount

        entries.push({
          date: file.replace('.md', ''),
          importance: parsed.data.importance,
          tags: parsed.data.tags || [],
          related: parsed.data.related || [],
          content: parsed.content,
          wordCount
        })

        // Collect tags
        if (parsed.data.tags) {
          allTags.push(...parsed.data.tags)
        }

        // Count importance
        const imp = parsed.data.importance?.toLowerCase()
        if (imp === 'high') importance.high++
        else if (imp === 'medium') importance.medium++
        else if (imp === 'low') importance.low++
        else importance.untagged++
      } catch (error) {
        console.error(`Error processing ${file}:`, error)
      }
    }

    // Calculate tag frequency
    const tagFreq: { [key: string]: number } = {}
    allTags.forEach(tag => {
      tagFreq[tag] = (tagFreq[tag] || 0) + 1
    })

    const topTags = Object.entries(tagFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }))

    const uniqueTags = Object.keys(tagFreq).sort()

    // Recent files (last 7 days)
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const recentFiles = entries
      .filter(e => new Date(e.date) >= sevenDaysAgo)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(e => ({
        date: e.date,
        importance: e.importance,
        tags: e.tags,
        wordCount: e.wordCount
      }))

    // Calculate health score
    let healthScore = 0
    const recommendations: string[] = []

    // Points for organization
    if (importance.untagged === 0) healthScore += 25
    else if (importance.untagged < entries.length * 0.2) {
      healthScore += 15
      recommendations.push(`${importance.untagged} entries need importance tags`)
    } else {
      recommendations.push(`${importance.untagged} entries missing importance tags - consider reviewing`)
    }

    if (allTags.length > 0) healthScore += 25
    else recommendations.push('No tags found - add tags to improve searchability')

    if (clusterCount > 0) healthScore += 25
    else recommendations.push('No clusters found - consider organizing memories by topic')

    if (decisionCount > 0) healthScore += 25
    else recommendations.push('No decision log found - track important choices in DECISIONS.md')

    // Format size
    const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    return NextResponse.json({
      status: 'success',
      data: {
        totalEntries: entries.length,
        totalWords,
        totalSize: formatSize(totalSize),
        dailyFiles: dailyFiles.length,
        digests: digestCount,
        clusters: clusterCount,
        decisions: decisionCount > 0 ? 1 : 0,
        tags: uniqueTags,
        topTags,
        importance,
        recentFiles,
        healthScore,
        recommendations: recommendations.length > 0 ? recommendations : ['Memory system is well organized! 🎉']
      }
    })
  } catch (error) {
    console.error('Error fetching memory stats:', error)
    return NextResponse.json(
      { status: 'error', error: 'Failed to fetch memory statistics' },
      { status: 500 }
    )
  }
}
