@echo off
cd /d "%~dp0"
title 【PandaPanda的AI日常___無人機模擬器】
if exist PandaPythonw.exe (
    start "" "%~dp0PandaPythonw.exe" super_combined_main.py
) else if exist PandaPython.exe (
    "%~dp0PandaPython.exe" super_combined_main.py
) else (
    where python >nul 2>nul
    if %errorlevel% equ 0 (
        python super_combined_main.py
        if %errorlevel% neq 0 (
            start "" "%~dp0index.html"
        )
    ) else (
        start "" "%~dp0index.html"
    )
)
