import { tool } from 'ai';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { focusItems, poiObjects, workSections } from '@/db/schema';

export const jiheiAiTools = {
  querySectionProgress: tool({
    description: '查询吉黑高速明水至北安段一至六工区的施工进度、质量合格率、安全管控指标',
    inputSchema: z.object({
      sectionId: z
        .enum(['all', 'sec1', 'sec2', 'sec3', 'sec4', 'sec5', 'sec6'])
        .default('all')
        .describe('工区编号，all 代表全线汇总'),
    }),
    execute: async ({ sectionId }) => {
      if (sectionId === 'all') {
        const rows = await db.select().from(workSections).orderBy(asc(workSections.sortOrder));
        return {
          scope: '全线六工区汇总',
          sections: rows.map((r) => ({
            id: r.id,
            name: r.name,
            stakeRange: r.stakeRange,
            subgradePct: r.progressMetrics[0],
            bridgePct: r.progressMetrics[1],
            pavementPct: r.progressMetrics[2],
            yardPct: r.progressMetrics[3],
          })),
        };
      }
      const rows = await db
        .select()
        .from(workSections)
        .where(eq(workSections.id, sectionId))
        .limit(1);
      if (!rows.length) return { error: '未找到指定工区' };
      const r = rows[0];
      return {
        id: r.id,
        name: r.name,
        stakeRange: r.stakeRange,
        progressMetrics: r.progressMetrics,
        qualityMetrics: r.qualityMetrics,
        safetyMetrics: r.safetyMetrics,
      };
    },
  }),

  queryFocusIssues: tool({
    description: '查询重点关注事项，包括本月关键节点、待协同问题、跨工区协同事项',
    inputSchema: z.object({
      category: z
        .enum(['all', 'nodes', 'issues', 'collab'])
        .default('all')
        .describe('事项分类'),
    }),
    execute: async ({ category }) => {
      const rows =
        category === 'all'
          ? await db.select().from(focusItems).orderBy(asc(focusItems.sortOrder))
          : await db
              .select()
              .from(focusItems)
              .where(eq(focusItems.category, category))
              .orderBy(asc(focusItems.sortOrder));
      return { count: rows.length, items: rows };
    },
  }),

  queryPoiDetail: tool({
    description: '查询桥梁示例A、梁场示例A、拌合站示例A等重点工程详细信息与归档资料',
    inputSchema: z.object({
      poiId: z.enum(['bridgeA', 'beamYardA', 'batchPlantA']).describe('重点工程 ID'),
    }),
    execute: async ({ poiId }) => {
      const rows = await db.select().from(poiObjects).where(eq(poiObjects.id, poiId)).limit(1);
      if (!rows.length) return { error: '未找到工程对象' };
      return rows[0];
    },
  }),

  flyCesiumCamera: tool({
    description: '联动前端 Cesium 三维地球飞行定位到指定工区或重点工程点位',
    inputSchema: z.object({
      targetType: z.enum(['overview', 'section', 'poi']),
      targetId: z.string().describe('如 sec2、bridgeA、beamYardA、batchPlantA'),
      label: z.string(),
    }),
    execute: async ({ targetType, targetId, label }) => ({
      clientAction: 'flyCesium',
      targetType,
      targetId,
      label,
      executed: true,
    }),
  }),

  navigateModule: tool({
    description: '跳转到平台指定业务模块页面',
    inputSchema: z.object({
      moduleId: z.string(),
      subPageId: z.string().optional(),
      label: z.string(),
    }),
    execute: async ({ moduleId, subPageId, label }) => ({
      clientAction: 'navigateModule',
      moduleId,
      subPageId,
      label,
      executed: true,
    }),
  }),
};
