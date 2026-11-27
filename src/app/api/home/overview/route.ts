import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { asc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import {
  workSections,
  poiObjects,
  focusItems,
  milestoneNodes,
  showcaseTopics,
} from '@/db/schema';
import { DATE_PRESETS } from '@/lib/modules/registry';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dateParam = req.nextUrl.searchParams.get('date') ?? '2026-11-25';
  const preset = DATE_PRESETS.find((d) => d.date === dateParam) ?? DATE_PRESETS[0];

  const [sections, pois, focus, milestones, topics] = await Promise.all([
    db.select().from(workSections).orderBy(asc(workSections.sortOrder)),
    db.select().from(poiObjects),
    db.select().from(focusItems).orderBy(asc(focusItems.sortOrder)),
    db.select().from(milestoneNodes).orderBy(asc(milestoneNodes.sortOrder)),
    db.select().from(showcaseTopics).orderBy(asc(showcaseTopics.sortOrder)),
  ]);

  return NextResponse.json({
    datePreset: preset,
    workSections: sections,
    poiObjects: pois,
    focusItems: focus,
    milestoneNodes: milestones,
    showcaseTopics: topics,
  });
}
