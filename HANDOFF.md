# G1211吉黑高速明水至北安段工程建设项目综合管理平台 — Next.js 全栈架构交接规范（HANDOFF）

> 本平台已由原生 HTML/JS 原型升级为 **Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + PostgreSQL 16 + Drizzle ORM + Better Auth RBAC + Vercel AI SDK + Nginx** 全栈生产架构（采用 **Strangler Fig 渐进双轨迁移**，全量 **16 模块 / 64 页** 已 100% 跑通）。

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

## 3. 核心底座与迁移双轨机制

1. **持久化 CesiumJS 底座**：`public/lib/cesium/`（18.77MB 本地内核）+ `src/lib/cesium/engine.ts` + `src/components/cesium/CesiumBackdrop.tsx` 挂载于 `src/app/(platform)/layout.tsx`，跨 64 个子路由不卸载 WebGL，按路由 `cesiumMode`（`interactive | dimmed | opaque`）自动暂停/恢复渲染循环。
2. **Strangler Fig 桥接层**：`src/components/legacy/LegacyModuleHost.tsx` 注入 `window.JIHEI_PLATFORM` 垫片，按需加载剩余 9 个未原生化模块（`m05`–`m07`、`m09`–`m14`）的 `public/legacy/js/modules/*.js` 并同步工区、日期、弹窗、Toast 与路由跳转；已完成原生化的模块脚本已清理删除。
3. **共享 UI 组件库**：`src/components/ui/`（`GlassPanel`、`KpiCard`、`StatusBadge`、`DataTable`、`SplitImageCompare`、`SparklineDonut`、`DonutSvg`）。
4. **模块总表（`src/lib/modules/registry.ts` — 已原生 7 模块 / 33 页，双轨运行 9 模块 / 31 页）**：

| 状态 | 模块 | 路由前缀 | 子页数 | 后端 API & Schema / 说明 |
|---|---|---|---|---|
| ✅ 原生全栈 | `1. 综合首页` | `/home/*` | 4 页 | `src/modules/m01-home/` + `/api/home/overview` |
| ✅ 原生全栈 | `2. 进度管理` | `/progress/*` | 5 页 | `src/modules/m02_progress/` + `/api/v1/m02/*` (`overview`, `reports`, `plan`, `bim`) + `src/db/schema/domains/m02.ts`（含 Cesium BIM 实体追踪） |
| ✅ 原生全栈 | `3. 质量管理` | `/quality/*` | 6 页 | `src/modules/m03_quality/` + `/api/v1/m03/*` (`overview`, `lab`, `mixing`, `pavement`, `beam-yard`, `issues`) + `src/db/schema/domains/m03.ts` |
| ✅ 原生全栈 | `4. 安全管理` | `/safety/*` | 5 页 | `src/modules/m04_safety/` + `/api/v1/m04/*` (`overview`, `risks`, `ai-alerts`, `hazards`) + `src/db/schema/domains/m04.ts`（含 Cesium 12 处风险点追踪） |
| ✅ 原生全栈 | `8. 计量管理` | `/measure/*` | 4 页 | `src/modules/m08_measure/` + `/api/v1/m08/*` (`overview`, `sections`, `physical-compare`, `records`) + `src/db/schema/domains/m08.ts` |
| ✅ 原生全栈 | `15. 系统管理` | `/system/*` | 6 页 | `src/modules/m15-system/` + Better Auth RBAC + PostgreSQL 审计日志 |
| ✅ 原生全栈 | `16. AI助手` | `/ai/*` | 3 页 | `src/modules/m16-ai/` + AI SDK 流式对话/查库工具/会话落库 |
| 🔄 双轨运行 | `5.~7., 9.~14. 业务模块` | `/staff/*` 等 9 模块 | 31 页 | `public/legacy/js/modules/m05~m07, m09~m14` 经 `LegacyModuleHost` 运行，待 Phase 3~4 分批原生化 |

---

## 4. Phase 2 ~ 4 并行重构批次规划（`/teamwork`）

- ✅ **Phase 2（批次 A · 核心建管 4 模块 / 20 页，已完成原生全栈重构）**：`m02_progress`（5 页）、`m03_quality`（6 页）、`m04_safety`（5 页）、`m08_measure`（4 页），已接入 Better Auth 会话鉴权、PostgreSQL 领域表（`src/db/schema/domains/m02.ts`~`m08.ts`）及 `pnpm db:seed` 幂等初始化，通过 `pnpm typecheck`、`pnpm build` 与 `pnpm smoke:next` 64/64 巡检。
- **Phase 3（批次 B · 人机料与监测 5 模块 / 18 页）**：`m05-staff`、`m06-machine`、`m07-material`、`m09-uav`、`m10-video`
- **Phase 4（批次 C · 特色专题与收口 4 模块 / 13 页）**：`m11-speed`、`m12-pingan`、`m13-publish`、`m14-blacksoil`，全部转 `'native'` 后删除 `LegacyModuleHost` 与 `public/legacy/`。
