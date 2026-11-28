import type { NextRequest } from 'next/server';
import { db } from '@/db';
import { auditLogs } from '@/db/schema/core';
import type { AuthSession } from './auth-guard';

export type AuditExecutor = Pick<typeof db, 'insert'>;

export function extractClientIp(req?: NextRequest): string {
  return (
    req?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req?.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

export async function writeAuditLog(params: {
  moduleId: string;
  action: string;
  target: string;
  detail?: Record<string, unknown>;
  req?: NextRequest;
  session?: AuthSession;
  userId?: string | null;
  userName?: string;
  executor?: AuditExecutor;
  swallowError?: boolean;
}): Promise<void> {
  const executor = params.executor ?? db;
  const userId = params.userId !== undefined ? params.userId : (params.session?.user.id ?? null);
  const userName =
    params.userName ||
    params.session?.user.name ||
    params.session?.user.email ||
    'unknown';

  const run = async () => {
    await executor.insert(auditLogs).values({
      userId,
      userName,
      action: params.action,
      moduleId: params.moduleId,
      target: params.target,
      detail: params.detail ?? {},
      ipAddress: extractClientIp(params.req),
    });
  };

  if (params.swallowError) {
    try {
      await run();
    } catch {
      // Do not break primary mutation if audit log fails
    }
    return;
  }

  await run();
}
