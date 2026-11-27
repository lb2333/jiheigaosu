import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { pinganTopics, type PinganDeliverablesMap } from '@/db/schema/domains/m12';
import {
  DIRECTION_LIST,
  STAGE_LIST,
  STAGE_META,
  type PinganTopicDTO,
} from '@/modules/m12_pingan/types';
import { formatStampLabel, logM12Audit, requireSession, requireWriteSession } from '../_utils';

const createTopicSchema = z.object({
  name: z.string().trim().min(1, '专题名称不能为空').max(120, '专题名称不能超过 120 字'),
  shortName: z.string().trim().max(120).optional(),
  summary: z.string().trim().min(1, '项目简介不能为空').max(500, '项目简介不能超过 500 字'),
  direction: z.enum(DIRECTION_LIST),
  stage: z.enum(STAGE_LIST),
  achievements: z.string().trim().max(300).optional(),
  note: z.string().trim().max(300).optional(),
  sectionId: z.enum(['sec1', 'sec2', 'sec3', 'sec4', 'sec5', 'sec6']).optional(),
});

function toTopicDTO(t: typeof pinganTopics.$inferSelect): PinganTopicDTO {
  return {
    id: t.id,
    name: t.name,
    shortName: t.shortName,
    summary: t.summary,
    direction: t.direction,
    stage: t.stage,
    achievements: t.achievements,
    note: t.note,
    sectionId: t.sectionId,
    deliverables: t.deliverables,
    sortOrder: t.sortOrder,
    updatedAt: formatStampLabel(t.updatedAt),
  };
}

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const keyword = (searchParams.get('keyword') || '').trim().toLowerCase();
  const direction = (searchParams.get('direction') || '').trim();
  const stage = (searchParams.get('stage') || '').trim();
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = Math.min(50, Math.max(1, Number.parseInt(searchParams.get('pageSize') || '10', 10) || 10));

  const rows = await db.select().from(pinganTopics).orderBy(asc(pinganTopics.sortOrder));

  const stageCounts: Record<string, number> & { total: number } = {
    total: rows.length,
    立项: 0,
    计划与设计: 0,
    研究执行: 0,
    成果整理: 0,
    验收与推广: 0,
  };
  for (const r of rows) {
    if (Object.prototype.hasOwnProperty.call(stageCounts, r.stage)) {
      stageCounts[r.stage] += 1;
    }
  }

  const filtered = rows
    .filter((t) => {
      if (keyword) {
        const hay = `${t.id} ${t.shortName} ${t.name} ${t.summary} ${t.achievements}`.toLowerCase();
        if (!hay.includes(keyword)) return false;
      }
      if (direction && direction !== '全部方向' && t.direction !== direction) return false;
      if (stage && stage !== '全部阶段' && t.stage !== stage) return false;
      return true;
    })
    .map(toTopicDTO);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const items = filtered.slice(startIdx, startIdx + pageSize);

  const latestUpdate = rows.reduce<Date | null>((acc, t) => {
    if (!acc || t.updatedAt > acc) return t.updatedAt;
    return acc;
  }, null);

  return NextResponse.json({
    items,
    allTopicsCount: rows.length,
    stageCounts,
    total,
    page: safePage,
    pageSize,
    totalPages,
    lastUpdated: formatStampLabel(latestUpdate),
  });
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse!;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体 JSON 格式无效' }, { status: 400 });
  }

  const parsed = createTopicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '新增专题参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const existingRows = await db.select().from(pinganTopics).orderBy(asc(pinganTopics.sortOrder));
  let maxN = 8;
  let maxSort = 8;
  for (const r of existingRows) {
    const m = /^KT-(\d+)$/i.exec(r.id);
    if (m) maxN = Math.max(maxN, Number.parseInt(m[1], 10));
    maxSort = Math.max(maxSort, r.sortOrder);
  }
  const nextId = `KT-${String(maxN + 1).padStart(2, '0')}`;

  const data = parsed.data;
  const shortName = data.shortName?.trim() || data.name;
  const achievements = data.achievements?.trim() || '立项材料';
  const note = data.note?.trim() || '按计划推进';
  const stageIdx = (STAGE_META[data.stage] ?? { index: 0 }).index;
  const today = new Date().toISOString().slice(0, 10);

  const deliverables: PinganDeliverablesMap = {
    midterm:
      stageIdx >= 2
        ? [
            {
              title: `${shortName}中期评审资料.pdf`,
              type: '中期评审资料',
              date: today,
              size: '3.2 MB',
              summary: data.summary,
            },
          ]
        : [],
    patent:
      stageIdx >= 3
        ? [
            {
              title: `${shortName}技术标准草案.pdf`,
              type: '标准/专利',
              date: today,
              size: '2.1 MB',
              summary: achievements,
            },
          ]
        : [],
    acceptance:
      stageIdx >= 4
        ? [
            {
              title: `${shortName}验收与推广报告.pdf`,
              type: '验收推广',
              date: today,
              size: '4.5 MB',
              summary: '完成验收评审并纳入全线推广清单。',
            },
          ]
        : [],
  };

  const [created] = await db
    .insert(pinganTopics)
    .values({
      id: nextId,
      name: data.name,
      shortName,
      summary: data.summary,
      direction: data.direction,
      stage: data.stage,
      achievements,
      note,
      sectionId: data.sectionId ?? 'sec1',
      deliverables,
      sortOrder: maxSort + 1,
    })
    .returning();

  await logM12Audit({
    req,
    userId: session.user.id,
    userName: session.user.name,
    action: 'CREATE_PINGAN_TOPIC',
    target: `${created.id} ${created.shortName}`,
    detail: {
      id: created.id,
      direction: created.direction,
      stage: created.stage,
    },
  });

  return NextResponse.json({ topic: toTopicDTO(created) });
}
