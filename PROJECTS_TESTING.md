# Projects System - Testing Checklist

## 🧪 Manual Testing Guide

### Setup
```bash
cd ~/charlotte-dashboard
npm run dev
# Open http://localhost:3000/charlotte
```

---

## ✅ Test Scenarios

### 1. Main Dashboard
- [ ] Projects card appears on main dashboard
- [ ] Shows correct count of active projects (should be 6)
- [ ] Displays average progress percentage
- [ ] Shows total task count
- [ ] Lists up to 4 active projects with progress bars
- [ ] "View All →" link works
- [ ] Project colors display correctly

### 2. Projects List Page
**Navigation:**
- [ ] Click "🗂️ Projects" in sidebar → navigates to /charlotte/projects
- [ ] Click "View All →" on dashboard card → navigates to projects page

**Display:**
- [ ] All 6 projects display in grid
- [ ] Each card shows: name, description, status badge, progress bar, task count, tags
- [ ] Status colors correct: green (active), yellow (paused), gray (completed)
- [ ] Progress percentages match (calculated from tasks)

**Filters:**
- [ ] "All" button shows all 6 projects
- [ ] "Active" button shows 6 projects (all currently active)
- [ ] "Paused" button shows 0 projects
- [ ] "Completed" button shows 0 projects
- [ ] Filter counts update correctly in button text

**Interactions:**
- [ ] Hover effect on project cards
- [ ] Click any project → navigates to project detail page
- [ ] Tags truncate after 3 with "+X more" indicator

### 3. Project Details Page
**Navigation:**
- [ ] Click any project from projects list
- [ ] "Back to Projects" link works
- [ ] URL shows /charlotte/projects/:id

**Header:**
- [ ] Project name displays
- [ ] Status badge shows correct color and label
- [ ] Description displays
- [ ] Tags display with icons
- [ ] "Forget Project" button visible (red)

**Stats Cards:**
- [ ] Total Tasks shows correct count
- [ ] Completed shows correct count (green)
- [ ] In Progress shows correct count (blue)
- [ ] Progress % shows correct calculation (violet)

**Progress Bar:**
- [ ] Large progress bar displays
- [ ] Percentage label shows when progress > 10%
- [ ] Width matches progress percentage

**Tasks Section:**
- [ ] Tasks grouped by status (Backlog, To Do, In Progress, Completed)
- [ ] Each status shows correct count
- [ ] Task cards display with:
  - Title, description
  - Priority badge (correct color)
  - Category badge
- [ ] Empty states show "No tasks" message
- [ ] Task cards link to /charlotte/tasks

### 4. Forget Project Feature
**Modal Trigger:**
- [ ] Click "Forget Project" button
- [ ] Modal appears with warning icon
- [ ] Modal lists cleanup actions
- [ ] "This action cannot be undone" warning displays
- [ ] Cancel and Confirm buttons present

**Cancellation:**
- [ ] Click "Cancel" → modal closes
- [ ] Project still exists
- [ ] No changes to data

**Deletion:**
- [ ] Click "Forget Project" (confirm)
- [ ] Loading state shows
- [ ] Deletion completes successfully
- [ ] Redirects to /charlotte/projects
- [ ] Project no longer appears in list
- [ ] Check PROJECTS.json → project removed
- [ ] Check TASKS.json → projectId fields removed from tasks
- [ ] Check git log → commit exists: "chore: Forget project [name]"

### 5. Tasks Page Integration
**Navigation:**
- [ ] Navigate to /charlotte/tasks

**Project Filter:**
- [ ] "All Projects" dropdown appears in header
- [ ] Dropdown lists all 6 projects
- [ ] Select a project → tasks filter to show only that project
- [ ] Task count updates in header
- [ ] Kanban columns update correctly

**Project Badges on Tasks:**
- [ ] Tasks with projectId show project badge
- [ ] Badge matches project color
- [ ] Badge shows project name with 🗂️ icon
- [ ] Badge appears next to category badge
- [ ] Badge styling consistent (border, background)

**Filter Combinations:**
- [ ] Project filter + Category filter work together
- [ ] Project filter + Priority filter work together
- [ ] All three filters work together
- [ ] "All" options reset correctly

### 6. Sidebar Navigation
**Display:**
- [ ] "🗂️ Projects" link appears after "📋 Tasks"
- [ ] Icon displays correctly (folder SVG)
- [ ] Text shows "🗂️ Projects"

**Highlighting:**
- [ ] Link highlights when on /charlotte/projects
- [ ] Link highlights when on /charlotte/projects/:id
- [ ] Other nav items highlight correctly on their pages

**Responsive:**
- [ ] Sidebar collapses on mobile
- [ ] Projects link visible in collapsed state
- [ ] Expands/collapses correctly

---

## 🔍 API Testing

### Manual API Tests
Use browser console or Postman:

**GET /api/charlotte/projects**
```javascript
fetch('/api/charlotte/projects').then(r => r.json()).then(console.log)
```
- [ ] Returns 6 projects
- [ ] Each project has taskCount, completedCount, progress
- [ ] Progress percentages calculated correctly

**GET /api/charlotte/projects/:id/tasks**
```javascript
fetch('/api/charlotte/projects/proj-004/tasks').then(r => r.json()).then(console.log)
```
- [ ] Returns tasks for Charlotte Dashboard project
- [ ] Should return ~4 tasks (task-002, 003, 004, 008)

