'use client'

import { useState } from 'react'
import Link from 'next/link'

interface MemoryNode {
  id: string
  label: string
  description: string
  icon: string
  color: string
  link?: string
}

export default function MemoryArchitectureDiagram() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const nodes: MemoryNode[] = [
    {
      id: 'daily',
      label: 'Daily Logs',
      description: 'Raw notes with metadata (tags, importance, related)',
      icon: '📝',
      color: 'bg-blue-500',
      link: '/charlotte/memory/browser?type=daily'
    },
    {
      id: 'memory',
      label: 'Long-Term Memory',
      description: 'Curated insights and lessons (MEMORY.md)',
      icon: '🧠',
      color: 'bg-purple-500'
    },
    {
      id: 'decisions',
      label: 'Decision Log',
      description: 'Major choices with rationale & outcomes',
      icon: '⚖️',
      color: 'bg-green-500',
      link: '/charlotte/memory/decisions'
    },
    {
      id: 'digests',
      label: 'Digests',
      description: 'Weekly and monthly summaries',
      icon: '📊',
      color: 'bg-yellow-500',
      link: '/charlotte/memory/browser?type=digest'
    },
    {
      id: 'clusters',
      label: 'Clusters',
      description: 'Topic-based organization',
      icon: '🔗',
      color: 'bg-pink-500',
      link: '/charlotte/memory/clusters'
    },
    {
      id: 'search',
      label: 'Search System',
      description: 'Metadata-driven queries',
      icon: '🔍',
      color: 'bg-indigo-500',
      link: '/charlotte/memory/search'
    },
    {
      id: 'recalls',
      label: 'Proactive Recalls',
      description: 'Automatic context surfacing',
      icon: '💡',
      color: 'bg-orange-500'
    },
    {
      id: 'index',
      label: 'Navigation',
      description: 'INDEX.md, README.md',
      icon: '🗺️',
      color: 'bg-gray-500'
    }
  ]

  const dataFlow = [
    { from: 'daily', to: 'digests', label: 'Summarize' },
    { from: 'digests', to: 'memory', label: 'Curate' },
    { from: 'daily', to: 'clusters', label: 'Organize' },
    { from: 'clusters', to: 'search', label: 'Index' },
    { from: 'search', to: 'recalls', label: 'Surface' }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Memory Architecture</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Interactive visualization of Charlotte's memory structure and data flow
        </p>
      </header>
      <div className="p-6">
        
        {/* Architecture Diagram */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {nodes.map(node => (
            <div
              key={node.id}
              className={`relative group cursor-pointer transition-all duration-200 ${
                selectedNode === node.id ? 'scale-105 z-10' : ''
              }`}
              onMouseEnter={() => setSelectedNode(node.id)}
              onMouseLeave={() => setSelectedNode(null)}
            >
              {node.link ? (
                <Link href={node.link}>
                  <div className={`${node.color} bg-opacity-10 dark:bg-opacity-20 rounded-lg p-4 border-2 border-transparent hover:border-current transition-all`}>
                    <div className="text-3xl mb-2">{node.icon}</div>
                    <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100 mb-1">
                      {node.label}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {node.description}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className={`${node.color} bg-opacity-10 dark:bg-opacity-20 rounded-lg p-4 border-2 border-transparent hover:border-current transition-all`}>
                  <div className="text-3xl mb-2">{node.icon}</div>
                  <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100 mb-1">
                    {node.label}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {node.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Data Flow Visualization */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Data Flow
          </h3>
          <div className="space-y-2">
            {dataFlow.map((flow, idx) => {
              const fromNode = nodes.find(n => n.id === flow.from)
              const toNode = nodes.find(n => n.id === flow.to)
              return (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <span>{fromNode?.icon}</span>
                    <span className="text-gray-700 dark:text-gray-300">{fromNode?.label}</span>
                  </span>
                  <span className="text-gray-400 dark:text-gray-600">→</span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 italic">{flow.label}</span>
                  <span className="text-gray-400 dark:text-gray-600">→</span>
                  <span className="flex items-center gap-2">
                    <span>{toNode?.icon}</span>
                    <span className="text-gray-700 dark:text-gray-300">{toNode?.label}</span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Integration Points */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Key Integration Points
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🔗</span>
                <span className="font-medium text-sm text-gray-800 dark:text-gray-100">Clusters</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Topic-based organization with CLUSTERS.md and CLUSTER_MAP.md
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🔍</span>
                <span className="font-medium text-sm text-gray-800 dark:text-gray-100">Search</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Metadata-driven queries across all memory files
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">💡</span>
                <span className="font-medium text-sm text-gray-800 dark:text-gray-100">Recalls</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Automatic context surfacing when relevant
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
