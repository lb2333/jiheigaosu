import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/db';
import {
  publishOrders,
  publishPlans,
  publishTemplates,
} from '@/db/schema/domains/m13';
import { requireSession } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = req.nextUrl;
  const scene = searchParams.get('scene') ?? 'all';
  const approval = searchParams.get('approval') ?? 'all';
  const iface = searchParams.get('iface') ?? 'all';
  const sectionId = searchParams.get('sectionId') ?? 'all';
  const cond = searchParams.get('cond') ?? 'all';

  const [allPlans, allOrders, allTemplates] = await Promise.all([
    db.select().from(publishPlans).orderBy(asc(publishPlans.sortOrder), asc(publishPlans.id)),
    db.select().from(publishOrders).orderBy(asc(publishOrders.sortOrder), asc(publishOrders.id)),
    db.select().from(publishTemplates).orderBy(asc(publishTemplates.sortOrder), asc(publishTemplates.id)),
  ]);

  const filtered = allPlans.filter((p) => {
    if (scene && scene !== 'all' && p.scene !== scene) return false;
    if (approval && approval !== 'all' && p.approvalStatus !== approval) return false;
    if (iface && iface !== 'all' && p.interfaceStatus !== iface) return false;
    if (sectionId && sectionId !== 'all' && p.sectionId !== sectionId) return false;
    if (cond === 'met' && !p.conditionMet) return false;
    if (cond === 'pending' && p.conditionMet) return false;
    return true;
  });

  return NextResponse.json({
    plans: filtered,
    allPlans,
    kpis: {
      total: allPlans.length,
      approved: allPlans.filter((p) => p.approvalStatus === '已批准').length,
      met: allPlans.filter((p) => p.conditionMet).length,
      pending: allPlans.filter((p) => !p.conditionMet).length,
    },
    orders: allOrders,
    templates: allTemplates,
  });
}
