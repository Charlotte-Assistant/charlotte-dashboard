# Projects System - Visual Structure Guide

Quick reference for understanding the Projects system architecture.

---

## 📁 File Structure

```
charlotte-dashboard/
├── app/
│   ├── api/charlotte/
│   │   └── projects/
│   │       ├── route.ts                    # GET (list), POST (create)
│   │       └── [id]/
│   │           ├── route.ts                # PUT (update), DELETE (forget)
│   │           └── tasks/
│   │               └── route.ts            # GET (project tasks)
│   │
│   └── (default)/charlotte/
│       ├── page.tsx                        # Main dashboard (imports ProjectsCard)
│       ├── projects-card.tsx               # Dashboard summary widget
│       ├── projects/
│       │   ├── page.tsx                    # Projects list view
│       │   └── [id]/
│       │       └── page.tsx                # Project details view
│       └── tasks/
│           └── page.tsx                    # Updated with project filter
│
├── components/ui/
│   └── sidebar.tsx                         # Updated with Projects link
│
└── ~/.openclaw/workspace/
    ├── PROJECTS.json                       # Projects data file
    └── TASKS.json                          # Updated with projectId
```

---

## 🔄 Data Flow

### Reading Projects
```
UI Component
    ↓ fetch()
GET /api/charlotte/projects
    ↓ fs.readFile()
PROJECTS.json
    ↓ enhancement
Add task stats (taskCount, completedCount, progress)
    ↓ return
UI renders projects with stats
```

### Creating Project
```
UI Form
    ↓ POST request
POST /api/charlotte/projects
    ↓ generate ID
proj-XXX (sequential)
    ↓ fs.writeFile()
PROJECTS.json updated
    ↓ return
New project displayed
```

### Forgetting Project
```
UI "Forget Project" button
    ↓ confirmation modal
User confirms deletion
    ↓ DELETE request
DELETE /api/charlotte/projects/:id
    ↓ Step 1
Remove from PROJECTS.json
    ↓ Step 2
Unlink tasks in TASKS.json
    ↓ Step 3
Search MEMORY.md for mentions
    ↓ Step 4
Search memory/* files
    ↓ Step 5
Git commit changes
    ↓ return cleanup log
UI redirects to projects list
```

---

## 🎨 Component Hierarchy

```
Main Dashboard (/charlotte)
├── Projects Card
│   ├── Stats Summary (active count, avg progress)
│   └── Quick List (up to 4 projects)
│       └── Progress bars
│
├── [Other Cards...]

Projects List (/charlotte/projects)
├── Header with Filters
│   ├── All / Active / Paused / Completed
│   └── Project counts
├── Projects Grid
│   └── Project Cards
│       ├── Status badge
│       ├── Name & description
│       ├── Progress bar
│       ├── Task count
│       └── Tags
│
└── Empty state (if no projects)

Project Details (/charlotte/projects/:id)
├── Header
│   ├── Back button
│   ├── Project name & status
│   ├── Description
│   ├── Tags
│   └── Forget button
├── Stats Cards Row
│   ├── Total Tasks
│   ├── Completed
│   ├── In Progress
│   └── Progress %
├── Large Progress Bar
└── Tasks Section
    ├── Backlog
    ├── To Do
    ├── In Progress
    └── Completed
        └── Task Cards
            ├── Priority badge
            ├── Title & description
            └── Category badge

Tasks Page (/charlotte/tasks)
├── Header with Filters
│   ├── Project filter ← NEW!
│   ├── Category filter
│   └── Priority filter
└── Kanban Board
    └── Task Cards
        ├── [Existing badges]
        └── Project badge ← NEW!
```

---

## 🔗 Navigation Flow

```
Main Dashboard
    │
    ├─→ Projects Card → "View All" → Projects List
    │                                      │
    │                                      ├─→ Project Card → Project Details
    │                                      │                       │
    │                                      │                       └─→ Forget Project → Confirmation
    │                                      │                                                 │
    │                                      │                                                 └─→ Projects List
    │                                      │
    └─→ Sidebar "🗂️ Projects" ────────────┘

Tasks Page
    │
    ├─→ Project Filter Dropdown
    │       └─→ Select Project → Filtered Tasks
    │
    └─→ Task Card → Project Badge (visual only)
```

---

## 💾 Data Model Relationships

```
PROJECTS.json
├── projects[]
│   ├── id: "proj-001"
│   ├── name: "The Loop"
│   ├── description: "..."
│   ├── status: "active"
│   ├── category: "Team"
│   ├── tags: []
│   └── color: "#3b82f6"
│
└── categories[]

TASKS.json
├── tasks[]
│   ├── id: "task-001"
│   ├── title: "Memory System"
│   ├── projectId: "proj-003" ← LINK!
│   ├── status: "completed"
│   └── ...
│
├── categories[]
├── priorities{}
└── statuses{}

Relationship:
tasks.projectId → projects.id (one-to-many)
```

---

## 📊 Progress Calculation

```javascript
// Per Project
const projectTasks = tasks.filter(t => t.projectId === projectId)
const completedTasks = projectTasks.filter(t => t.status === 'completed')
const progress = (completedTasks.length / projectTasks.length) * 100

// Dashboard Average
const activeProjects = projects.filter(p => p.status === 'active')
const totalProgress = activeProjects.reduce((sum, p) => sum + p.progress, 0)
const avgProgress = totalProgress / activeProjects.length
```

