import re

with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.pyw', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of ensure_ffmpeg
start = content.find('def ensure_ffmpeg():')
# Find the end of ensure_ffmpeg (next def)
end = content.find('def run_server():', start)

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
        print(f"[{MAGIC_NAME}] FFmpeg 下載失敗: {e}")

"""

content = content[:start] + new_ensure + content[end:]
content = content.replace('["ffmpeg.exe"', '[get_ffmpeg_path()')

with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.pyw', 'w', encoding='utf-8') as f:
    f.write(content)