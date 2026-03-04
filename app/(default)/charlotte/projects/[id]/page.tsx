'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Pause,
  Clock,
  Tag,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

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
  taskCount: number;
  completedCount: number;
  progress: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  projectId?: string;
  created_date: string;
  updated_date: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
      fetchProjectTasks();
    }
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch('/api/charlotte/projects');
      const data = await response.json();
      const foundProject = data.projects.find((p: Project) => p.id === projectId);
      setProject(foundProject || null);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectTasks = async () => {
    try {
      const response = await fetch(`/api/charlotte/projects/${projectId}/tasks`);
      const data = await response.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error('Error fetching project tasks:', error);
    }
  };

  const handleForgetProject = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/charlotte/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Project deleted:', result);
        router.push('/charlotte/projects');
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Check console for details.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'paused':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'completed':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const tasksByStatus = {
    backlog: tasks.filter((t) => t.status === 'backlog'),
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    completed: tasks.filter((t) => t.status === 'completed'),
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="text-center">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Project not found</p>
          <Link href="/charlotte/projects" className="text-violet-600 hover:text-violet-700">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/charlotte/projects"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                {project.name}
              </h1>
              <span
                className={`px-3 py-1 rounded text-sm font-medium border ${getStatusColor(
                  project.status
                )}`}
              >
                {project.status}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{project.description}</p>

            {/* Tags */}
            {project.tags.length > 0 && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-500/10 text-red-600 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Forget Project
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Tasks</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {project.taskCount}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-600">{project.completedCount}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Progress</div>
          <div className="text-2xl font-bold text-blue-600">
            {tasksByStatus.in_progress.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Progress</div>
          <div className="text-2xl font-bold text-violet-600">{project.progress}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Overall Progress
        </h2>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div
            className="bg-violet-500 h-4 rounded-full transition-all flex items-center justify-end pr-2"
            style={{ width: `${project.progress}%` }}
          >
            {project.progress > 10 && (
              <span className="text-xs font-medium text-white">{project.progress}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Tasks by Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Project Tasks
        </h2>

        {tasks.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No tasks assigned to this project yet.
          </p>
        ) : (
          <div className="space-y-6">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <div key={status}>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase">
                  {status.replace('_', ' ')} ({statusTasks.length})
                </h3>
                <div className="space-y-2">
                  {statusTasks.map((task) => (
                    <Link
                      key={task.id}
                      href="/charlotte/tasks"
                      className="block p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-violet-500 dark:hover:border-violet-500 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {task.title}
                            </h4>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {task.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Forget Project?</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will permanently delete <strong>{project.name}</strong> and:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-2 list-disc list-inside">
              <li>Remove from PROJECTS.json</li>
              <li>Unlink all associated tasks</li>
              <li>Flag references in MEMORY.md for review</li>
              <li>Search memory files for mentions</li>
              <li>Commit changes to git</li>
            </ul>
            <p className="text-sm text-red-600 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleForgetProject}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Forget Project
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
