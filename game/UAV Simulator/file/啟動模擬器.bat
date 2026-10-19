@echo off
chcp 65001 >nul
cd /d "%~dp0"
title PandaPanda 無人機模擬器

where python >nul 2>nul
if %errorlevel% equ 0 (
    python super_combined_main.py
) else (
    start "" "%~dp0index.html"
)
