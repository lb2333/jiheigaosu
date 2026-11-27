@echo off
chcp 65001 >nul
set PGDIR=E:\ruanjian3\PostgreSQL
if not exist "%PGDIR%\data\PG_VERSION" (
  echo [错误] 未找到初始化的数据库目录: %PGDIR%\data
  exit /b 1
)
"%PGDIR%\pgsql\bin\pg_ctl.exe" -D "%PGDIR%\data" status >nul 2>&1
if %errorlevel%==0 (
  echo PostgreSQL 已在运行中 (端口 5432)
  exit /b 0
)
"%PGDIR%\pgsql\bin\pg_ctl.exe" -D "%PGDIR%\data" -l "%PGDIR%\pg.log" -o "-p 5432" start
echo PostgreSQL 启动完成: 127.0.0.1:5432 (数据库: jihei_highway)
