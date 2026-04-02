'use client';

import { useState } from 'react';
import { generatePlan, generateClarifyingQuestions, savePlanToDatabase, type GeneratedPlan } from '@/lib/ai/plan-generator';
import { Sparkles, Loader2, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanGeneratorProps {
  projectId?: string;
  specification: string;
  onPlanGenerated?: (plan: GeneratedPlan) => void;
}

export function PlanGenerator({ projectId, specification, onPlanGenerated }: PlanGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const generatedPlan = await generatePlan(specification);
      setPlan(generatedPlan);
      onPlanGenerated?.(generatedPlan);
    } catch (err) {
      setError('Failed to generate plan. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!plan || !projectId) return;
    
    setIsSaving(true);
    try {
      await savePlanToDatabase(projectId, plan);
    } catch (err) {
      setError('Failed to save plan.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white p-12 dark:border-zinc-800 dark:bg-zinc-900">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        <p className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Generating your plan...
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Analyzing requirements and creating technical tasks
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
        <button
          onClick={handleGenerate}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
            <Sparkles className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Generate Technical Plan
          </h3>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            AI will analyze your requirements and create a detailed implementation plan with tasks, dependencies, and estimates.
          </p>
          <button
            onClick={handleGenerate}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <Sparkles className="h-4 w-4" />
            Generate Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {plan.name}
          </h2>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">{plan.overview}</p>
        </div>
        <div className="flex items-center gap-3">
          {projectId && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Plan'}
            </button>
          )}
          <button
            onClick={handleGenerate}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Regenerate
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Architecture</h3>
          <div className="mt-4 space-y-3">
            <div>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Frontend:</span>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">{plan.architecture.frontend}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Backend:</span>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">{plan.architecture.backend}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Database:</span>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">{plan.architecture.database}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Timeline</h3>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-indigo-600">{plan.timeline.totalHours}</span>
              <span className="text-zinc-600 dark:text-zinc-400">hours estimated</span>
            </div>
            <div className="mt-4 space-y-2">
              {plan.timeline.phases.map((phase) => (
                <div key={phase.name} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">{phase.name}</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">{phase.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Tasks ({plan.tasks.length})</h3>
        <div className="mt-4 space-y-3">
          {plan.tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 rounded-lg border border-zinc-100 p-4 dark:border-zinc-800"
            >
              <div
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                  task.priority === 'CRITICAL' && 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
                  task.priority === 'HIGH' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
                  task.priority === 'MEDIUM' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
                  task.priority === 'LOW' && 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                )}
              >
                {task.priority[0]}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{task.title}</h4>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{task.description}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                  <span>{task.estimatedHours}h</span>
                  {task.dependencies && task.dependencies.length > 0 && (
                    <span>Depends on: {task.dependencies.join(', ')}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {plan.risks.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20">
          <h3 className="font-semibold text-amber-900 dark:text-amber-300">Risks & Mitigations</h3>
          <div className="mt-4 space-y-3">
            {plan.risks.map((risk, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      risk.severity === 'HIGH' && 'bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300',
                      risk.severity === 'MEDIUM' && 'bg-amber-200 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
                      risk.severity === 'LOW' && 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                    )}
                  >
                    {risk.severity}
                  </span>
                  <span className="text-sm text-amber-900 dark:text-amber-300">{risk.description}</span>
                </div>
                <p className="pl-14 text-sm text-amber-700 dark:text-amber-400">
                  Mitigation: {risk.mitigation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
