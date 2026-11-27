import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/db';
import {
  uavFleet,
  uavHangars,
  uavHazardClues,
  uavReports,
  uavRoutes,
  uavTasks,
} from '@/db/schema/domains/m09';
import { COVERAGE_ITEMS, MAP_POIS } from '@/modules/m09_uav/types';
import { requireSession } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = req.nextUrl;
  const sectionId = searchParams.get('sectionId') ?? 'all';
  const scene = searchParams.get('scene') ?? '全部场景';

  const [hangars, fleet, allTasks, allClues, allReports, routes] = await Promise.all([
    db.select().from(uavHangars).orderBy(asc(uavHangars.sortOrder)),
    db.select().from(uavFleet).orderBy(asc(uavFleet.sortOrder)),
    db.select().from(uavTasks).orderBy(asc(uavTasks.sortOrder)),
    db.select().from(uavHazardClues).orderBy(asc(uavHazardClues.sortOrder)),
    db.select().from(uavReports).orderBy(asc(uavReports.sortOrder)),
    db.select().from(uavRoutes).orderBy(asc(uavRoutes.sortOrder)),
  ]);

  const inSec = <T extends { sectionId: string }>(arr: T[]) =>
    sectionId && sectionId !== 'all' ? arr.filter((x) => x.sectionId === sectionId) : arr;

  const tasksPool = inSec(allTasks);
  const cluesPool = inSec(allClues);
  const reportsPool = inSec(allReports);
  const fleetPool = inSec(fleet);
  const hangarsPool = inSec(hangars);
  const poisPool = MAP_POIS.filter(
    (p) =>
      (sectionId === 'all' || !sectionId || p.secId === sectionId) &&
      (scene === '全部场景' || p.scene === scene)
  );

  const confirmedHazards = cluesPool.filter((c) => c.status === '已确认隐患').length;
  const recheckCount = reportsPool.filter((r) => r.status === '待复查').length;

  const activeMission =
    allTasks.find((t) => t.status === '执行中') ??
    tasksPool[0] ??
    allTasks[0] ??
    null;

  const primaryRoute = routes.find((r) => r.id === 'tpl-lc-a') ?? routes[0] ?? null;

  return NextResponse.json({
    hangars: hangarsPool,
    allHangars: hangars,
    fleet: fleetPool,
    allFleet: fleet,
    pois: poisPool,
    primaryRoute,
    coverageItems: COVERAGE_ITEMS,
    activeMission,
    recentTasks: tasksPool.slice(0, 3),
    taskKpis: {
      total: tasksPool.length,
      done: tasksPool.filter((t) => t.status === '已完成').length,
      doing: tasksPool.filter((t) => t.status === '执行中').length,
      todo: tasksPool.filter((t) => t.status === '待执行').length,
      pendingOrg: tasksPool.filter((t) => t.status === '待整理').length,
    },
    hazardKpis: {
      pendingClues: cluesPool.filter((c) => c.status === '待核查').length,
      confirmedHazards,
      recheckCount,
      closedCount: Math.max(1, Math.round(confirmedHazards * 0.6)),
    },
    deviceKpis: {
      onlineUav: fleetPool.filter((f) => f.status !== '离线维护').length,
      totalUav: fleetPool.length,
      onlineHangar: hangarsPool.length,
    },
  });
}
