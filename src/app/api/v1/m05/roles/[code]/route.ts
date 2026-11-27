import { NextRequest, NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import {
  staffKeyRoles,
  staffMembers,
  staffOrganizations,
} from '@/db/schema/domains/m05';
import { logM05Audit, requireSession, requireWriteSession } from '../../_utils';

const patchRoleSchema = z.object({
  action: z.enum(['assign', 'unassign']),
  holderId: z.string().trim().min(1).optional(),
  assignDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { code } = await context.params;
  const roleCode = decodeURIComponent(code);

  const [roleRow] = await db
    .select()
    .from(staffKeyRoles)
    .where(eq(staffKeyRoles.code, roleCode))
    .limit(1);

  if (!roleRow) {
    return NextResponse.json({ error: '关键岗位编号不存在' }, { status: 404 });
  }

  const [orgRows, staffRows, allRoles] = await Promise.all([
    db.select().from(staffOrganizations).orderBy(asc(staffOrganizations.sortOrder)),
    db.select().from(staffMembers).orderBy(asc(staffMembers.sortOrder)),
    db.select().from(staffKeyRoles),
  ]);

  const orgMap = new Map(orgRows.map((o) => [o.id, o]));
  const org = orgMap.get(roleRow.orgId);
  const holder = roleRow.holderId
    ? staffRows.find((s) => s.id === roleRow.holderId) ?? null
    : null;

  const busyHolders = new Set(
    allRoles
      .filter((r) => r.holderId && r.code !== roleRow.code)
      .map((r) => r.holderId as string)
  );

  const candidates = staffRows
    .filter((s) => {
      if (busyHolders.has(s.id)) return false;
      const sOrg = orgMap.get(s.orgId);
      return (
        s.orgId === roleRow.orgId ||
        (org &&
          sOrg &&
          org.sectionId !== 'line' &&
          sOrg.sectionId === org.sectionId &&
          sOrg.type === org.type)
      );
    })
    .map((s) => ({
      id: s.id,
      name: s.name,
      orgId: s.orgId,
      orgName: orgMap.get(s.orgId)?.name ?? '',
      role: s.role,
      status: s.status,
    }));

  return NextResponse.json({
    role: {
      code: roleRow.code,
      orgId: roleRow.orgId,
      orgName: org?.name ?? '',
      orgType: org?.type ?? '',
      sectionId: roleRow.sectionId,
      sectionName: org?.sectionName ?? '',
      roleName: roleRow.roleName,
      holderId: roleRow.holderId,
      assignDate: roleRow.assignDate,
      holder: holder
        ? {
            id: holder.id,
            name: holder.name,
            role: holder.role,
            status: holder.status,
            phone: holder.phone,
            cert: holder.cert,
            certValid: holder.certValid,
            joinDate: holder.joinDate,
            duty: holder.duty,
          }
        : null,
    },
    candidates,
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse!;

  const { code } = await context.params;
  const roleCode = decodeURIComponent(code);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体 JSON 格式无效' }, { status: 400 });
  }

  const parsed = patchRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '关键岗位配置参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(staffKeyRoles)
    .where(eq(staffKeyRoles.code, roleCode))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: '关键岗位记录不存在' }, { status: 404 });
  }

  if (parsed.data.action === 'assign') {
    const holderId = parsed.data.holderId;
    if (!holderId) {
      return NextResponse.json({ error: '请指定配置责任人编号' }, { status: 400 });
    }

    const [candidate] = await db
      .select()
      .from(staffMembers)
      .where(eq(staffMembers.id, holderId))
      .limit(1);

    if (!candidate) {
      return NextResponse.json({ error: '指定候选人员不存在' }, { status: 404 });
    }

    const assignDate = parsed.data.assignDate ?? '2026-11-26';

    const [updatedRole] = await db
      .update(staffKeyRoles)
      .set({
        holderId,
        assignDate,
        updatedAt: new Date(),
      })
      .where(eq(staffKeyRoles.code, roleCode))
      .returning();

    await db
      .update(staffMembers)
      .set({
        role: existing.roleName,
        status: '在岗',
        offReason: '',
        updatedAt: new Date(),
      })
      .where(eq(staffMembers.id, holderId));

    await logM05Audit({
      req,
      userId: session.user.id,
      userName: session.user.name,
      action: 'ASSIGN_KEY_ROLE',
      target: `${existing.code} (${existing.roleName})`,
      detail: {
        holderId,
        holderName: candidate.name,
        assignDate,
      },
    });

    return NextResponse.json({ role: updatedRole });
  }

  // unassign
  const [updatedRole] = await db
    .update(staffKeyRoles)
    .set({
      holderId: null,
      assignDate: null,
      updatedAt: new Date(),
    })
    .where(eq(staffKeyRoles.code, roleCode))
    .returning();

  await logM05Audit({
    req,
    userId: session.user.id,
    userName: session.user.name,
    action: 'UNASSIGN_KEY_ROLE',
    target: `${existing.code} (${existing.roleName})`,
    detail: {
      previousHolderId: existing.holderId,
    },
  });

  return NextResponse.json({ role: updatedRole });
}
