import { NextRequest, NextResponse } from 'next/server';
import { and, asc, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import {
  safetyActivities,
  safetyExternalRecords,
  safetyHazards,
} from '@/db/schema/domains/m04';
import { computeHazardStats, secName } from '@/modules/m04_safety/types';
import { formatNowLabel, generateNextHazardId, requireSession, requireWriteSession } from '../_utils';

const createHazardSchema = z.object({
  period: z.string().min(4).default('2026-11'),
  sectionId: z.enum(['sec1', 'sec2', 'sec3', 'sec4', 'sec5', 'sec6']),
  category: z.string().min(1),
  location: z.string().trim().min(1),
  dueDate: z.string().trim().min(8),
  description: z.string().trim().min(1),
  req: z.string().trim().optional(),
  level: z.string().trim().optional(),
});

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const sectionId = searchParams.get('sectionId') || '';
  const source = searchParams.get('source') || 'all';
  const status = searchParams.get('status') || 'all';
  const period = searchParams.get('period') || '2026-11';
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = 7;

  const scopeFilters = [eq(safetyHazards.period, period)];
  if (sectionId && sectionId !== 'all') scopeFilters.push(eq(safetyHazards.sectionId, sectionId));

  const extFilters = [];
  if (sectionId && sectionId !== 'all') extFilters.push(eq(safetyExternalRecords.sectionId, sectionId));

  const [scopeHazards, extRows] = await Promise.all([
    db
      .select()
      .from(safetyHazards)
      .where(and(...scopeFilters))
      .orderBy(asc(safetyHazards.sortOrder), desc(safetyHazards.createdAt), asc(safetyHazards.id)),
    db
      .select()
      .from(safetyExternalRecords)
      .where(extFilters.length ? and(...extFilters) : undefined)
      .orderBy(asc(safetyExternalRecords.sortOrder)),
  ]);

  const stats = computeHazardStats(scopeHazards);

  const filtered = scopeHazards.filter((h) => {
    if (source !== 'all' && h.source !== source) return false;
    if (status === '超期') {
      if (!(h.overdue && h.status !== '已销项')) return false;
    } else if (status !== 'all' && h.status !== status) {
      return false;
    }
    if (q) {
      const hay = `${h.id} ${h.location} ${h.description} ${h.source} ${secName(h.sectionId)}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const filteredExt = extRows.filter((e) => {
    if (!q) return true;
    const hay = `${e.extId} ${e.location} ${e.description} ${e.linkedHazardId}`.toLowerCase();
    return hay.includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const items = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return NextResponse.json({
    period,
    stats,
    total: filtered.length,
    page: safePage,
    totalPages,
    items,
    externalRecords: filteredExt,
    allPeriodHazards: scopeHazards,
  });
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireWriteSession();
  if (errorResponse) return errorResponse;

  const body = await req.json();
  const parsed = createHazardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '隐患登记参数不完整', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const due = data.dueDate.slice(0, 10);
  const newId = await generateNextHazardId(data.period);
  const sName = secName(data.sectionId);
  const locFull = data.location.startsWith(sName) ? data.location : `${sName} · ${data.location}`;
  const { full, short } = formatNowLabel();

  const [created] = await db
    .insert(safetyHazards)
    .values({
      id: newId,
      period: data.period,
      sectionId: data.sectionId,
      location: locFull,
      source: '人工巡查',
      category: data.category,
      description: data.description,
      level: data.level || '一般隐患',
      dueDate: due,
      dueFull: `${due} 17:00`,
      status: '待派发',
      overdue: false,
      foundAt: full,
      dispatchedAt: '',
      feedbackAt: '',
      owner: '整改负责人A（演示）',
      req: data.req?.trim() || '立即停工整改并补齐标准防护设施，拍照提交复查。',
      beforeNote: `人工巡查登记：${data.description}`,
      afterNote: '',
      reviewer: '监理复查人员A（演示）',
      reviewTime: '',
      reviewNote: '',
      attachment: '',
      sortOrder: 0,
    })
    .returning();

  await db.insert(safetyActivities).values({
    title: `${sName} · ${data.description}`,
    timeLabel: short,
    code: newId,
    status: '待派发',
    tagClass: 'm04-tag-amber',
    sectionId: data.sectionId,
    icon: 'flag',
  });

  return NextResponse.json({ hazard: created }, { status: 201 });
}
