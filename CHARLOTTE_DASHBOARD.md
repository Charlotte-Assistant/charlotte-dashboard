# 🦞 Charlotte Health Status Dashboard

A comprehensive monitoring and management dashboard for Charlotte AI Assistant, built with Next.js and the Mosaic theme.

## 📋 Overview

The Charlotte Health Status Dashboard provides real-time monitoring and insights into:

- **System Status**: OpenClaw gateway status, uptime, and heartbeat monitoring
- **System Metrics**: Live CPU, memory, disk, and network usage
- **Active Integrations**: Status of connected services (Telegram, WhatsApp, Gmail, etc.)
- **Memory System**: Statistics on memory files, entries, and storage
- **Memory Search**: Full-text search across all memory files
- **Cluster Navigation**: Browse and explore memory clusters by topic

## 🗂️ Files Created

### Main Page
- **`app/(default)/charlotte/page.tsx`** - Main dashboard page with grid layout

### Components
- **`app/(default)/charlotte/status-card.tsx`** - System status (OpenClaw, Gateway, Uptime, Heartbeat)
- **`app/(default)/charlotte/system-metrics-card.tsx`** - Real-time system metrics (CPU, Memory, Disk, Network)
- **`app/(default)/charlotte/integrations-card.tsx`** - Active integrations display
- **`app/(default)/charlotte/memory-stats-card.tsx`** - Memory system statistics
- **`app/(default)/charlotte/memory-search-card.tsx`** - Memory search interface
- **`app/(default)/charlotte/cluster-navigation-card.tsx`** - Memory cluster browser

### API Routes
- **`app/api/charlotte/status/route.ts`** - Backend API for fetching real Charlotte data from OpenClaw

### Navigation
- **`components/ui/sidebar.tsx`** - Updated with Charlotte link (after Campaigns)

## 🚀 Features

### 1. System Status Card
- **OpenClaw Status**: Online/Offline/Degraded with pulsing indicator
- **Gateway Status**: Running/Stopped with checkmark
- **System Uptime**: Days, hours, minutes
- **Last Heartbeat**: Time since last heartbeat poll
- Auto-refreshes every 30 seconds

### 2. System Metrics Card
- **CPU Usage**: Real-time percentage with color-coded progress bar
- **Memory Usage**: RAM usage visualization
- **Disk Usage**: Storage consumption
- **Network Activity**: Download/upload speeds
- Live updates every 3 seconds

### 3. Integrations Card
- Display all connected services
- Status badges (Connected/Disconnected/Error)
- Last sync timestamps
- Quick actions menu
- Add new integration button

### 4. Memory Stats Card
- **Total Entries**: Count across all memory files
- **Daily Files**: Number of daily memory logs
- **Clusters**: Topic-based groupings
- **Storage Used**: Disk space for memory system
- **Recent Activity**: 24-hour activity breakdown
- Gradient stat cards for key metrics

### 5. Memory Search Card
- Full-text search across all memory files
- Search filters (All Files, Daily Only, MEMORY.md, Last 7 Days)
- Relevance scoring for results
- Source file and timestamp display
- Empty state and loading indicators

### 6. Cluster Navigation Card
- Browse memory clusters by topic
- Expandable cluster details
- Topic tags for each cluster
- Entry counts and last updated times
- Quick stats summary
- "Explore Cluster" action buttons

## 🔌 API Integration

The dashboard connects to real OpenClaw data via `/api/charlotte/status`:

**Checks performed:**
- OpenClaw gateway status (`openclaw gateway status`)
- System uptime (`uptime`)
- Memory file counts and entries
- CPU and memory metrics (`ps`, `vm_stat`)
- Network activity

**Response format:**
```json
{
  "status": "success",
  "data": {
    "openclaw": "online" | "offline" | "degraded",
    "gateway": "running" | "stopped",
    "uptime": "3d 14h 22m",
    "lastHeartbeat": "Just now",
    "memory": {
      "totalEntries": 2847,
      "dailyFiles": 89,
      "clusters": 23,
      "lastUpdated": "5 min ago",
      "storageUsed": "145 MB"
    },
    "metrics": {
      "cpu": 23,
      "memory": 42,
      "disk": 38,
      "network": {
        "in": "2.3 MB/s",
        "out": "0.8 MB/s"
      }
    }
  }
}
```

