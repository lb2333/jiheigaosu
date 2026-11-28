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

1. **持久化 CesiumJS 底座**：`public/lib/cesium/`（11.21 MB 本地内核，已清理冗余 `index.js`/`index.cjs`）+ `src/lib/cesium/engine.ts` + `src/lib/cesium/highway-assets.ts` + `src/components/cesium/CesiumBackdrop.tsx` 挂载于 `src/app/(platform)/layout.tsx`，跨 64 个子路由不卸载 WebGL；`widgets.css` 与 `Cesium.js` 仅在进入 `interactive` / `dimmed` 路由时惰性加载，54 个 `opaque` 路由零三维首屏阻塞，并内置分辨率上限控制、投影脏检测与事件清理。
   - **三维公路/桥梁/互通与 4D BIM 模型资产**：`scripts/blender/generate_highway_models.py`（导出 `public/models/*.glb` 5 套轻量低模），沿 `ROUTE_COORDS` 装配 4 处互通立交 + 26 座主线新建桥（7 大 / 8 中 / 11 小，横跨主线）+ 贴地双向四车道 26m 路面；另 `scripts/blender/generate_bim_stage_models.py` 为「2.进度管理」4D BIM 模拟生成 `public/models/bim/*.glb`（4 个对象 × 4 道分工序模型，共 16 个 `.glb`，由 `ensureBim3DModels()` 在首次启用 BIM/模拟图层时惰性装配）。
2. **全量原生路由与平台底座**：`src/app/(platform)/[module]/[subPage]/page.tsx` 通过 `src/components/shell/ModuleStageLoader.tsx` 对 `src/lib/modules/registry.ts` 中 16 个原生模块执行 `next/dynamic` 路由级动态拆包（`TopHeader` 悬停/聚焦预加载），`AiFloatingDrawer`、`GlobalModalHost`（结构化 `ModalBlock[]` 无 `dangerouslySetInnerHTML`）、路由状态页（`loading.tsx` / `error.tsx` / `not-found.tsx`）与全局壳层样式 `src/styles/platform-shell.css` 构成统一壳层；静态基础目录统一收敛至 `src/lib/modules/platform-data.ts`。
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


---

## 5. 性能、架构与工程化专项优化（第 1～5 阶段）

- **Phase 1 · 路由拆包与壳层按需加载**：
  - 新增 `src/components/shell/ModuleStageLoader.tsx`，在 `src/app/(platform)/[module]/[subPage]/page.tsx` 去除 16 模块静态全量导入，`TopHeader` 增加 `onMouseEnter`/`onFocus` chunk 预加载；
  - 拆分 `AiFloatingDrawer.tsx` + `AiFloatingDrawerBody.tsx`（点击或悬停时懒加载 `@ai-sdk/react` / `ai`）；
  - `next.config.ts` 增加 `poweredByHeader: false` 及 `X-Content-Type-Options`、`X-Frame-Options`、`Referrer-Policy` 安全响应头。
- **Phase 2 · CesiumJS 惰性启动、包体瘦身与 Nginx 缓存**：
  - `src/app/layout.tsx` 移除同步 `widgets.css`，改为 `CesiumBackdrop.tsx` 在首个非 `opaque` 路由按需注入并惰性初始化 WebGL；
  - `src/lib/cesium/engine.ts` 支持 `ensureBim3DModels()` 惰性装配 16 套 `.glb`、`resolutionScale` 限制（`<= 1.5`，`dimmed` 模式 `0.75`）、`_updateProjectedPositions()` 脏检测及事件清理方法；
  - 清理冗余 `public/lib/cesium/index.js` 与 `index.cjs`（Cesium 静态目录由 `18.77 MB` 降至 `11.21 MB`），补齐 `deploy/nginx/jihei-platform.conf` `location /models/` 缓存及 `model/gltf-binary` gzip，主要非首屏 `<img>` 补充 `loading="lazy" decoding="async"`。
- **Phase 3 · 样式降载、可用性与路由状态页**：
  - 完善 `src/styles/tokens.css` 表面色阶、语义状态色与统一 `--z-*` 层级并在 `platform-shell.css` 收口；
  - `mode-opaque` 路由移除 `backdrop-filter`，表格行增加 `content-visibility: auto`，清空全部 `transition: all`；
  - 移除全局 `html, body { user-select: none; }` 恢复文本与单据可复制能力，补充 `tabular-nums`、`:focus-visible` 及 `1366px`/`2560px+` 响应式断点，新增 `src/app/(platform)/loading.tsx`、`error.tsx` 与 `src/app/not-found.tsx`。
