import { NextRequest, NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { uavRoutes } from '@/db/schema/domains/m09';
import { secLabel } from '@/modules/m09_uav/types';
import { formatNowLabels, recordUavAudit, requireSession, requireWriteSession } from '../_utils';

const createRouteSchema = z.object({
  action: z.enum(['create', 'clone']).default('create'),
  sourceRouteId: z.string().optional(),
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(40),
  sectionId: z.enum(['sec1', 'sec2', 'sec3', 'sec4', 'sec5', 'sec6']).default('sec3'),
  targetName: z.string().min(1).max(100).default('路基示例段'),
  hangar: z.string().min(1).max(40).default('机巢B01'),
});

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = req.nextUrl;
  const search = (searchParams.get('search') ?? '').trim().toLowerCase();
  const sectionId = searchParams.get('sectionId') ?? 'all';

  const all = await db.select().from(uavRoutes).orderBy(asc(uavRoutes.sortOrder));
  const filtered = all.filter((r) => {
    if (sectionId && sectionId !== 'all' && r.sectionId !== sectionId) return false;
    if (search && !r.name.toLowerCase().includes(search) && !r.code.toLowerCase().includes(search)) {
      return false;
    }
    return true;
  });

  return NextResponse.json({ routes: filtered, allRoutes: all });
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse;

  const body = await req.json().catch(() => null);
  const parsed = createRouteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '新建或克隆航线参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const { date } = formatNowLabels();
  const newId = `tpl-${Date.now()}`;

  let sourceRoute = null;
  if (d.sourceRouteId) {
    const [found] = await db
      .select()
      .from(uavRoutes)
      .where(eq(uavRoutes.id, d.sourceRouteId))
      .limit(1);
    sourceRoute = found ?? null;
  }
  if (!sourceRoute) {
    const [first] = await db.select().from(uavRoutes).orderBy(asc(uavRoutes.sortOrder)).limit(1);
    sourceRoute = first ?? null;
  }

  const waypoints =
    d.action === 'clone' && sourceRoute
      ? sourceRoute.waypoints.map((w) => ({ ...w }))
      : (sourceRoute?.waypoints.slice(0, 6) ?? []).map((w, idx) => ({
          ...w,
          no: String(idx + 1).padStart(2, '0'),
          lon: Number((125.99 + idx * 0.001).toFixed(5)),
          lat: Number((47.65 + (idx % 2) * 0.003).toFixed(5)),
        }));

  const boundary: [number, number][] =
    d.action === 'clone' && sourceRoute
      ? sourceRoute.boundary.map((b) => [b[0], b[1]] as [number, number])
      : [
          [125.988, 47.655],
          [125.996, 47.655],
          [125.996, 47.649],
          [125.988, 47.649],
        ];

  const center: [number, number] =
    d.action === 'clone' && sourceRoute ? sourceRoute.center : [125.992, 47.652];

  const [created] = await db
    .insert(uavRoutes)
    .values({
      id: newId,
      name: d.name.trim(),
      code: d.code.trim(),
      status: '草稿',
      sectionId: d.sectionId,
      taskId: sourceRoute?.taskId ?? 'UAV-20261126-04',
      targetName: d.targetName.includes('·')
        ? d.targetName
        : `${secLabel(d.sectionId)}·${d.targetName}`,
      hangar: d.hangar,
      lengthKm: d.action === 'clone' && sourceRoute ? sourceRoute.lengthKm : 1.15,
      icon: 'route',
      center,
      boundary,
      waypoints,
      history: [
        {
          ver: d.code.trim(),
          date,
          author: session.user.name || '当前用户',
          status: '草稿',
          note: d.action === 'clone' ? `基于模板 ${sourceRoute?.code ?? ''} 派生` : '新建初始航线',
        },
      ],
      isTemplate: false,
      sortOrder: 99,
    })
    .returning();

  await recordUavAudit({
    session,
    action: d.action === 'clone' ? 'clone_uav_route' : 'create_uav_route',
    target: newId,
    detail: { name: created.name, code: created.code },
    req,
  });

  return NextResponse.json({ route: created });
}
