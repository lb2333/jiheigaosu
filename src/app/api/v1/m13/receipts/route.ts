import { NextRequest, NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import {
  publishBoards,
  publishOrders,
  publishReceipts,
} from '@/db/schema/domains/m13';
import { requireSession } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = req.nextUrl;
  const reqOrderId = searchParams.get('orderId');
  const group = searchParams.get('group') ?? 'all';
  const date = searchParams.get('date') ?? 'all';
  const kw = (searchParams.get('kw') ?? '').trim().toLowerCase();

  const [allOrders, allBoards] = await Promise.all([
    db.select().from(publishOrders).orderBy(asc(publishOrders.sortOrder), asc(publishOrders.id)),
    db.select().from(publishBoards).orderBy(asc(publishBoards.sortOrder), asc(publishBoards.id)),
  ]);

  const order =
    (reqOrderId ? allOrders.find((o) => o.id === reqOrderId) : undefined) ??
    allOrders[0] ??
    null;

  const boardMap = new Map(allBoards.map((b) => [b.id, b]));
  const groupOptions = Array.from(new Set(allBoards.map((b) => b.groupDetail)));

  if (!order) {
    return NextResponse.json({
      order: null,
      allOrders,
      receipts: [],
      allReceiptsForOrder: [],
      boards: allBoards,
      groupOptions,
      kpis: { target: 0, dispatched: 0, received: 0, confirmed: 0, pending: 0 },
    });
  }

  const persistedRows = await db
    .select()
    .from(publishReceipts)
    .where(eq(publishReceipts.orderId, order.id))
    .orderBy(asc(publishReceipts.sortOrder), asc(publishReceipts.id));

  const allReceiptsForOrder =
    persistedRows.length > 0
      ? persistedRows
      : order.boardIds.map((bid, idx) => ({
          id: `${order.id}__${bid}`,
          orderId: order.id,
          boardId: bid,
          dispatchStatus: order.status === '已下发' ? '已下发' : '待下发',
          dispatchTime:
            order.status === '已下发'
              ? `${(order.scheduleTime.split(' ')[1] || '10:30')}:00`
              : '—',
          receiveStatus: '未回执',
          receiveTime: '—',
          readbackStatus: '未回读',
          readbackTime: '—',
          confirmStatus: '待确认显示',
          confirmTime: '—',
          verifyRecord:
            order.status === '已下发'
              ? '待设备回读与现场核验'
              : '发布单尚未下发',
          sortOrder: idx + 1,
          updatedAt: order.updatedAt,
        }));

  const filtered = allReceiptsForOrder.filter((r) => {
    const b = boardMap.get(r.boardId);
    if (!b) return false;
    if (group !== 'all' && b.groupDetail !== group && b.group !== group) return false;
    if (date !== 'all' && order.date !== date) return false;
    if (kw) {
      const hay = `${b.id} ${b.stake} ${b.pointName}`.toLowerCase();
      if (!hay.includes(kw)) return false;
    }
    return true;
  });

  const target = allReceiptsForOrder.length;
  const dispatched = allReceiptsForOrder.filter((r) => r.dispatchStatus === '已下发').length;
  const received = allReceiptsForOrder.filter((r) => r.receiveStatus === '已接收').length;
  const confirmed = allReceiptsForOrder.filter((r) => r.confirmStatus === '已确认显示').length;

  return NextResponse.json({
    order,
    allOrders,
    receipts: filtered,
    allReceiptsForOrder,
    boards: allBoards,
    groupOptions,
    kpis: {
      target,
      dispatched,
      received,
      confirmed,
      pending: target - confirmed,
    },
  });
}
