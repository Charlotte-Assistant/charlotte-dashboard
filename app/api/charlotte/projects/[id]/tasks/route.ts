import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const TASKS_FILE = path.join(process.env.HOME || '', '.openclaw', 'workspace', 'TASKS.json');

// GET /api/charlotte/projects/:id/tasks - Get all tasks for a project
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    const json = JSON.parse(data);
    
    const projectTasks = json.tasks.filter((task: any) => task.projectId === params.id);
    
    return NextResponse.json({
      tasks: projectTasks,
      categories: json.categories,
      priorities: json.priorities,
      statuses: json.statuses,
    });
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project tasks' },
      { status: 500 }
    );
  }
}
