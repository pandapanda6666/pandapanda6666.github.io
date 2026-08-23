import os

with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.py', 'r', encoding='utf-8') as f:
    run_py = f.read()

old_block = """            elif local_file.endswith('.html'):
                self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()"""

new_block = """            elif local_file.endswith('.html'):
                self.send_header('Content-type', 'text/html; charset=utf-8')
            self.send_header("Cross-Origin-Opener-Policy", "same-origin")
            self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
            self.end_headers()"""

run_py = run_py.replace(old_block, new_block)

with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.py', 'w', encoding='utf-8') as f:
    f.write(run_py)