@echo off
chcp 65001 >nul
set NGINX_DIR=E:\ruanjian3\nginx
pushd "%NGINX_DIR%"
nginx.exe -s quit
popd
echo Nginx 已停止
