import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PROJECTS_FILE = path.join(process.env.HOME || '', '.openclaw', 'workspace', 'PROJECTS.json');
const TASKS_FILE = path.join(process.env.HOME || '', '.openclaw', 'workspace', 'TASKS.json');

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  category: string;
  created_date: string;
  updated_date: string;
  tags: string[];
  color: string;
}

// GET /api/charlotte/projects - Fetch all projects
export async function GET() {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    const json = JSON.parse(data);
    
    // Enhance projects with task counts
    const tasksData = await fs.readFile(TASKS_FILE, 'utf-8');
    const tasksJson = JSON.parse(tasksData);
    
    const projectsWithStats = json.projects.map((project: Project) => {
      const projectTasks = tasksJson.tasks.filter((task: any) => task.projectId === project.id);
      const completedTasks = projectTasks.filter((task: any) => task.status === 'completed').length;
      const totalTasks = projectTasks.length;
      
      return {
        ...project,
        taskCount: totalTasks,
        completedCount: completedTasks,
        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      };
    });
    
    return NextResponse.json({
      projects: projectsWithStats,
      categories: json.categories,
      lastUpdated: json.lastUpdated,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/charlotte/projects - Create new project
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    const json = JSON.parse(data);
    
    const newProject: Project = {
      id: `proj-${String(json.projects.length + 1).padStart(3, '0')}`,
      name: body.name,
      description: body.description || '',
      status: body.status || 'active',
      category: body.category || 'Infrastructure',
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      tags: body.tags || [],
      color: body.color || '#3b82f6',
    };
    
    json.projects.push(newProject);
    json.lastUpdated = new Date().toISOString();
    
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(json, null, 2));
    
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
