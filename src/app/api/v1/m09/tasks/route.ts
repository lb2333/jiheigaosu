import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { uavTasks } from '@/db/schema/domains/m09';
import {
  generateNextTaskId,
  recordUavAudit,
  requireSession,
  requireWriteSession,
} from '../_utils';

const createTaskSchema = z.object({
  name: z.string().min(1).max(100),
  sectionId: z.enum(['sec1', 'sec2', 'sec3', 'sec4', 'sec5', 'sec6']),
  target: z.string().min(1).max(100),
  type: z.enum(['专项', '全面', '应急']),
  planTime: z.string().min(5).max(32),
  uav: z.string().min(1).max(50).optional(),
  owner: z.string().min(1).max(50).optional(),
  routeCode: z.string().min(1).max(50).optional(),
  hangar: z.string().min(1).max(50).optional(),
});

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = req.nextUrl;
  const sectionId = searchParams.get('sectionId') ?? 'all';
  const type = searchParams.get('type') ?? '全部类型';
  const status = searchParams.get('status') ?? '全部状态';
  const period = searchParams.get('period') ?? '2026年11月';
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = Math.max(1, Math.min(24, Number.parseInt(searchParams.get('pageSize') ?? '6', 10) || 6));

  const all = await db.select().from(uavTasks).orderBy(asc(uavTasks.sortOrder));

  const kpiPool = all.filter(
    (t) =>
      (sectionId === 'all' || !sectionId || t.sectionId === sectionId) &&
      (!period || t.period === period)
  );

  const filtered = kpiPool.filter((t) => {
    if (type !== '全部类型' && t.type !== type) return false;
    if (status !== '全部状态' && t.status !== status) return false;
    return true;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return NextResponse.json({
    tasks: filtered,
    allTasks: kpiPool,
    pageItems,
    total,
    page: safePage,
    totalPages,
    kpis: {
      total: kpiPool.length,
      todo: kpiPool.filter((t) => t.status === '待执行').length,
      doing: kpiPool.filter((t) => t.status === '执行中').length,
      pending: kpiPool.filter((t) => t.status === '待整理').length,
      done: kpiPool.filter((t) => t.status === '已完成').length,
    },
  });
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse;

  const body = await req.json().catch(() => null);
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '新建巡检任务参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const newId = await generateNextTaskId();
  const scene = d.name.includes('保通')
    ? '施工保通'
    : d.name.includes('桥')
      ? '桥梁专项'
      : d.name.includes('路基') || d.name.includes('边坡')
        ? '路基边坡'
        : '料场巡检';

  const [created] = await db
    .insert(uavTasks)
    .values({
      id: newId,
      name: d.name.trim(),
      sectionId: d.sectionId,
      target: d.target.trim(),
      type: d.type,
      typeFull: `${d.type}巡检`,
      scene,
      planTime: d.planTime.trim(),
      shortTime: d.planTime.trim().slice(5),
      status: '待执行',
      uav: d.uav ?? '无人机A02',
      owner: d.owner ?? '巡检员A（演示）',
      routeCode: d.routeCode ?? 'LC-A V2.0',
      hangar: d.hangar ?? '机巢A01',
      checks: ['现场安全', '重点部位', '警示标志'],
      allChecks: ['现场安全', '重点部位', '警示标志'],
      preflightPassed: false,
      stage: 3,
      period: '2026年11月',
      sortOrder: 0,
    })
    .returning();

  await recordUavAudit({
    session,
    action: 'create_uav_task',
    target: newId,
    detail: { name: created.name, sectionId: created.sectionId },
    req,
  });

  return NextResponse.json({ task: created });
}
