import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { TaskBoard } from '@/components/task-board';

const sampleTasks = [
  {
    id: '1',
    title: 'Set up Next.js project structure',
    description: 'Initialize project with TypeScript, Tailwind, and App Router',
    status: 'COMPLETED' as const,
    priority: 'HIGH' as const,
    estimatedHours: 4,
    dependencies: [],
    tags: ['setup'],
    assignedTo: 'dev1',
  },
  {
    id: '2',
    title: 'Configure Prisma and database',
    description: 'Set up PostgreSQL schema and Prisma client',
    status: 'COMPLETED' as const,
    priority: 'CRITICAL' as const,
    estimatedHours: 6,
    dependencies: ['1'],
    tags: ['database'],
    assignedTo: 'dev1',
  },
  {
    id: '3',
    title: 'Implement authentication',
    description: 'Add Clerk authentication and protected routes',
    status: 'IN_PROGRESS' as const,
    priority: 'CRITICAL' as const,
    estimatedHours: 8,
    dependencies: ['1', '2'],
    tags: ['auth'],
    assignedTo: 'dev2',
  },
  {
    id: '4',
    title: 'Create Drawing Board UI',
    description: 'Build conversational requirements gathering interface',
    status: 'IN_PROGRESS' as const,
    priority: 'HIGH' as const,
    estimatedHours: 12,
    dependencies: ['3'],
    tags: ['ui'],
    assignedTo: 'dev2',
  },
  {
    id: '5',
    title: 'AI plan generation',
    description: 'Integrate OpenAI for technical plan generation',
    status: 'PENDING' as const,
    priority: 'HIGH' as const,
    estimatedHours: 10,
    dependencies: ['4'],
    tags: ['ai'],
    assignedTo: 'dev3',
  },
  {
    id: '6',
    title: 'Task management dashboard',
    description: 'Create kanban board for tracking tasks',
    status: 'IN_PROGRESS' as const,
    priority: 'MEDIUM' as const,
    estimatedHours: 8,
    dependencies: ['3'],
    tags: ['ui'],
    assignedTo: 'dev1',
  },
];

export default async function TasksPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <TaskBoard tasks={sampleTasks} />
      </main>
    </div>
  );
}
