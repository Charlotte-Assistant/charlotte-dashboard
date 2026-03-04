# Memory System - User Guide

## Quick Start

### 1. Access from Dashboard
Navigate to http://localhost:3001/charlotte and look for the **🧠 Memory System** card in the dashboard.

### 2. Access from Sidebar
Click **🧠 Memory** in the left sidebar for the main memory overview.

## Main Features

### 📊 Memory Overview (`/charlotte/memory`)

**What you'll see:**
- **Architecture Diagram** - Interactive visualization of how your memory system is organized
  - Daily Logs → Digests → Long-Term Memory
  - Clickable sections that link to detailed views
  
- **Statistics Panel**
  - Total entries, words, storage used
  - File breakdown (daily logs, digests, clusters, decisions)
  - Importance distribution chart
  - Top 10 most-used tags (clickable for search)
  
- **Health Card**
  - Score out of 100
  - Color-coded: Green (80+), Yellow (60-79), Red (<60)
  - Actionable recommendations
  - Recent activity (last 7 days)
  
- **Quick Actions**
  - 🔍 Search - Jump to search interface
  - 📁 Browse - Browse all files by type
  - 📅 Timeline - View chronological history
  - 🔗 Clusters - Topic organization
  - ⚖️ Decisions - View decision log
  - 💾 Export - Download as JSON or Markdown

### 🔍 Search (`/charlotte/memory/search`)

**How to use:**
1. Enter keywords in the search box
2. Optional: Add filters
   - **Tag:** Filter by specific tag
   - **Importance:** High/Medium/Low
   - **Date Range:** From/To dates
3. Click **Search**
4. View results with:
   - Relevance scores
   - Highlighted context snippets
   - Tags and importance badges
   - Click to see full entry

**Example searches:**
- "setup" - Find all setup-related memories
- Tag: "lesson" - All lessons learned
- Importance: "high" - Only high-priority entries
- Date range: Last month + Tag: "decision"

### 📁 Browser (`/charlotte/memory/browser`)

**What you can do:**
- Switch between tabs:
  - **All Files** - Everything
  - **Daily Logs** - Day-by-day memories (YYYY-MM-DD.md)
  - **Digests** - Weekly/monthly summaries
  - **Special Files** - MEMORY.md, DECISIONS.md, CLUSTERS.md, etc.
  
- For each file, see:
  - Filename and type badge
  - Date, word count, file size, last modified
  - Tags (clickable)
  - Importance level
  - Content preview

### 📅 Timeline (`/charlotte/memory/timeline`)

**View options:**
- **By Day** - Each day as a separate entry
- **By Week** - Group by week
- **By Month** - Monthly summaries

**What you'll see:**
- Visual timeline with dots for each period
- Entry count, total words, unique tags per period
- Expandable entries showing:
  - Title
  - Date
  - Importance
  - Tags
  - Word count

### 🔗 Clusters (`/charlotte/memory/clusters`)

**Organization by topic:**
- Cards for each cluster from CLUSTERS.md
- Click to view related memories
- See:
  - Cluster name
  - Entry count
  - Associated tags
  - Last updated
  - Preview text

### ⚖️ Decisions (`/charlotte/memory/decisions`)

**Filter by status:**
- All
- Implemented ✅
- Pending ⏳
- Under Review 🔍
- Revisited 🔄

**For each decision:**
- Title
- Date
- Status badge (color-coded)
- Tags
- Full decision content

### 💾 Export

**Available formats:**
1. **JSON** - Structured data with metadata
   ```json
   {
     "exported": "2026-03-03T...",
     "entries": [
       {
         "type": "daily",
         "filename": "2026-03-03.md",
         "metadata": {...},
         "content": "..."
       }
     ]
   }
   ```

2. **Markdown** - Readable format with sections
   ```markdown
   # Memory Export
   
   ## 2026-03-03.md
   
   **Metadata:**
   ...
   
   Content here...
   ```

3. **Plain Text** - Simple text format

**How to export:**
1. Go to main memory page
2. Click "Export JSON" or "Export MD"
3. File downloads automatically
4. Includes daily logs, digests, and special files

## Understanding Health Score

**Score Breakdown (0-100):**
- 25 points: All entries have importance tags
- 25 points: Tags are being used
- 25 points: Clusters are organized
- 25 points: Decision log exists

**Recommendations you might see:**
- "5 entries need importance tags" → Add importance to frontmatter
- "No tags found" → Start tagging your memories
- "No clusters found" → Create CLUSTERS.md to organize by topic
- "No decision log" → Create DECISIONS.md to track major choices
- "Memory system is well organized! 🎉" → Perfect score!

## Best Practices

### For Daily Logs
```markdown
---
date: 2026-03-03
importance: high
tags: [project-x, meeting, decision]
related: [infrastructure, team]
---

# Session Log — Monday, March 3rd, 2026

## Project X Meeting

Summary of what happened...
```

### For Decisions
```markdown
### Remove Old System in Favor of New System

**Date**: 2026-03-03
**Status**: [Implemented]
**Tags**: [architecture, migration]

**Context**
Why we needed to make this decision...

**Decision**
What we decided to do...

**Rationale**
Why this made sense...
```

### For Clusters
```markdown
## Infrastructure [Cluster]

**Tags**: `infrastructure, servers, deployment`
**Entries**: 12
**Last Updated**: 2026-03-03

Description of what this cluster contains...
```

## Tips

1. **Use tags consistently** - Same tag names across files
2. **Set importance** - Helps prioritize what matters
3. **Link related items** - Use the `related` field
4. **Regular reviews** - Check health score weekly
5. **Export backups** - Download JSON exports periodically

## Troubleshooting

**No data showing?**
- Ensure memory files exist in `~/.openclaw/workspace/memory/`
- Check file format has proper frontmatter

**Search not finding results?**
- Verify search terms are in the file content or tags
- Try broader search terms
- Check date filters

**Health score low?**
- Follow the recommendations in the Health Card
- Add missing metadata to files
- Create missing organizational files

## File Locations

- **Memory files:** `~/.openclaw/workspace/memory/`
- **Daily logs:** `memory/YYYY-MM-DD.md`
- **Digests:** `memory/digests/`
- **Special files:** `memory/MEMORY.md`, `memory/DECISIONS.md`, etc.

## Need Help?

The Memory System is designed to be intuitive. Explore the interface - all sections are clearly labeled and most actions have tooltips or descriptions. The architecture diagram on the main page shows how everything connects.
