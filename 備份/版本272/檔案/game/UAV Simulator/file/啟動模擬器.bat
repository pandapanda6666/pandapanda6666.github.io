@echo off
cd /d "%~dp0"
title PandaPanda UAV Simulator
where python >nul 2>nul
if %errorlevel% equ 0 (
    python super_combined_main.py
) else (
    start "" "%~dp0index.html"
)
