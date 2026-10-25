import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NVIDIA_DEFAULT_MODEL = 'nvidia/nemotron-3.5-super-vl-120b-a12b';
const OPENROUTER_DEFAULT_MODEL = 'openai/gpt-4o-mini';

export async function GET() {
  const openRouterConfigured = Boolean(process.env.OPENROUTER_API_KEY?.trim());
  const nvidiaConfigured = Boolean(process.env.NVIDIA_API_KEY?.trim());
  const provider = openRouterConfigured ? 'OpenRouter' : nvidiaConfigured ? 'NVIDIA NIM' : 'Not configured';
  const model = openRouterConfigured
    ? process.env.OPENROUTER_MODEL_ID?.trim() || OPENROUTER_DEFAULT_MODEL
    : process.env.NVIDIA_MODEL_ID?.trim() || NVIDIA_DEFAULT_MODEL;
  return NextResponse.json({
    provider,
    model,
    credentialConfigured: openRouterConfigured || nvidiaConfigured,
    credentialLocation: 'server',
    liveAnalysisEnabled: openRouterConfigured || nvidiaConfigured,
  });
}
