import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

interface ModelInfo {
  id: string;
  name: string;
}

async function testOpenAI(apiKey: string): Promise<{ valid: boolean; models: ModelInfo[]; error?: string }> {
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { valid: false, models: [], error: data.error?.message || `HTTP ${res.status}` };
    }

    const data = await res.json();
    const chatModels = (data.data || [])
      .filter((m: { id: string }) =>
        m.id.startsWith('gpt-') || m.id.startsWith('o1') || m.id.startsWith('o3') || m.id.startsWith('o4')
      )
      .map((m: { id: string }) => ({ id: m.id, name: m.id }))
      .sort((a: ModelInfo, b: ModelInfo) => a.id.localeCompare(b.id));

    return { valid: true, models: chatModels };
  } catch (e) {
    return { valid: false, models: [], error: (e as Error).message };
  }
}

async function testAnthropic(apiKey: string): Promise<{ valid: boolean; models: ModelInfo[]; error?: string }> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { valid: false, models: [], error: data.error?.message || `HTTP ${res.status}` };
    }

    const data = await res.json();
    const models = (data.data || [])
      .map((m: { id: string; display_name?: string }) => ({ id: m.id, name: m.display_name || m.id }))
      .sort((a: ModelInfo, b: ModelInfo) => a.id.localeCompare(b.id));

    return { valid: true, models };
  } catch (e) {
    return { valid: false, models: [], error: (e as Error).message };
  }
}

async function testCustom(apiKey: string, endpoint: string): Promise<{ valid: boolean; models: ModelInfo[]; error?: string }> {
  try {
    const modelsUrl = endpoint.replace(/\/+$/, '') + '/models';
    const res = await fetch(modelsUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      return { valid: false, models: [], error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    const models = (data.data || [])
      .map((m: { id: string }) => ({ id: m.id, name: m.id }))
      .sort((a: ModelInfo, b: ModelInfo) => a.id.localeCompare(b.id));

    return { valid: true, models };
  } catch (e) {
    return { valid: false, models: [], error: (e as Error).message };
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { provider, apiKey, endpoint } = body;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required' }, { status: 400 });
  }

  let result;
  switch (provider) {
    case 'anthropic':
      result = await testAnthropic(apiKey);
      break;
    case 'custom':
      if (!endpoint) {
        return NextResponse.json({ error: 'Endpoint is required for custom providers' }, { status: 400 });
      }
      result = await testCustom(apiKey, endpoint);
      break;
    default:
      result = await testOpenAI(apiKey);
  }

  return NextResponse.json(result);
}
