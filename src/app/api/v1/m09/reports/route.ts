import { NextRequest, NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { uavReports, uavTasks } from '@/db/schema/domains/m09';
import { secLabel } from '@/modules/m09_uav/types';
import {
  formatNowLabels,
  generateNextReportId,
  recordUavAudit,
  requireSession,
  requireWriteSession,
} from '../_utils';

const createReportSchema = z.object({
  title: z.string().min(1).max(120),
  taskId: z.string().min(1),
  type: z.enum(['专项巡检报告', '全面巡检报告', '复查报告']),
});

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = req.nextUrl;
  const sectionId = searchParams.get('sectionId') ?? 'all';
  const type = searchParams.get('type') ?? '全部类型';
  const period = searchParams.get('period') ?? '2026年11月';
  const keyword = (searchParams.get('keyword') ?? '').trim().toLowerCase();

  const [allReports, tasks] = await Promise.all([
    db.select().from(uavReports).orderBy(asc(uavReports.sortOrder)),
    db.select().from(uavTasks).orderBy(asc(uavTasks.sortOrder)),
  ]);

  const kpiPool = allReports.filter(
    (r) =>
      (sectionId === 'all' || !sectionId || r.sectionId === sectionId) &&
      (!period || r.period === period)
  );

  const filtered = kpiPool.filter((r) => {
    if (type !== '全部类型' && r.type !== type) return false;
    if (
      keyword &&
      !r.title.toLowerCase().includes(keyword) &&
      !r.id.toLowerCase().includes(keyword) &&
      !r.taskId.toLowerCase().includes(keyword)
    ) {
      return false;
    }
    return true;
  });

  return NextResponse.json({
    reports: filtered,
    tasks: tasks.slice(0, 8),
    kpis: {
      total: kpiPool.length,
      archived: kpiPool.filter((r) => r.status === '已归档').length,
      recheck: kpiPool.filter((r) => r.status === '待复查').length,
      draft: kpiPool.filter((r) => r.status === '草稿').length,
      samePoint: kpiPool.filter((r) => r.isRecheck).length,
    },
  });
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse;

  const body = await req.json().catch(() => null);
  const parsed = createReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '生成巡检报告草稿参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const [task] = await db
    .select()
    .from(uavTasks)
    .where(eq(uavTasks.id, d.taskId))
    .limit(1);

  if (!task) {
    return NextResponse.json({ error: '关联巡检任务不存在' }, { status: 404 });
  }

  const newId = await generateNextReportId();
  const { date, short } = formatNowLabels();
  const mmdd = date.slice(5);

  const [created] = await db
    .insert(uavReports)
    .values({
      id: newId,
      title: d.title.trim(),
      taskId: task.id,
      origTaskId: task.id,
      sectionId: task.sectionId,
      location: `${secLabel(task.sectionId)}·${task.target}`,
      type: d.type,
      reportDate: date,
      period: '2026年11月',
      status: '草稿',
      archiveTime: '未归档（草稿）',
      mediaSummary: '照片12张·视频1段',
      flightRecCount: 1,
      photoCount: 12,
      videoCount: 1,
      hazardCount: 1,
      isRecheck: d.type === '复查报告',
      summary: `系统依据任务 ${task.id} 自动汇总飞行记录与航拍取证生成的报告草稿。`,
      hazardId: 'AQ-202611-041',
      hazardDesc: '待人工复核关联问题',
      hazardState: '待复查',
      recheckEvidence: '已自动挂载本架次航拍图集。',
      handleStatus: '草稿待提交审核',
      origTime: short,
      recheckTime: short,
      timeline: [
        { date: mmdd, text: `关联任务 ${task.id} 数据拉取完成`, done: true },
        { date: mmdd, text: '生成巡检报告草稿', done: true },
        { date: '待完成', text: '等待审核归档', done: false },
      ],
      sortOrder: 0,
    })
    .returning();

  await recordUavAudit({
    session,
    action: 'create_uav_report_draft',
    target: newId,
    detail: { title: created.title, taskId: created.taskId },
    req,
  });

  return NextResponse.json({ report: created });
}
