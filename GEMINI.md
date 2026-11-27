# G1211吉黑高速原型 — Next.js 全栈工作区开发规范

在本工作区开展任何模块新增、原生迁移或维护前，必须遵循以下约定：

1. **先读交接文档**：新对话开始时先阅读根目录 `HANDOFF.md`，了解当前 Next.js 16 + PostgreSQL 16 + Nginx 底座接口、双轨迁移进度与共享组件库。
2. **模块目录隔离开发**：
   - 原生模块代码必须置于 `src/modules/mXX_<name>/`，接口置于 `src/app/api/v1/mXX/`，领域表结构置于 `src/db/schema/domains/mXX.ts`。
   - 尚未原生化的模块继续在 `public/legacy/js/modules/mXX_*.js` 通过 `LegacyModuleHost` 运行；一旦某模块完成原生重构，由主协调者更新 `src/lib/modules/registry.ts`（`mode: 'native'`）并移除对应 `public/legacy/` 脚本。
3. **并行协作防冲突**：使用 `/teamwork` 并行重构 Phase 2~4 模块时，各 Worker 仅允许读写自己负责的 `src/modules/mXX-*/`、`src/app/api/v1/mXX/` 与 `src/db/schema/domains/mXX.ts`；`src/lib/modules/registry.ts`、`src/db/schema/index.ts` 与 `HANDOFF.md` 统一由主协调者收口更新。
4. **以图为准 & 内网零外部 CDN**：对照 `系统界面示意图/` 下的 PNG 实际画面还原布局与交互；图标使用 `lucide-react` 或纯内联 SVG/Canvas，禁止引入不可控外部 CDN。
5. **Cesium 与鉴权约束**：保留 `public/lib/cesium/` 本地内核及 `src/lib/cesium/engine.ts`；业务模块添加临时 Cesium 实体必须使用 `engine.trackModuleEntity(moduleId, ...)` 并在卸载时调用 `clearModuleEntities(moduleId)`；所有受保护 API 必须在服务端通过 `auth.api.getSession({ headers: await headers() })` 校验。
6. **交付前校验**：每次改动后须执行 `pnpm typecheck && pnpm build`（以及 `pnpm smoke:next` 64 路由巡检）确认无报错后同步更新 `HANDOFF.md`。
