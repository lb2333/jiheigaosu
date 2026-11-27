import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import {
  videoAirGroundPairs,
  videoAirGroundReviews,
} from '@/db/schema/domains/m10';
import {
  formatNowTimestamp,
  logM10Audit,
  requireWriteSession,
} from '../../../_utils';

const recheckSchema = z.object({
  uavRoute: z.string().trim().min(1, '请选择调度无人机航线').max(120),
  instruction: z.string().trim().min(1, '请填写复核指令说明').max(500),
});

async function handleRecheck(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse!;

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体 JSON 格式错误' }, { status: 400 });
  }

  const parsed = recheckSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '空地联合复核参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(videoAirGroundPairs)
    .where(eq(videoAirGroundPairs.id, id));

  if (!existing) {
    return NextResponse.json({ error: '未找到指定空地联动点位记录' }, { status: 404 });
  }

  const recheckTime = formatNowTimestamp();

  const [updatedPair] = await db
    .update(videoAirGroundPairs)
    .set({
      recheckSent: true,
      recheckTime,
    })
    .where(eq(videoAirGroundPairs.id, id))
    .returning();

  const [review] = await db
    .insert(videoAirGroundReviews)
    .values({
      pairId: existing.id,
      hazardId: existing.hazardId,
      camId: existing.camId,
      uavRoute: parsed.data.uavRoute,
      instruction: parsed.data.instruction,
      submittedBy: session.user.name,
      status: '已下发',
      recheckTime,
    })
    .returning();

  await logM10Audit({
    session,
    action: 'SUBMIT_AIRGROUND_RECHECK',
    target: `${existing.id} · ${existing.hazardId}`,
    detail: {
      camId: existing.camId,
      uavRoute: parsed.data.uavRoute,
      instruction: parsed.data.instruction,
      recheckTime,
    },
    req,
  });

  return NextResponse.json({ pair: updatedPair, review }, { status: 200 });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleRecheck(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleRecheck(req, context);
}
