import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, description } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const existing = await prisma.workspace.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: 'A workspace with this name already exists' }, { status: 409 });
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      members: {
        create: {
          userId,
          role: 'OWNER',
        },
      },
    },
  });

  return NextResponse.json(workspace, { status: 201 });
}
