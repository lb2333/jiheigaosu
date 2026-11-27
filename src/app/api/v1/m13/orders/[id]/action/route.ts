import { NextRequest, NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import {
  publishBoards,
  publishOrders,
  publishPlans,
  publishReceipts,
} from '@/db/schema/domains/m13';
import {
  formatNowLabels,
  recordPublishAudit,
  requireWriteSession,
} from '../../../_utils';

const orderActionSchema = z.object({
  action: z.enum([
    'review_pass',
    'review_reject',
    'authorize_dispatch',
    'revoke',
    'restore',
    'resubmit',
  ]),
  reviewer: z.string().min(1).max(40).optional(),
  authorizer: z.string().min(1).max(40).optional(),
  scheduleTime: z.string().min(1).max(40).optional(),
  comment: z.string().max(240).optional(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse;

  const { id } = await context.params;
  const [order] = await db
    .select()
    .from(publishOrders)
    .where(eq(publishOrders.id, id));
  if (!order) {
    return NextResponse.json({ error: '发布单不存在' }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = orderActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '发布单操作参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const now = formatNowLabels();
  const trail = Array.isArray(order.auditLogs) ? [...order.auditLogs] : [];

  if (d.action === 'review_pass') {
    const reviewer = d.reviewer?.trim() || '审核员B（演示）';
    const scheduleTime = d.scheduleTime?.trim() || '11-26 11:45';
    trail.push({
      stage: '内容审核',
      actor: reviewer,
      time: now.full,
      action: 'review_pass',
      note: d.comment?.trim() || '文案内容审核通过，流转至待授权',
    });

    const [updated] = await db
      .update(publishOrders)
      .set({
        reviewer,
        scheduleTime,
        status: '待授权',
        stepTimes: { ...order.stepTimes, review: now.hm },
        auditLogs: trail,
        updatedAt: new Date(),
      })
      .where(eq(publishOrders.id, id))
      .returning();

    await recordPublishAudit({
      session,
      action: 'publish_order_review_pass',
      target: id,
      detail: { reviewer, scheduleTime },
      req,
    });

    return NextResponse.json({ order: updated });
  }

  if (d.action === 'review_reject') {
    const reviewer = d.reviewer?.trim() || '审核员B（演示）';
    trail.push({
      stage: '内容审核',
      actor: reviewer,
      time: now.full,
      action: 'review_reject',
      note: d.comment?.trim() || '内容审核退回并标记为已撤销',
    });

    const [updated] = await db
      .update(publishOrders)
      .set({
        reviewer,
        status: '已撤销',
        stepTimes: { ...order.stepTimes, review: now.hm },
        auditLogs: trail,
        updatedAt: new Date(),
      })
      .where(eq(publishOrders.id, id))
      .returning();

    await recordPublishAudit({
      session,
      action: 'publish_order_review_reject',
      target: id,
      detail: { reviewer },
      req,
    });

    return NextResponse.json({ order: updated });
  }

  if (d.action === 'authorize_dispatch') {
    const authorizer = d.authorizer?.trim() || '授权员C（演示）';
    trail.push({
      stage: '授权下发',
      actor: authorizer,
      time: now.full,
      action: 'authorize_dispatch',
      note: `二级授权通过并下发至 ${order.boardIds.length} 块情报板`,
    });

    const [updated] = await db
      .update(publishOrders)
      .set({
        authorizer,
        authorized: true,
        status: '已下发',
        scheduleTime: `11-26 ${now.hm}`,
        fullTime: `2026-11-26 ${now.hms}`,
        stepTimes: {
          ...order.stepTimes,
          auth: now.hm,
          dispatch: now.hm,
        },
        auditLogs: trail,
        updatedAt: new Date(),
      })
      .where(eq(publishOrders.id, id))
      .returning();

    const targetBoards = order.boardIds.length
      ? await db
          .select()
          .from(publishBoards)
          .where(inArray(publishBoards.id, order.boardIds))
      : [];
    const boardMap = new Map(targetBoards.map((b) => [b.id, b]));

    for (let i = 0; i < order.boardIds.length; i++) {
      const bid = order.boardIds[i];
      const b = boardMap.get(bid);
      const isOnline = b ? b.online : true;
      if (b) {
        await db
          .update(publishBoards)
          .set({
            prevTitle: `${b.confirmedTitle} · ${order.version}`,
            prevLine1: b.line1,
            prevLine2: b.line2,
            lastOrderId: order.id,
            lastTime: `11-26 ${now.hm}`,
            feedbackStatus: '待确认显示',
            updatedAt: new Date(),
          })
          .where(eq(publishBoards.id, bid));
      }

      const recId = `${order.id}__${bid}`;
      await db
        .insert(publishReceipts)
        .values({
          id: recId,
          orderId: order.id,
          boardId: bid,
          dispatchStatus: '已下发',
          dispatchTime: now.hms,
          receiveStatus: isOnline ? '已接收' : '未回执',
          receiveTime: isOnline ? now.hms : '—',
          readbackStatus: '未回读',
          readbackTime: '—',
          confirmStatus: '待确认显示',
          confirmTime: '—',
          verifyRecord: isOnline ? '待设备回读与现场核验' : '设备离线，等待重连回执',
          sortOrder: i + 1,
        })
        .onConflictDoUpdate({
          target: publishReceipts.id,
          set: {
            dispatchStatus: '已下发',
            dispatchTime: now.hms,
            receiveStatus: isOnline ? '已接收' : '未回执',
            receiveTime: isOnline ? now.hms : '—',
            readbackStatus: '未回读',
            readbackTime: '—',
            confirmStatus: '待确认显示',
            confirmTime: '—',
            verifyRecord: isOnline ? '待设备回读与现场核验' : '设备离线，等待重连回执',
            updatedAt: new Date(),
          },
        });
    }

    // Update linked plan if any
    await db
      .update(publishPlans)
      .set({
        linkedOrderNote: `${now.hm} 已授权下发`,
        flowStage: 4,
        updatedAt: new Date(),
      })
      .where(eq(publishPlans.linkedOrderId, order.id));

    await recordPublishAudit({
      session,
      action: 'publish_order_authorize_dispatch',
      target: id,
      detail: { authorizer, boardCount: order.boardIds.length },
      req,
    });

    return NextResponse.json({ order: updated });
  }

  if (d.action === 'revoke') {
    const authorizer = d.authorizer?.trim() || order.authorizer || '授权员C（演示）';
    trail.push({
      stage: '撤销发布',
      actor: authorizer,
      time: now.full,
      action: 'revoke',
      note: '授权撤销发布并停止跟踪回执',
    });

    const [updated] = await db
      .update(publishOrders)
      .set({
        status: '已撤销',
        authorizer,
        auditLogs: trail,
        updatedAt: new Date(),
      })
      .where(eq(publishOrders.id, id))
      .returning();

    await recordPublishAudit({
      session,
      action: 'publish_order_revoke',
      target: id,
      detail: { authorizer },
      req,
    });

    return NextResponse.json({ order: updated });
  }

  if (d.action === 'restore') {
    const targetBoards = order.boardIds.length
      ? await db
          .select()
          .from(publishBoards)
          .where(inArray(publishBoards.id, order.boardIds))
      : [];

    for (const b of targetBoards) {
      await db
        .update(publishBoards)
        .set({
          line1: b.prevLine1 || b.line1,
          line2: b.prevLine2 || b.line2,
          confirmedTitle: (b.prevTitle || '原板面').split(' · ')[0],
          feedbackStatus: '已确认显示',
          verifyTime: `11-26 ${now.hms}`,
          updatedAt: new Date(),
        })
        .where(eq(publishBoards.id, b.id));
    }

    trail.push({
      stage: '恢复原内容',
      actor: session.user.name || '授权员C（演示）',
      time: now.full,
      action: 'restore',
      note: `已授权恢复 ${order.boardIds.length} 块情报板的原板面内容`,
    });

    const [updated] = await db
      .update(publishOrders)
      .set({
        auditLogs: trail,
        updatedAt: new Date(),
      })
      .where(eq(publishOrders.id, id))
      .returning();

    await recordPublishAudit({
      session,
      action: 'publish_order_restore',
      target: id,
      detail: { boardCount: order.boardIds.length },
      req,
    });

    return NextResponse.json({ order: updated });
  }

  // resubmit
  trail.push({
    stage: '重新提交',
    actor: session.user.name || order.operator,
    time: now.full,
    action: 'resubmit',
    note: '重新提交至待审核状态',
  });

  const [updated] = await db
    .update(publishOrders)
    .set({
      status: '待审核',
      reviewer: '待审核',
      authorizer: '待授权',
      authorized: false,
      stepTimes: {
        ...order.stepTimes,
        review: '待审核',
        auth: '待授权',
        dispatch: '待下发',
      },
      auditLogs: trail,
      updatedAt: new Date(),
    })
    .where(eq(publishOrders.id, id))
    .returning();

  await recordPublishAudit({
    session,
    action: 'publish_order_resubmit',
    target: id,
    detail: {},
    req,
  });

  return NextResponse.json({ order: updated });
}
