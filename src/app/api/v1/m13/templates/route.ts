import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { publishTemplates } from '@/db/schema/domains/m13';
import {
  generateNextTemplateId,
  recordPublishAudit,
  requireSession,
  requireWriteSession,
} from '../_utils';

const createTemplateSchema = z.object({
  name: z.string().min(1).max(60),
  category: z.enum(['常用文本', '板面模板', '预案内容']),
  spec: z.enum(['单黄LED 128×48', '全彩LED 192×64']),
  status: z.enum(['有效', '待启用']).optional(),
  line1: z.string().min(1).max(20),
  line2: z.string().min(1).max(20),
  startTime: z.string().min(1).max(32).optional(),
  endTime: z.string().min(1).max(32).optional(),
  validText: z.string().min(1).max(40).optional(),
});

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = req.nextUrl;
  const category = searchParams.get('category') ?? 'all';
  const spec = searchParams.get('spec') ?? 'all';
  const status = searchParams.get('status') ?? 'all';
  const kw = (searchParams.get('kw') ?? '').trim().toLowerCase();
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = Math.max(
    1,
    Math.min(24, Number.parseInt(searchParams.get('pageSize') ?? '6', 10) || 6)
  );

  const allTemplates = await db
    .select()
    .from(publishTemplates)
    .orderBy(asc(publishTemplates.sortOrder), asc(publishTemplates.id));

  const filtered = allTemplates.filter((t) => {
    if (category && category !== 'all' && t.category !== category) return false;
    if (spec && spec !== 'all' && t.spec !== spec) return false;
    if (status && status !== 'all' && t.status !== status) return false;
    if (kw) {
      const hay = `${t.id} ${t.name} ${t.line1} ${t.line2}`.toLowerCase();
      if (!hay.includes(kw)) return false;
    }
    return true;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return NextResponse.json({
    templates: filtered,
    allTemplates,
    pageItems,
    total,
    page: safePage,
    totalPages,
    kpis: {
      total: allTemplates.length,
      textCount: allTemplates.filter((t) => t.category === '常用文本').length,
      boardCount: allTemplates.filter((t) => t.category === '板面模板').length,
      planCount: allTemplates.filter((t) => t.category === '预案内容').length,
    },
  });
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse;

  const body = await req.json().catch(() => null);
  const parsed = createTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '新增模板参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const newId = await generateNextTemplateId();

  const [created] = await db
    .insert(publishTemplates)
    .values({
      id: newId,
      name: d.name.trim(),
      category: d.category,
      version: 'V1.0',
      spec: d.spec,
      validText: d.validText?.trim() || '长期有效',
      startTime: d.startTime?.trim() || '2026-11-26 00:00',
      endTime: d.endTime?.trim() || '2026-12-31 23:59',
      status: d.status ?? '有效',
      line1: d.line1.trim(),
      line2: d.line2.trim(),
      sortOrder: 0,
    })
    .returning();

  await recordPublishAudit({
    session,
    action: 'create_publish_template',
    target: newId,
    detail: { name: created.name, category: created.category, spec: created.spec },
    req,
  });

  return NextResponse.json({ template: created });
}
