# G1211吉黑高速明水至北安段工程建设项目综合管理平台 — Next.js 全栈架构交接规范（HANDOFF）

> 本平台已由原生 HTML/JS 原型全面升级为 **Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + PostgreSQL 16 + Drizzle ORM + Better Auth RBAC + Vercel AI SDK + Nginx** 全栈生产架构，全量 **16 模块 / 64 页已 100% 完成原生 React 全栈迁移**（原 Strangler Fig 双轨兼容层 `LegacyModuleHost`、`public/legacy/`、`legacy-compat.css` 与 `legacy-data.ts` 已全面退役清理）。

---

## 1. 运行环境与服务架构

- **工作区根目录**：`f:\吉黑高速原型`
- **本地 PostgreSQL 16.8**：安装于 `E:\ruanjian3\PostgreSQL`（数据目录 `E:\ruanjian3\PostgreSQL\data`，端口 `5432`，库名 `jihei_highway`）
  - 启动：`scripts\pg-start.bat` | 停止：`scripts\pg-stop.bat`
- **本地 Nginx 反向代理**：安装于 `E:\ruanjian3\nginx`（配置 `deploy/nginx/jihei-platform.conf`，监听 `8088` 代理至 Next.js `127.0.0.1:3000`，AI 流式接口已禁用缓冲）
  - 启动：`deploy\nginx\start-nginx.bat` | 停止：`deploy\nginx\stop-nginx.bat`
- **环境变量**：`.env.local`（模板见 `.env.example`），包含 `DATABASE_URL`、`BETTER_AUTH_SECRET`、`BETTER_AUTH_URL`、`NEXT_PUBLIC_CESIUM_ION_TOKEN`、`NEXT_PUBLIC_TIANDITU_TOKEN`、可选 `AI_OPENAI_COMPAT_*` / `AI_GATEWAY_API_KEY`。
- **常用工程命令**：
  - `pnpm dev`：启动 Next.js 开发服务（`http://127.0.0.1:3000`）
  - `pnpm typecheck`：TypeScript 严格检查（`tsc --noEmit`）
  - `pnpm build`：生产构建（生成 `.next/standalone`）
  - `pnpm db:push` / `pnpm db:seed`：推送 Drizzle Schema 与初始化基础/演示数据
  - `pnpm smoke:next`：无头浏览器全量 64 路由 + Auth + DB + AI + Cesium 巡检（`tests/smoke-64.mjs`）

---

## 2. 演示账号与权限体系（Better Auth + PostgreSQL RBAC）

- 登录页：`/login`（支持邮箱密码登录及演示快捷切换，`ALLOW_DEMO_LOGIN=true` 时生效）
- 预设账号（默认密码 `Jihei@2026`）：
  - `admin@jihei.cn` — 超级管理员（`admin`，可操作「15.系统管理」用户授权与配置变更）
  - `sec2@jihei.cn` — 二工区总工（`engineer`）
  - `supervisor@jihei.cn` — 总监理工程师（`supervisor`）
  - `guide@jihei.cn` — 数字展厅讲解员（`viewer`）

---

## 3. 核心底座与全量原生模块化架构

1. **持久化 CesiumJS 底座**：`public/lib/cesium/`（18.77MB 本地内核）+ `src/lib/cesium/engine.ts` + `src/components/cesium/CesiumBackdrop.tsx` 挂载于 `src/app/(platform)/layout.tsx`，跨 64 个子路由不卸载 WebGL，按路由 `cesiumMode`（`interactive | dimmed | opaque`）自动暂停/恢复渲染循环；各业务模块通过 `engine.trackModuleEntity(moduleId, ...)` 与 `engine.clearModuleEntities(moduleId)` 管理模块级三维实体生命周期。
2. **全量原生路由与平台底座**：`src/app/(platform)/[module]/[subPage]/page.tsx` 按 `src/lib/modules/registry.ts`（`16` 个模块全部为 `mode: 'native'`）直接渲染对应原生 React 模块组件；全局壳层样式统一收敛至 `src/styles/platform-shell.css`，静态基础目录统一收敛至 `src/lib/modules/platform-data.ts`；原 `LegacyModuleHost`、`public/legacy/` 及 `/legacy/` 代理白名单已全部清理退役。
3. **共享 UI 组件库**：`src/components/ui/`（`GlassPanel`、`KpiCard`、`StatusBadge`、`DataTable`、`SplitImageCompare`、`SparklineDonut`、`DonutSvg`）。
4. **模块总表（`src/lib/modules/registry.ts` — 16 模块 / 64 页 100% 原生全栈）**：

