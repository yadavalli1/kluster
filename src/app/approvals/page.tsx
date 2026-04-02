import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { 
  CheckCircle2, 
  XCircle, 
  Clock,
  FileText,
  GitCommit,
  Rocket,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const sampleApprovals = [
  {
    id: '1',
    type: 'PLAN',
    title: 'Technical Implementation Plan - Dashboard System',
    description: 'Plan v1.2 for monitoring dashboard with infrastructure metrics',
    requestedBy: 'Developer 1',
    requestedAt: '2025-04-01T10:00:00Z',
    status: 'PENDING',
    reviewers: ['Architect', 'Security Lead'],
  },
  {
    id: '2',
    type: 'DEPLOYMENT',
    title: 'Deploy v1.2.3 to Production',
    description: 'Deployment of dashboard system to production Kubernetes cluster',
    requestedBy: 'Developer 2',
    requestedAt: '2025-04-01T09:00:00Z',
    status: 'APPROVED',
    approvedBy: 'DevOps Lead',
    approvedAt: '2025-04-01T09:30:00Z',
  },
  {
    id: '3',
    type: 'PLAN',
    title: 'Technical Implementation Plan - Wiki System',
    description: 'Plan v1.0 for collaborative documentation platform',
    requestedBy: 'Developer 3',
    requestedAt: '2025-03-31T15:00:00Z',
    status: 'REJECTED',
    rejectedBy: 'Architect',
    rejectedAt: '2025-03-31T16:00:00Z',
    reason: 'Security requirements not addressed for authentication flow',
  },
];

function getTypeIcon(type: string) {
  switch (type) {
    case 'PLAN':
      return <FileText className="h-5 w-5 text-indigo-600" />;
    case 'DEPLOYMENT':
      return <Rocket className="h-5 w-5 text-green-600" />;
    default:
      return <GitCommit className="h-5 w-5 text-zinc-600" />;
  }
}

function getStatusBadge(status: string) {
  const styles = {
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  };

  const icons = {
    PENDING: Clock,
    APPROVED: CheckCircle2,
    REJECTED: XCircle,
  };

  const Icon = icons[status as keyof typeof icons];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${styles[status as keyof typeof styles]}`}>
      <Icon className="h-3 w-3" />
      {status.toLowerCase()}
    </span>
  );
}

export default async function ApprovalsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const pendingCount = sampleApprovals.filter(a => a.status === 'PENDING').length;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-zinc-200 bg-white px-8 py-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Approvals</h1>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                Review and approve plans, deployments, and other critical changes.
              </p>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
                {pendingCount} pending approval{pendingCount > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        <div className="p-8">
          <div className="space-y-4">
            {sampleApprovals.map((approval) => (
              <div
                key={approval.id}
                className="rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      {getTypeIcon(approval.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                          {approval.title}
                        </h3>
                        {getStatusBadge(approval.status)}
                      </div>
                      
                      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                        {approval.description}
                      </p>
                      
                      <div className="mt-3 flex items-center gap-4 text-sm text-zinc-500">
                        <span>Requested by {approval.requestedBy}</span>
                        <span></span>
                        <span>
                          {new Date(approval.requestedAt).toLocaleDateString()} at{' '}
                          {new Date(approval.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {approval.status === 'APPROVED' && (
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-green-700 dark:text-green-400">
                            Approved by {approval.approvedBy} on{' '}
                            {new Date(approval.approvedAt!).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {approval.status === 'REJECTED' && (
                        <div className="mt-3 rounded-lg bg-red-50 p-3 dark:bg-red-900/10">
                          <div className="flex items-center gap-2 text-sm">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="font-medium text-red-700 dark:text-red-400">
                              Rejected by {approval.rejectedBy}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                            Reason: {approval.reason}
                          </p>
                        </div>
                      )}

                      {approval.status === 'PENDING' && approval.reviewers && (
                        <div className="mt-3">
                          <span className="text-sm text-zinc-500">Waiting for approval from:{' '}</span>
                          <span className="text-sm text-zinc-700 dark:text-zinc-300">
                            {approval.reviewers.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {approval.status === 'PENDING' && (
                      <>
                        <button className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700">
                          <CheckCircle2 className="h-4 w-4" />
                          Approve
                        </button>
                        <button className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20">
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </>
                    )}
                    <button className="rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
