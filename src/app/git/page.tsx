import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { GitBranch, GitCommit, Github, Plus, RefreshCw, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const sampleCommits = [
  { sha: 'abc1234', message: 'Initial commit: Kluster MVP', author: 'Developer 1', timestamp: '2 hours ago' },
  { sha: 'def5678', message: 'Add workspace management UI', author: 'Developer 2', timestamp: '3 hours ago' },
  { sha: 'ghi9012', message: 'Implement Drawing Board component', author: 'Developer 1', timestamp: '5 hours ago' },
];

const sampleBranches = [
  { name: 'main', isDefault: true, ahead: 0, behind: 0 },
  { name: 'feature/drawing-board', isDefault: false, ahead: 5, behind: 0 },
  { name: 'feature/ai-integration', isDefault: false, ahead: 12, behind: 2 },
];

export default async function GitIntegrationPage() {
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
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Git Integration</h1>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                Manage repository sync and version control.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                <RefreshCw className="h-4 w-4" />
                Sync
              </button>
              <Link
                href="https://github.com/kluster/dashboard"
                target="_blank"
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                <ExternalLink className="h-4 w-4" />
                View on GitHub
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">Commit History</span>
                  </div>
                  <span className="text-sm text-zinc-500">{sampleCommits.length} commits</span>
                </div>
                
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {sampleCommits.map((commit) => (
                    <div key={commit.sha} className="flex items-center gap-4 px-6 py-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                        <GitCommit className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{commit.message}</p>
                        <p className="text-sm text-zinc-500">
                          {commit.author} committed {commit.timestamp}
                        </p>
                      </div>
                      <span className="font-mono text-sm text-zinc-400">
                        {commit.sha.substring(0, 7)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">Branches</span>
                  </div>
                  <button className="rounded-md p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {sampleBranches.map((branch) => (
                    <div
                      key={branch.name}
                      className="flex items-center justify-between px-6 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-900 dark:text-zinc-100">
                          {branch.name}
                        </span>
                        {branch.isDefault && (
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            default
                          </span>
                        )}
                      </div>
                      {(branch.ahead > 0 || branch.behind > 0) && (
                        <span className="text-xs text-zinc-500">
                          {branch.ahead > 0 && `+${branch.ahead}`}
                          {branch.behind > 0 && `-${branch.behind}`}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
