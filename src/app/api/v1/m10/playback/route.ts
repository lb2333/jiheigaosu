import { NextRequest, NextResponse } from 'next/server';
import { asc, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import {
  videoCameras,
  videoEvidenceCaptures,
  videoPlaybackAlarms,
} from '@/db/schema/domains/m10';
import {
  buildFallbackPlaybackAlarm,
  buildPlaybackSegments,
  getRangeStartHour,
  pad2,
} from '@/modules/m10_video/types';
import { logM10Audit, requireSession, requireWriteSession } from '../_utils';

const captureSchema = z.object({
  cameraId: z.string().trim().min(1),
  recordDate: z.string().trim().min(8),
  capturedAt: z.string().trim().min(8),
  clipLabel: z.string().trim().min(1),
  note: z.string().trim().max(200).optional(),
});

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const requestedCamId = (searchParams.get('camId') || 'CAM-YD-A01').trim();
  const date = (searchParams.get('date') || '2026-11-26').trim();
  const range = (searchParams.get('range') || '09:00–10:00').trim();

  const allCameras = await db
    .select()
    .from(videoCameras)
    .orderBy(asc(videoCameras.sortOrder), asc(videoCameras.id));

  const playableCameras = allCameras.filter((c) => c.status !== '离线');
  const selectedCam =
    playableCameras.find((c) => c.id === requestedCamId) ||
    playableCameras[0] ||
    allCameras[0];

  if (!selectedCam) {
    return NextResponse.json({ error: '暂无可用回放摄像头' }, { status: 404 });
  }

  const [alarmRows, captures] = await Promise.all([
    db
      .select()
      .from(videoPlaybackAlarms)
      .where(eq(videoPlaybackAlarms.cameraId, selectedCam.id))
      .orderBy(asc(videoPlaybackAlarms.sortOrder)),
    db
      .select()
      .from(videoEvidenceCaptures)
      .where(eq(videoEvidenceCaptures.cameraId, selectedCam.id))
      .orderBy(desc(videoEvidenceCaptures.createdAt))
      .limit(10),
  ]);

  const dbAlarm = alarmRows.find((a) => a.recordDate === date) || alarmRows[0];
  const startH = getRangeStartHour(range);
  const hh = pad2(startH);

  const alarm = dbAlarm
    ? {
        ...dbAlarm,
        recordDate: date,
        timeRange: range,
        alarmTime:
          range === dbAlarm.timeRange && date === dbAlarm.recordDate
            ? dbAlarm.alarmTime
            : `${date} ${hh}:${dbAlarm.alarmTime.slice(14)}`,
        clipWindow:
          range === dbAlarm.timeRange
            ? dbAlarm.clipWindow
            : `${hh}:${dbAlarm.clipWindow.slice(3, 8)} – ${hh}:${dbAlarm.clipWindow.slice(14)}`,
        segments: buildPlaybackSegments(range, dbAlarm.alarmClipIdx),
      }
    : buildFallbackPlaybackAlarm(selectedCam, date, range);

  return NextResponse.json({
    camera: selectedCam,
    playableCameras,
    date,
    range,
    alarm,
    segments: alarm.segments,
    captures,
  });
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

  const parsed = captureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '截图取证参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [cam] = await db
    .select({ id: videoCameras.id, name: videoCameras.name })
    .from(videoCameras)
    .where(eq(videoCameras.id, parsed.data.cameraId));

  if (!cam) {
    return NextResponse.json({ error: '摄像头不存在' }, { status: 404 });
  }

  const [capture] = await db
    .insert(videoEvidenceCaptures)
    .values({
      cameraId: parsed.data.cameraId,
      recordDate: parsed.data.recordDate,
      capturedAt: parsed.data.capturedAt,
      clipLabel: parsed.data.clipLabel,
      note: parsed.data.note || '历史录像截图取证并加盖数字水印',
      capturedBy: session.user.name,
    })
    .returning();

  await logM10Audit({
    session,
    action: 'CAPTURE_PLAYBACK_EVIDENCE',
    target: `${cam.id} @ ${parsed.data.capturedAt}`,
    detail: parsed.data as Record<string, unknown>,
    req,
  });

  return NextResponse.json({ capture }, { status: 201 });
}
