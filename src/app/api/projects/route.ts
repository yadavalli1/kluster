import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, workspaceId, gitRepoUrl } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  if (!workspaceId) {
    return NextResponse.json({ error: 'Workspace is required' }, { status: 400 });
  }

  // Verify user is a member of the workspace
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this workspace' }, { status: 403 });
  }

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const existing = await prisma.project.findUnique({
    where: { workspaceId_slug: { workspaceId, slug } },
  });

  if (existing) {
    return NextResponse.json({ error: 'A project with this name already exists in this workspace' }, { status: 409 });
  }

  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      workspaceId,
      gitRepoUrl: gitRepoUrl?.trim() || null,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
