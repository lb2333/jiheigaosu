import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import {
  blacksoilParcels,
  type BlacksoilComplianceStatus,
} from '@/db/schema/domains/m14';
import { formatNowTimeLabel, logM14Audit, requireWriteSession } from '../../_utils';

const patchParcelSchema = z
  .object({
    topsoilCompliant: z.boolean().optional(),
    complianceStatus: z.enum(['已达标', '待核验', '整改中']).optional(),
    reviewNote: z.string().trim().max(300).optional(),
    topsoilThicknessCm: z.number().int().min(0).max(120).optional(),
  })
  .refine(
    (data) =>
      data.topsoilCompliant !== undefined ||
      data.complianceStatus !== undefined ||
      data.reviewNote !== undefined ||
      data.topsoilThicknessCm !== undefined,
    { message: '请至少提供一项需要更新的合规核验字段' }
  );

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse!;

  const { id } = await context.params;
  const parcelId = decodeURIComponent(id).trim();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体 JSON 格式无效' }, { status: 400 });
  }

  const parsed = patchParcelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '黑土地地块核验参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(blacksoilParcels)
    .where(eq(blacksoilParcels.id, parcelId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: '黑土地保护地块不存在' }, { status: 404 });
  }

  const nextStatus: BlacksoilComplianceStatus =
    parsed.data.complianceStatus ??
    (parsed.data.topsoilCompliant !== undefined
      ? parsed.data.topsoilCompliant
        ? '已达标'
        : '待核验'
      : existing.complianceStatus);

  const nextCompliant: boolean =
    parsed.data.topsoilCompliant !== undefined
      ? parsed.data.topsoilCompliant
      : nextStatus === '已达标';

  const nextThickness =
    parsed.data.topsoilThicknessCm ?? existing.topsoilThicknessCm;
  const nextReviewNote =
    parsed.data.reviewNote !== undefined ? parsed.data.reviewNote : existing.reviewNote;
  const reviewedAt = formatNowTimeLabel();

  const statusTag =
    nextStatus === '已达标'
      ? `表土保护核验通过（剥离厚度 ${nextThickness}cm）`
      : nextStatus === '整改中'
        ? `整改推进中（当前复测厚度 ${nextThickness}cm）`
        : `待现场复核（记录厚度 ${nextThickness}cm）`;

  const nextTopsoilStatus = nextReviewNote
    ? `${statusTag} · ${nextReviewNote}`
    : existing.topsoilStatus;

  const [updated] = await db
    .update(blacksoilParcels)
    .set({
      topsoilCompliant: nextCompliant,
      complianceStatus: nextStatus,
      topsoilThicknessCm: nextThickness,
      reviewNote: nextReviewNote,
      topsoilStatus: nextTopsoilStatus,
      reviewedBy: session.user.name,
      reviewedAt,
      updatedAt: new Date(),
    })
    .where(eq(blacksoilParcels.id, parcelId))
    .returning();

  await logM14Audit({
    req,
    userId: session.user.id,
    userName: session.user.name,
    action: 'REVIEW_BLACKSOIL_PARCEL',
    target: `${updated.name} (${updated.id})`,
    detail: {
      previousStatus: existing.complianceStatus,
      previousCompliant: existing.topsoilCompliant,
      complianceStatus: updated.complianceStatus,
      topsoilCompliant: updated.topsoilCompliant,
      topsoilThicknessCm: updated.topsoilThicknessCm,
      reviewNote: updated.reviewNote,
    },
  });

  return NextResponse.json({
    parcel: {
      ...updated,
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}
