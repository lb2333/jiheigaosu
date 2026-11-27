import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { asc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { workSections } from '@/db/schema/core';
import { progressBimObjects } from '@/db/schema/domains/m02';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const sectionId = sp.get('sectionId') || '';
  const objectId = sp.get('objectId') || '';

  const [sections, allObjects] = await Promise.all([
    db.select().from(workSections).orderBy(asc(workSections.sortOrder)),
    db.select().from(progressBimObjects).orderBy(asc(progressBimObjects.sortOrder)),
  ]);

  const activeObject =
    (objectId ? allObjects.find((o) => o.id === objectId) : undefined) ??
    (sectionId ? allObjects.find((o) => o.sectionId === sectionId) : undefined) ??
    allObjects[0] ??
    null;

  return NextResponse.json({
    sections: sections.map((s) => ({ id: s.id, name: s.name })),
    objects: allObjects,
    activeObject,
  });
}
