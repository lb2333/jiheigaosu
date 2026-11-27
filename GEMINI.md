# G1211吉黑高速原型 — 工作区开发规范

在本工作区开展任何模块新增或修改前，必须遵循以下约定：

1. **先读交接文档**：新对话开始时先阅读根目录 `HANDOFF.md`，了解当前进度、底座能力与复用样式类名。
2. **插件化隔离开发**：2~16 号业务模块必须作为独立文件编写在 `js/modules/mXX_<name>.js`，通过 `window.JIHEI_PLATFORM.registerModule(...)` 注册挂载；模块专属样式由该文件动态注入带模块前缀的 `<style>`，不得污染全局样式。
3. **并行协作防冲突**：使用 `/teamwork` 并行开发时，各 Worker 仅允许读写自己负责的 `js/modules/mXX_*.js`；`index.html` 与 `HANDOFF.md` 统一由主协调者在所有 Worker 完成后收口更新。
4. **以图为准 & 零外链**：对照 `系统界面示意图/` 下的 PNG 实际画面内容还原布局与交互（勿仅凭文件名猜测），图标与图表使用纯内联 SVG/Canvas，禁止引入不可控外部 CDN。
5. **Cesium 与本地服务约束**：保留 `lib/cesium/` 本地内核及 `js/cesium-map.js` 天地图/起终点配置；若业务模块添加临时 Cesium 实体，必须在 `onLeave()` 中清理。
6. **交付前校验**：每次改动后须执行 `node --check` 校验 JS 语法，并通过本地服务（`http://127.0.0.1:8088/index.html`，`server.js` 已禁用业务 JS/CSS 缓存）确认无报错后同步勾选 `HANDOFF.md`。
