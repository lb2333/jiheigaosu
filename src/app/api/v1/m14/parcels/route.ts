import { NextRequest, NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { blacksoilParcels } from '@/db/schema/domains/m14';
import {
  CORRIDOR_CENTERLINE,
  CORRIDOR_POLYGON,
  EPOCH_META,
  WORLD_H,
  WORLD_W,
} from '@/modules/m14_blacksoil/types';
import { requireSession } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = req.nextUrl;
  const sectionId = (searchParams.get('sectionId') ?? '').trim();
  const keyword = (searchParams.get('keyword') ?? '').trim().toLowerCase();

  const rows =
    sectionId && sectionId !== 'all'
      ? await db
          .select()
          .from(blacksoilParcels)
          .where(eq(blacksoilParcels.sectionId, sectionId))
          .orderBy(asc(blacksoilParcels.sortOrder))
      : await db
          .select()
          .from(blacksoilParcels)
          .orderBy(asc(blacksoilParcels.sortOrder));

  const filtered = keyword
    ? rows.filter(
        (p) =>
          p.id.toLowerCase().includes(keyword) ||
          p.name.toLowerCase().includes(keyword) ||
          p.stake.toLowerCase().includes(keyword) ||
          p.sectionName.toLowerCase().includes(keyword)
      )
    : rows;

  return NextResponse.json({
    epochs: EPOCH_META,
    corridor: {
      worldWidth: WORLD_W,
      worldHeight: WORLD_H,
      centerline: CORRIDOR_CENTERLINE,
      polygon: CORRIDOR_POLYGON,
    },
    parcels: filtered.map((row) => ({
      ...row,
      updatedAt: row.updatedAt.toISOString(),
    })),
  });
}
