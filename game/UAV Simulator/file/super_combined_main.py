# -*- coding: utf-8 -*-
import urllib.parse
import time
import os
import sys
import ctypes
import subprocess
import json
import threading
import http.server
import socketserver
import asyncio

# --- Headless / pythonw 專用防崩潰 NullWriter ---
class NullWriter:
    def write(self, *args, **kwargs):
        pass
    def flush(self, *args, **kwargs):
        pass

if sys.stdout is None:
    sys.stdout = NullWriter()
if sys.stderr is None:
    sys.stderr = NullWriter()

# 立即隱藏空白黑控制台視窗
try:
    hwnd = ctypes.windll.kernel32.GetConsoleWindow()
    if hwnd:
        ctypes.windll.user32.ShowWindow(hwnd, 0)
except Exception:
    pass

def install_module(module_name):
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", module_name], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

try:
    import webview
except ImportError:
    install_module("pywebview")
    try:
        import webview
    except Exception:
        webview = None

try:
    from bleak import BleakScanner, BleakClient
except ImportError:
    install_module("bleak")
    try:
        from bleak import BleakScanner, BleakClient
    except Exception:
        BleakScanner, BleakClient = None, None

try:
    import websockets
except ImportError:
    install_module("websockets")
    try:
        import websockets
    except Exception:
        websockets = None

# --- BLE RABBONI LOGIC ---
SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
CHAR_WRITE_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
CHAR_NOTIFY_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"

connected_clients = set()

def parse_sensor_data(data):
    try:
        if len(data) >= 14 and data[0] == 0x55 and data[1] == 0xAA:
            import struct
            acc_x, acc_y, acc_z = struct.unpack('>hhh', data[2:8])
            scale_acc = 16.0 / 32768.0
            ax = acc_x * scale_acc
            ay = acc_y * scale_acc
            az = acc_z * scale_acc
            return {"ax": ax, "ay": ay, "az": az, "raw": list(data)}
    except Exception:
        pass
    return None

async def handle_scan(websocket):
    if BleakScanner is None:
        try:
            await websocket.send(json.dumps({"type": "scan_results", "devices": []}))
        except Exception:
            pass
        return
    try:
        devices = await BleakScanner.discover(timeout=4.0)
        res = []
        for d in devices:
            if d.name and ("rabboni" in d.name.lower() or "rb" in d.name.lower()):
                res.append({"name": d.name, "address": d.address})
        await websocket.send(json.dumps({"type": "scan_results", "devices": res}))
    except Exception as e:
        try:
            await websocket.send(json.dumps({"type": "scan_error", "message": str(e)}))
        except Exception:
            pass

async def connect_and_listen(address, name, websocket):
    if BleakClient is None:
        return
    try:
        async with BleakClient(address) as client:
            if not client.is_connected:
                return
            await websocket.send(json.dumps({"type": "connected", "name": name}))

            def callback(sender, data):
                parsed = parse_sensor_data(data)
                if parsed:
                    msg = json.dumps({"type": "data", "name": name, "data": parsed})
                    asyncio.create_task(websocket.send(msg))

            await client.start_notify(CHAR_NOTIFY_UUID, callback)
            while client.is_connected:
                await asyncio.sleep(0.5)
    except Exception:
        pass
    finally:
        try:
            await websocket.send(json.dumps({"type": "disconnected", "name": name}))
        except Exception:
            pass

async def ws_handler(websocket, *args):
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                if data.get('cmd') == 'scan':
                    asyncio.create_task(handle_scan(websocket))
                elif data.get('cmd') == 'connect':
                    addr = data.get('address')
                    name = data.get('name')
                    asyncio.create_task(connect_and_listen(addr, name, websocket))
            except Exception:
                pass
    except Exception:
        pass
    finally:
        connected_clients.discard(websocket)

async def start_ws_server():
    if websockets is None:
        return None
    try:
        server = await websockets.serve(ws_handler, "127.0.0.1", 50500)
        return server
    except Exception:
        return None

