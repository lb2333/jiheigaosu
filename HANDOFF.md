# G1211吉黑高速明水至北安段 工程建设项目综合管理平台 — 原型开发交接规范（HANDOFF）

> 本文件记录「G1211吉黑高速明水至北安段工程建设项目综合管理平台」底座接口、视觉规范、文件组织方式与全量开发进度（`1.综合首页` ~ `16.ai助手`，**全部 16 个模块 / 64 页原型已 100% 完成**；注：第 4 模块按磁盘实际 5 张示意图核减，实际总计 64 页）。**新开对话或维护请先阅读本文件**，严格遵守现有底座接口、视觉规范与文件组织方式。

---

## 1. 运行环境与预览方式

- **工作区根目录**：`f:\吉黑高速原型`
- **本地原型示意图目录**：`f:\吉黑高速原型\系统界面示意图`（含 `1.综合首页` ~ `16.ai助手` 全部 PNG）
- **本地服务**：已内置零依赖 Node 静态服务 `server.js`（端口 `8088`，已启用 Brotli/Gzip 压缩、流式传输、ETag/304 协商缓存及路径安全校验，`lib/cesium/` 与 `assets/` 长期缓存）
  - 启动方式：运行 `node f:\吉黑高速原型\server.js` 或双击 `启动三维平台.bat`
  - 浏览器访问：`http://127.0.0.1:8088/index.html`
- **Cesium 内核与性能配置**：
  - CesiumJS 1.119.0 已完整本地化至 `f:\吉黑高速原型\lib\cesium\`；
  - 全局配置与 15 模块按需懒加载清单统一收敛于 `js/config.js`（首屏零阻塞，支持 `#moduleId/subPageId` 深链及浏览器前进/后退）；
  - 全屏 `opaque` 业务页、建设里程碑及后台标签页自动暂停 Cesium WebGL 渲染循环，点位脉冲采用 GLSL Shader 材质，外网影像异常时自动降级为本地深蓝数字底图。

- **工程化脚本（`package.json`）**：
  - `npm start`：启动本地静态服务（默认 `http://127.0.0.1:8088/index.html`）
  - `npm run check`：全量语法检查 + 模块/目录一致性校验 + 跨模块链接验证（`scripts/check.js`）
  - `npm run smoke`：零依赖无头 Edge/Chrome 64 页真实浏览器巡检 + Ctrl+K/日期联动/缓存重置验证（`scripts/smoke-test.js`）
  - `npm run pack`：生成不含 `系统界面示意图/` 的轻量运行发布包至 `dist-release/`（`scripts/pack-release.js`）
- **底座新增能力**：
  - 共享组件与持久化底座 `js/shared/ui-kit.js`（`window.JIHEI_UI` / `ctx.ui` / `ctx.store`）及公共样式 `css/modules-common.css`；
  - 全局快捷直达面板（`Ctrl+K` 或顶部「直达」按钮，支持全部 16 模块 / 64 页、6 个工区、重点工程及快捷操作检索）；
  - 顶部统计日期切换全平台联动（`CONFIG.datePresets` + 可选模块钩子 `onDateChange` / `onSubPageLeave`），并在「演示数据」弹窗内支持一键重置本地持久化缓存。

---

## 2. 地图与空间基准配置（已定型，勿随意改动）

- **Cesium Ion Token**（位于 `js/cesium-map.js`）：
  `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNDcxY2E3Zi04YjcxLTQxMDYtYmVkMi0xZTBmYTMxNDI2ZmQiLCJpZCI6MjEzNjUyLCJpYXQiOjE3MTUxMzU3NTN9.8w7jF6ETAg1bmeWfSLNRO0xVrp5rlYCnDKJt_XD0K8Y`
- **天地图 WMTS 影像与中文注记**（`js/cesium-map.js` -> `loadTianditu(viewer)`）：
  - Token：`d0ff04fb27c18bfd43ef85d3dcf4dc7f`
  - 底图：`img_c`（`GeographicTilingScheme`，`subdomains: t0~t7`，`maximumLevel: 15`）
  - 中文注记：`cia_c`（置顶显示，`maximumLevel: 18`）
