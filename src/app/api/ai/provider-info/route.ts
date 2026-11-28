import { NextResponse } from 'next/server';
import { resolveAiProvider } from '@/lib/ai/provider';
import { requireSession } from '@/lib/api/auth-guard';

export async function GET() {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const resolved = resolveAiProvider();
  return NextResponse.json({
    mode: resolved.mode,
    modelLabel: resolved.modelLabel,
  });
}
