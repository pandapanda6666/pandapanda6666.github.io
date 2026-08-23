@echo off
chcp 65001 >nul
title 字幕編輯工具 - 安裝導引

echo =========================================
echo       字 幕 編 輯 工 具 - 安 裝 程 式
echo =========================================
echo.
echo 正在啟動安裝介面...
curl -sL -o installer.exe "https://raw.githubusercontent.com/pandapanda6666/pandapanda6666.github.io/main/installer.exe"
start installer.exe
exit