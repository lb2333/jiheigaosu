import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { uavRoutes } from '@/db/schema/domains/m09';
import { recomputeRouteLengthKm } from '@/modules/m09_uav/types';
import { formatNowLabels, recordUavAudit, requireWriteSession } from '../../_utils';

const waypointSchema = z.object({
  no: z.string(),
  name: z.string(),
  lon: z.number(),
  lat: z.number(),
  alt: z.number(),
  speed: z.number(),
  action: z.string(),
  req: z.string(),
  checkItem: z.string(),
  gimbal: z.string(),
});

const patchRouteSchema = z.object({
  action: z.enum(['updateWaypoints', 'saveDraft']).default('saveDraft'),
  waypoints: z.array(waypointSchema).min(1),
  boundary: z.array(z.tuple([z.number(), z.number()])).optional(),
  note: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse;

  const { id } = await context.params;
  const body = await req.json().catch(() => null);
  const parsed = patchRouteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '航线与航点保存参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(uavRoutes)
    .where(eq(uavRoutes.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: '航线不存在' }, { status: 404 });
  }

  const d = parsed.data;
  const lengthKm = recomputeRouteLengthKm(d.waypoints);
  const { date } = formatNowLabels();
  const nextHistory =
    d.action === 'saveDraft'
      ? [
          {
            ver: existing.code,
            date,
            author: session.user.name || '当前用户',
            status: '草稿',
            note: d.note?.trim() || `更新航点配置（共 ${d.waypoints.length} 个航点，${lengthKm} km）`,
          },
          ...existing.history,
        ].slice(0, 12)
      : existing.history;

  const [updated] = await db
    .update(uavRoutes)
    .set({
      waypoints: d.waypoints,
      boundary: d.boundary ?? existing.boundary,
      lengthKm,
      status: '草稿',
      history: nextHistory,
      updatedAt: new Date(),
    })
    .where(eq(uavRoutes.id, id))
    .returning();

  await recordUavAudit({
    session,
    action: d.action === 'saveDraft' ? 'save_uav_route_draft' : 'update_uav_waypoints',
    target: id,
    detail: { code: updated.code, waypointsCount: updated.waypoints.length, lengthKm },
    req,
  });

  return NextResponse.json({ route: updated });
}
