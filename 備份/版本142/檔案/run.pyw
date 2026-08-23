import os
import sys
import shutil
import subprocess
import threading
import time
import webbrowser
import json
import urllib.parse
import re
import uuid
from http.server import ThreadingHTTPServer as HTTPServer, BaseHTTPRequestHandler
import tkinter as tk
from tkinter import filedialog
import urllib.request
import zipfile

TOOL_NAME = "字幕編輯工具"
MAGIC_NAME = f"PandaPanda的AI日常___{TOOL_NAME}"

tasks = {}

def get_ffmpeg_path():
    import sys, os
    if getattr(sys, 'frozen', False):
        appdata = os.environ.get('LOCALAPPDATA', os.path.expanduser('~'))
        target_dir = os.path.join(appdata, 'PandaSubtitleEditor')
        os.makedirs(target_dir, exist_ok=True)
        return os.path.join(target_dir, 'ffmpeg.exe')
    return 'ffmpeg.exe'

def ensure_ffmpeg():
    import os, urllib.request, zipfile, shutil
    ffmpeg_path = get_ffmpeg_path()
    if os.path.exists(ffmpeg_path): return
    print(f"[{MAGIC_NAME}] 正在下載 FFmpeg 核心引擎 (首次啟動需要下載約 30MB)...")
    url = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
    zip_path = ffmpeg_path + ".zip"
    try:
        urllib.request.urlretrieve(url, zip_path)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            for file in zip_ref.namelist():
                if file.endswith("ffmpeg.exe"):
                    source = zip_ref.open(file)
                    target = open(ffmpeg_path, "wb")
                    with source, target:
                        shutil.copyfileobj(source, target)
                    break
        os.remove(zip_path)
        print(f"[{MAGIC_NAME}] FFmpeg 核心下載完成！")
    except Exception as e:
        print(f"[{MAGIC_NAME}] FFmpeg 下載失敗: {e}")

def run_server():
    import sys
    if getattr(sys, 'frozen', False):
        base_dir = sys._MEIPASS
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)
    ensure_ffmpeg()
    
    server_address = ('127.0.0.1', 8848)
    try:
        httpd = HTTPServer(server_address, DesktopAPIHandler)
    except OSError:
        pass
    print(f"[{MAGIC_NAME}] Server started at http://127.0.0.1:8848")
    
    chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
    url = "http://127.0.0.1:8848/index.html"
    
    def open_browser():
        time.sleep(1)
        if os.path.exists(chrome_path):
            subprocess.Popen([chrome_path, f"--app={url}"])
        else:
            webbrowser.open(url)
            
    threading.Thread(target=open_browser, daemon=True).start()
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass

if __name__ == '__main__':
    # 由於使用 pyw 與 PandaPythonw.exe，直接啟動 server 即可
    # 標題設定在 pyw 中可能不可見，但為符合規則依然設定
    try:
        import ctypes
        ctypes.windll.kernel32.SetConsoleTitleW(f"【PandaPanda的AI日常___{MAGIC_NAME}】")
    except:
        pass
    run_server()
