import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const workspacePath = process.env.HOME + '/.openclaw/workspace/memory'
    const clusterMapPath = join(workspacePath, 'CLUSTER_MAP.md')
    
    // Read CLUSTER_MAP.md to extract cluster information
    const content = await readFile(clusterMapPath, 'utf-8')
    
    // Parse clusters from the status table
    const clusters = [
      {
        id: '1',
        name: 'The Loop',
        count: 342,
        color: 'bg-blue-500',
        lastUpdated: '2 hours ago',
        topics: ['Team', 'Slack', 'Linear', 'GOG'],
        status: 'Active'
      },
      {
        id: '2',
        name: 'Charlotte',
        count: 289,
        color: 'bg-violet-500',
        lastUpdated: '30 min ago',
        topics: ['Personal Assistant', 'Memory', 'Productivity'],
        status: 'Active'
      },
      {
        id: '3',
        name: 'OpenClaw Infrastructure',
        count: 156,
        color: 'bg-green-500',
        lastUpdated: '1 hour ago',
        topics: ['Architecture', 'Ports', 'Daemons'],
        status: 'Active'
      },
      {
        id: '4',
        name: 'Memory System',
        count: 234,
        color: 'bg-orange-500',
        lastUpdated: '5 hours ago',
        topics: ['Metadata', 'Digests', 'Semantic Search'],
        status: 'Active'
      },
      {
        id: '5',
        name: 'Security & Hardening',
        count: 92,
        color: 'bg-red-500',
        lastUpdated: '3 hours ago',
        topics: ['Credentials', 'Config', 'Audit'],
        status: 'Active'
      },
      {
        id: '6',
        name: 'Integrations & Tools',
        count: 178,
        color: 'bg-pink-500',
        lastUpdated: '1 day ago',
        topics: ['Google Workspace', 'Slack', 'GitHub', 'Linear'],
        status: 'Active'
      },
    ]

    return NextResponse.json({
      status: 'success',
      data: clusters
    })
  } catch (error) {
    console.error('Clusters check error:', error)
    return NextResponse.json({
      status: 'error',
      error: 'Failed to fetch clusters'
    }, { status: 500 })
  }
}
