@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在启动 G1211吉黑高速三维数字孪生原型服务...
start "" "http://127.0.0.1:8088/index.html"
node server.js
pause
