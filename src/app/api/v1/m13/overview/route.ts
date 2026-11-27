import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/db';
import {
  publishBoards,
  publishOrders,
  publishReceipts,
} from '@/db/schema/domains/m13';
import { secName } from '@/modules/m13_publish/types';
import { requireSession } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = req.nextUrl;
  const sectionId = searchParams.get('sectionId') ?? 'all';
  const group = searchParams.get('group') ?? 'all';
  const online = searchParams.get('online') ?? 'all';
  const feedback = searchParams.get('feedback') ?? 'all';
  const kw = (searchParams.get('kw') ?? '').trim().toLowerCase();
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = Math.max(
    1,
    Math.min(24, Number.parseInt(searchParams.get('pageSize') ?? '6', 10) || 6)
  );

  const [allBoards, allOrders, allReceipts] = await Promise.all([
    db.select().from(publishBoards).orderBy(asc(publishBoards.sortOrder), asc(publishBoards.id)),
    db.select().from(publishOrders).orderBy(asc(publishOrders.sortOrder), asc(publishOrders.id)),
    db.select().from(publishReceipts).orderBy(asc(publishReceipts.sortOrder), asc(publishReceipts.id)),
  ]);

  const sectionBoards =
    sectionId && sectionId !== 'all'
      ? allBoards.filter((b) => b.sectionId === sectionId)
      : allBoards;
  const sectionOrders =
    sectionId && sectionId !== 'all'
      ? allOrders.filter((o) => o.sectionId === sectionId)
      : allOrders;

  const filtered = sectionBoards.filter((b) => {
    if (group && group !== 'all' && b.group !== group) return false;
    if (online === 'online' && !b.online) return false;
    if (online === 'offline' && b.online) return false;
    if (feedback === 'pending' && b.feedbackStatus !== '待确认显示') return false;
    if (kw) {
      const hay = `${b.id} ${b.stake} ${b.pointName} ${secName(b.sectionId)} ${b.confirmedTitle}`.toLowerCase();
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

  // Synthesize default receipts for orders that do not yet have persisted receipt rows
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

  const latestIssuedOrder =
    sectionOrders.find((o) => o.status === '已下发') ??
    sectionOrders[0] ??
    allOrders[0] ??
    null;
  const latestRecs = latestIssuedOrder
    ? receiptsByOrder[latestIssuedOrder.id] ?? []
    : [];
  const pendingConfirmCount = latestRecs.filter(
    (r) => r.confirmStatus !== '已确认显示'
  ).length;

  return NextResponse.json({
    boards: filtered,
    allBoards,
    pageItems,
    total,
    page: safePage,
    totalPages,
    kpis: {
      totalBoards: sectionBoards.length,
      onlineBoards: sectionBoards.filter((b) => b.online).length,
      offlineBoards: sectionBoards.filter((b) => !b.online).length,
      totalOrders: sectionOrders.length,
      pendingConfirmCount,
    },
    latestIssuedOrderId: latestIssuedOrder?.id ?? 'FB-20261126-007',
    receiptsByOrder,
    lastUpdated: '11-26 10:45',
  });
}