async def rabboni_main():
    ws_server = await start_ws_server()
    if ws_server:
        await asyncio.Future()

def start_rabboni_background():
    try:
        asyncio.run(rabboni_main())
    except Exception:
        pass

# --- HTTP SERVER LOGIC ---
server_ready_event = threading.Event()
actual_server_port = 8849
server_started_successfully = False

class ThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

    def handle_error(self, request, client_address):
        pass

def start_http_server(directory, port=8849):
    global actual_server_port, server_started_successfully

    class SafeHandler(http.server.SimpleHTTPRequestHandler):
        protocol_version = "HTTP/1.1"

        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=directory, **kwargs)

        def log_message(self, format, *args):
            pass

        def log_request(self, code='-', size='-'):
            pass

        def log_error(self, format, *args):
            pass

        def do_GET(self):
            if self.path.startswith('/api/check_update'):
                try:
                    import urllib.request
                    mirrors = [
                        "https://pandapanda6666.github.io/game/UAV%20Simulator/file/version.json",
                        "https://cdn.jsdelivr.net/gh/PandaPanda6666/PandaPanda6666.github.io@main/game/UAV%20Simulator/file/version.json",
                        "https://raw.githubusercontent.com/PandaPanda6666/PandaPanda6666.github.io/main/game/UAV%20Simulator/file/version.json"
                    ]
                    v_data = None
                    for m in mirrors:
                        try:
                            req = urllib.request.Request(m + f"?t={int(time.time()*1000)}", headers={'User-Agent': 'Mozilla/5.0 PandaPandaUAV/4.0'})
                            with urllib.request.urlopen(req, timeout=5) as resp:
                                v_data = json.loads(resp.read().decode('utf-8'))
                                if v_data and v_data.get("version"):
                                    break
                        except Exception:
                            continue
                    
                    if v_data:
                        body = json.dumps(v_data).encode('utf-8')
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.send_header('Content-Length', str(len(body)))
                        self.send_header('Connection', 'close')
                        self.end_headers()
                        self.wfile.write(body)
                        return
                    else:
                        raise Exception("無法從伺服器取得版本資料")
                except Exception as e:
                    body = json.dumps({"status": "error", "message": str(e)}).encode('utf-8')
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Content-Length', str(len(body)))
                    self.send_header('Connection', 'close')
                    self.end_headers()
                    self.wfile.write(body)
                    return

            super().do_GET()

        def do_POST(self):
            if self.path == '/api/update':
                try:
                    import urllib.request
                    mirrors = [
                        "https://pandapanda6666.github.io/game/UAV%20Simulator/file/",
                        "https://cdn.jsdelivr.net/gh/PandaPanda6666/PandaPanda6666.github.io@main/game/UAV%20Simulator/file/",
                        "https://raw.githubusercontent.com/PandaPanda6666/PandaPanda6666.github.io/main/game/UAV%20Simulator/file/"
                    ]
                    v_data = None
                    chosen_mirror = mirrors[0]
                    for m in mirrors:
                        try:
                            req = urllib.request.Request(m + f"version.json?t={int(time.time()*1000)}", headers={'User-Agent': 'Mozilla/5.0 PandaPandaUAV/4.0'})
                            with urllib.request.urlopen(req, timeout=5) as resp:
                                v_data = json.loads(resp.read().decode('utf-8'))
                                if v_data and v_data.get("version"):
                                    chosen_mirror = m
                                    break
                        except Exception:
                            continue

                    if not v_data:
                        raise Exception("無法從任何更新伺服器取得版本清單")

                    files_to_update = v_data.get("files", ["index.html", "version.json"])
                    for f in files_to_update:
                        downloaded = False
                        for m in [chosen_mirror] + [x for x in mirrors if x != chosen_mirror]:
                            try:
                                f_url = m + urllib.parse.quote(f)
                                f_req = urllib.request.Request(f_url, headers={'User-Agent': 'Mozilla/5.0 PandaPandaUAV/4.0'})
                                with urllib.request.urlopen(f_req, timeout=12) as f_resp:
                                    content = f_resp.read()
                                dest = os.path.join(directory, f)
                                try:
                                    with open(dest, 'wb') as out_f:
                                        out_f.write(content)
                                except Exception:
                                    if f.endswith('.exe'):
                                        try:
                                            with open(dest + '.new', 'wb') as out_f:
                                                out_f.write(content)
                                        except Exception:
                                            pass
                                downloaded = True
                                break
                            except Exception:
                                continue

                    body = json.dumps({"status": "ok", "version": v_data.get("version")}).encode('utf-8')
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Content-Length', str(len(body)))
                    self.send_header('Connection', 'close')
                    self.end_headers()
                    self.wfile.write(body)
                    return
                except Exception as e:
                    body = json.dumps({"status": "error", "message": str(e)}).encode('utf-8')
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Content-Length', str(len(body)))
                    self.send_header('Connection', 'close')
                    self.end_headers()
                    self.wfile.write(body)
                    return

            super().do_POST()

    for p in range(port, port + 30):
        try:
            httpd = ThreadingTCPServer(("127.0.0.1", p), SafeHandler)
            actual_server_port = p
            server_started_successfully = True
            server_ready_event.set()
            httpd.serve_forever()
            break
        except Exception:
            continue
    server_ready_event.set()

