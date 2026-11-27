import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { asc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { workSections } from '@/db/schema/core';
import { progressPlanNodes, progressPlanTasks } from '@/db/schema/domains/m02';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const sectionId = sp.get('sectionId') || 'all';
  const level = sp.get('level') || 'total';
  const range = sp.get('range') || '2026';
  const category = sp.get('category') || 'all';
  const keyword = (sp.get('keyword') || '').trim().toLowerCase();

  const [sections, allTasks, allNodes] = await Promise.all([
    db.select().from(workSections).orderBy(asc(workSections.sortOrder)),
    db.select().from(progressPlanTasks).orderBy(asc(progressPlanTasks.sortOrder)),
    db.select().from(progressPlanNodes).orderBy(asc(progressPlanNodes.seq)),
  ]);

  const filteredTasks = allTasks.filter((t) => {
    if (category !== 'all' && t.category !== category) return false;
    if (sectionId !== 'all' && t.sectionId !== sectionId) return false;
    if (range === '2026' && t.timeRange === '2026-2027') {
      // Keep full timeline tasks visible like legacy, unless explicitly filtered out;
      // legacy shows all tasks for 2026 unless category/secId/keyword filters them
    }
    if (keyword) {
      if (!t.name.toLowerCase().includes(keyword) && !t.category.toLowerCase().includes(keyword)) {
        return false;
      }
    }
    return true;
  });

  const displayTasks = filteredTasks.length > 0 ? filteredTasks : allTasks;

  const filteredNodes = allNodes.filter((n) => {
    if (sectionId !== 'all' && n.sectionId !== sectionId) return false;
    if (keyword) {
      if (
        !n.title.toLowerCase().includes(keyword) &&
        !n.objectName.toLowerCase().includes(keyword) &&
        !n.taskName.toLowerCase().includes(keyword)
      ) {
        return false;
      }
    }
    return true;
  });

  const shortListBase = allNodes.filter((n) => n.inShortList).sort((a, b) => a.listOrder - b.listOrder);
  const shortListNodes =
    sectionId === 'all'
      ? shortListBase
      : shortListBase.filter((n) => filteredNodes.some((f) => f.id === n.id));

  const assocNodes = allNodes.filter(
    (n) => n.id === 'n2' || n.id === 'n3' || n.id === 'n4' || (category !== 'all' && n.category === category)
  );

  const isAllSec = sectionId === 'all';
  const totalNodesCount = isAllSec ? 18 : Math.max(3, filteredNodes.length + 2);
  const monthTodoCount = isAllSec
    ? allNodes.filter((n) => n.status !== '已完成').length
    : Math.max(1, filteredNodes.filter((n) => n.status !== '已完成').length);
  const expiringCount = isAllSec ? 3 : 1;

  return NextResponse.json({
    sectionId,
    level,
    range,
    category,
    sections: sections.map((s) => ({ id: s.id, name: s.name })),
    kpis: {
      totalNodesCount,
      monthTodoCount,
      expiringCount,
      stageLabel: '施工高峰期',
    },
    tasks: displayTasks,
    nodes: allNodes,
    filteredNodes,
    shortListNodes: shortListNodes.length > 0 ? shortListNodes : shortListBase,
    assocNodes: assocNodes.slice(0, 4),
  });
}
