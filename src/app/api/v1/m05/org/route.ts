import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/db';
import {
  staffKeyRoles,
  staffMembers,
  staffOrganizations,
} from '@/db/schema/domains/m05';
import type {
  StaffKeyRoleBriefDTO,
  StaffMemberDTO,
  StaffOrganizationDTO,
} from '@/modules/m05_staff/types';
import { requireSession } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const orgType = (searchParams.get('orgType') || '').trim();
  const sectionId = (searchParams.get('sectionId') || '').trim();
  const orgId = (searchParams.get('orgId') || '').trim();
  const dutyStatus = (searchParams.get('dutyStatus') || '').trim();
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const selectedStaffId = (searchParams.get('selectedStaffId') || '').trim();
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = Math.min(50, Math.max(1, Number.parseInt(searchParams.get('pageSize') || '8', 10) || 8));

  const [orgRows, staffRows, roleRows] = await Promise.all([
    db.select().from(staffOrganizations).orderBy(asc(staffOrganizations.sortOrder)),
    db.select().from(staffMembers).orderBy(asc(staffMembers.sortOrder)),
    db.select().from(staffKeyRoles).orderBy(asc(staffKeyRoles.sortOrder)),
  ]);

  // Count staff per org
  const staffCountByOrg = new Map<string, number>();
  for (const s of staffRows) {
    staffCountByOrg.set(s.orgId, (staffCountByOrg.get(s.orgId) ?? 0) + 1);
  }

  const allOrgs: StaffOrganizationDTO[] = orgRows.map((o) => ({
    id: o.id,
    name: o.name,
    type: o.type,
    sectionId: o.sectionId,
    sectionName: o.sectionName,
    headcount: o.headcount,
    lon: o.lon,
    lat: o.lat,
    staffCount: staffCountByOrg.get(o.id) ?? o.headcount,
  }));

  const orgMap = new Map(allOrgs.map((o) => [o.id, o]));

  // Map staffId -> keyRole
  const keyRoleByHolder = new Map<string, StaffKeyRoleBriefDTO>();
  for (const r of roleRows) {
    if (r.holderId) {
      keyRoleByHolder.set(r.holderId, {
        code: r.code,
        roleName: r.roleName,
        assignDate: r.assignDate,
      });
    }
  }

  const normalizedSec = sectionId === 'all' ? '' : sectionId;

  const treeOrgs = allOrgs.filter((org) => {
    if (normalizedSec && org.sectionId !== normalizedSec) return false;
    if (orgType && org.type !== orgType) return false;
    return true;
  });

  const scopedOrgs = treeOrgs.filter((org) => {
    if (orgId && org.id !== orgId) return false;
    return true;
  });

  const scopedOrgIds = new Set(scopedOrgs.map((o) => o.id));

  const toStaffDTO = (s: typeof staffRows[number]): StaffMemberDTO => {
    const org = orgMap.get(s.orgId);
    return {
      id: s.id,
      name: s.name,
      orgId: s.orgId,
      orgName: org?.name ?? '',
      orgType: org?.type ?? '',
      sectionId: s.sectionId,
      sectionName: org?.sectionName ?? '',
      role: s.role,
      status: s.status,
      phone: s.phone,
      cert: s.cert,
      certValid: s.certValid,
      joinDate: s.joinDate,
      duty: s.duty,
      offReason: s.offReason,
      keyRole: keyRoleByHolder.get(s.id) ?? null,
    };
  };

  const scopedStaff = staffRows
    .filter((s) => {
      if (!scopedOrgIds.has(s.orgId)) return false;
      if (dutyStatus && s.status !== dutyStatus) return false;
      if (q) {
        const org = orgMap.get(s.orgId);
        const hay = `${s.id} ${s.name} ${s.role} ${org?.name ?? ''} ${org?.sectionName ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .map(toStaffDTO);

  const scopedRoles = roleRows.filter((r) => scopedOrgIds.has(r.orgId));
  const onDutyCount = scopedStaff.filter((s) => s.status === '在岗').length;
  const offDutyCount = scopedStaff.filter((s) => s.status === '暂未在岗').length;
  const assignedRolesCount = scopedRoles.filter((r) => Boolean(r.holderId)).length;

  const totalPages = Math.max(1, Math.ceil(scopedStaff.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const items = scopedStaff.slice(startIdx, startIdx + pageSize);

  let selectedPerson: StaffMemberDTO | null = null;
  if (selectedStaffId) {
    selectedPerson = scopedStaff.find((s) => s.id === selectedStaffId) ?? null;
    if (!selectedPerson) {
      const raw = staffRows.find((s) => s.id === selectedStaffId);
      if (raw && scopedStaff.length === 0) {
        selectedPerson = toStaffDTO(raw);
      }
    }
  }
  if (!selectedPerson) {
    selectedPerson = scopedStaff[0] ?? (staffRows[0] ? toStaffDTO(staffRows[0]) : null);
  }

  return NextResponse.json({
    allOrgs,
    treeOrgs,
    kpis: {
      orgCount: scopedOrgs.length,
      staffTotal: scopedStaff.length,
      onDutyCount,
      offDutyCount,
      roleTotal: scopedRoles.length,
      assignedRolesCount,
    },
    items,
    total: scopedStaff.length,
    page: safePage,
    pageSize,
    totalPages,
    selectedPerson,
  });
}
