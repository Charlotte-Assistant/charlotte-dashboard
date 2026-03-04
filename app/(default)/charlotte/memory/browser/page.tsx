import { Suspense } from 'react'

export const metadata = {
  title: 'Memory Browser - Charlotte Dashboard',
  description: 'Browse Charlotte AI Memory Files',
}

import MemoryBrowserClient from './memory-browser-client'

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
    </div>
  )
}

export default function MemoryBrowserPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MemoryBrowserClient />
    </Suspense>
  )
}
