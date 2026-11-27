import { NextRequest, NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import {
  publishBoards,
  publishOrders,
  publishReceipts,
  publishTemplates,
} from '@/db/schema/domains/m13';
import {
  formatNowLabels,
  generateNextOrderId,
  recordPublishAudit,
  requireSession,
  requireWriteSession,
} from '../_utils';

const createOrderSchema = z.object({
  templateId: z.string().min(1).max(40),
  sectionId: z.enum(['sec1', 'sec2', 'sec3', 'sec4', 'sec5', 'sec6', 'line']),
  title: z.string().min(1).max(60),
  validRange: z.string().min(1).max(60),
  line1: z.string().min(1).max(20),
  line2: z.string().min(1).max(20),
  boardIds: z.array(z.string().min(1)).min(1, '请至少选择 1 块目标情报板'),
});

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = req.nextUrl;
  const sectionId = searchParams.get('sectionId') ?? 'all';
  const status = searchParams.get('status') ?? 'all';
  const period = searchParams.get('period') ?? '2026年11月';
  const kw = (searchParams.get('kw') ?? '').trim().toLowerCase();
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = Math.max(
    1,
    Math.min(24, Number.parseInt(searchParams.get('pageSize') ?? '5', 10) || 5)
  );

  const [allOrders, allBoards, allTemplates, allReceipts] = await Promise.all([
    db.select().from(publishOrders).orderBy(asc(publishOrders.sortOrder), asc(publishOrders.id)),
    db.select().from(publishBoards).orderBy(asc(publishBoards.sortOrder), asc(publishBoards.id)),
    db.select().from(publishTemplates).orderBy(asc(publishTemplates.sortOrder), asc(publishTemplates.id)),
    db.select().from(publishReceipts).orderBy(asc(publishReceipts.sortOrder), asc(publishReceipts.id)),
  ]);

  const sectionPool =
    sectionId && sectionId !== 'all'
      ? allOrders.filter((o) => o.sectionId === sectionId)
      : allOrders;

  const filtered = sectionPool.filter((o) => {
    if (status && status !== 'all' && o.status !== status) return false;
    if (period === '近7日' && !o.date.startsWith('2026-11-2')) return false;
    if (kw) {
      const hay = `${o.id} ${o.title} ${o.line1} ${o.line2} ${o.groupLabel}`.toLowerCase();
      if (!hay.includes(kw)) return false;
    }
    return true;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const receiptsByOrder: Record<string, typeof allReceipts> = {};
  for (const r of allReceipts) {
    if (!receiptsByOrder[r.orderId]) receiptsByOrder[r.orderId] = [];
    receiptsByOrder[r.orderId].push(r);
  }
  for (const ord of allOrders) {
    if (!receiptsByOrder[ord.id]) {
      receiptsByOrder[ord.id] = ord.boardIds.map((bid, idx) => ({
        id: `${ord.id}__${bid}`,
        orderId: ord.id,
        boardId: bid,
        dispatchStatus: ord.status === '已下发' ? '已下发' : '待下发',
        dispatchTime:
          ord.status === '已下发'
            ? `${(ord.scheduleTime.split(' ')[1] || '10:30')}:00`
            : '—',
        receiveStatus: '未回执',
        receiveTime: '—',
        readbackStatus: '未回读',
        readbackTime: '—',
        confirmStatus: '待确认显示',
        confirmTime: '—',
        verifyRecord:
          ord.status === '已下发' ? '待设备回读与现场核验' : '发布单尚未下发',
        sortOrder: idx + 1,
        updatedAt: ord.updatedAt,
      }));
    }
  }

  return NextResponse.json({
    orders: filtered,
    allOrders,
    pageItems,
    total,
    page: safePage,
    totalPages,
    kpis: {
      total: sectionPool.length,
      pendingReview: sectionPool.filter((o) => o.status === '待审核').length,
      pendingAuth: sectionPool.filter((o) => o.status === '待授权').length,
      issued: sectionPool.filter((o) => o.status === '已下发').length,
      revoked: sectionPool.filter((o) => o.status === '已撤销').length,
    },
    boards: allBoards,
    templates: allTemplates,
    receiptsByOrder,
  });
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse;

  const body = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '新建发布单参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const [tpl] = await db
    .select()
    .from(publishTemplates)
    .where(eq(publishTemplates.id, d.templateId));
  if (!tpl) {
    return NextResponse.json({ error: '引用的内容模板不存在' }, { status: 404 });
  }

  const [firstBoard] = await db
    .select()
    .from(publishBoards)
    .where(eq(publishBoards.id, d.boardIds[0]));
  if (!firstBoard) {
    return NextResponse.json({ error: '目标情报板不存在' }, { status: 404 });
  }

  const newId = await generateNextOrderId();
  const now = formatNowLabels();
  const actorName = session.user.name || '发布员A（演示）';

  const [created] = await db
    .insert(publishOrders)
    .values({
      id: newId,
      title: d.title.trim(),
      version: tpl.version,
      sectionId: d.sectionId,
      groupLabel: firstBoard.groupDetail,
      templateId: tpl.id,
      spec: tpl.spec,
      line1: d.line1.trim(),
      line2: d.line2.trim(),
      validRange: d.validRange.trim(),
      scheduleTime: '待安排',
      fullTime: '待审核确认',
      date: '2026-11-26',
      period: '2026年11月',
      status: '待审核',
      operator: actorName,
      reviewer: '待审核',
      authorizer: '待授权',
      authorized: false,
      prevBoardSummary: `${firstBoard.confirmedTitle} · V1.0`,
      boardIds: d.boardIds,
      stepTimes: {
        compose: now.hm,
        review: '待审核',
        auth: '待授权',
        dispatch: '待下发',
      },
      auditLogs: [
        {
          stage: '内容编排',
          actor: actorName,
          time: now.full,
          action: 'create',
          note: `新建发布单并锁定 ${d.boardIds.length} 块目标情报板`,
        },
      ],
      sortOrder: 0,
    })
    .returning();

  await recordPublishAudit({
    session,
    action: 'create_publish_order',
    target: newId,
    detail: {
      title: created.title,
      templateId: created.templateId,
      boardIds: created.boardIds,
    },
    req,
  });

  return NextResponse.json({ order: created });
}
