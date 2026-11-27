# Nginx + PostgreSQL 本地/内网部署说明

## 1. 服务组件路径
- **PostgreSQL 16.8**：`E:\ruanjian3\PostgreSQL`（数据目录 `E:\ruanjian3\PostgreSQL\data`，端口 `5432`，数据库 `jihei_highway`）
- **Nginx**：`E:\ruanjian3\nginx`（站点配置引用 `f:\吉黑高速原型\deploy\nginx\jihei-platform.conf`，对外端口 `8088`）
- **Next.js Standalone**：端口 `3000`

## 2. 启动顺序
1. 启动数据库：`scripts\pg-start.bat`
2. 构建并启动 Next.js（或使用 PM2/NSSM 托管）：
   ```powershell
   pnpm build
   # 复制 standalone 所需静态资源后启动（或使用 pnpm start:next）
   pnpm start:next
   ```
3. 启动 Nginx 反向代理：`deploy\nginx\start-nginx.bat`
4. 浏览器访问：`http://127.0.0.1:8088`
