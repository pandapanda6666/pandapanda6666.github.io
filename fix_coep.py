import re
with open('run.pyw', 'r', encoding='utf-8') as f:
    text = f.read()

replacement = """def do_POST(self):
        if self.path.startswith('/api/shutdown'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header("Cross-Origin-Opener-Policy", "same-origin")
            self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
            self.send_header("Cross-Origin-Resource-Policy", "cross-origin")
            self.end_headers()
            import json, threading, os
            self.wfile.write(json.dumps({"status": "shutting_down"}).encode('utf-8'))
            threading.Thread(target=lambda: (os._exit(0))).start()
            return
"""

text = re.sub(r'def do_POST\(self\):\n\s*if self\.path\.startswith\(\'/api/shutdown\'\):.*?return\n', replacement, text, flags=re.DOTALL)

# And also add the headers to /api/save_file and /api/export_video
# Wait, let's just make a helper for send_json
helper = """    def send_json(self, data):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        self.send_header("Cross-Origin-Resource-Policy", "same-origin")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))"""

text = text.replace("""    def send_json(self, data):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))""", helper)

with open('run.pyw', 'w', encoding='utf-8') as f:
    f.write(text)
print("run.pyw fixed COEP")