# --- MAIN ---
def main():
    try:
        ctypes.windll.kernel32.SetConsoleTitleW("【PandaPanda的AI日常___無人機模擬器】")
    except Exception:
        pass
    
    if getattr(sys, 'frozen', False):
        exe_dir = os.path.dirname(sys.executable)
    else:
        exe_dir = os.path.dirname(os.path.abspath(__file__))
    
    threading.Thread(target=start_rabboni_background, daemon=True).start()
    threading.Thread(target=start_http_server, args=(exe_dir,), daemon=True).start()
    
    # 等待本地伺服器完成綁定 (最多等 2 秒)
    server_ready_event.wait(timeout=2.0)
    
    index_path = os.path.join(exe_dir, 'index.html')
    if not os.path.exists(index_path):
        return

    # 驗證本地 HTTP 伺服器是否可正常訪問，若成功則以 HTTP 訪問，若異常則直接載入本機 file:///
    target_url = None
    if server_started_successfully:
        try:
            import urllib.request
            test_resp = urllib.request.urlopen(f'http://127.0.0.1:{actual_server_port}/index.html', timeout=1.0)
            if test_resp.status == 200:
                target_url = f'http://127.0.0.1:{actual_server_port}/index.html'
        except Exception:
            target_url = None

    if not target_url:
        # 降級保底：直接以本機檔案路徑加載，絕對不會出現 127.0.0.1 載入失敗！
        target_url = "file:///" + index_path.replace("\\", "/")

    # 啟動獨立應用程式視窗 (優先 Edge / Chrome App Mode，完全無網址列、無分頁)
    window_launched = False

    if webview is not None:
        try:
            window = webview.create_window(
                '【PandaPanda的AI日常___無人機模擬器】', 
                target_url,
                width=1280, 
                height=750
            )
            webview.start(debug=False)
            window_launched = True
        except Exception:
            window_launched = False

    if not window_launched:
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
            user_data = os.path.join(exe_dir, "app_profile")
            cmd = [
                app_browser,
                f"--app={target_url}",
                "--window-size=1280,750",
                f"--user-data-dir={user_data}",
                "--no-first-run",
                "--no-default-browser-check"
            ]
            try:
                proc = subprocess.Popen(cmd)
                proc.wait()
            except Exception:
                pass
        else:
            import webbrowser
            webbrowser.open(target_url)
            try:
                while True:
                    time.sleep(1)
            except Exception:
                pass

if __name__ == '__main__':
    main()
