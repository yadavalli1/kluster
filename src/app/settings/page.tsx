import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { UserProfile } from '@clerk/nextjs';
import Link from 'next/link';
import { Key, ChevronRight } from 'lucide-react';

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-zinc-200 bg-white px-8 py-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Manage your account and preferences.
          </p>
        </div>

        <div className="p-8 space-y-8">
          <Link
            href="/settings/ai"
            className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/20">
                <Key className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">AI API Keys</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Bring your own key — configure OpenAI, Anthropic, or custom providers.
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-400" />
          </Link>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Account</h2>
            <UserProfile />
          </div>
        </div>
      </main>
    </div>
  );
}
