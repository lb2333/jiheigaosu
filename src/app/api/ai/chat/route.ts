import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';
import { asc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { aiMessages, aiThreads, focusItems, poiObjects, workSections } from '@/db/schema';
import { resolveAiProvider } from '@/lib/ai/provider';
import { jiheiAiTools } from '@/lib/ai/tools';

async function buildFallbackAnswer(query: string): Promise<string> {
  const q = query.trim();

  if (q.includes('节点') || q.includes('问题') || q.includes('协同')) {
    const items = await db.select().from(focusItems).orderBy(asc(focusItems.sortOrder));
    const nodes = items.filter((i) => i.category === 'nodes');
    const issues = items.filter((i) => i.category === 'issues');
    return [
      `已实时检索 PostgreSQL「重点关注」台账（共 ${items.length} 条）：`,
      `\n【本月关键节点（${nodes.length} 项）】`,
      ...nodes.map((n, i) => `${i + 1}. ${n.title}（${n.sectionName} · 期限 ${n.dueDate} · ${n.status}）`),
      `\n【待协同问题（${issues.length} 项）】`,
      ...issues.slice(0, 4).map((it, i) => `${i + 1}. ${it.title}（${it.sectionName} · ${it.status}）`),
    ].join('\n');
  }

  if (q.includes('桥梁') || q.includes('梁场') || q.includes('拌合站')) {
    const poiId = q.includes('梁场') ? 'beamYardA' : q.includes('拌合站') ? 'batchPlantA' : 'bridgeA';
    const rows = await db.select().from(poiObjects).where(eq(poiObjects.id, poiId)).limit(1);
    if (rows.length) {
      const p = rows[0];
      return [
        `已从数据库调取重点工程「${p.name}」（${p.sectionName} · ${p.stake}）实时档案：`,
        `- 工程类型：${p.type}`,
        `- 当前施工阶段：${p.stage}`,
        `- 规模与进度：${p.metrics.length} | 形象进度 ${p.metrics.progress} | 完成量 ${p.metrics.beamsDone}`,
        `- 现场负责人：${p.metrics.supervisor}`,
        `- 关联资料：已归档 ${p.docs.length} 份核心技术/质检文件（最新：${p.docs[0]?.name ?? '无'}）。`,
      ].join('\n');
    }
  }

  const sections = await db.select().from(workSections).orderBy(asc(workSections.sortOrder));
  if (q.includes('二工区') || q.includes('一工区') || q.includes('三工区') || q.includes('四工区') || q.includes('五工区') || q.includes('六工区')) {
    const target = sections.find((s) => q.includes(s.name)) ?? sections[1];
    if (target) {
      return [
        `已实时查询 PostgreSQL 工区主表「${target.name}（${target.stakeRange}）」：`,
        `- 进度指标：路基 ${target.progressMetrics[0]}% · 桥梁 ${target.progressMetrics[1]}% · 路面 ${target.progressMetrics[2]}% · 场站 ${target.progressMetrics[3]}%`,
        `- 质量合格率：桩基 ${target.qualityMetrics[0]}% · 混凝土 ${target.qualityMetrics[1]}% · 质量闭环 ${target.qualityMetrics[5]}%`,
        `- 安全管控率：隐患闭环 ${target.safetyMetrics[0]}% · 班前教育 ${target.safetyMetrics[1]}% · AI处置 ${target.safetyMetrics[5]}%`,
      ].join('\n');
    }
  }

  return [
    `已为您检索 PostgreSQL 全线六工区实时台账（G1211吉黑高速明水至北安段，全长 146.8 km）：`,
    ...sections.map(
      (s) => `• ${s.name}（${s.stakeRange}）：路基 ${s.progressMetrics[0]}% / 桥梁 ${s.progressMetrics[1]}% / 场站 ${s.progressMetrics[3]}%`
    ),
    `\n提示：当前运行于内置 PostgreSQL 查库引擎；在 .env.local 配置 AI_OPENAI_COMPAT_BASE_URL（如 Ollama / DeepSeek / Qwen）或 AI_GATEWAY_API_KEY 后可切换完整大语言模型多步工具推理。`,
  ].join('\n');
}

function extractLastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      const texts = messages[i].parts
        .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text);
      return texts.join('\n').trim();
    }
  }
  return '';
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as {
    messages: UIMessage[];
    scenario?: string;
    threadId?: string;
  };
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const scenario = body.scenario ?? 'analysis';
  const threadId = body.threadId;
  const lastUserText = extractLastUserText(messages);

  if (threadId && lastUserText) {
    await db
      .insert(aiMessages)
      .values({
        id: `msg-${Date.now()}-u`,
        threadId,
        role: 'user',
        parts: [{ type: 'text', text: lastUserText }],
      })
      .onConflictDoNothing();
    await db
      .update(aiThreads)
      .set({ updatedAt: new Date() })
      .where(eq(aiThreads.id, threadId));
  }

  const resolved = resolveAiProvider();

  if (resolved.mode !== 'local-db-fallback' && resolved.model) {
    const result = streamText({
      model: resolved.model,
      system: `你是「G1211吉黑高速明水至北安段工程建设项目综合管理平台」的智能工程助手（当前场景：${scenario}）。
请优先调用数据库工具（querySectionProgress、queryFocusIssues、queryPoiDetail）获取真实工程数据作答；当用户要求查看地图点位或跳转模块时，同步调用 flyCesiumCamera 或 navigateModule。回答需精炼、专业、数据准确。`,
      messages: await convertToModelMessages(messages),
      tools: jiheiAiTools,
      stopWhen: isStepCount(5),
      onFinish: async ({ text }) => {
        if (threadId && text) {
          await db.insert(aiMessages).values({
            id: `msg-${Date.now()}-a`,
            threadId,
            role: 'assistant',
            parts: [{ type: 'text', text }],
          });
        }
      },
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        tools: jiheiAiTools,
      }),
    });
  }

  // Fallback streaming response backed by live PostgreSQL queries
  const answer = await buildFallbackAnswer(lastUserText);
  if (threadId) {
    await db.insert(aiMessages).values({
      id: `msg-${Date.now()}-a`,
      threadId,
      role: 'assistant',
      parts: [{ type: 'text', text: answer }],
    });
  }

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const textId = `txt-${Date.now()}`;
      writer.write({ type: 'text-start', id: textId });
      const chunks = answer.match(/.{1,14}/gs) ?? [answer];
      for (const ch of chunks) {
        writer.write({ type: 'text-delta', id: textId, delta: ch });
        await new Promise((r) => setTimeout(r, 12));
      }
      writer.write({ type: 'text-end', id: textId });
    },
  });

  return createUIMessageStreamResponse({ stream });
}