---

## 🎯 Status Color Mapping

```javascript
const statusColors = {
  active: {
    badge: 'bg-green-500/10 text-green-600 border-green-500/20',
    icon: 'fill-green-500',
    hex: '#10b981'
  },
  paused: {
    badge: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    icon: 'text-yellow-500',
    hex: '#f59e0b'
  },
  completed: {
    badge: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    icon: 'text-gray-400',
    hex: '#6b7280'
  }
}
```

---

## 🔍 API Response Examples

### GET /api/charlotte/projects
```json
{
  "projects": [
    {
      "id": "proj-001",
      "name": "The Loop",
      "description": "...",
      "status": "active",
      "category": "Team",
      "created_date": "2026-03-01T00:00:00Z",
      "updated_date": "2026-03-03T22:49:00Z",
      "tags": ["team", "claudia"],
      "color": "#3b82f6",
      "taskCount": 0,
      "completedCount": 0,
      "progress": 0
    }
  ],
  "categories": [...],
  "lastUpdated": "2026-03-03T22:49:00.000Z"
}
```

### DELETE /api/charlotte/projects/:id
```json
{
  "success": true,
  "projectName": "Test Project",
  "removedItems": [
    "Removed project \"Test Project\" from PROJECTS.json",
    "Unlinked 3 task(s) from project",
    "Found 2 mention(s) of \"Test Project\" in MEMORY.md",
    "Changes committed to git"
  ]
}
```

---

## 🎨 UI State Management

```typescript
// Projects List Page
const [projects, setProjects] = useState<Project[]>([])
const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all')

// Project Details Page
const [project, setProject] = useState<Project | null>(null)
const [tasks, setTasks] = useState<Task[]>([])
const [showDeleteModal, setShowDeleteModal] = useState(false)
const [deleting, setDeleting] = useState(false)

// Dashboard Card
const [projects, setProjects] = useState<Project[]>([])
const [loading, setLoading] = useState(true)

// Tasks Page (updated)
const [projects, setProjects] = useState<Project[]>([])
const [filterProject, setFilterProject] = useState<string>('all')
```

---

## 🔧 Key Functions

### Enhanced Statistics
```typescript
// In GET /api/charlotte/projects
const projectsWithStats = json.projects.map(project => {
  const projectTasks = tasksJson.tasks.filter(
    task => task.projectId === project.id
  )
  const completedTasks = projectTasks.filter(
    task => task.status === 'completed'
  )
  
  return {
    ...project,
    taskCount: projectTasks.length,
    completedCount: completedTasks.length,
    progress: projectTasks.length > 0 
      ? Math.round((completedTasks.length / projectTasks.length) * 100)
      : 0
  }
})
```

### Project Lookup in Tasks
```typescript
const getProjectForTask = (projectId?: string) => {
  if (!projectId) return null
  return projects.find(p => p.id === projectId)
}

// Usage in task card
{task.projectId && (() => {
  const project = getProjectForTask(task.projectId)
  return project ? (
    <span style={{ 
      backgroundColor: `${project.color}20`,
      color: project.color 
    }}>
      🗂️ {project.name}
    </span>
  ) : null
})()}
```

---

## 🚀 Quick Reference

### Adding a New Project (Manual)
```bash
# Edit PROJECTS.json
{
  "id": "proj-007",
  "name": "New Project",
  "description": "Description",
  "status": "active",
  "category": "Infrastructure",
  "created_date": "2026-03-03T22:00:00Z",
  "updated_date": "2026-03-03T22:00:00Z",
  "tags": ["tag1"],
  "color": "#3b82f6"
}
```

### Linking a Task to Project
```bash
# Edit TASKS.json - add to any task:
"projectId": "proj-004"
```

### Routes to Test
```bash
# Development
http://localhost:3000/charlotte                 # Main dashboard
http://localhost:3000/charlotte/projects        # Projects list
http://localhost:3000/charlotte/projects/proj-004  # Project details
http://localhost:3000/charlotte/tasks           # Tasks with filter

# API
curl http://localhost:3000/api/charlotte/projects
curl http://localhost:3000/api/charlotte/projects/proj-004/tasks
```

---

## 🎯 Testing Shortcuts

```bash
# Start dev server
cd ~/charlotte-dashboard && npm run dev

# Quick visual test path:
1. Open dashboard → see Projects card
2. Click "View All" → see all 6 projects
3. Click "Charlotte Dashboard" project → see details
4. Note task count (should be 4)
5. Click "Forget Project" → see confirmation
6. Click Cancel (don't actually delete!)
7. Go to Tasks page → use project filter

# Data verification
cat ~/.openclaw/workspace/PROJECTS.json | jq '.projects | length'  # Should be 6
cat ~/.openclaw/workspace/TASKS.json | jq '.tasks | map(select(.projectId)) | length'  # Should be 10

# Git check
cd ~/.openclaw/workspace && git log --oneline -2
```

---

## 📚 Documentation Index

1. **PROJECTS_IMPLEMENTATION.md** - Complete technical documentation
2. **PROJECTS_TESTING.md** - Comprehensive testing checklist
3. **PROJECTS_DELIVERABLES.md** - Final deliverables summary
4. **PROJECTS_STRUCTURE.md** - This file (visual structure guide)

---

**Quick Start:** Read PROJECTS_DELIVERABLES.md first, then use this file as a reference while exploring the code.