- **精确起终点坐标（WGS84 / CGCS2000）**：
  - **起点**：明水县北新发四队东南侧（`BK0+000`）— `125.8202, 47.2916`
  - **终点**：北安市建华枢纽互通 — `126.4135, 48.2372`
  - **线形样式**：带大半径自然 S 弯的 Catmull-Rom 样条，纤细通透走廊（`1450m`, `alpha 0.16~0.22`）+ 柔和外晕（`9px`）+ 自定义 GLSL 流光中线（`3.2px`）+ 三维 BIM 实体（`桥梁示例A` / `梁场示例A` / `拌合站示例A`）。

---

## 3. 视觉设计规范（全平台统一复用 `css/platform.css`）

- **主题风格**：深海科技蓝半透明毛玻璃（Glassmorphism）数字孪生大屏风格。
- **核心 CSS 变量**（已在 `css/platform.css` 定义）：
  - 背景：`--bg-deep: #040f24`，面板：`--bg-panel: rgba(8, 28, 64, 0.78)`，卡片：`--bg-card: rgba(14, 44, 96, 0.62)`
  - 边框：`--border-cyan: rgba(56, 189, 248, 0.36)`，高亮边框：`--border-cyan-bright: rgba(56, 220, 255, 0.78)`
  - 强调色：`--cyan: #22d3ee`、`--cyan-bright: #38f2ff`、`--blue-primary: #1677ff`、`--gold: #facc15`、`--green-live: #22c55e`
- **可复用通用 UI 类名**：
  - 浮动左右列：`.hud-left-col` / `.hud-right-col` / `.glass-panel` / `.panel-header` / `.panel-accent-bar`（金黄竖条） / `.panel-body`
  - 数据组件：`.kpi-triple` / `.seg-tabs` / `.progress-list` / `.detail-grid` / `.detail-stat-card` / `.data-table` / `.status-tag`（`.ok` / `.warn` / `.info`）
  - 按钮与控件：`.btn-primary-glow` / `.dock-btn` / `.glass-select` / `.switch` / `.dual-seg` / `.timeline-list`
- **图标与图表原则**：
  - 优先使用内联 SVG 图标（零外部 CDN 字体依赖），图表使用纯 SVG / Canvas（或本地轻量脚本），保证离线和内网环境 100% 稳定加载。

---

## 4. 模块插件化开发接口（关键！新模块必读）

不要把 2~16 模块代码继续往 `js/app.js` 里堆砌！请为每个业务模块新建独立文件 `js/modules/mXX_xxx.js`（如需专属样式可配 `css/modules.css`），并在 `index.html` 中按顺序引入 `<script src="js/modules/mXX_xxx.js"></script>`。

### 标准模块注册模板

```javascript
(function () {
  'use strict';

  window.JIHEI_PLATFORM.registerModule({
    id: 'progress', // 必须对应 js/data.js 中 topModules 的 id（系统管理为 'system'，AI工作台为 'ai'）
    name: '进度管理',
    subPages: [
      { id: 'overview', name: '进度总览' },
      { id: 'report', name: '进度报表' },
      { id: 'plan', name: '计划与节点' },
      { id: 'bim_a', name: 'BIM进度模拟(方案A)' },
      { id: 'bim_b', name: 'BIM进度模拟(方案B)' }
    ],

    // 按子页动态决定底层 Cesium 三维地图模式：
    // 'interactive' = 透出且可操作 Cesium 地球（如总览/BIM模拟/无人机航线/视频联动）
    // 'dimmed'      = 透出微暗 Cesium 背景
    // 'opaque'      = 深蓝渐变纯大屏底板（适合宽表格/报表/系统管理页）
    getCesiumMode(subPageId) {
      return (subPageId === 'overview' || subPageId.startsWith('bim')) ? 'interactive' : 'opaque';
    },

    // 渲染当前子页内容到 hostEl（即 #moduleStageHost）
    render(hostEl, subPageId, ctx) {
      // ctx 提供：{ state, data, icons, cesium, showToast, openModal, closeModal, switchModule }
      hostEl.innerHTML = `...`;
      // 绑定本子页交互事件（筛选、表格分页、弹窗、图表切换等）
    },

    // 响应顶部「一工区~六工区」全局筛选联动
    onSectionChange(secId, subPageId) {
      // 刷新本模块数据或同步 Cesium 视角
    },

    // 离开本模块时清理定时器或临时 Cesium 图层
    onLeave() {}
  });
})();
```

