with open('run.pyw', 'r', encoding='utf-8') as f:
    run = f.read()

# Add shutdown to DesktopAPIHandler.do_GET and do_POST
shutdown_logic = """
    def do_POST(self):
        if self.path.startswith('/api/shutdown'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            import json, threading, os
            self.wfile.write(json.dumps({"status": "shutting_down"}).encode('utf-8'))
            threading.Thread(target=lambda: (os._exit(0))).start()
            return
        
        # original do_POST logic follows:
"""

# Let's see if we can find do_POST
if 'def do_POST(self):' in run:
    run = run.replace('def do_POST(self):', shutdown_logic)
else:
    print("Could not find do_POST")

with open('run.pyw', 'w', encoding='utf-8') as f:
    f.write(run)