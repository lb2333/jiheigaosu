import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { videoCameras } from '@/db/schema/domains/m10';
import {
  logM10Audit,
  requireWriteSession,
  SECTION_ID_BY_NAME,
  SECTION_NAME_BY_ID,
} from '../../_utils';

const patchCameraSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  sectionId: z.enum(['sec1', 'sec2', 'sec3', 'sec4', 'sec5', 'sec6']).optional(),
  sectionName: z.enum(['一工区', '二工区', '三工区', '四工区', '五工区', '六工区']).optional(),
  stake: z.string().trim().min(1).max(40).optional(),
  location: z.string().trim().min(1).max(80).optional(),
  purpose: z.string().trim().min(1).max(60).optional(),
  status: z.enum(['在线', '图像异常', '离线']).optional(),
  faultNote: z.string().trim().max(200).optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse!;

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体 JSON 格式错误' }, { status: 400 });
  }

  const parsed = patchCameraSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '摄像头点位配置参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const updateFields: Partial<typeof videoCameras.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) updateFields.name = data.name;
  if (data.sectionId !== undefined) {
    updateFields.sectionId = data.sectionId;
    updateFields.sectionName = SECTION_NAME_BY_ID[data.sectionId];
  } else if (data.sectionName !== undefined) {
    updateFields.sectionName = data.sectionName;
    updateFields.sectionId = SECTION_ID_BY_NAME[data.sectionName];
  }
  if (data.stake !== undefined) updateFields.stake = data.stake;
  if (data.location !== undefined) updateFields.location = data.location;
  if (data.purpose !== undefined) updateFields.purpose = data.purpose;
  if (data.status !== undefined) {
    updateFields.status = data.status;
    if (data.status === '在线' && data.faultNote === undefined) {
      updateFields.faultNote = '';
    }
  }
  if (data.faultNote !== undefined) updateFields.faultNote = data.faultNote;

  const [updated] = await db
    .update(videoCameras)
    .set(updateFields)
    .where(eq(videoCameras.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: '未找到指定摄像头设备' }, { status: 404 });
  }

  await logM10Audit({
    session,
    action: 'UPDATE_VIDEO_CAMERA',
    target: `${updated.id} (${updated.name})`,
    detail: data as Record<string, unknown>,
    req,
  });

  return NextResponse.json({ camera: updated });
}
