'use client';

import { useState } from 'react';
import { 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Circle, 
  ArrowRight,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'BLOCKED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  dueDate?: Date;
  estimatedHours: number;
  actualHours?: number;
  dependencies: string[];
  tags: string[];
}

interface TaskBoardProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskCreate?: () => void;
}

const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'PENDING', label: 'To Do', color: 'bg-zinc-100 dark:bg-zinc-800' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'BLOCKED', label: 'Blocked', color: 'bg-red-50 dark:bg-red-900/20' },
  { id: 'COMPLETED', label: 'Done', color: 'bg-green-50 dark:bg-green-900/20' },
];

function TaskCard({ task, onUpdate }: { task: Task; onUpdate?: (id: string, updates: Partial<Task>) => void }) {
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'IN_PROGRESS':
        return <Circle className="h-5 w-5 text-blue-600" />;
      case 'BLOCKED':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-zinc-400" />;
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    const styles = {
      CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      LOW: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
    };

    return (
      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', styles[priority])}>
        {priority}
      </span>
    );
  };

  return (
    <div className="group rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={() => {
              const newStatus: TaskStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
              onUpdate?.(task.id, { status: newStatus });
            }}
            className="mt-0.5 transition-opacity hover:opacity-70"
          >
            {getStatusIcon(task.status)}
          </button>
          <div>
            <h4 className={cn(
              'font-medium text-zinc-900 dark:text-zinc-100',
              task.status === 'COMPLETED' && 'line-through text-zinc-500'
            )}>
              {task.title}
            </h4>
            {task.description && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {task.description}
              </p>
            )}
          </div>
        </div>
        <button className="opacity-0 transition-opacity group-hover:opacity-100">
          <MoreHorizontal className="h-4 w-4 text-zinc-400" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-4">
        {getPriorityBadge(task.priority)}
        
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}

        <div className="flex items-center gap-1 text-xs text-zinc-500">
          <Clock className="h-3 w-3" />
          {task.estimatedHours}h
        </div>
      </div>

      {task.dependencies.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
          <ArrowRight className="h-3 w-3" />
          <span>Depends on {task.dependencies.length} task(s)</span>
        </div>
      )}

      {task.assignedTo && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
            {task.assignedTo.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">{task.assignedTo}</span>
        </div>
      )}
    </div>
  );
}

export function TaskBoard({ tasks, onTaskUpdate, onTaskCreate }: TaskBoardProps) {
  const [filter, setFilter] = useState('');
  const [view, setView] = useState<'board' | 'list'>('board');

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(filter.toLowerCase()) ||
    task.description?.toLowerCase().includes(filter.toLowerCase())
  );

  const tasksByStatus = columns.reduce((acc, col) => {
    acc[col.id] = filteredTasks.filter(t => t.status === col.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const progress = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Tasks</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {progress.completed} of {progress.total} completed ({Math.round((progress.completed / progress.total) * 100) || 0}%)
            </p>
          </div>
          
          <button
            onClick={onTaskCreate}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          
          <button className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>

        <div className="mt-4 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{ width: `${(progress.completed / progress.total) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid h-full gap-6 md:grid-cols-4">
          {columns.map(column => (
            <div key={column.id} className="flex flex-col">
              <div className={cn('mb-3 rounded-lg px-3 py-2', column.color)}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                    {column.label}
                  </h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {tasksByStatus[column.id]?.length || 0}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                {tasksByStatus[column.id]?.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={onTaskUpdate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
