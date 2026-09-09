import os
import sys
import shutil
import subprocess
import threading
import time
import webbrowser
from http.server import ThreadingHTTPServer as HTTPServer, SimpleHTTPRequestHandler

TOOL_NAME = "UAV_Simulator"
MAGIC_NAME = f"PandaPanda的AI日常___{TOOL_NAME}"

class SimulatorAPIHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        super().end_headers()

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    server_address = ('127.0.0.1', 8849)
    try:
        httpd = HTTPServer(server_address, SimulatorAPIHandler)
    except OSError:
        print(f"[{MAGIC_NAME}] Port 8849 is already in use.")
        return
    print(f"[{MAGIC_NAME}] Server started at http://127.0.0.1:8849")
    
    chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
    url = "http://127.0.0.1:8849/index.html"
    
    def open_browser():
        time.sleep(1)
        if os.path.exists(chrome_path):
            subprocess.Popen([chrome_path, f"--app={url}"])
        else:
            webbrowser.open(url)
            
    threading.Thread(target=open_browser, daemon=True).start()
    
    # 嘗試啟動 Rabboni 軟體
    rabboni_path = r"L:\我的雲端硬碟\隨身碟備份\micro SD-1 128GB\E\Rabboni軟體\rabboni_app.exe"
    if os.path.exists(rabboni_path):
        try:
            output = subprocess.check_output('tasklist', creationflags=subprocess.CREATE_NO_WINDOW).decode('utf-8', errors='ignore')
            if "rabboni_app.exe" not in output:
                print(f"[{MAGIC_NAME}] 正在啟動 Rabboni 軟體...")
                subprocess.Popen([rabboni_path], cwd=os.path.dirname(rabboni_path))
        except:
            pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass

if __name__ == '__main__':
    is_worker = (len(sys.argv) > 1 and sys.argv[1] == "worker")
    current_exe = os.path.basename(sys.executable).lower()
    
    if not is_worker and current_exe != "pandapython.exe":
        target_exe = os.path.join(os.path.dirname(sys.executable), "PandaPython.exe")
        if not os.path.exists(target_exe):
            try:
                shutil.copy2(sys.executable, target_exe)
            except Exception as e:
                target_exe = sys.executable
        subprocess.Popen([target_exe, os.path.abspath(__file__), "worker"], creationflags=subprocess.CREATE_NEW_CONSOLE)
        sys.exit(0)
    else:
        os.system(f"title {MAGIC_NAME}")
        run_server()
