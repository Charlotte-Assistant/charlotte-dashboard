'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FolderKanban, TrendingUp, CheckCircle, Clock } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  progress: number;
  taskCount: number;
  completedCount: number;
  color: string;
}

export default function ProjectsCard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/charlotte/projects');
      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeProjects = projects.filter((p) => p.status === 'active');
  const totalProgress =
    activeProjects.length > 0
      ? Math.round(
          activeProjects.reduce((sum, p) => sum + p.progress, 0) / activeProjects.length
        )
      : 0;

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-violet-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Projects</h2>
          </div>
          <Link
            href="/charlotte/projects"
            className="text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
          >
            View All →
          </Link>
        </header>
      </div>

      <div className="flex-grow px-5 pb-5">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-gray-500 dark:text-gray-400">Loading projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No projects yet</p>
            <Link
              href="/charlotte/projects"
              className="text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400"
            >
              Create your first project
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {activeProjects.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-violet-600">{totalProgress}%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Avg Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {projects.reduce((sum, p) => sum + p.taskCount, 0)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Tasks</div>
              </div>
            </div>

            {/* Active Projects List */}
            <div className="space-y-3">
              {activeProjects.slice(0, 4).map((project) => (
                <Link
                  key={project.id}
                  href={`/charlotte/projects/${project.id}`}
                  className="block group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {project.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {project.completedCount}/{project.taskCount}
                      </span>
                      <span className="text-xs font-medium text-violet-600">
                        {project.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-violet-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </Link>
              ))}

              {activeProjects.length > 4 && (
                <Link
                  href="/charlotte/projects"
                  className="block text-center text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 pt-2"
                >
                  +{activeProjects.length - 4} more projects
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
