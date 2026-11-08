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

try:
    import webview
except Exception:
    webview = None

try:
    from bleak import BleakScanner, BleakClient
except Exception:
    BleakScanner, BleakClient = None, None

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

actual_ws_port = None

async def start_ws_server():
    global actual_ws_port
    if websockets is None:
        return None
    # 彈性搜尋可用通訊埠，預設優先 50500，被占用則依序搜尋 50501~50550，最後由作業系統動態指派 (port 0)
    ports_to_try = [50500] + list(range(50501, 50551)) + [0]
    for wsp in ports_to_try:
        try:
            server = await websockets.serve(ws_handler, "127.0.0.1", wsp)
            if server and server.sockets:
                actual_ws_port = server.sockets[0].getsockname()[1]
            else:
                actual_ws_port = wsp
            return server
        except Exception:
            continue
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
last_heartbeat_time = time.time()
should_exit_flag = False
http_server_instance = None

class ThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

    def server_bind(self):
        try:
            import socket
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        except Exception:
            pass
        super().server_bind()

    def handle_error(self, request, client_address):
        # 阻絕客戶端關閉視窗引發之 BrokenPipeError / ConnectionResetError
        pass

def start_http_server(directory, preferred_port=8849):
    global actual_server_port, server_started_successfully, http_server_instance

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
            global last_heartbeat_time, should_exit_flag
            if self.path.startswith('/api/heartbeat'):
                last_heartbeat_time = time.time()
                if 'closing=1' in self.path:
                    should_exit_flag = True
                body = json.dumps({"status": "ok", "time": last_heartbeat_time}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Length', str(len(body)))
                self.send_header('Connection', 'close')
                self.end_headers()
                try:
                    self.wfile.write(body)
                except Exception:
                    pass
                return

            if self.path.startswith('/api/server_info'):
                body = json.dumps({
                    "status": "ok",
                    "http_port": actual_server_port,
                    "ws_port": actual_ws_port,
                    "version": "v4.034"
                }).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Length', str(len(body)))
                self.send_header('Connection', 'close')
                self.end_headers()
                try:
                    self.wfile.write(body)
                except Exception:
                    pass
                return

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
                        try:
                            self.wfile.write(body)
                        except Exception:
                            pass
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
                    try:
                        self.wfile.write(body)
                    except Exception:
                        pass
                    return

            try:
                super().do_GET()
            except Exception:
                pass

        def do_POST(self):
            global last_heartbeat_time, should_exit_flag
            if self.path.startswith('/api/heartbeat'):
                last_heartbeat_time = time.time()
                if 'closing=1' in self.path:
                    should_exit_flag = True
                body = json.dumps({"status": "ok", "time": last_heartbeat_time}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Length', str(len(body)))
                self.send_header('Connection', 'close')
                self.end_headers()
                try:
                    self.wfile.write(body)
                except Exception:
                    pass
                return

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
                    try:
                        self.wfile.write(body)
                    except Exception:
                        pass
                    return
                except Exception as e:
                    body = json.dumps({"status": "error", "message": str(e)}).encode('utf-8')
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Content-Length', str(len(body)))
                    self.send_header('Connection', 'close')
                    self.end_headers()
                    try:
                        self.wfile.write(body)
                    except Exception:
                        pass
                    return

            try:
                super().do_POST()
            except Exception:
                pass

    # 通訊埠彈性自適應：優先 8849，若被占用則搜尋 8850~8999，最後由作業系統動態指派可用通訊埠 (port 0)
    port_candidates = [preferred_port] + list(range(8850, 9000)) + [0]
    for p in port_candidates:
        try:
            httpd = ThreadingTCPServer(("127.0.0.1", p), SafeHandler)
            actual_server_port = httpd.server_address[1]
            server_started_successfully = True
            http_server_instance = httpd
            server_ready_event.set()
            try:
                port_file = os.path.join(directory, "server_port.txt")
                with open(port_file, "w", encoding="utf-8") as pf:
                    pf.write(str(actual_server_port))
            except Exception:
                pass
            httpd.serve_forever()
            break
        except Exception:
            continue
    server_ready_event.set()

# --- MAIN ---
def main():
    global last_heartbeat_time, should_exit_flag
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
    
    index_path = os.path.join(exe_dir, 'index.html')
    if not os.path.exists(index_path):
        return

    # 彈性輪詢檢測 HTTP 伺服器健康狀況 (最長等 5 秒，每 50ms 檢測一次)
    target_url = None
    t_start = time.time()
    while time.time() - t_start < 5.0:
        if server_ready_event.is_set() and actual_server_port:
            try:
                import urllib.request
                req = urllib.request.Request(f'http://127.0.0.1:{actual_server_port}/index.html')
                with urllib.request.urlopen(req, timeout=0.5) as resp:
                    if resp.status == 200:
                        target_url = f'http://127.0.0.1:{actual_server_port}/index.html'
                        break
            except Exception:
                time.sleep(0.05)
        else:
            time.sleep(0.05)

    if not target_url:
        # 降級保底：若本機 HTTP 伺服器遭到外部攔截，直接以本機 file:/// 協定加載
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
                "--allow-file-access-from-files",
                "--no-first-run",
                "--no-default-browser-check"
            ]
            try:
                proc = subprocess.Popen(cmd)
            except Exception:
                proc = None
        else:
            import webbrowser
            webbrowser.open(target_url)
            proc = None

        # --- 心跳看門狗 (Heartbeat Watchdog) ---
        # 解決瀏覽器進程立即退出導致 HTTP 伺服器終止、引發 127.0.0.1 拒絕連線的問題
        startup_grace = time.time() + 20.0
        while True:
            time.sleep(1.0)
            if should_exit_flag:
                break
            now = time.time()
            if now < startup_grace:
                continue
            # 若超過 6 秒未收到任何來自模擬器視窗的心跳，代表使用者已關閉視窗，正常結束進程
            if now - last_heartbeat_time > 6.0:
                break

    # 退出前關閉 HTTP 伺服器
    if http_server_instance:
        try:
            http_server_instance.shutdown()
        except Exception:
            pass

if __name__ == '__main__':
    main()

