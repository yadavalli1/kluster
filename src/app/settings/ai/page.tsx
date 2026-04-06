'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { ArrowLeft, Key, Eye, EyeOff, Check } from 'lucide-react';
import Link from 'next/link';

interface Workspace {
  id: string;
  name: string;
}

const PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4-turbo-preview', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    placeholder: 'sk-...',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
    placeholder: 'sk-ant-...',
  },
  {
    id: 'custom',
    name: 'Custom / Self-Hosted',
    models: [],
    placeholder: 'Your API key',
  },
];

export default function AISettingsPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState('');
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4-turbo-preview');
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [showKey, setShowKey] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/workspaces')
      .then((r) => r.json())
      .then((data) => {
        setWorkspaces(data);
        if (data.length === 1) setWorkspaceId(data[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/ai-settings?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => {
        setProvider(data.provider || 'openai');
        setModel(data.model || 'gpt-4-turbo-preview');
        setHasExistingKey(data.hasKey || false);
        setEndpoint(data.endpoint || '');
        setTemperature(data.temperature ?? 0.7);
        setMaxTokens(data.maxTokens ?? 4096);
        setApiKey('');
      })
      .catch(() => {});
  }, [workspaceId]);

  const currentProvider = PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];

  function handleProviderChange(newProvider: string) {
    setProvider(newProvider);
    const p = PROVIDERS.find((pr) => pr.id === newProvider);
    if (p && p.models.length > 0) {
      setModel(p.models[0]);
    } else {
      setModel('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          provider,
          model,
          ...(apiKey && { apiKey }),
          endpoint: provider === 'custom' ? endpoint : undefined,
          temperature,
          maxTokens,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save settings');
        return;
      }

      setSuccess('AI settings saved successfully');
      setHasExistingKey(true);
      setApiKey('');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-zinc-200 bg-white px-8 py-6 dark:border-zinc-800 dark:bg-zinc-950">
          <Link
            href="/settings"
            className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/20">
              <Key className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">AI API Keys</h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Bring your own API key to use AI features.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-xl p-8">
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Your API keys are stored securely and only used for AI features within your workspace.
              Keys are never shared with other users or workspaces.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="workspace" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Workspace
              </label>
              <select
                id="workspace"
                required
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="">Select a workspace</option>
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>{ws.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                AI Provider
              </label>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProviderChange(p.id)}
                    className={`rounded-lg border px-4 py-3 text-center text-sm font-medium transition-colors ${
                      provider === p.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Model
              </label>
              {currentProvider.models.length > 0 ? (
                <select
                  id="model"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  {currentProvider.models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              ) : (
                <input
                  id="model"
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="model-name"
                  className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
                />
              )}
            </div>

            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                API Key
                {hasExistingKey && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <Check className="h-3 w-3" /> Key configured
                  </span>
                )}
              </label>
              <div className="relative mt-1">
                <input
                  id="apiKey"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={hasExistingKey ? '••••••••  (leave blank to keep current)' : currentProvider.placeholder}
                  className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 pr-10 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {provider === 'custom' && (
              <div>
                <label htmlFor="endpoint" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  API Endpoint
                </label>
                <input
                  id="endpoint"
                  type="url"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://api.example.com/v1"
                  className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="temperature" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Temperature <span className="text-zinc-400">({temperature})</span>
                </label>
                <input
                  id="temperature"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="mt-2 w-full accent-indigo-600"
                />
              </div>
              <div>
                <label htmlFor="maxTokens" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Max Tokens
                </label>
                <input
                  id="maxTokens"
                  type="number"
                  min="256"
                  max="128000"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 4096)}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}

            <button
              type="submit"
              disabled={loading || !workspaceId}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save AI Settings'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
