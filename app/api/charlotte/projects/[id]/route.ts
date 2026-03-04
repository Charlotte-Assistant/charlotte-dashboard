import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PROJECTS_FILE = path.join(process.env.HOME || '', '.openclaw', 'workspace', 'PROJECTS.json');
const TASKS_FILE = path.join(process.env.HOME || '', '.openclaw', 'workspace', 'TASKS.json');
const MEMORY_FILE = path.join(process.env.HOME || '', '.openclaw', 'workspace', 'MEMORY.md');
const WORKSPACE_DIR = path.join(process.env.HOME || '', '.openclaw', 'workspace');

// PUT /api/charlotte/projects/:id - Update project
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    const json = JSON.parse(data);
    
    const projectIndex = json.projects.findIndex((p: any) => p.id === params.id);
    
    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    json.projects[projectIndex] = {
      ...json.projects[projectIndex],
      ...body,
      updated_date: new Date().toISOString(),
    };
    
    json.lastUpdated = new Date().toISOString();
    
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(json, null, 2));
    
    return NextResponse.json(json.projects[projectIndex]);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/charlotte/projects/:id - Forget/delete project with full cleanup
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const removedItems: string[] = [];
    
    // 1. Remove from PROJECTS.json
    const projectsData = await fs.readFile(PROJECTS_FILE, 'utf-8');
    const projectsJson = JSON.parse(projectsData);
    
    const projectIndex = projectsJson.projects.findIndex((p: any) => p.id === params.id);
    
    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    const projectName = projectsJson.projects[projectIndex].name;
    projectsJson.projects.splice(projectIndex, 1);
    projectsJson.lastUpdated = new Date().toISOString();
    
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(projectsJson, null, 2));
    removedItems.push(`Removed project "${projectName}" from PROJECTS.json`);
    
    // 2. Remove projectId from tasks in TASKS.json
    const tasksData = await fs.readFile(TASKS_FILE, 'utf-8');
    const tasksJson = JSON.parse(tasksData);
    
    let updatedTaskCount = 0;
    tasksJson.tasks = tasksJson.tasks.map((task: any) => {
      if (task.projectId === params.id) {
        updatedTaskCount++;
        const { projectId, ...taskWithoutProject } = task;
        return taskWithoutProject;
      }
      return task;
    });
    
    tasksJson.lastUpdated = new Date().toISOString();
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasksJson, null, 2));
    
    if (updatedTaskCount > 0) {
      removedItems.push(`Unlinked ${updatedTaskCount} task(s) from project`);
    }
    
    // 3. Clean up MEMORY.md references (simple approach - flag for manual review)
    try {
      const memoryContent = await fs.readFile(MEMORY_FILE, 'utf-8');
      const projectMentions = (memoryContent.match(new RegExp(projectName, 'gi')) || []).length;
      
      if (projectMentions > 0) {
        removedItems.push(`Found ${projectMentions} mention(s) of "${projectName}" in MEMORY.md (manual review recommended)`);
      }
    } catch (error) {
      removedItems.push('MEMORY.md not found or not readable');
    }
    
    // 4. Search memory/* files for references
    try {
      const memoryDir = path.join(WORKSPACE_DIR, 'memory');
      const memoryFiles = await fs.readdir(memoryDir);
      let memoryFileMatches = 0;
      
      for (const file of memoryFiles) {
        if (file.endsWith('.md') || file.endsWith('.json')) {
          const content = await fs.readFile(path.join(memoryDir, file), 'utf-8');
          const matches = (content.match(new RegExp(projectName, 'gi')) || []).length;
          if (matches > 0) {
            memoryFileMatches += matches;
          }
        }
      }
      
      if (memoryFileMatches > 0) {
        removedItems.push(`Found ${memoryFileMatches} mention(s) in memory/* files (manual cleanup recommended)`);
      }
    } catch (error) {
      // memory/ directory doesn't exist or is empty
    }
    
    // 5. Commit changes to git
    try {
      await execAsync(`cd "${WORKSPACE_DIR}" && git add PROJECTS.json TASKS.json`);
      await execAsync(`cd "${WORKSPACE_DIR}" && git commit -m "chore: Forget project ${projectName}"`);
      removedItems.push('Changes committed to git');
    } catch (error) {
      removedItems.push('Git commit skipped (no git repo or no changes)');
    }
    
    return NextResponse.json({
      success: true,
      projectName,
      removedItems,
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