**POST /api/charlotte/projects** (Create)
```javascript
fetch('/api/charlotte/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Project',
    description: 'Testing project creation',
    status: 'active',
    category: 'Infrastructure',
    tags: ['test'],
    color: '#3b82f6'
  })
}).then(r => r.json()).then(console.log)
```
- [ ] Returns created project with id: proj-007
- [ ] Project appears in UI
- [ ] PROJECTS.json updated

**PUT /api/charlotte/projects/:id** (Update)
```javascript
fetch('/api/charlotte/projects/proj-007', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Updated Test Project',
    status: 'paused'
  })
}).then(r => r.json()).then(console.log)
```
- [ ] Returns updated project
- [ ] Changes reflect in UI
- [ ] PROJECTS.json updated

**DELETE /api/charlotte/projects/:id** (Forget)
```javascript
fetch('/api/charlotte/projects/proj-007', {
  method: 'DELETE'
}).then(r => r.json()).then(console.log)
```
- [ ] Returns cleanup log with removedItems array
- [ ] Project removed from PROJECTS.json
- [ ] Tasks unlinked in TASKS.json
- [ ] Git commit created

---

## 📁 Data Integrity Tests

### PROJECTS.json
- [ ] File exists at ~/.openclaw/workspace/PROJECTS.json
- [ ] Valid JSON format
- [ ] Contains 6 projects (after any deletions)
- [ ] All required fields present
- [ ] lastUpdated timestamp updates on changes

### TASKS.json
- [ ] File at ~/.openclaw/workspace/TASKS.json
- [ ] All tasks have projectId field (or null/undefined for unassigned)
- [ ] projectId values match existing project IDs
- [ ] No orphaned projectIds (referencing deleted projects)

### Git Integration
```bash
cd ~/.openclaw/workspace
git log --oneline -5
```
- [ ] Commits exist for project operations
- [ ] Commit messages follow format: "chore: Forget project [name]"
- [ ] PROJECTS.json and TASKS.json tracked

---

## 🎨 Visual Tests

### Responsive Design
**Desktop (>1024px):**
- [ ] Projects grid shows 3 columns
- [ ] Cards have consistent sizing
- [ ] Sidebar fully expanded

**Tablet (768-1024px):**
- [ ] Projects grid shows 2 columns
- [ ] Sidebar collapses/expands
- [ ] Filters stack or wrap correctly

**Mobile (<768px):**
- [ ] Projects grid shows 1 column
- [ ] Sidebar hidden by default
- [ ] Filters stack vertically
- [ ] Touch targets appropriately sized

### Dark Mode
- [ ] Toggle dark mode
- [ ] All cards have correct dark background
- [ ] Text remains readable
- [ ] Progress bars visible
- [ ] Badges have correct dark mode colors
- [ ] Status icons visible

### Animations
- [ ] Hover effects smooth
- [ ] Progress bar transitions smooth
- [ ] Modal fade in/out
- [ ] Loading states animate
- [ ] Page transitions smooth

---

## 🐛 Edge Cases

### Empty States
- [ ] Zero projects → shows empty message
- [ ] Zero tasks in project → shows "No tasks assigned"
- [ ] Filter returns zero results → shows "No projects found"

### Long Content
- [ ] Long project names wrap correctly
- [ ] Long descriptions truncate with ellipsis
- [ ] Many tags truncate with "+X more"
- [ ] Many projects scroll correctly

### Error Handling
- [ ] API failure → shows error message
- [ ] Invalid project ID → shows 404 message
- [ ] Network timeout → graceful degradation
- [ ] Invalid JSON → doesn't crash

---

## ⚡ Performance Tests

### Load Times
- [ ] Projects list loads < 1 second
- [ ] Project details loads < 500ms
- [ ] API responses < 200ms
- [ ] No blocking UI operations

### Real-time Updates
- [ ] Dashboard card updates on navigation back
- [ ] Projects list updates after deletion
- [ ] Task counts update correctly
- [ ] Progress bars recalculate on task updates

---

## ✅ Acceptance Criteria

**Must Pass:**
- [x] All 6 projects extracted from memory display correctly
- [x] Tasks properly linked to projects
- [x] Project details show accurate metrics
- [x] "Forget project" performs full cleanup
- [x] Git commits on deletion
- [x] UI matches dashboard design system
- [x] No console errors
- [x] Build succeeds
- [x] TypeScript types correct

**Nice to Have:**
- [ ] Animations smooth on all devices
- [ ] Dark mode fully tested
- [ ] Responsive on all breakpoints
- [ ] Accessibility keyboard navigation
- [ ] Screen reader support

---

## 🚀 Production Readiness

### Pre-Launch:
- [ ] Run full test suite
- [ ] Test on multiple browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile devices
- [ ] Verify data backup exists
- [ ] Review commit history
- [ ] Update documentation

### Post-Launch:
- [ ] Monitor for errors
- [ ] Verify git integration working
- [ ] Check PROJECTS.json/TASKS.json integrity
- [ ] Gather user feedback
- [ ] Plan iteration cycle

---

**Testing Status:** Ready for manual QA  
**Estimated Test Time:** 30-45 minutes for full suite  
**Critical Path:** Projects list → Details → Forget project → Verify cleanup
