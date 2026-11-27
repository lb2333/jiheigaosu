import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { videoCameras } from '@/db/schema/domains/m10';
import { requireSession, SECTION_ID_BY_NAME } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const rawSection = (searchParams.get('sectionId') || searchParams.get('section') || '').trim();
  const sectionId =
    rawSection && rawSection !== 'all'
      ? SECTION_ID_BY_NAME[rawSection] || rawSection
      : '';
  const siteType = (searchParams.get('siteType') || '').trim();
  const purpose = (searchParams.get('purpose') || '').trim();
  const status = (searchParams.get('status') || '').trim();
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = Math.max(
    1,
    Math.min(100, Number.parseInt(searchParams.get('pageSize') || '7', 10) || 7)
  );

  const allCameras = await db
    .select()
    .from(videoCameras)
    .orderBy(asc(videoCameras.sortOrder), asc(videoCameras.id));

  const filtered = allCameras.filter((c) => {
    if (sectionId && c.sectionId !== sectionId) return false;
    if (siteType && c.siteType !== siteType) return false;
    if (purpose && c.purpose !== purpose) return false;
    if (status && c.status !== status) return false;
    if (q) {
      const hay = `${c.id} ${c.name} ${c.stake} ${c.location} ${c.sectionName} ${c.purpose}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const items = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const kpis = {
    total: filtered.length,
    online: filtered.filter((c) => c.status === '在线').length,
    offline: filtered.filter((c) => c.status === '离线').length,
    abnormal: filtered.filter((c) => c.status === '图像异常').length,
    sections: new Set(filtered.map((c) => c.sectionId)).size,
  };

  return NextResponse.json({
    kpis,
    total,
    page: safePage,
    pageSize,
    totalPages,
    items,
    allCameras,
  });
}
