import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { measureContracts, measureRecords } from '@/db/schema/domains/m08';
import {
  ALLOWED_WRITE_ROLES,
  loadContractsAndPeriods,
  loadRecordsByPeriod,
  resolvePeriodMeta,
} from '@/modules/m08_measure/server-helpers';

const querySchema = z.object({
  sectionId: z.string().optional(),
  period: z.string().optional(),
  status: z.string().optional(),
  payStatus: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

const createRecordSchema = z.object({
  id: z.string().min(3).max(40).optional(),
  sectionId: z.enum(['sec1', 'sec2', 'sec3', 'sec4', 'sec5', 'sec6']),
  workItem: z.string().min(1).max(40),
  period: z.string().min(4).max(20).default('2026年11月'),
  amount: z.number().positive(),
  status: z.enum(['已确认', '审核中', '待审核']).default('待审核'),
  payStatus: z.enum(['已支付', '办理中', '待支付', '未回传']).default('未回传'),
  stakeRange: z.string().min(1).max(80).optional(),
  qtyDesc: z.string().min(1).max(160),
  reviewer: z.string().min(1).max(60).optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const parsed = querySchema.safeParse({
    sectionId: sp.get('sectionId') || undefined,
    period: sp.get('period') || undefined,
    status: sp.get('status') || undefined,
    payStatus: sp.get('payStatus') || undefined,
    q: sp.get('q') || undefined,
    page: sp.get('page') || undefined,
    pageSize: sp.get('pageSize') || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const sectionId = parsed.data.sectionId || null;
  const statusFilter = parsed.data.status || '';
  const payStatusFilter = parsed.data.payStatus || '';
  const kw = (parsed.data.q || '').trim().toLowerCase();
  const pageSize = parsed.data.pageSize ?? 6;
  const requestedPage = parsed.data.page ?? 1;

  const { contracts, periods } = await loadContractsAndPeriods();
  const pm = resolvePeriodMeta(periods, parsed.data.period);
  const periodRecords = await loadRecordsByPeriod(pm.period, periods);
  const secScoped = periodRecords.filter(
    (r) => !sectionId || r.sectionId === sectionId
  );

  const summary = {
    total: secScoped.length,
    confirmed: secScoped.filter((r) => r.status === '已确认').length,
    reviewing: secScoped.filter((r) => r.status === '审核中').length,
    pending: secScoped.filter((r) => r.status === '待审核').length,
  };

  const filtered = secScoped.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (payStatusFilter && r.payStatus !== payStatusFilter) return false;
    if (kw) {
      const hay = `${r.id} ${r.sectionName} ${r.contractCode} ${r.workItem}`.toLowerCase();
      if (!hay.includes(kw)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return NextResponse.json({
    period: pm.period,
    sectionId,
    summary,
    rows,
    total: filtered.length,
    page,
    pageSize,
    totalPages,
    contracts,
    periods,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!ALLOWED_WRITE_ROLES.has(session.user.role ?? 'viewer')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createRecordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const [contract] = await db
    .select()
    .from(measureContracts)
    .where(eq(measureContracts.sectionId, data.sectionId))
    .limit(1);

  if (!contract) {
    return NextResponse.json({ error: 'Section contract not found' }, { status: 404 });
  }

  const ym = data.period.replace('年', '').replace('月', '');
  const codeNum = contract.contractCode.slice(0, 2);
  const generatedId =
    data.id ??
    `JL-${codeNum}-${ym}-${String(Math.floor(100 + Math.random() * 899))}`;

  const nowStr = '2026-11-26 11:05';
  const paidAmount = data.payStatus === '已支付' ? data.amount : 0;
  const payTime = data.payStatus === '已支付' ? '11-26 11:05' : '—';

  const [created] = await db
    .insert(measureRecords)
    .values({
      id: generatedId,
      sectionId: contract.sectionId,
      sectionName: contract.sectionName,
      contractCode: contract.contractCode,
      workItem: data.workItem,
      period: data.period,
      amount: Number(data.amount.toFixed(2)),
      status: data.status,
      payStatus: data.payStatus,
      paidAmount,
      payTime,
      syncTime: nowStr,
      stakeRange: data.stakeRange ?? contract.stakeRange,
      qtyDesc: data.qtyDesc,
      reviewer: data.reviewer ?? `${contract.supervisor} · ${session.user.name}`,
      sortOrder: 0,
    })
    .returning();

  await db.insert(auditLogs).values({
    userId: session.user.id,
    userName: session.user.name,
    action: 'CREATE_MEASURE_RECORD',
    moduleId: 'measure',
    target: created.id,
    detail: {
      sectionId: created.sectionId,
      workItem: created.workItem,
      amount: created.amount,
      status: created.status,
    },
    ipAddress: req.headers.get('x-forwarded-for') ?? '127.0.0.1',
  });

  return NextResponse.json({ record: created }, { status: 201 });
}