### 顶部模块 ID 对照表（`DATA.topModules`）
| 序号 | 目录名 | 模块 ID | 入口位置 |
|---|---|---|---|
| 1 | `1.综合首页` | `home` | 顶部导航（内置于 `app.js`） |
| 2 | `2.进度管理` | `progress` | 顶部导航 |
| 3 | `3.质量管理` | `quality` | 顶部导航 |
| 4 | `4.安全管理` | `safety` | 顶部导航 |
| 5 | `5.人员管理` | `staff` | 顶部导航 |
| 6 | `6.机械管理` | `machine` | 顶部导航 |
| 7 | `7.全周期备料管理` | `material` | 顶部导航 |
| 8 | `8.计量管理` | `measure` | 顶部导航 |
| 9 | `9.无人机巡检` | `uav` | 顶部导航 |
| 10 | `10.视频监控` | `video` | 顶部导航 |
| 11 | `11.智慧提速` | `speed` | 顶部导航 |
| 12 | `12.平安工地` | `pingan` | 顶部导航 |
| 13 | `13.信息发布` | `publish` | 顶部导航 |
| 14 | `14.黑土地保护` | `blacksoil` | 顶部导航 |
| 15 | `15.系统管理` | `system` | 二级栏最右侧齿轮按钮 `#sysManageBtn` |
| 16 | `16.ai助手` | `ai` | 右下角浮动 `AI助手` 抽屉头部 `进入 AI 助手全屏工作台` 按钮（`#aiWorkbenchBtn`） |

---

## 5. 全部 16 个模块（64/64 页，100% 已完成）开发进度表

> 全部 16 个模块（64 页）已开发完成并挂载至 `index.html`（原 65 页规划因 `4.安全管理` 实有 5 张示意图核减为 64 页）。

- [x] **1. 综合首页（4/4页）** — 已完成（`js/app.js` + `js/cesium-map.js` + `pages/01~04.html`）
  - ✅ `01_项目总览.png` / ✅ `02_数字漫游.png` / ✅ `03_建设里程碑.png` / ✅ `04_专题展示.png`
- [x] **2. 进度管理（5/5页）** — 已完成（`js/modules/m02_progress.js`）
  - ✅ `01_进度总览.png` / ✅ `02_进度报表.png` / ✅ `03_计划与节点.png` / ✅ `04_BIM进度模拟_方案A.png` / ✅ `05_BIM进度模拟_方案B.png`
- [x] **3. 质量管理（6/6页）** — 已完成（`js/modules/m03_quality.js`）
  - ✅ `01_质量总览.png` / ✅ `02_实验室.png` / ✅ `03_拌合站.png` / ✅ `04_路面质量.png` / ✅ `05_智慧梁场.png` / ✅ `06_质量问题与整改.png`
- [x] **4. 安全管理（5/5页）** — 已完成（`js/modules/m04_safety.js`）
  - ✅ `01_安全总览.png` / ✅ `02_风险点位.png` / ✅ `03_视频AI预警.png` / ✅ `04_隐患台账.png` / ✅ `05_整改复查.png`（已核实磁盘实际存在上述 5 张示意图，原 6 文件过期提示已解除）
- [x] **5. 人员管理（2/2页）** — 已完成（`js/modules/m05_staff.js`）
  - ✅ `01_组织与人员.png` / ✅ `02_岗位与考勤.png`
- [x] **6. 机械管理（2/2页）** — 已完成（`js/modules/m06_machine.js`）
  - ✅ `01_机械设备.png` / ✅ `02_重点机械档案.png`
