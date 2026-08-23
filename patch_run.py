import os

with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.py', 'r', encoding='utf-8') as f:
    run_py = f.read()

# Add static file serving to run.py
static_serve = """
            # Serve static files if they exist (e.g. tailwindcss.js)
            file_path = os.path.join(os.path.dirname(__file__), self.path.lstrip('/'))
            if os.path.isfile(file_path):
                self.send_response(200)
                if file_path.endswith('.js'):
                    self.send_header('Content-type', 'application/javascript')
                elif file_path.endswith('.css'):
                    self.send_header('Content-type', 'text/css')
                self.end_headers()
                with open(file_path, 'rb') as f:
                    self.wfile.write(f.read())
                return
"""

# Insert it right before the API routes, after the '/' route
if "if self.path == '/api/select_video':" in run_py:
    run_py = run_py.replace("if self.path == '/api/select_video':", static_serve + "\n            if self.path == '/api/select_video':")
    with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.py', 'w', encoding='utf-8') as f:
        f.write(run_py)
    print("Patched run.py")
else:
    print("Could not patch run.py")