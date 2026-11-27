import { NextResponse } from 'next/server';
import { resolveAiProvider } from '@/lib/ai/provider';

export async function GET() {
  const resolved = resolveAiProvider();
  return NextResponse.json({
    mode: resolved.mode,
    modelLabel: resolved.modelLabel,
  });
}
