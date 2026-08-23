import os

with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.pyw', 'r', encoding='utf-8') as f:
    run_pyw = f.read()

old_ensure = """def ensure_ffmpeg():
    if os.path.exists("ffmpeg.exe"): return
    print(f"[{MAGIC_NAME}] 正在下載 FFmpeg 核心引擎 (首次啟動需要下載約 30MB)...")
    url = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
    zip_path = "ffmpeg.zip"
    try:
        urllib.request.urlretrieve(url, zip_path)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            for file in zip_ref.namelist():
                if file.endswith("ffmpeg.exe"):
                    source = zip_ref.open(file)
                    target = open("ffmpeg.exe", "wb")
                    with source, target:
                        shutil.copyfileobj(source, target)
                    break
        os.remove(zip_path)
        print(f"[{MAGIC_NAME}] FFmpeg 核心下載完成！")
    except Exception as e:
        print(f"[{MAGIC_NAME}] FFmpeg 下載失敗: {e}")"""

new_ensure = """def get_ffmpeg_path():
    import sys
    # 如果是編譯版本，把 ffmpeg 存在 AppData，避免每次解壓縮 MEIPASS 都要重抓
    if getattr(sys, 'frozen', False):
        appdata = os.environ.get('LOCALAPPDATA', os.path.expanduser('~'))
        target_dir = os.path.join(appdata, 'PandaSubtitleEditor')
        os.makedirs(target_dir, exist_ok=True)
        return os.path.join(target_dir, 'ffmpeg.exe')
    return 'ffmpeg.exe'

def ensure_ffmpeg():
    ffmpeg_path = get_ffmpeg_path()
    if os.path.exists(ffmpeg_path): return
    print(f"[{MAGIC_NAME}] 正在下載 FFmpeg 核心引擎 (首次啟動需要下載約 30MB)...")
    url = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
    zip_path = ffmpeg_path + ".zip"
    try:
        urllib.request.urlretrieve(url, zip_path)
        import zipfile, shutil
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

run_pyw = run_pyw.replace(old_ensure, new_ensure)

# Also update the place where ffmpeg.exe is CALLED!
run_pyw = run_pyw.replace('subprocess.Popen(["ffmpeg.exe"', 'subprocess.Popen([get_ffmpeg_path()')
run_pyw = run_pyw.replace('subprocess.run(["ffmpeg.exe"', 'subprocess.run([get_ffmpeg_path()')

with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.pyw', 'w', encoding='utf-8') as f:
    f.write(run_pyw)