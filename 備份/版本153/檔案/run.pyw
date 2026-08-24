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

def ensure_ffmpeg():
    if os.path.exists("ffmpeg.exe"): return
    print(f"[{MAGIC_NAME}] 正在下載 FFmpeg 核心引擎 (初次啟動需要下載約 30MB)...")
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
        print(f"[{MAGIC_NAME}] FFmpeg 下載失敗: {e}")

class DesktopAPIHandler(BaseHTTPRequestHandler):
    def send_json(self, data):
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        self.send_header("Cross-Origin-Resource-Policy", "cross-origin")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
        
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        qs = urllib.parse.parse_qs(parsed.query)
        
        if path == "/api/is_desktop":
            self.send_json({"status": "ok"})
            return
            
        
        # Serve static files if they exist
        local_file = os.path.join(os.path.dirname(__file__), path.lstrip('/'))
        if os.path.isfile(local_file) and not path.startswith('/api/'):
            self.send_response(200)
            if local_file.endswith('.js'):
                self.send_header('Content-type', 'application/javascript; charset=utf-8')
            elif local_file.endswith('.css'):
                self.send_header('Content-type', 'text/css; charset=utf-8')
            elif local_file.endswith('.html'):
                self.send_header('Content-type', 'text/html; charset=utf-8')
            self.send_header("Cross-Origin-Opener-Policy", "same-origin")
            self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
            self.send_header("Cross-Origin-Resource-Policy", "cross-origin")
            self.end_headers()
            with open(local_file, 'rb') as f:
                self.wfile.write(f.read())
            return

        if path in ["/api/select_video", "/api/select_audio"]:
            root = tk.Tk()
            root.withdraw()
            root.attributes('-topmost', True)
            filetypes = [("影片檔", "*.mp4;*.webm;*.mov")] if path == "/api/select_video" else [("音訊檔", "*.mp3;*.wav;*.m4a")]
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
                self.send_error(404)
                return
                
            size = os.path.getsize(media_path)
            self.send_response(206)
            
            ext = os.path.splitext(media_path)[1].lower()
            ctype = "video/mp4"
            if ext == ".mp3": ctype = "audio/mpeg"
            elif ext == ".webm": ctype = "video/webm"
            
            self.send_header('Content-Type', ctype)
            self.send_header('Accept-Ranges', 'bytes')
            
            range_header = self.headers.get('Range', None)
            start = 0
            end = size - 1
            if range_header:
                range_match = re.match(r'bytes=(\d+)-(\d*)', range_header)
                if range_match:
                    start = int(range_match.group(1))
                    if range_match.group(2):
                        end = int(range_match.group(2))
            
            length = end - start + 1
            self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
            self.send_header('Content-Length', str(length))
            self.send_header("Cross-Origin-Opener-Policy", "same-origin")
            self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
            self.send_header("Cross-Origin-Resource-Policy", "cross-origin")
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
                    except:
                        break
                    remaining -= len(chunk)
            return

        if path == "/": path = "/index.html"
        file_path = os.path.join(os.getcwd(), path.lstrip('/'))
        if os.path.exists(file_path):
            self.send_response(200)
            if file_path.endswith('.html'): self.send_header("Content-Type", "text/html; charset=utf-8")
            elif file_path.endswith('.js'): self.send_header("Content-Type", "application/javascript")
            elif file_path.endswith('.css'): self.send_header("Content-Type", "text/css")
            self.send_header("Cross-Origin-Opener-Policy", "same-origin")
            self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
            self.send_header("Cross-Origin-Resource-Policy", "cross-origin")
            self.end_headers()
            with open(file_path, 'rb') as f:
                self.wfile.write(f.read())
        else:
            self.send_error(404)

    
    def do_POST(self):
        if self.path.startswith('/api/shutdown'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header("Cross-Origin-Opener-Policy", "same-origin")
            self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
            self.send_header("Cross-Origin-Resource-Policy", "cross-origin")
            self.send_header("Cross-Origin-Resource-Policy", "cross-origin")
            self.end_headers()
            import json, threading, os
            self.wfile.write(json.dumps({"status": "shutting_down"}).encode('utf-8'))
            threading.Thread(target=lambda: (os._exit(0))).start()
            return
        
        # original do_POST logic follows:

        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode('utf-8')
        
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
                    self.send_json({"status": "ok"})
                else:
                    self.send_json({"status": "cancelled"})
            except Exception as e:
                self.send_json({"status": "error", "error": str(e)})
            return
            
        if path == "/api/export_video":
            try:
                data = json.loads(body)
                video_path = data.get("video_path")
                ass_content = data.get("ass_content")
                resolution = data.get("resolution")
                crf = data.get("crf", 28)

                ass_path = os.path.join(os.path.dirname(video_path), "temp_subs.ass")
                with open(ass_path, 'w', encoding='utf-8') as f:
                    f.write(ass_content)

                out_path = os.path.join(os.path.dirname(video_path), f"exported_{resolution}p.mp4")

                task_id = str(uuid.uuid4())
                tasks[task_id] = {"status": "running", "progress": 0}

                def run_ffmpeg():
                    safe_ass = ass_path.replace('\\', '/')
                    cmd = [get_ffmpeg_path(), "-y", "-i", video_path, "-vf", "scale=-2:" + str(resolution) + ",ass='" + safe_ass.replace(':', '\\:') + "'", "-c:v", "libx264", "-preset", "fast", "-crf", str(crf), "-c:a", "copy", out_path]

                    dur_cmd = [get_ffmpeg_path(), "-i", video_path]
                    dur_proc = subprocess.Popen(dur_cmd, stderr=subprocess.PIPE, text=True, encoding='utf-8', errors='ignore')
                    _, err = dur_proc.communicate()
                    duration = 1
                    dur_match = re.search(r"Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})", err)
                    if dur_match:
                        h, m, s = dur_match.groups()
                        duration = float(h)*3600 + float(m)*60 + float(s)

                    proc = subprocess.Popen(cmd, stderr=subprocess.PIPE, text=True, encoding='utf-8', errors='ignore')
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
                    if os.path.exists(ass_path):
                        try: os.remove(ass_path)
                        except: pass

                    if proc.returncode == 0:
                        tasks[task_id]["status"] = "done"
                        tasks[task_id]["progress"] = 1.0
                    else:
                        tasks[task_id]["status"] = "error"
                        tasks[task_id]["error"] = "FFmpeg Error"

                threading.Thread(target=run_ffmpeg, daemon=True).start()
                self.send_json({"task_id": task_id})
            except Exception as e:
                self.send_json({"status": "error", "error": str(e)})
            return

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
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
