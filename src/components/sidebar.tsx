'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FolderKanban,
  PenTool,
  Settings,
  Users,
  ChevronRight,
  Plus,
  CheckSquare,
  Rocket,
  GitBranch,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RealtimeNotifications } from './realtime-notifications';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNav: SidebarItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Workspaces', href: '/workspaces', icon: FolderKanban },
  { label: 'Drawing Board', href: '/drawing-board', icon: PenTool },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Deployments', href: '/deployments', icon: Rocket },
  { label: 'Git', href: '/git', icon: GitBranch },
  { label: 'Approvals', href: '/approvals', icon: FileText },
];

const bottomNav: SidebarItem[] = [
  { label: 'Team', href: '/team', icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  workspaceName?: string;
  projectName?: string;
}

export function Sidebar({ workspaceName, projectName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Kluster
          </span>
        </Link>
      </div>

      {(workspaceName || projectName) && (
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <nav className="flex items-center gap-1 text-sm">
            {workspaceName && (
              <>
                <span className="text-zinc-500">{workspaceName}</span>
                {projectName && (
                  <>
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {projectName}
                    </span>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <div className="mb-4 flex items-center justify-between">
          <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            New Project
          </button>
          <RealtimeNotifications />
        </div>

        <div className="space-y-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <nav className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <div className="space-y-1">
          {bottomNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
