@echo off
chcp 65001 >nul
title 字幕編輯工具 - 安裝導引

echo =========================================
echo       字 幕 編 輯 工 具 - 安 裝 程 式
echo =========================================
echo.
echo 正在檢查 Python 環境...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [系統提示] 未偵測到 Python，準備自動下載安裝...
    echo 正在下載 Python 安裝檔，請稍候...
    curl -L -o python_installer.exe "https://www.python.org/ftp/python/3.11.8/python-3.11.8-amd64.exe"
    
    echo 正在背景安裝 Python (這可能需要幾分鐘)...
    start /wait python_installer.exe /quiet InstallAllUsers=0 PrependPath=1 Include_test=0
    del python_installer.exe
    
    echo [系統提示] Python 安裝完成！
    echo ========================================================
    echo 由於系統環境變數更新，請【關閉這個黑色視窗】
    echo 並【重新點擊 install.bat】以繼續啟動圖形化安裝介面！
    echo ========================================================
    pause
    exit /b
)

echo Python 已經就緒！
echo 正在啟動安裝介面...
curl -sL -o installer_temp.py "https://raw.githubusercontent.com/pandapanda6666/pandapanda6666.github.io/main/installer.py"
start pythonw installer_temp.py
exit