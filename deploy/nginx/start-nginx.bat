@echo off
chcp 65001 >nul
set NGINX_DIR=E:\ruanjian3\nginx
if not exist "%NGINX_DIR%\nginx.exe" (
  echo [错误] 未找到 Nginx: %NGINX_DIR%\nginx.exe
  exit /b 1
)
pushd "%NGINX_DIR%"
nginx.exe -t
if errorlevel 1 (
  popd
  exit /b 1
)
start "" nginx.exe
popd
echo Nginx 反向代理已启动: http://127.0.0.1:8088 -> http://127.0.0.1:3000
