import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import {
  publishBoards,
  publishOrders,
  publishReceipts,
} from '@/db/schema/domains/m13';
import {
  formatNowLabels,
  recordPublishAudit,
  requireWriteSession,
} from '../../_utils';

const receiptActionSchema = z.object({
  action: z.enum(['collect_readback', 'confirm_display']),
  orderId: z.string().min(1).max(40),
  boardId: z.string().min(1).max(40),
});

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse;

  const body = await req.json().catch(() => null);
  const parsed = receiptActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '回执操作参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { action, orderId, boardId } = parsed.data;
  const [[order], [board]] = await Promise.all([
    db.select().from(publishOrders).where(eq(publishOrders.id, orderId)),
    db.select().from(publishBoards).where(eq(publishBoards.id, boardId)),
  ]);
  if (!order || !board) {
    return NextResponse.json({ error: '发布单或情报板不存在' }, { status: 404 });
  }

  const recId = `${order.id}__${board.id}`;
  const [existingRec] = await db
    .select()
    .from(publishReceipts)
    .where(eq(publishReceipts.id, recId));

  const now = formatNowLabels();
  const baseDispatchTime =
    existingRec?.dispatchTime && existingRec.dispatchTime !== '—'
      ? existingRec.dispatchTime
      : `${(order.scheduleTime.split(' ')[1] || '10:30')}:00`;
  const receiveTime =
    existingRec?.receiveTime && existingRec.receiveTime !== '—'
      ? existingRec.receiveTime
      : now.hms;

  if (action === 'collect_readback') {
    await db
      .update(publishBoards)
      .set({ online: true, updatedAt: new Date() })
      .where(eq(publishBoards.id, board.id));

    const [receipt] = await db
      .insert(publishReceipts)
      .values({
        id: recId,
        orderId: order.id,
        boardId: board.id,
        dispatchStatus: '已下发',
        dispatchTime: baseDispatchTime,
        receiveStatus: '已接收',
        receiveTime,
        readbackStatus: '内容一致',
        readbackTime: now.hms,
        confirmStatus: existingRec?.confirmStatus ?? '待确认显示',
        confirmTime: existingRec?.confirmTime ?? '—',
        verifyRecord: '设备已回读一致，待现场核验确认',
        sortOrder: existingRec?.sortOrder ?? 1,
      })
      .onConflictDoUpdate({
        target: publishReceipts.id,
        set: {
          receiveStatus: '已接收',
          receiveTime,
          readbackStatus: '内容一致',
          readbackTime: now.hms,
          verifyRecord: '设备已回读一致，待现场核验确认',
          updatedAt: new Date(),
        },
      })
      .returning();

    await recordPublishAudit({
      session,
      action: 'publish_receipt_collect_readback',
      target: recId,
      detail: { orderId, boardId },
      req,
    });

    return NextResponse.json({ receipt });
  }

  // confirm_display
  const readbackTime =
    existingRec?.readbackTime && existingRec.readbackTime !== '—'
      ? existingRec.readbackTime
      : now.hms;
  const verifier = `现场核验 · ${session.user.name || '巡查员D（演示）'}`;

  const [receipt] = await db
    .insert(publishReceipts)
    .values({
      id: recId,
      orderId: order.id,
      boardId: board.id,
      dispatchStatus: '已下发',
      dispatchTime: baseDispatchTime,
      receiveStatus: '已接收',
      receiveTime,
      readbackStatus: '内容一致',
      readbackTime,
      confirmStatus: '已确认显示',
      confirmTime: now.hms,
      verifyRecord: verifier,
      sortOrder: existingRec?.sortOrder ?? 1,
    })
    .onConflictDoUpdate({
      target: publishReceipts.id,
      set: {
        receiveStatus: '已接收',
        receiveTime,
        readbackStatus: '内容一致',
        readbackTime,
        confirmStatus: '已确认显示',
        confirmTime: now.hms,
        verifyRecord: verifier,
        updatedAt: new Date(),
      },
    })
    .returning();

  await db
    .update(publishBoards)
    .set({
      online: true,
      confirmedTitle: order.title,
      line1: order.line1,
      line2: order.line2,
      lastOrderId: order.id,
      lastTime: `11-26 ${now.hm}`,
      verifyTime: `11-26 ${now.hms}`,
      feedbackStatus: '已确认显示',
      updatedAt: new Date(),
    })
    .where(eq(publishBoards.id, board.id));

  await recordPublishAudit({
    session,
    action: 'publish_receipt_confirm_display',
    target: recId,
    detail: { orderId, boardId, verifier },
    req,
  });

  return NextResponse.json({ receipt });
}
