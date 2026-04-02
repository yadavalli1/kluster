import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';

export default async function DrawingBoardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 bg-white px-8 py-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Drawing Board</h1>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                Define your application requirements through guided conversation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800">
                <option value="conversational">Conversational Mode</option>
                <option value="structured">Structured Form</option>
                <option value="document">Document Editor</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto p-8">
            <div className="mx-auto max-w-3xl">
              <div className="space-y-6">
                <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                      <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-zinc-900 dark:text-zinc-100">
                        Hello! I will help you define your application requirements. Let us start with the basics.
                      </p>
                      <p className="mt-4 font-medium text-zinc-900 dark:text-zinc-100">
                        What are you building? Describe your application in a few sentences.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">You</span>
                  </div>
                  <div className="flex-1 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-zinc-600 dark:text-zinc-400">
                      I want to build a dashboard system like Grafana for monitoring infrastructure metrics...
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                      <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-zinc-900 dark:text-zinc-100">
                        Great! A monitoring dashboard with infrastructure metrics. Let me ask a few clarifying questions to better understand your needs.
                      </p>
                      <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
                        <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300">💡 Suggested clarifications:</p>
                        <ul className="mt-2 space-y-2 text-sm text-indigo-800 dark:text-indigo-300">
                          <li>What types of metrics will you be monitoring? (CPU, memory, network, etc.)</li>
                          <li>Do you need real-time streaming or is periodic polling sufficient?</li>
                          <li>Will you need alerting capabilities when thresholds are exceeded?</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-80 border-l border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Progress</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  1
                </div>
                <span className="text-sm text-zinc-900 dark:text-zinc-100">What</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-400">
                  2
                </div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Why</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-400">
                  3
                </div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Success Criteria</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-400">
                  4
                </div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Edge Cases</span>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Status</h4>
              <div className="mt-2 rounded-lg bg-yellow-100 px-3 py-2 dark:bg-yellow-900/20">
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Draft</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto flex max-w-3xl items-center gap-4">
            <textarea
              className="flex-1 resize-none rounded-lg border border-zinc-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              rows={2}
              placeholder="Type your response..."
            />
            <button className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
