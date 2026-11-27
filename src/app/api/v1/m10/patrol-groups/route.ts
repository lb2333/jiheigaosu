import { NextRequest, NextResponse } from 'next/server';
import { asc, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { videoCameras, videoPatrolGroups } from '@/db/schema/domains/m10';
import { logM10Audit, requireSession, requireWriteSession } from '../_utils';

const createGroupSchema = z.object({
  name: z.string().trim().min(1, '组合名称不能为空').max(60),
  cameraIds: z.array(z.string().trim().min(1)).min(1, '至少包含 1 路摄像头').max(9),
});

export async function GET() {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const [groups, cameras] = await Promise.all([
    db
      .select()
      .from(videoPatrolGroups)
      .orderBy(desc(videoPatrolGroups.builtIn), asc(videoPatrolGroups.sortOrder), asc(videoPatrolGroups.createdAt)),
    db
      .select()
      .from(videoCameras)
      .orderBy(asc(videoCameras.sortOrder), asc(videoCameras.id)),
  ]);

  return NextResponse.json({ groups, cameras });
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse!;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体 JSON 格式错误' }, { status: 400 });
  }

  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '视频组合参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const allCams = await db
    .select({ id: videoCameras.id })
    .from(videoCameras)
    .orderBy(asc(videoCameras.sortOrder));

  const validIds = new Set(allCams.map((c) => c.id));
  const filled = parsed.data.cameraIds.filter((id) => validIds.has(id));
  if (filled.length === 0) {
    return NextResponse.json({ error: '所选摄像头编号均不存在' }, { status: 400 });
  }
  while (filled.length < 9 && allCams.length > 0) {
    filled.push(allCams[filled.length % allCams.length].id);
  }

  const existingGroups = await db.select({ sortOrder: videoPatrolGroups.sortOrder }).from(videoPatrolGroups);
  const maxOrder = existingGroups.reduce((m, g) => Math.max(m, g.sortOrder), 3);

  const newId = `grp-custom-${Date.now()}`;
  const [created] = await db
    .insert(videoPatrolGroups)
    .values({
      id: newId,
      name: parsed.data.name,
      builtIn: false,
      cameraIds: filled.slice(0, 9),
      sortOrder: maxOrder + 1,
    })
    .returning();

  await logM10Audit({
    session,
    action: 'CREATE_PATROL_GROUP',
    target: `${created.name} (${created.id})`,
    detail: { cameraIds: created.cameraIds },
    req,
  });

  return NextResponse.json({ group: created }, { status: 201 });
}
