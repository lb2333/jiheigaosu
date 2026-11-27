import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { safetyHazards } from '@/db/schema/domains/m04';
import { uavHazardClues } from '@/db/schema/domains/m09';
import { requireSession } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = req.nextUrl;
  const sectionId = searchParams.get('sectionId') ?? 'all';
  const scene = searchParams.get('scene') ?? '全部场景';
  const status = searchParams.get('status') ?? '全部状态';
  const period = searchParams.get('period') ?? '2026年11月';

  const [allClues, safetyList] = await Promise.all([
    db.select().from(uavHazardClues).orderBy(asc(uavHazardClues.sortOrder)),
    db
      .select({
        id: safetyHazards.id,
        description: safetyHazards.description,
        location: safetyHazards.location,
        status: safetyHazards.status,
      })
      .from(safetyHazards)
      .orderBy(asc(safetyHazards.sortOrder))
      .limit(12),
  ]);

  const kpiPool = allClues.filter(
    (c) =>
      (sectionId === 'all' || !sectionId || c.sectionId === sectionId) &&
      (!period || c.period === period)
  );

  const filtered = kpiPool.filter((c) => {
    if (scene !== '全部场景' && c.scene !== scene) return false;
    if (status !== '全部状态' && c.status !== status) return false;
    return true;
  });

  const sorted =
    status === '全部状态'
      ? [
          ...filtered.filter((c) => c.status === '待核查'),
          ...filtered.filter((c) => c.status !== '待核查'),
        ]
      : filtered;

  return NextResponse.json({
    clues: sorted,
    kpis: {
      total: kpiPool.length,
      pending: kpiPool.filter((c) => c.status === '待核查').length,
      confirmed: kpiPool.filter((c) => c.status === '已确认隐患').length,
      falsePositive: kpiPool.filter((c) => c.status === '已标误报').length,
      duplicate: kpiPool.filter((c) => c.status === '已关联重复').length,
    },
    linkedSafetyHazards:
      safetyList.length > 0
        ? safetyList
        : [
            {
              id: 'AQ-202611-018',
              description: '二工区桥梁2号墩临边防护缺失',
              location: '二工区·桥梁示例A·2号墩',
              status: '待复查',
            },
            {
              id: 'AQ-202611-041',
              description: '二工区料场A消防通道占用',
              location: '二工区·料场示例A',
              status: '待派发',
            },
            {
              id: 'AQ-202611-021',
              description: '一工区保通段导改水马偏移',
              location: '一工区·保通示例段',
              status: '已销项',
            },
          ],
  });
}
