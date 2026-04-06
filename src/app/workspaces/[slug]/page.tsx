import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Plus, Folder, ArrowRight, Users, Settings } from 'lucide-react';

export default async function WorkspaceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { slug } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: {
      projects: { where: { deletedAt: null }, orderBy: { updatedAt: 'desc' } },
      members: true,
    },
  });

  if (!workspace) notFound();

  const isMember = workspace.members.some((m) => m.userId === userId);
  if (!isMember) notFound();

  return (
    <div className="flex h-screen">
      <Sidebar workspaceName={workspace.name} />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-zinc-200 bg-white px-8 py-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{workspace.name}</h1>
              {workspace.description && (
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">{workspace.description}</p>
              )}
              <div className="mt-2 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {workspace.members.length} member{workspace.members.length !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Folder className="h-4 w-4" />
                  {workspace.projects.length} project{workspace.projects.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/settings/ai`}
                className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <Link
                href="/projects/new"
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                New Project
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Projects</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workspace.projects.map((project) => (
              <div
                key={project.id}
                className="group rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/20">
                    <Folder className="h-5 w-5 text-indigo-600" />
                  </div>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {project.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{project.name}</h3>
                {project.description && (
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <Link
                  href={`/drawing-board?project=${project.id}`}
                  className="mt-4 flex items-center gap-2 text-sm font-medium text-indigo-600 transition-colors group-hover:text-indigo-700"
                >
                  Open Project
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ))}

            <Link
              href="/projects/new"
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 p-6 transition-colors hover:border-indigo-500 dark:border-zinc-700 dark:hover:border-indigo-500"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <Plus className="h-6 w-6 text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Create New Project</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
