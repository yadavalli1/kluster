import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId');

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this workspace' }, { status: 403 });
  }

  const settings = await prisma.aISettings.findUnique({ where: { workspaceId } });

  if (!settings) {
    return NextResponse.json({ provider: 'openai', model: 'gpt-4-turbo-preview', hasKey: false, endpoint: null, temperature: 0.7, maxTokens: 4096 });
  }

  return NextResponse.json({
    provider: settings.provider,
    model: settings.model,
    hasKey: !!settings.apiKey,
    endpoint: settings.endpoint,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
  });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { workspaceId, provider, model, apiKey, endpoint, temperature, maxTokens } = body;

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
    return NextResponse.json({ error: 'Only owners and admins can update AI settings' }, { status: 403 });
  }

  if (!provider || !model) {
    return NextResponse.json({ error: 'Provider and model are required' }, { status: 400 });
  }

  const settings = await prisma.aISettings.upsert({
    where: { workspaceId },
    create: {
      workspaceId,
      provider,
      model,
      apiKey: apiKey || null,
      endpoint: endpoint || null,
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? 4096,
    },
    update: {
      provider,
      model,
      ...(apiKey !== undefined && { apiKey: apiKey || null }),
      endpoint: endpoint || null,
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? 4096,
    },
  });

  return NextResponse.json({
    provider: settings.provider,
    model: settings.model,
    hasKey: !!settings.apiKey,
    endpoint: settings.endpoint,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
  });
}
