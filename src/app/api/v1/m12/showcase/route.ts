import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/db';
import {
  pinganShowcaseItems,
  pinganTopics,
  type PinganStatItem,
  type PinganTelemetryItem,
} from '@/db/schema/domains/m12';
import type {
  PinganFeaturedResultDTO,
  PinganOverviewDTO,
  PinganSlideDTO,
  PinganTopicDTO,
} from '@/modules/m12_pingan/types';
import { formatStampLabel, requireSession } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const direction = (searchParams.get('direction') || '').trim();
  const stage = (searchParams.get('stage') || '').trim();

  const [showcaseRows, topicRows] = await Promise.all([
    db.select().from(pinganShowcaseItems).orderBy(asc(pinganShowcaseItems.sortOrder)),
    db.select().from(pinganTopics).orderBy(asc(pinganTopics.sortOrder)),
  ]);

  const overviewRow = showcaseRows.find((r) => r.itemType === 'overview');
  const overviewPayload = (overviewRow?.payload ?? {}) as {
    stats?: PinganStatItem[];
    lastUpdated?: string;
  };

  const overview: PinganOverviewDTO = {
    title: overviewRow?.title ?? '吉黑高速明水至北安段',
    desc:
      overviewRow?.summary ??
      '项目按双向四车道高速公路标准建设。平安百年品质工程创建聚焦寒区改扩建品质提升、工业化建造、智慧提速和绿色低碳。',
    stats: Array.isArray(overviewPayload.stats)
      ? overviewPayload.stats
      : [
          { label: '路线全长', value: '142.608', unit: 'km' },
          { label: '建设里程', value: '120.528', unit: 'km' },
          { label: '施工工区', value: '6', unit: '个' },
        ],
  };

  const slides: PinganSlideDTO[] = showcaseRows
    .filter((r) => r.itemType === 'slide')
    .map((r) => {
      const p = (r.payload ?? {}) as { telemetry?: PinganTelemetryItem[] };
      return {
        id: r.id,
        kind: r.kind === 'video' ? 'video' : 'image',
        title: r.title,
        subtitle: r.subtitle,
        topicId: r.topicId,
        imgPath: r.imgPath,
        stake: r.stake,
        durationSec: r.durationSec,
        durationStr: r.durationStr,
        telemetry: Array.isArray(p.telemetry) ? p.telemetry : [],
        caption: r.summary,
      };
    });

  const featuredResults: PinganFeaturedResultDTO[] = showcaseRows
    .filter((r) => r.itemType === 'featured')
    .map((r) => {
      const p = (r.payload ?? {}) as { metrics?: string[] };
      return {
        id: r.id,
        title: r.title,
        topicLabel: r.topicLabel,
        topicId: r.topicId,
        category: r.category,
        date: r.publishDate,
        author: r.author,
        summary: r.summary,
        metrics: Array.isArray(p.metrics) ? p.metrics : [],
      };
    });

  const filteredTopics: PinganTopicDTO[] = topicRows
    .filter((t) => {
      if (direction && direction !== '全部方向' && t.direction !== direction) {
        return false;
      }
      if (stage && stage !== '全部阶段' && t.stage !== stage) {
        return false;
      }
      return true;
    })
    .map((t) => ({
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
    }));

  const latestTopicUpdate = topicRows.reduce<Date | null>((acc, t) => {
    if (!acc || t.updatedAt > acc) return t.updatedAt;
    return acc;
  }, null);

  return NextResponse.json({
    overview,
    slides,
    featuredResults,
    topics: filteredTopics,
    totalTopics: topicRows.length,
    lastUpdated: overviewPayload.lastUpdated || formatStampLabel(latestTopicUpdate),
  });
}
