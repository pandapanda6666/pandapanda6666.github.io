@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 【PandaPanda的AI日常___字幕編輯工具】
if exist "PandaPanda的AI日常___字幕編輯工具.exe" (
    start "" "PandaPanda的AI日常___字幕編輯工具.exe"
) else if exist "PandaPythonw.exe" (
    start "" PandaPythonw.exe run.pyw
) else (
    where pythonw >nul 2>nul
    if %errorlevel% equ 0 (
        start "" pythonw run.pyw
    ) else (
        where python >nul 2>nul
        if %errorlevel% equ 0 (
            start "" python run.pyw
        ) else (
            if exist "index.html" (
                start "" "%~dp0index.html"
            ) else (
                start "" "%~dp0Edit\Video\Add subtitles\index.html"
            )
        )
    )
)