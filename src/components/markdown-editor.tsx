'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Eye, Edit, Split, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

const Editor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  { ssr: false }
);

type ViewMode = 'edit' | 'preview' | 'split';

interface MarkdownEditorProps {
  initialValue?: string;
  onSave?: (value: string) => void;
  placeholder?: string;
}

const defaultTemplate = `# Project Specification

## What are you building?

Describe your application here...

## Why is this needed?

Explain the business use case and problem being solved...

## Success Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Requirements

### Frontend
- Framework: Next.js 14
- Styling: Tailwind CSS

### Backend
- API: REST/GraphQL
- Database: PostgreSQL

### Infrastructure
- Deployment: Kubernetes
- Monitoring: Prometheus + Grafana

## Edge Cases

1. What happens when...
2. How do we handle...

## Out of Scope

Explicitly define what is NOT included in this project:
- Feature A (future iteration)
- Feature B (not required for MVP)
`;

export function MarkdownEditor({
  initialValue = defaultTemplate,
  onSave,
  placeholder = 'Enter your specification...',
}: MarkdownEditorProps) {
  const [value, setValue] = useState(initialValue);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(value);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-800">
          <button
            onClick={() => setViewMode('edit')}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              viewMode === 'edit'
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700'
            )}
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              viewMode === 'preview'
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700'
            )}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              viewMode === 'split'
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700'
            )}
          >
            <Split className="h-4 w-4" />
            Split
          </button>
        </div>

        {onSave && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div
            className={cn(
              'overflow-hidden',
              viewMode === 'edit' ? 'w-full' : 'w-1/2 border-r border-zinc-200 dark:border-zinc-800'
            )}
          >
            <Editor
              value={value}
              onChange={(newValue) => setValue(newValue || '')}
              language="markdown"
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                fontSize: 14,
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            className={cn(
              'overflow-auto bg-white p-8 dark:bg-zinc-900',
              viewMode === 'preview' ? 'w-full' : 'w-1/2'
            )}
          >
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-6 mb-3">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-zinc-700 dark:text-zinc-300">
                      {children}
                    </li>
                  ),
                  p: ({ children }) => (
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-zinc-800 dark:text-zinc-200">
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-zinc-950 rounded-lg p-4 overflow-x-auto">
                        <code className={className}>{children}</code>
                      </pre>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-zinc-600 dark:text-zinc-400 my-4">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {value || placeholder}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
