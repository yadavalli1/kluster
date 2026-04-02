import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Plus, Folder, Users, ArrowRight } from 'lucide-react';

export default async function WorkspacesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-zinc-200 bg-white px-8 py-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Workspaces</h1>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                Manage your workspaces and team resources.
              </p>
            </div>
            <Link
              href="/workspaces/new"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              New Workspace
            </Link>
          </div>
        </div>

        <div className="p-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="group relative rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/20">
                <Folder className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Personal Workspace</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Your personal workspace for individual projects.
              </p>
              <div className="mt-4 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  1 member
                </span>
                <span>3 projects</span>
              </div>
              <Link
                href="/workspaces/personal"
                className="mt-6 flex items-center gap-2 text-sm font-medium text-indigo-600 transition-colors group-hover:text-indigo-700"
              >
                View Workspace
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <Link
              href="/workspaces/new"
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 p-6 transition-colors hover:border-indigo-500 dark:border-zinc-700 dark:hover:border-indigo-500"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <Plus className="h-6 w-6 text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Create New Workspace</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
