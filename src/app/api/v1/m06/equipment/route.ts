import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { machineEquipment, machineKeyArchives } from '@/db/schema/domains/m06';
import {
  EQUIP_TYPES,
  SECTIONS,
  SECTION_BY_ID,
  getCertMeta,
  type EquipmentDTO,
  type MachineMarkerDTO,
} from '@/modules/m06_machine/types';
import { getReminderConfig, requireSession } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const rawSec = (searchParams.get('sectionId') ?? '').trim();
  const sectionId = rawSec === 'all' ? '' : rawSec;
  const rawType = (searchParams.get('type') ?? '').trim();
  const typeFilter = rawType === 'all' ? '' : rawType;
  const rawEntry = (searchParams.get('entryStatus') ?? '').trim();
  const entryStatus = rawEntry === 'all' ? '' : rawEntry;
  const rawUse = (searchParams.get('useStatus') ?? '').trim();
  const useStatus = rawUse === 'all' ? '' : rawUse;
  const q = (searchParams.get('q') ?? '').trim().toLowerCase();
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number.parseInt(searchParams.get('pageSize') ?? '8', 10) || 8)
  );

  const [allEquipment, allArchives, reminderConfig] = await Promise.all([
    db
      .select()
      .from(machineEquipment)
      .orderBy(asc(machineEquipment.sortOrder), asc(machineEquipment.code)),
    db.select().from(machineKeyArchives),
    getReminderConfig(),
  ]);

  const archiveMap = new Map<string, typeof machineKeyArchives.$inferSelect>(
    allArchives.map((a: typeof machineKeyArchives.$inferSelect) => [a.equipmentCode, a])
  );

  const matches = (
    row: typeof machineEquipment.$inferSelect,
    opts?: { skipType?: boolean; skipSec?: boolean }
  ) => {
    if (!opts?.skipSec && sectionId && row.sectionId !== sectionId) return false;
    if (!opts?.skipType && typeFilter && row.type !== typeFilter) return false;
    if (entryStatus && row.entryStatus !== entryStatus) return false;
    if (useStatus && row.useStatus !== useStatus) return false;
    if (q) {
      const hay = `${row.code} ${row.name} ${row.unit} ${row.type} ${row.sectionName}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  };

  const filtered = allEquipment.filter((r: typeof machineEquipment.$inferSelect) => matches(r));
  const typeScope = allEquipment.filter((r: typeof machineEquipment.$inferSelect) =>
    matches(r, { skipType: true })
  );
  const secOnSiteScope = allEquipment.filter(
    (r: typeof machineEquipment.$inferSelect) =>
      matches(r, { skipSec: true }) && r.entryStatus === '在场'
  );

  const kpis = {
    total: filtered.length,
    onSite: filtered.filter((x: typeof machineEquipment.$inferSelect) => x.entryStatus === '在场').length,
    inUse: filtered.filter((x: typeof machineEquipment.$inferSelect) => x.useStatus === '在用').length,
    standby: filtered.filter((x: typeof machineEquipment.$inferSelect) => x.useStatus === '待用').length,
    stopped: filtered.filter((x: typeof machineEquipment.$inferSelect) => x.useStatus === '停用').length,
    exited: filtered.filter((x: typeof machineEquipment.$inferSelect) => x.entryStatus === '已退场').length,
  };

  const byType = EQUIP_TYPES.map((t) => ({
    name: t.name,
    count: typeScope.filter((x: typeof machineEquipment.$inferSelect) => x.type === t.name).length,
  }));

  const bySection = SECTIONS.map((s) => ({
    id: s.id,
    name: s.name,
    count: secOnSiteScope.filter((x: typeof machineEquipment.$inferSelect) => x.sectionId === s.id).length,
  }));

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pageSlice = filtered.slice(startIdx, startIdx + pageSize);

  const items: EquipmentDTO[] = pageSlice.map((r: typeof machineEquipment.$inferSelect) => {
    const arc = archiveMap.get(r.code);
    return {
      code: r.code,
      name: r.name,
      type: r.type,
      sectionId: r.sectionId,
      sectionName: r.sectionName,
      unit: r.unit,
      entryStatus: r.entryStatus,
      useStatus: r.useStatus,
      isKey: r.isKey,
      model: r.model,
      spec: r.spec,
      manufacturer: r.manufacturer,
      entryDate: r.entryDate,
      exitDate: r.exitDate,
      location: r.location,
      operator: r.operator,
      sortOrder: r.sortOrder,
      archiveId: arc?.archiveId,
      certMeta: arc ? getCertMeta(arc, reminderConfig) : null,
    };
  });

  // Representative machine markers (up to 2 per section for Cesium tracking)
  const representativeMarkers: MachineMarkerDTO[] = [];
  const secCountMap = new Map<string, number>();
  for (const r of allEquipment) {
    if (r.entryStatus !== '在场') continue;
    if (sectionId && r.sectionId !== sectionId) continue;
    const cur = secCountMap.get(r.sectionId) ?? 0;
    if (cur >= 2 && !r.isKey) continue;
    if (cur >= 2) continue;
    const secMeta = SECTION_BY_ID[r.sectionId];
    if (!secMeta) continue;
    secCountMap.set(r.sectionId, cur + 1);
    representativeMarkers.push({
      code: r.code,
      name: r.name,
      sectionId: r.sectionId,
      sectionName: r.sectionName,
      type: r.type,
      useStatus: r.useStatus,
      location: r.location,
      lon: secMeta.lon + cur * 0.012,
      lat: secMeta.lat + cur * 0.008,
    });
  }

  return NextResponse.json({
    kpis,
    distributions: {
      byType,
      bySection,
      typeTotal: typeScope.length,
      sectionTotal: secOnSiteScope.length,
    },
    items,
    total: filtered.length,
    page: safePage,
    pageSize,
    totalPages,
    representativeMarkers,
  });
}
