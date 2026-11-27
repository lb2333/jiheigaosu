import { NextRequest, NextResponse } from 'next/server';
import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { safetyHazards } from '@/db/schema/domains/m04';
import { getHazardStatusMeta, secName } from '@/modules/m04_safety/types';
import { requireSession } from '../../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const sectionId = searchParams.get('sectionId') || '';
  const period = searchParams.get('period') || '2026-11';

  const filters = [eq(safetyHazards.period, period)];
  if (sectionId && sectionId !== 'all') {
    filters.push(eq(safetyHazards.sectionId, sectionId));
  }

  const rows = await db
    .select()
    .from(safetyHazards)
    .where(and(...filters))
    .orderBy(asc(safetyHazards.sortOrder), desc(safetyHazards.createdAt), asc(safetyHazards.id));

  const header = ['隐患编号', '工区', '工程位置', '发现来源', '风险类别', '隐患描述', '确认等级', '整改期限', '状态'];
  const lines = [
    header.join(','),
    ...rows.map((h) =>
      [
        h.id,
        secName(h.sectionId),
        h.location,
        h.source,
        h.category,
        h.description,
        h.level,
        h.dueDate,
        getHazardStatusMeta(h).label,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    ),
  ];

  const csvBody = '\uFEFF' + lines.join('\r\n');
  const filename = encodeURIComponent(`吉黑高速安全隐患台账_${period}.csv`);

  return new NextResponse(csvBody, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename*=UTF-8''${filename}`,
      'Cache-Control': 'no-store',
    },
  });
}
