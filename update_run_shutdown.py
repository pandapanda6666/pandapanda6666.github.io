import re

with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.pyw', 'r', encoding='utf-8') as f:
    run_pyw = f.read()

# Add shutdown handler
old_api = """        if self.path.startswith('/api/is_desktop'):
            self.send_response(200)"""

new_api = """        if self.path.startswith('/api/shutdown'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "shutting_down"}).encode('utf-8'))
            print(f"[{MAGIC_NAME}] 收到關閉指令，準備關閉伺服器...")
            import threading
            threading.Thread(target=lambda: (os._exit(0))).start()
            return

        if self.path.startswith('/api/is_desktop'):
            self.send_response(200)"""

run_pyw = run_pyw.replace(old_api, new_api)

with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.pyw', 'w', encoding='utf-8') as f:
    f.write(run_pyw)