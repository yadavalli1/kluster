import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Users, Mail, Shield } from 'lucide-react';

export default async function TeamPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-zinc-200 bg-white px-8 py-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Team</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Manage your team members and roles.
          </p>
        </div>

        <div className="p-8">
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Members</h2>
                <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
                  <Mail className="h-4 w-4" />
                  Invite Member
                </button>
              </div>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">You</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Current user</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Owner</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
            <Users className="mx-auto h-8 w-8 text-zinc-400" />
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Invite team members to collaborate on workspaces and projects.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
