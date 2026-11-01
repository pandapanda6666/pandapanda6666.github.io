import os
import sys
import shutil
import subprocess
import threading
import time
import webbrowser
import json
import urllib.parse
import urllib.request
import re
import uuid
import socketserver
import http.server
from http.server import BaseHTTPRequestHandler
import tkinter as tk
from tkinter import filedialog
import ctypes

class NullWriter:
    def write(self, *args, **kwargs): pass
    def flush(self, *args, **kwargs): pass

if sys.stdout is None:
    sys.stdout = NullWriter()
if sys.stderr is None:
    sys.stderr = NullWriter()

TOOL_NAME = "字幕編輯工具"
MAGIC_NAME = f"PandaPanda的AI日常___{TOOL_NAME}"

tasks = {}
server_ready_event = threading.Event()
actual_server_port = 8848
server_started_successfully = False

def get_base_dir():
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))

def get_resource_file(filename):
    # 1. 優先尋找 PyInstaller 解壓縮目錄 (_MEIPASS)
    if hasattr(sys, '_MEIPASS'):
        p = os.path.join(sys._MEIPASS, filename)
        if os.path.exists(p): return p
    # 2. 優先尋找 Edit/Video/Add subtitles/ 子目錄 (git 專案開發環境)
    base_dir = get_base_dir()
    p_sub = os.path.join(base_dir, "Edit", "Video", "Add subtitles", filename)
    if os.path.exists(p_sub): return p_sub
    # 3. 尋找執行檔同目錄 (安裝後 PandaSubtitleEditor 目錄)
    p = os.path.join(base_dir, filename)
    if os.path.exists(p): return p
    # 4. 尋找原始碼同目錄
    script_dir = os.path.dirname(os.path.abspath(__file__))
    p_dev_sub = os.path.join(script_dir, "Edit", "Video", "Add subtitles", filename)
    if os.path.exists(p_dev_sub): return p_dev_sub
    p_dev = os.path.join(script_dir, filename)
    if os.path.exists(p_dev): return p_dev
    return p

def get_ffmpeg_path():
    base_dir = get_base_dir()
    local_ffmpeg = os.path.join(base_dir, "ffmpeg.exe")
    if os.path.exists(local_ffmpeg):
        return local_ffmpeg
    if hasattr(sys, '_MEIPASS'):
        mei_ffmpeg = os.path.join(sys._MEIPASS, "ffmpeg.exe")
        if os.path.exists(mei_ffmpeg):
            return mei_ffmpeg
    # 雲端硬碟備用路徑
    cloud_ffmpeg = r"L:\我的雲端硬碟\硬體及自製軟體\自製軟體\字幕編輯工具\ffmpeg.exe"
    if os.path.exists(cloud_ffmpeg):
        return cloud_ffmpeg
    which = shutil.which("ffmpeg")
    if which:
        return which
    return "ffmpeg.exe"

def ensure_ffmpeg_async():
    if os.path.exists(get_ffmpeg_path()):
        return
    def download():
        url = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
        zip_path = os.path.join(get_base_dir(), "ffmpeg_tmp.zip")
        try:
            import zipfile
            urllib.request.urlretrieve(url, zip_path)
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                for file in zip_ref.namelist():
                    if file.endswith("ffmpeg.exe"):
                        source = zip_ref.open(file)
                        target = open(os.path.join(get_base_dir(), "ffmpeg.exe"), "wb")
                        with source, target:
                            shutil.copyfileobj(source, target)
                        break
            if os.path.exists(zip_path):
                os.remove(zip_path)
        except Exception:
            pass
    threading.Thread(target=download, daemon=True).start()

class DesktopAPIHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, format, *args):
        pass

    def log_request(self, code='-', size='-'):
        pass

    def log_error(self, format, *args):
        pass

    def send_json(self, data):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Connection", "close")
        self.end_headers()
        self.wfile.write(body)
        self.close_connection = True
        
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Content-Length", "0")
        self.send_header("Connection", "close")
        self.end_headers()
        self.close_connection = True
        
    def do_GET(self):
        try:
            self._handle_get()
        except Exception:
            try:
                self.send_response(500)
                self.send_header("Content-Type", "text/plain; charset=utf-8")
                self.send_header("Content-Length", "0")
                self.send_header("Connection", "close")
                self.end_headers()
                self.close_connection = True
            except Exception:
                pass

    def _handle_get(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        qs = urllib.parse.parse_qs(parsed.query)
        
        if path == "/api/is_desktop":
            self.send_json({"status": "ok", "version": "1.0.0"})
            return

        if path in ["/api/select_video", "/api/select_audio"]:
            root = tk.Tk()
            root.withdraw()
            root.attributes('-topmost', True)
            filetypes = [("媒體檔案 (影片/音訊)", "*.mp4;*.webm;*.mov;*.mkv;*.avi;*.mp3;*.wav;*.m4a;*.aac;*.flac;*.ogg"), ("影片檔", "*.mp4;*.webm;*.mov;*.mkv;*.avi"), ("音訊檔", "*.mp3;*.wav;*.m4a;*.aac;*.flac;*.ogg"), ("所有檔案", "*.*")] if path == "/api/select_video" else [("音訊檔", "*.mp3;*.wav;*.m4a;*.aac;*.flac;*.ogg"), ("所有檔案", "*.*")]
            file_path = filedialog.askopenfilename(title="選擇檔案", filetypes=filetypes)
            root.destroy()
            if file_path:
                self.send_json({"path": file_path, "filename": os.path.basename(file_path)})
            else:
                self.send_json({})
            return
            
        if path == "/api/export_status":
            task_id = qs.get("task_id", [""])[0]
            if task_id in tasks:
                self.send_json(tasks[task_id])
            else:
                self.send_json({"status": "error", "error": "Task not found"})
            return
            
        if path == "/media":
            media_path = qs.get("path", [""])[0]
            if not os.path.exists(media_path):
                self.send_response(404)
                self.send_header("Content-Length", "0")
                self.send_header("Connection", "close")
                self.end_headers()
                self.close_connection = True
                return
                
            size = os.path.getsize(media_path)
            ext = os.path.splitext(media_path)[1].lower()
            ctype = "video/mp4"
            if ext == ".mp3": ctype = "audio/mpeg"
            elif ext == ".webm": ctype = "video/webm"
            elif ext == ".wav": ctype = "audio/wav"
            elif ext == ".ogg": ctype = "audio/ogg"
            elif ext == ".m4a": ctype = "audio/mp4"
            elif ext == ".aac": ctype = "audio/aac"
            elif ext == ".flac": ctype = "audio/flac"
            
            range_header = self.headers.get('Range', None)
            if range_header:
                start = 0
                end = size - 1
                range_match = re.match(r'bytes=(\d+)-(\d*)', range_header)
                if range_match:
                    start = int(range_match.group(1))
                    if range_match.group(2):
                        end = int(range_match.group(2))
                
                length = end - start + 1
                self.send_response(206)
                self.send_header('Content-Type', ctype)
                self.send_header('Accept-Ranges', 'bytes')
                self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
                self.send_header('Content-Length', str(length))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Headers", "*")
                self.end_headers()
                
                with open(media_path, 'rb') as f:
                    f.seek(start)
                    chunk_size = 65536
                    remaining = length
                    while remaining > 0:
                        chunk = f.read(min(chunk_size, remaining))
                        if not chunk: break
                        try:
                            self.wfile.write(chunk)
                        except Exception:
                            break
                        remaining -= len(chunk)
            else:
                self.send_response(200)
                self.send_header('Content-Type', ctype)
                self.send_header('Accept-Ranges', 'bytes')
                self.send_header('Content-Length', str(size))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Headers", "*")
                self.end_headers()
                
                with open(media_path, 'rb') as f:
                    shutil.copyfileobj(f, self.wfile)
            return

        # 靜態檔案服務 (支援 index.html, js, css, 圖示等)
        req_file = path.lstrip('/')
        if not req_file or req_file == "/" or req_file == "index.html":
            req_file = "index.html"

        target_file = get_resource_file(req_file)
        if os.path.isfile(target_file):
            with open(target_file, 'rb') as f:
                content = f.read()
            self.send_response(200)
            if target_file.endswith('.html'):
                self.send_header("Content-Type", "text/html; charset=utf-8")
            elif target_file.endswith('.js'):
                self.send_header("Content-Type", "application/javascript; charset=utf-8")
            elif target_file.endswith('.css'):
                self.send_header("Content-Type", "text/css; charset=utf-8")
            elif target_file.endswith('.ico'):
                self.send_header("Content-Type", "image/x-icon")
            elif target_file.endswith('.png'):
                self.send_header("Content-Type", "image/png")
            elif target_file.endswith('.svg'):
                self.send_header("Content-Type", "image/svg+xml")
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Headers", "*")
            self.send_header("Connection", "close")
            self.end_headers()
            self.wfile.write(content)
            self.close_connection = True
            return
        else:
            self.send_response(404)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", "0")
            self.send_header("Connection", "close")
            self.end_headers()
            self.close_connection = True
            return

    def do_POST(self):
        try:
            self._handle_post()
        except Exception as e:
            try:
                self.send_json({"status": "error", "error": str(e)}, 500)
            except Exception:
                pass

    def _handle_post(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode('utf-8')
        
        if path == "/api/shutdown":
            self.send_json({"status": "shutting_down"})
            return

        if path == "/api/save_file":
            try:
                data = json.loads(body)
                filename = data.get("filename")
                content = data.get("content")

                root = tk.Tk()
                root.withdraw()
                root.attributes('-topmost', True)
                ext = os.path.splitext(filename)[1] if filename else ''
                save_path = filedialog.asksaveasfilename(title="儲存檔案", initialfile=filename, defaultextension=ext)
                root.destroy()
                
                if save_path:
                    if data.get("type") == "text":
                        with open(save_path, 'w', encoding='utf-8') as f:
                            f.write(content)
                    else:
                        import base64
                        with open(save_path, 'wb') as f:
                            f.write(base64.b64decode(content))
                    self.send_json({"status": "ok", "path": save_path})
                else:
                    self.send_json({"status": "cancelled"})
            except Exception as e:
                self.send_json({"status": "error", "error": str(e)})
            return
            
        if path == "/api/export_audio":
            try:
                data = json.loads(body)
                video_path = os.path.abspath(data.get("video_path"))
                bitrate = str(data.get("bitrate", "320k"))

                video_dir = os.path.dirname(video_path)
                video_file = os.path.basename(video_path)
                video_stem, _ = os.path.splitext(video_file)

                out_file = f"{video_stem}.mp3"
                out_path = os.path.join(video_dir, out_file)

                task_id = str(uuid.uuid4())
                tasks[task_id] = {"status": "running", "progress": 0, "size": ""}

                def run_ffmpeg_audio():
                    ffmpeg_bin = get_ffmpeg_path()
                    cmd = [
                        ffmpeg_bin, "-y", "-i", video_file,
                        "-vn", "-acodec", "libmp3lame", "-ab", bitrate,
                        out_file
                    ]

                    dur_cmd = [ffmpeg_bin, "-i", video_file]
                    dur_proc = subprocess.Popen(dur_cmd, cwd=video_dir, stderr=subprocess.PIPE, text=True, encoding='utf-8', errors='ignore')
                    _, err = dur_proc.communicate()
                    duration = 1
                    dur_match = re.search(r"Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})", err)
                    if dur_match:
                        h, m, s = dur_match.groups()
                        duration = float(h)*3600 + float(m)*60 + float(s)

                    proc = subprocess.Popen(cmd, cwd=video_dir, stderr=subprocess.PIPE, text=True, encoding='utf-8', errors='ignore')
                    for line in proc.stderr:
                        time_match = re.search(r"time=(\d{2}):(\d{2}):(\d{2}\.\d{2})", line)
                        if time_match:
                            h, m, s = time_match.groups()
                            cur_time = float(h)*3600 + float(m)*60 + float(s)
                            prog = min(cur_time / duration, 1.0)
                            size_match = re.search(r"size=\s*([0-9]+kB)", line)
                            size = size_match.group(1) if size_match else ""
                            tasks[task_id]["progress"] = prog
                            tasks[task_id]["size"] = size

                    proc.wait()
                    if proc.returncode == 0:
                        tasks[task_id]["status"] = "done"
                        tasks[task_id]["progress"] = 1.0
                        tasks[task_id]["out_path"] = out_path
                    else:
                        tasks[task_id]["status"] = "error"
                        tasks[task_id]["error"] = "FFmpeg MP3 音訊匯出失敗"

                threading.Thread(target=run_ffmpeg_audio, daemon=True).start()
                self.send_json({"task_id": task_id})
            except Exception as e:
                self.send_json({"status": "error", "error": str(e)})
            return

        if path == "/api/export_video":
            try:
                data = json.loads(body)
                video_path = os.path.abspath(data.get("video_path"))
                ass_content = data.get("ass_content")
                resolution = str(data.get("resolution", "1080")).replace("p", "").strip().lower()
                crf = data.get("crf", 28)

                video_dir = os.path.dirname(video_path)
                video_file = os.path.basename(video_path)
                video_stem, _ = os.path.splitext(video_file)

                if resolution == "mp3":
                    out_file = f"{video_stem}.mp3"
                    out_path = os.path.join(video_dir, out_file)
                    task_id = str(uuid.uuid4())
                    tasks[task_id] = {"status": "running", "progress": 0, "size": ""}

                    def run_ffmpeg_audio_only():
                        ffmpeg_bin = get_ffmpeg_path()
                        cmd = [
                            ffmpeg_bin, "-y", "-i", video_file,
                            "-vn", "-acodec", "libmp3lame", "-ab", "320k",
                            out_file
                        ]
                        dur_cmd = [ffmpeg_bin, "-i", video_file]
                        dur_proc = subprocess.Popen(dur_cmd, cwd=video_dir, stderr=subprocess.PIPE, text=True, encoding='utf-8', errors='ignore')
                        _, err = dur_proc.communicate()
                        duration = 1
                        dur_match = re.search(r"Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})", err)
                        if dur_match:
                            h, m, s = dur_match.groups()
                            duration = float(h)*3600 + float(m)*60 + float(s)

                        proc = subprocess.Popen(cmd, cwd=video_dir, stderr=subprocess.PIPE, text=True, encoding='utf-8', errors='ignore')
                        for line in proc.stderr:
                            time_match = re.search(r"time=(\d{2}):(\d{2}):(\d{2}\.\d{2})", line)
                            if time_match:
                                h, m, s = time_match.groups()
                                cur_time = float(h)*3600 + float(m)*60 + float(s)
                                prog = min(cur_time / duration, 1.0)
                                size_match = re.search(r"size=\s*([0-9]+kB)", line)
                                size = size_match.group(1) if size_match else ""
                                tasks[task_id]["progress"] = prog
                                tasks[task_id]["size"] = size

                        proc.wait()
                        if proc.returncode == 0:
                            tasks[task_id]["status"] = "done"
                            tasks[task_id]["progress"] = 1.0
                            tasks[task_id]["out_path"] = out_path
                        else:
                            tasks[task_id]["status"] = "error"
                            tasks[task_id]["error"] = "FFmpeg MP3 音訊匯出失敗"

                    threading.Thread(target=run_ffmpeg_audio_only, daemon=True).start()
                    self.send_json({"task_id": task_id})
                    return

                temp_ass = f"temp_subs_{uuid.uuid4().hex[:6]}.ass"
                ass_full_path = os.path.join(video_dir, temp_ass)
                with open(ass_full_path, 'w', encoding='utf-8') as f:
                    f.write(ass_content)

                out_file = f"{video_stem}_含字幕_{resolution}p.mp4"
                out_path = os.path.join(video_dir, out_file)

                task_id = str(uuid.uuid4())
                tasks[task_id] = {"status": "running", "progress": 0, "size": ""}

                def run_ffmpeg():
                    ffmpeg_bin = get_ffmpeg_path()
                    vf_filter = f"scale=-2:{resolution},ass='{temp_ass}'"
                    cmd = [
                        ffmpeg_bin, "-y", "-i", video_file,
                        "-vf", vf_filter,
                        "-c:v", "libx264", "-preset", "fast", "-crf", str(crf),
                        "-c:a", "copy", out_file
                    ]

                    dur_cmd = [ffmpeg_bin, "-i", video_file]
                    dur_proc = subprocess.Popen(dur_cmd, cwd=video_dir, stderr=subprocess.PIPE, text=True, encoding='utf-8', errors='ignore')
                    _, err = dur_proc.communicate()
                    duration = 1
                    dur_match = re.search(r"Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})", err)
                    if dur_match:
                        h, m, s = dur_match.groups()
                        duration = float(h)*3600 + float(m)*60 + float(s)

                    proc = subprocess.Popen(cmd, cwd=video_dir, stderr=subprocess.PIPE, text=True, encoding='utf-8', errors='ignore')
                    for line in proc.stderr:
                        time_match = re.search(r"time=(\d{2}):(\d{2}):(\d{2}\.\d{2})", line)
                        if time_match:
                            h, m, s = time_match.groups()
                            cur_time = float(h)*3600 + float(m)*60 + float(s)
                            prog = min(cur_time / duration, 1.0)
                            size_match = re.search(r"size=\s*([0-9]+kB)", line)
                            size = size_match.group(1) if size_match else ""
                            tasks[task_id]["progress"] = prog
                            tasks[task_id]["size"] = size

                    proc.wait()
                    if os.path.exists(ass_full_path):
                        try: os.remove(ass_full_path)
                        except Exception: pass

                    if proc.returncode == 0:
                        tasks[task_id]["status"] = "done"
                        tasks[task_id]["progress"] = 1.0
                        tasks[task_id]["out_path"] = out_path
                    else:
                        tasks[task_id]["status"] = "error"
                        tasks[task_id]["error"] = "FFmpeg 匯出合成失敗"

                threading.Thread(target=run_ffmpeg, daemon=True).start()
                self.send_json({"task_id": task_id})
            except Exception as e:
                self.send_json({"status": "error", "error": str(e)})
            return

class ThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

    def handle_error(self, request, client_address):
        pass

def start_http_server(port=8848):
    global actual_server_port, server_started_successfully
    for p in range(port, port + 30):
        try:
            httpd = ThreadingTCPServer(("127.0.0.1", p), DesktopAPIHandler)
            actual_server_port = p
            server_started_successfully = True
            server_ready_event.set()
            httpd.serve_forever()
            break
        except Exception:
            continue
    server_ready_event.set()

def main():
    try:
        ctypes.windll.kernel32.SetConsoleTitleW(f"【PandaPanda的AI日常___{TOOL_NAME}】")
    except Exception:
        pass

    ensure_ffmpeg_async()

    # 啟動多執行緒本地 HTTP 伺服器
    threading.Thread(target=start_http_server, args=(8848,), daemon=True).start()
    
    # 等待伺服器就緒 (最多 3 秒)
    server_ready_event.wait(timeout=3.0)

    # 檢查 index.html 檔案位置
    index_file = get_resource_file("index.html")
    
    target_url = None
    if server_started_successfully:
        target_url = f'http://127.0.0.1:{actual_server_port}/index.html?desktop=1'
    else:
        if os.path.exists(index_file):
            target_url = "file:///" + index_file.replace("\\", "/") + "?desktop=1"
        else:
            target_url = f'http://127.0.0.1:8848/index.html?desktop=1'

    # 尋找 Edge 或 Chrome 獨立 App 視窗模式
    edge_candidates = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"),
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    ]
    app_browser = None
    for cand in edge_candidates:
        if os.path.exists(cand):
            app_browser = cand
            break

    if app_browser:
        user_data = os.path.join(get_base_dir(), "app_profile")
        cmd = [
            app_browser,
            f"--app={target_url}",
            "--window-size=1280,820",
            f"--user-data-dir={user_data}",
            "--no-first-run",
            "--no-default-browser-check"
        ]
        try:
            proc = subprocess.Popen(cmd)
            proc.wait()
        except KeyboardInterrupt:
            pass
    else:
        webbrowser.open(target_url)
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass

if __name__ == '__main__':
    main()