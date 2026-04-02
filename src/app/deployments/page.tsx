import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { 
  Rocket, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';

const sampleDeployments = [
  {
    id: '1',
    version: 'v1.2.3',
    environment: 'Production',
    status: 'SUCCESS',
    target: 'Kubernetes',
    startedAt: '2025-04-01T10:30:00Z',
    duration: '4m 32s',
    commit: 'abc1234',
    triggeredBy: 'Developer 1',
  },
  {
    id: '2',
    version: 'v1.2.2',
    environment: 'Staging',
    status: 'IN_PROGRESS',
    target: 'Kubernetes',
    startedAt: '2025-04-01T15:00:00Z',
    duration: '2m 15s',
    commit: 'def5678',
    triggeredBy: 'CI/CD Pipeline',
  },
  {
    id: '3',
    version: 'v1.2.1',
    environment: 'Production',
    status: 'FAILED',
    target: 'AWS ECS',
    startedAt: '2025-03-31T08:00:00Z',
    duration: '8m 45s',
    commit: 'ghi9012',
    triggeredBy: 'Developer 2',
  },
];

function getStatusIcon(status: string) {
  switch (status) {
    case 'SUCCESS':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'IN_PROGRESS':
      return <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />;
    case 'FAILED':
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    default:
      return <Clock className="h-5 w-5 text-zinc-400" />;
  }
}

function getStatusBadge(status: string) {
  const styles = {
    SUCCESS: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    PENDING: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status as keyof typeof styles]}`}>
      {status === 'IN_PROGRESS' ? 'Deploying' : status.toLowerCase()}
    </span>
  );
}

export default async function DeploymentsPage() {
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
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Deployments</h1>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                Monitor and manage application deployments.
              </p>
            </div>
            <Link
              href="/deployments/new"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              <Rocket className="h-4 w-4" />
              New Deployment
            </Link>
          </div>
        </div>

        <div className="p-8">
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500">Version</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500">Environment</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500">Target</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500">Triggered</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {sampleDeployments.map((deployment) => (
                  <tr key={deployment.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(deployment.status)}
                        {getStatusBadge(deployment.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-zinc-900 dark:text-zinc-100">
                        {deployment.version}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {deployment.environment}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {deployment.target}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {deployment.duration}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-zinc-900 dark:text-zinc-100">{deployment.triggeredBy}</p>
                        <p className="text-zinc-500">{new Date(deployment.startedAt).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          <ExternalLink className="h-4 w-4 text-zinc-500" />
                        </button>
                        <button className="rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
