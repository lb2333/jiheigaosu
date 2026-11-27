import { NextRequest, NextResponse } from 'next/server';
import { asc, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import {
  uavFleet,
  uavHazardClues,
  uavLiveEvents,
  uavRoutes,
  uavTasks,
} from '@/db/schema/domains/m09';
import { secLabel } from '@/modules/m09_uav/types';
import {
  formatNowLabels,
  generateNextClueId,
  recordUavAudit,
  requireSession,
  requireWriteSession,
} from '../_utils';

const livePostSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('markClue'),
    taskId: z.string().min(1),
    uavId: z.string().min(1),
    title: z.string().min(1).max(120),
    category: z.string().min(1).max(60),
    waypoint: z.string().min(1).max(60),
  }),
  z.object({
    action: z.literal('snapshot'),
    taskId: z.string().min(1),
    uavId: z.string().min(1),
    snapName: z.string().min(1).max(80),
    elapsedLabel: z.string().optional(),
  }),
  z.object({
    action: z.literal('recording'),
    taskId: z.string().min(1),
    uavId: z.string().min(1),
    durationLabel: z.string().min(1).max(32),
  }),
  z.object({
    action: z.literal('command'),
    taskId: z.string().min(1),
    uavId: z.string().min(1),
    command: z.enum(['pause', 'resume', 'rth', 'takeover', 'landed']),
    text: z.string().min(1).max(160),
  }),
]);

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const taskId = req.nextUrl.searchParams.get('taskId') ?? '';

  const [tasks, fleet, routes, events] = await Promise.all([
    db.select().from(uavTasks).orderBy(asc(uavTasks.sortOrder)),
    db.select().from(uavFleet).orderBy(asc(uavFleet.sortOrder)),
    db.select().from(uavRoutes).orderBy(asc(uavRoutes.sortOrder)),
    db.select().from(uavLiveEvents).orderBy(desc(uavLiveEvents.id)).limit(40),
  ]);

  const filteredEvents = taskId
    ? events.filter((e) => e.taskId === taskId)
    : events;

  return NextResponse.json({
    tasks: tasks.slice(0, 8),
    fleet,
    primaryRoute: routes.find((r) => r.id === 'tpl-lc-a') ?? routes[0] ?? null,
    events: filteredEvents.length > 0 ? filteredEvents : events.slice(0, 12),
  });
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse;

  const body = await req.json().catch(() => null);
  const parsed = livePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '实时巡检操作参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const { full, short, hm } = formatNowLabels();

  if (d.action === 'markClue') {
    const [task] = await db
      .select()
      .from(uavTasks)
      .where(eq(uavTasks.id, d.taskId))
      .limit(1);

    const secId = task?.sectionId ?? 'sec2';
    const target = task?.target ?? '料场示例A';
    const scene = task?.scene ?? '料场巡检';
    const uavName = d.uavId === 'UAV-A01' ? '无人机A01' : d.uavId;
    const clueId = await generateNextClueId();

    const [createdClue] = await db
      .insert(uavHazardClues)
      .values({
        id: clueId,
        title: d.title.trim(),
        sectionId: secId,
        location: `${secLabel(secId)}·${target}`,
        scene,
        period: '2026年11月',
        foundTime: full,
        shortTime: short,
        status: '待核查',
        taskId: d.taskId,
        waypoint: d.waypoint.trim(),
        imgName: 'IMG_LIVE_01.jpg',
        wpLabel: d.waypoint.trim(),
        category: d.category.trim(),
        rule: '人工实时标记',
        source: `${uavName}·可见光`,
        reviewer: session.user.name || '核查人员A（演示）',
        note: '实时巡检画面人工标记线索，待核查确认。',
        imgSrc: 'milestone_before.jpg',
        box: { x: 0.56, y: 0.44, w: 0.24, h: 0.31 },
        linkedHazard: '',
        sortOrder: 0,
      })
      .returning();

    const [createdEvent] = await db
      .insert(uavLiveEvents)
      .values({
        taskId: d.taskId,
        uavId: d.uavId,
        eventTime: hm,
        eventType: 'clue',
        text: `人工标记疑似线索 ${clueId}（${d.title.trim()}）`,
        detail: { clueId, waypoint: d.waypoint.trim() },
      })
      .returning();

    await recordUavAudit({
      session,
      action: 'mark_uav_live_clue',
      target: clueId,
      detail: { taskId: d.taskId, title: d.title.trim() },
      req,
    });

    return NextResponse.json({ clue: createdClue, event: createdEvent });
  }

  const eventText =
    d.action === 'snapshot'
      ? `截图取证已保存（${d.snapName}）`
      : d.action === 'recording'
        ? `已保存巡检录像片段（时长 ${d.durationLabel}）`
        : d.text;

  const [createdEvent] = await db
    .insert(uavLiveEvents)
    .values({
      taskId: d.taskId,
      uavId: d.uavId,
      eventTime: hm,
      eventType: d.action,
      text: eventText,
      detail: d.action === 'command' ? { command: d.command } : {},
    })
    .returning();

  await recordUavAudit({
    session,
    action: `uav_live_${d.action}`,
    target: d.taskId,
    detail: { uavId: d.uavId, text: eventText },
    req,
  });

  return NextResponse.json({ event: createdEvent });
}
