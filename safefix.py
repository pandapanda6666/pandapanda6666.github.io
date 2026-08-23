import re, os

with open('run.pyw', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Indentation in run_server
content = content.replace("        import sys\n    if getattr(sys, 'frozen', False):", "    import sys\n    if getattr(sys, 'frozen', False):")

# Fix 2: ensure_ffmpeg to download to %LOCALAPPDATA%
new_ensure = """def get_ffmpeg_path():
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
        print(f"[{MAGIC_NAME}] FFmpeg 下載失敗: {e}")"""

# Find ensure_ffmpeg and replace JUST it
start = content.find('def ensure_ffmpeg():')
end = content.find('class DesktopAPIHandler(BaseHTTPRequestHandler):', start)
content = content[:start] + new_ensure + "\n\n" + content[end:]

# Replace ffmpeg.exe calls
content = content.replace('["ffmpeg.exe"', '[get_ffmpeg_path()')
content = content.replace('subprocess.run(["ffmpeg.exe"', 'subprocess.run([get_ffmpeg_path()')

# Fix 3: Add /api/shutdown to DesktopAPIHandler.do_GET
old_api = """        if self.path.startswith('/api/is_desktop'):
            self.send_response(200)"""

new_api = """        if self.path.startswith('/api/shutdown'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            import json
            self.wfile.write(json.dumps({"status": "shutting_down"}).encode('utf-8'))
            print(f"[{MAGIC_NAME}] 收到關閉指令，準備關閉伺服器...")
            import threading, os
            threading.Thread(target=lambda: (os._exit(0))).start()
            return

        if self.path.startswith('/api/is_desktop'):
            self.send_response(200)"""

content = content.replace(old_api, new_api)

with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.pyw', 'w', encoding='utf-8') as f:
    f.write(content)