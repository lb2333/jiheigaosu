@echo off
chcp 65001 >nul
set PGDIR=E:\ruanjian3\PostgreSQL
"%PGDIR%\pgsql\bin\pg_ctl.exe" -D "%PGDIR%\data" stop -m fast
echo PostgreSQL 已停止