| 状态 | 模块 | 路由前缀 | 子页数 | 后端 API & Schema / 说明 |
|---|---|---|---|---|
| ✅ 原生全栈 | `1. 综合首页` | `/home/*` | 4 页 | `src/modules/m01-home/` + `/api/home/overview` |
| ✅ 原生全栈 | `2. 进度管理` | `/progress/*` | 5 页 | `src/modules/m02_progress/` + `/api/v1/m02/*` (`overview`, `reports`, `plan`, `bim`) + `src/db/schema/domains/m02.ts`（含 Cesium BIM 实体追踪） |
| ✅ 原生全栈 | `3. 质量管理` | `/quality/*` | 6 页 | `src/modules/m03_quality/` + `/api/v1/m03/*` (`overview`, `lab`, `mixing`, `pavement`, `beam-yard`, `issues`) + `src/db/schema/domains/m03.ts` |
| ✅ 原生全栈 | `4. 安全管理` | `/safety/*` | 5 页 | `src/modules/m04_safety/` + `/api/v1/m04/*` (`overview`, `risks`, `ai-alerts`, `hazards`) + `src/db/schema/domains/m04.ts`（含 Cesium 12 处风险点追踪） |
| ✅ 原生全栈 | `5. 人员管理` | `/staff/*` | 2 页 | `src/modules/m05_staff/` + `/api/v1/m05/*` (`org`, `staff/[id]`, `attendance`, `roles/[code]`, `anomalies/[id]`) + `src/db/schema/domains/m05.ts`（含 Cesium 组织驻地标注追踪） |
| ✅ 原生全栈 | `6. 机械管理` | `/machine/*` | 2 页 | `src/modules/m06_machine/` + `/api/v1/m06/*` (`equipment`, `equipment/[code]`, `key-archives`, `key-archives/[code]`, `patrols`, `reminder-config`) + `src/db/schema/domains/m06.ts`（含 Cesium 机械点位追踪） |
| ✅ 原生全栈 | `7. 全周期备料管理` | `/material/*` | 4 页 | `src/modules/m07_material/` + `/api/v1/m07/*` (`overview`, `reports`, `reports/[code]`, `yard`, `batches`, `batches/[batchId]`) + `src/db/schema/domains/m07.ts`（含 Cesium 料场点位追踪） |
| ✅ 原生全栈 | `8. 计量管理` | `/measure/*` | 4 页 | `src/modules/m08_measure/` + `/api/v1/m08/*` (`overview`, `sections`, `physical-compare`, `records`) + `src/db/schema/domains/m08.ts` |
| ✅ 原生全栈 | `9. 无人机巡检` | `/uav/*` | 6 页 | `src/modules/m09_uav/` + `/api/v1/m09/*` (`overview`, `tasks`, `routes`, `live`, `hazards`, `reports`) + `src/db/schema/domains/m09.ts`（含 Cesium 机巢/航线实体追踪及确认隐患推送 `m04`） |
| ✅ 原生全栈 | `10. 视频监控` | `/video/*` | 4 页 | `src/modules/m10_video/` + `/api/v1/m10/*` (`cameras`, `patrol-groups`, `playback`, `airground`) + `src/db/schema/domains/m10.ts` |
| ✅ 原生全栈 | `11. 智慧提速` | `/speed/*` | 5 页 | `src/modules/m11_speed/` + `/api/v1/m11/*` (`overview`, `algorithm`, `strategies`, `strategies/[segId]/audit`, `feedback`, `feedback/[batchId]/retry`, `replays`) + `src/db/schema/domains/m11.ts`（含 `traffic`/`replay` 交互式 Cesium 示范路段实体追踪） |
| ✅ 原生全栈 | `12. 平安工地` | `/pingan/*` | 2 页 | `src/modules/m12_pingan/` + `/api/v1/m12/*` (`showcase`, `topics`, `topics/[id]`) + `src/db/schema/domains/m12.ts` |
| ✅ 原生全栈 | `13. 信息发布` | `/publish/*` | 5 页 | `src/modules/m13_publish/` + `/api/v1/m13/*` (`overview`, `templates`, `templates/[id]`, `orders`, `orders/[id]/action`, `plans`, `plans/[id]`, `receipts`, `receipts/action`) + `src/db/schema/domains/m13.ts` |
| ✅ 原生全栈 | `14. 黑土地保护` | `/blacksoil/*` | 1 页 | `src/modules/m14_blacksoil/` + `/api/v1/m14/*` (`parcels`, `parcels/[id]`) + `src/db/schema/domains/m14.ts`（复用共享 `SplitImageCompare` 卷帘影像对比与矢量叠加） |
| ✅ 原生全栈 | `15. 系统管理` | `/system/*` | 6 页 | `src/modules/m15-system/` + Better Auth RBAC + PostgreSQL 审计日志 |
| ✅ 原生全栈 | `16. AI助手` | `/ai/*` | 3 页 | `src/modules/m16-ai/` + AI SDK 流式对话/查库工具/会话落库 |

---

## 4. Phase 2 ~ 4 并行重构批次归档（`/teamwork`）

- ✅ **Phase 2（批次 A · 核心建管 4 模块 / 20 页，已完成原生全栈重构）**：`m02_progress`（5 页）、`m03_quality`（6 页）、`m04_safety`（5 页）、`m08_measure`（4 页），已接入 Better Auth 会话鉴权、PostgreSQL 领域表（`src/db/schema/domains/m02.ts`~`m08.ts`）及 `pnpm db:seed` 幂等初始化，通过 `pnpm typecheck`、`pnpm build` 与 `pnpm smoke:next` 64/64 巡检。
- ✅ **Phase 3（批次 B · 人机料与监测 5 模块 / 18 页，已完成原生全栈重构）**：`m05_staff`（2 页）、`m06_machine`（2 页）、`m07_material`（4 页）、`m09_uav`（6 页）、`m10_video`（4 页），已接入 Better Auth 会话鉴权与 RBAC、PostgreSQL 领域表（`src/db/schema/domains/m05.ts`~`m10.ts`）及 `pnpm db:seed` 幂等初始化，通过 `pnpm typecheck`、`pnpm build`（standalone）、`pnpm smoke:next` 64/64 巡检与 `/api/v1/m05`~`m10` 鉴权校验。
- ✅ **Phase 4（批次 C · 特色专题与收官 4 模块 / 13 页，已完成原生全栈重构并退出双轨）**：`m11_speed`（5 页，含 `traffic`/`replay` Cesium 示范路段实体追踪）、`m12_pingan`（2 页）、`m13_publish`（5 页）、`m14_blacksoil`（1 页，复用 `SplitImageCompare`），全部切换 `mode: 'native'` 并彻底清理 `LegacyModuleHost`、`public/legacy/`、`legacy-compat.css` 与 `legacy-data.ts`，实现 **16 模块 / 64 页 100% 原生全栈化**。