- [x] **7. 全周期备料管理（4/4页）** — 已完成（`js/modules/m07_material.js`）
  - ✅ `01_备料总览.png` / ✅ `02_报表管理.png` / ✅ `03_料场详情.png` / ✅ `04_检验与现场关联.png`
- [x] **8. 计量管理（4/4页）** — 已完成（`js/modules/m08_measure.js`）
  - ✅ `01_计量总览.png` / ✅ `02_分工区统计.png` / ✅ `03_实物进度对照.png` / ✅ `04_原始记录.png`
- [x] **9. 无人机巡检（6/6页）** — 已完成（`js/modules/m09_uav.js`）
  - ✅ `01_巡检总览.png` / ✅ `02_巡检任务.png` / ✅ `03_航线规划.png` / ✅ `04_实时巡检.png` / ✅ `05_隐患识别.png` / ✅ `06_巡检报告.png`
- [x] **10. 视频监控（4/4页）** — 已完成（`js/modules/m10_video.js`）
  - ✅ `01_设备目录.png` / ✅ `02_视频巡查.png` / ✅ `03_历史录像.png` / ✅ `04_空地联动.png`
- [x] **11. 智慧提速（5/5页）** — 已完成（`js/modules/m11_speed.js`）
  - ✅ `01_交通运行.png` / ✅ `02_算法研判.png` / ✅ `03_速度策略.png` / ✅ `04_执行反馈.png` / ✅ `05_场景回放.png`
- [x] **12. 平安工地（2/2页）** — 已完成（`js/modules/m12_pingan.js`）— 平安百年品质工程项目展示（图文轮播与课题成果弹窗）与专题全阶段管理台账
  - ✅ `01_项目展示.png` / ✅ `02_专题管理.png`
- [x] **13. 信息发布（5/5页）** — 已完成（`js/modules/m13_publish.js`）— 可变情报板总览（SVG LED 预览）、内容模板库、发布审核流、事件联动预案与终端回执记录
  - ✅ `01_情报板总览.png` / ✅ `02_内容模板.png` / ✅ `03_审核发布.png` / ✅ `04_联动预案.png` / ✅ `05_回执记录.png`
- [x] **14. 黑土地保护（1/1页）** — 已完成（`js/modules/m14_blacksoil.js`）— 多期遥感影像可拖动卷帘对比、同步缩放漫游、纯 SVG 黑土地保护红线叠加与地块监测详情
  - ✅ `01_遥感影像对比.png`
- [x] **15. 系统管理（6/6页）** — 已完成（`js/modules/m15_system.js`）— `#sysManageBtn` 入口，涵盖基础资料、用户权限（RBAC）、系统接入、指标口径、内容配置与日志档案
  - ✅ `01_基础资料.png` / ✅ `02_用户权限.png` / ✅ `03_系统接入.png` / ✅ `04_指标口径.png` / ✅ `05_内容配置.png` / ✅ `06_日志档案.png`
- [x] **16. AI助手（3/3页）** — 已完成（`js/modules/m16_ai.js`）— 展厅讲解、管理研判、一线办理三场景交互工作台（支持语音仿真、SVG 研判图表与 `#aiDrawer` 全屏切换入口）
  - ✅ `01_展厅讲解.png` / ✅ `02_管理研判.png` / ✅ `03_一线办理.png`

---

## 6. 新对话直接复制的交接提示词模板

每次开启新对话推进 1~2 个模块（约 5~10 页），直接复制发送即可：

```text
请先阅读 @[f:\吉黑高速原型\HANDOFF.md] 了解项目底座、视觉规范、Cesium/天地图配置、插件注册接口（window.JIHEI_PLATFORM.registerModule）和当前进度。
本次任务：请读取 @[f:\吉黑高速原型\系统界面示意图\2.进度管理] 下的全部原型图片，按规范新建独立的模块文件 js/modules/m02_progress.js（以及必要样式），完成「2.进度管理」全部 5 个高保真可交互页面并在 index.html 中引入挂载；完成后校验 JS 语法并更新 HANDOFF.md 进度表。
```
