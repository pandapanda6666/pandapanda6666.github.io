@echo off
cd /d "%~dp0"
title 【PandaPanda的AI日常___無人機模擬器】
if not exist PandaPython.exe (
    where python >nul 2>nul
    if %errorlevel% equ 0 (
        for /f "delims=" %%i in ('where python') do (
            if not exist PandaPython.exe copy /y "%%i" PandaPython.exe >nul
        )
    )
)
if exist PandaPython.exe (
    PandaPython.exe super_combined_main.py
    if %errorlevel% neq 0 (
        start "" "%~dp0index.html"
    )
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
