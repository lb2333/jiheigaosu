import { NextRequest, NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import {
  machineEquipment,
  machineKeyArchives,
  machinePatrolLogs,
} from '@/db/schema/domains/m06';
import {
  getCertMeta,
  type KeyArchiveDTO,
  type PatrolLogDTO,
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
  const rawCert = (searchParams.get('certStatus') ?? '').trim();
  const certStatus = rawCert === 'all' ? '' : rawCert;
  const q = (searchParams.get('q') ?? '').trim().toLowerCase();
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number.parseInt(searchParams.get('pageSize') ?? '7', 10) || 7)
  );

  const [joinedRows, allPatrols, reminderConfig] = await Promise.all([
    db
      .select({
        equip: machineEquipment,
        archive: machineKeyArchives,
      })
      .from(machineKeyArchives)
      .innerJoin(
        machineEquipment,
        eq(machineKeyArchives.equipmentCode, machineEquipment.code)
      )
      .orderBy(asc(machineKeyArchives.keyOrder), asc(machineEquipment.code)),
    db
      .select()
      .from(machinePatrolLogs)
      .orderBy(asc(machinePatrolLogs.sortOrder)),
    getReminderConfig(),
  ]);

  const patrolMap = new Map<string, PatrolLogDTO[]>();
  for (const log of allPatrols) {
    const list = patrolMap.get(log.equipmentCode) ?? [];
    list.push({
      id: log.id,
      equipmentCode: log.equipmentCode,
      patrolTime: log.patrolTime,
      content: log.content,
      status: log.status,
      inspector: log.inspector,
      detail: log.detail,
    });
    patrolMap.set(log.equipmentCode, list);
  }

  const allKeyMachines: KeyArchiveDTO[] = joinedRows.map(
    ({
      equip,
      archive,
    }: {
      equip: typeof machineEquipment.$inferSelect;
      archive: typeof machineKeyArchives.$inferSelect;
    }) => {
    const certMeta = getCertMeta(archive, reminderConfig);
    return {
      code: equip.code,
      name: equip.name,
      type: equip.type,
      sectionId: equip.sectionId,
      sectionName: equip.sectionName,
      unit: equip.unit,
      entryStatus: equip.entryStatus,
      useStatus: equip.useStatus,
      isKey: equip.isKey,
      model: equip.model,
      spec: equip.spec,
      manufacturer: equip.manufacturer,
      entryDate: equip.entryDate,
      exitDate: equip.exitDate,
      location: equip.location,
      operator: equip.operator,
      sortOrder: equip.sortOrder,
      archiveId: archive.archiveId,
      keyOrder: archive.keyOrder,
      inspectNo: archive.inspectNo,
      inspectDate: archive.inspectDate,
      validUntil: archive.validUntil,
      installValidUntil: archive.installValidUntil,
      missingDocs: archive.missingDocs,
      certMeta,
      patrolLogs: patrolMap.get(equip.code) ?? [],
    };
  });

  const filtered = allKeyMachines.filter((item) => {
    if (sectionId && item.sectionId !== sectionId) return false;
    if (typeFilter && item.type !== typeFilter) return false;
    if (certStatus && item.certMeta.status !== certStatus) return false;
    if (q) {
      const hay = `${item.archiveId} ${item.code} ${item.name} ${item.unit} ${item.sectionName}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  let valid = 0;
  let soon = 0;
  let expired = 0;
  let missing = 0;
  let patrolTotal = 0;

  for (const r of filtered) {
    if (r.certMeta.status === '正常有效') valid++;
    else if (r.certMeta.status === '即将到期') soon++;
    else if (r.certMeta.status === '已到期') expired++;
    else missing++;
    patrolTotal += r.patrolLogs.length;
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const items = filtered.slice(startIdx, startIdx + pageSize);

  return NextResponse.json({
    kpis: {
      total: filtered.length,
      valid,
      soon,
      expired,
      missing,
      patrolTotal,
    },
    items,
    total: filtered.length,
    page: safePage,
    pageSize,
    totalPages,
    reminderConfig,
  });
}
