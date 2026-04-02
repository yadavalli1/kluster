import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { MarkdownEditor } from '@/components/markdown-editor';

export default async function SpecEditorPage() {
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
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Specification Editor
              </h1>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                Edit and preview your project specifications in Markdown format.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-6">
          <div className="h-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <MarkdownEditor
              onSave={async (value) => {
                'use server';
                console.log('Saving spec:', value);
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