## 🎨 Design Patterns

### Mosaic Theme Integration
- Uses existing Mosaic components and utilities
- Consistent dark/light mode support
- Responsive grid layout (Tailwind CSS)
- Color palette matches Mosaic violet theme
- Smooth transitions and animations

### Component Structure
- **Client Components**: All cards use `'use client'` for interactivity
- **State Management**: React hooks (useState, useEffect)
- **Type Safety**: TypeScript interfaces for data structures
- **Loading States**: Skeleton loaders and spinners
- **Empty States**: Helpful placeholder content

### Color Coding
- **Green**: Healthy, connected, good performance
- **Yellow**: Warning, moderate usage
- **Red**: Error, disconnected, high usage
- **Violet**: Primary brand color for active/selected states
- **Blue/Orange/Pink**: Accent colors for different categories

## 🛠️ Usage

### Access the Dashboard
1. Navigate to: `http://localhost:3000/charlotte`
2. Or click **"🦞 Charlotte"** in the sidebar (under Campaigns)

### Customize Components
Each card component is self-contained and can be:
- Reordered in the grid layout
- Hidden/shown conditionally
- Extended with additional features
- Styled independently

### Extend API Data
To add real data sources:
1. Edit `app/api/charlotte/status/route.ts`
2. Add new system checks (e.g., integration health)
3. Update component interfaces to match
4. Refresh components to fetch new data

### Add New Cards
1. Create new component in `app/(default)/charlotte/`
2. Define data interface
3. Build UI with Mosaic theme patterns
4. Import and add to main page grid

## 📱 Responsive Design

- **Mobile**: Single column, stacked cards
- **Tablet**: 2-column grid for some cards
- **Desktop**: Full 12-column grid layout
- **Sidebar**: Collapsible on mobile, auto-expand on desktop

## 🔮 Future Enhancements

Potential additions:
- [ ] Real-time memory search with full-text indexing
- [ ] Semantic clustering visualization
- [ ] Integration health checks (ping APIs)
- [ ] Historical metrics charts (Chart.js integration)
- [ ] Alert notifications for issues
- [ ] System logs viewer
- [ ] Configuration editor
- [ ] Cron job manager
- [ ] Skill status display
- [ ] Session history timeline

## 🐛 Troubleshooting

**Dashboard shows "offline":**
- Check if OpenClaw gateway is running: `openclaw gateway status`
- Start gateway: `openclaw gateway start`

**Metrics not updating:**
- Verify API route is accessible: `curl http://localhost:3000/api/charlotte/status`
- Check console for errors
- Ensure workspace permissions allow file reads

**Search not working:**
- Verify memory files exist in `~/.openclaw/workspace/memory`
- Check file permissions
- Implement actual search API endpoint (currently mock data)

## 📝 Notes

- Components use mock data for demonstration
- API endpoint provides real system data where available
- Memory search needs backend implementation for production use
- Cluster analysis is placeholder (would need semantic grouping)
- All components support dark mode automatically

## 🎯 Key Files Summary

| File | Purpose | Type |
|------|---------|------|
| `page.tsx` | Main dashboard layout | Page |
| `status-card.tsx` | System status display | Component |
| `system-metrics-card.tsx` | CPU/Memory/Disk metrics | Component |
| `integrations-card.tsx` | Connected services | Component |
| `memory-stats-card.tsx` | Memory system stats | Component |
| `memory-search-card.tsx` | Search interface | Component |
| `cluster-navigation-card.tsx` | Cluster browser | Component |
| `route.ts` | Charlotte status API | API Route |
| `sidebar.tsx` | Navigation update | Layout |

---

**Built for Charlotte 🦞 by Claude Sonnet**