- **Phase 4 · 前后端数据链路与数据库收敛**：
  - 新增 `src/lib/hooks/useApiQuery.ts`（`AbortController` 防竞态 + SWR 短期缓存）接入 `m01-home`、`m02_progress`、`m04_safety`；修复 `src/lib/store/platform-store.ts` `hydrateSession()` 挂载恢复工区/日期/图层偏好；
  - 收敛 `src/lib/api/auth-guard.ts` 与 `src/lib/api/audit.ts` 供 `m04`~`m14` 复用，补齐 `/api/ai/provider-info` 服务端会话校验，`src/db/index.ts` 支持 `PG_POOL_MAX`（默认 `15`）；
  - 合并 `m02/overview` 重复查询、`m04/overview` 改用 SQL `count(*)`，为 `m04`/`m11`/`m13` 多表写入接口增加 `db.transaction()` 并消除 `m13` N+1 循环写入，关键只读概览接口补充 `Cache-Control: private, max-age=15, stale-while-revalidate=60`。
- **Phase 5 · 超大模块拆解、安全弹窗与容器加固**：
  - 将 `m01-home/HomeModule.tsx`（140 行）、`m03_quality/QualityModule.tsx`（173 行）、`m08_measure/MeasureModule.tsx`（262 行）按子页拆分至各自 `components/*SubPage.tsx` 并以 `next/dynamic` 懒加载；消除 `m08` 模块级可变 `bridgeState`，统一收敛至 `usePlatformStore.measureBridge`（支持重置与登出清空）；
  - `QualityModal`、`MeasureModalHost` 及 `m09_uav`（23 弹窗 + 独立 `A4ReportSheet.tsx`）、`m13_publish`（8 弹窗）全部实现打开时按需加载；
  - 升级 `GlobalModalHost.tsx` 与 `platform-store.ts` 为结构化 `ModalBlock[]` 渲染，彻底移除 `dangerouslySetInnerHTML`；
  - 新增 `.dockerignore`，优化 `Dockerfile`（去除重复拷贝，切换 `USER node` 非 root 运行），`scripts/prepare-standalone.mjs` 停止复制 `.env.local` 进入 `.next/standalone/`。
- **UI 最小改动视觉优化（2026-11-28）**：
  - `src/styles/tokens.css` 与 `src/styles/platform-shell.css`：将全局面板与导航底色沉降为深海冷青灰玻璃态并收敛外发光，细化 `1px` 冰蓝边框与顶部微高光；统一「全栈数据」为深蓝灰+绿点在线胶囊、将琥珀金留给「重点关注」待办计数与滞后进度提示；`.hud-right-col` 增加底部安全避让（`max-height: calc(100% - 86px)`），彻底消除右下角 AI 浮球压住「对象详情」按钮的问题。
  - `src/components/shell/TopHeader.tsx`、`SubNavBar.tsx`、`AiFloatingDrawer.tsx`：精简用户胶囊释放顶栏空间使「黑土地保护」完整显示；移除右下角冗余水印胶囊并微缩 AI 浮球。
  - `src/modules/m01-home/components/OverviewSubPage.tsx` 与 `src/lib/cesium/engine.ts`：「管理概览」移除重复图标并按完成度分三档着色（青绿/天蓝/柔琥珀），视频顶部胶囊改为单行不折行，底部图层栏拉开关态文字对比度；全局 `color-scheme: dark` 与悬浮 HUD 侧栏隐藏原生滚动条消除白色滚动条；Cesium 高速两侧路线升级为正反双向 `JiheiFlowLine` 小箭头（`›`/`‹`）流动传输动态特效（移除静态发光边线与呆板箭头，并收细中心光带），按相机高度（`26 km → 5.5 km`）平滑三次渐变隐藏路线与工区色带，确保放大查看三维路面与桥梁模型时画面清爽；POI 地面波纹半径缩小约 30% 且隐藏同坐标重复桥梁静态标签。
  - `src/modules/m01-home/components/RoamingSubPage.tsx`、`src/lib/modules/platform-data.ts` 与 `src/lib/cesium/engine.ts`：「数字漫游」站点由 5 站扩充为覆盖全线 6 个工区的 **14 个沿线站点**（含明水枢纽、通达、拜泉、建华 4 处互通立交 + 乌裕尔河、桥梁示例A、三工区跨河、通肯河、拜泉西、五工区跨沟、建华跨线 7 座主线大桥 + 明水服务区 + 梁场/拌合站），并同步下调「实景漫游」与「设计模型预览」视角高度至贴近三维路面与互通/桥梁模型（俯瞰 `760~1120 m`、沿线 `480~680 m`、设计模型预览再拉近至 `0.84×`，自动采样真实地形高程），左栏时间轴支持无滚动条顺滑滚动与分类标签，底部控制栏升级为 14 站紧凑进度轨与悬停站点提示。
- **终验基线（2026-11-28）**：`pnpm typecheck` 0 报错；`pnpm build` 通过且 standalone 无 `.env.local`；`pnpm smoke:next` 通过 `127.0.0.1:8088`（Nginx -> `127.0.0.1:3000`）验证 **64 / 64 路由全部通过**、Cesium `ready: true`、Auth/PostgreSQL 读写与 AI 流式接口及 `Ctrl+K` 均正常。
