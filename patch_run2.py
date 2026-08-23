import os

with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.py', 'r', encoding='utf-8') as f:
    run_py = f.read()

# Add static file serving to run.py
static_serve = """
        # Serve static files if they exist
        local_file = os.path.join(os.path.dirname(__file__), parsed_path.path.lstrip('/'))
        if os.path.isfile(local_file) and not parsed_path.path.startswith('/api/'):
            self.send_response(200)
            if local_file.endswith('.js'):
                self.send_header('Content-type', 'application/javascript')
            elif local_file.endswith('.css'):
                self.send_header('Content-type', 'text/css')
            self.end_headers()
            with open(local_file, 'rb') as f:
                self.wfile.write(f.read())
            return
"""

run_py = run_py.replace('if path in ["/api/select_video", "/api/select_audio"]:', static_serve + '\n        if path in ["/api/select_video", "/api/select_audio"]:')
with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.py', 'w', encoding='utf-8') as f:
    f.write(run_py)
print("Patched run.py successfully.")