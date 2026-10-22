import os
import sys
import threading
import asyncio
import webview
import http.server
import socketserver
import ctypes
import traceback
import struct
import json
import math
import subprocess

def install_module(module_name):
    print(f"正在安裝缺失模組: {module_name}...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", module_name])
    except:
        pass

try:
    from bleak import BleakScanner, BleakClient
except ImportError:
    install_module("bleak")
    from bleak import BleakScanner, BleakClient

try:
    import websockets
except ImportError:
    install_module("websockets")
    import websockets

# --- RABBONI SERVER LOGIC ---
SCAN_TIMEOUT = 15
NOTIFY_UUID = "00001601-0000-1000-8000-00805f9b34fb"
WRITE_UUIDS = [
    "00001701-0000-1000-8000-00805f9b34fb",
    "00001702-0000-1000-8000-00805f9b34fb",
]
ACC_SCALE = 16
GYR_SCALE = 2000
GRAVITY = 9.81
ALPHA = 0.3  
filtered_acc = {'x': 0, 'y': 0, 'z': 0}
connected_clients = set()

def raw_to_ms2(raw_value, scale):
    return (raw_value / 32768.0) * scale * GRAVITY

def raw_to_degs(raw_value, scale):
    return (raw_value / 32768.0) * scale

def parse_sensor_data(data, device_name):
    global filtered_acc
    try:
        if len(data) >= 16:
            ax_raw = struct.unpack('>h', data[0:2])[0]
            ay_raw = struct.unpack('>h', data[2:4])[0]
            az_raw = struct.unpack('>h', data[4:6])[0]
            gx_raw = struct.unpack('>h', data[6:8])[0]
            gy_raw = struct.unpack('>h', data[8:10])[0]
            gz_raw = struct.unpack('>h', data[10:12])[0]
            
            acc_x = raw_to_ms2(ax_raw, ACC_SCALE)
            acc_y = raw_to_ms2(ay_raw, ACC_SCALE)
            acc_z = raw_to_ms2(az_raw, ACC_SCALE)
            
            gyr_x = raw_to_degs(gx_raw, GYR_SCALE)
            gyr_y = raw_to_degs(gy_raw, GYR_SCALE)
            gyr_z = raw_to_degs(gz_raw, GYR_SCALE)
            
            filtered_acc['x'] = ALPHA * acc_x + (1 - ALPHA) * filtered_acc['x']
            filtered_acc['y'] = ALPHA * acc_y + (1 - ALPHA) * filtered_acc['y']
            filtered_acc['z'] = ALPHA * acc_z + (1 - ALPHA) * filtered_acc['z']
            
            return {
                'name': device_name,
                'acc': [filtered_acc['x'], filtered_acc['y'], filtered_acc['z']],
                'gyr': [gyr_x, gyr_y, gyr_z]
            }
    except Exception as e:
        pass
    return None

async def broadcast_ws(message):
    if connected_clients:
        tasks = [asyncio.create_task(client.send(message)) for client in connected_clients]
        await asyncio.gather(*tasks, return_exceptions=True)

def make_notification_handler(device_name):
    def notification_handler(sender, data):
        parsed = parse_sensor_data(data, device_name)
        if parsed:
            json_str = json.dumps(parsed)
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(broadcast_ws(json_str))
            except:
                pass
    return notification_handler

async def activate_device(client):
    activation_commands = [
        (bytes([0x01]), "開始"),
        (bytes([0xFF]), "使能"),
    ]
    activated = False
    for uuid in WRITE_UUIDS[:2]:
        for cmd, name in activation_commands:
            try:
                await client.write_gatt_char(uuid, cmd)
                activated = True
                await asyncio.sleep(0.3)
            except:
                pass
    return activated

async def handle_scan(websocket):
    devices = await BleakScanner.discover(timeout=5.0)
    found = []
    for d in devices:
        if d.name and "rabboni" in d.name.lower():
            found.append({"name": d.name, "address": d.address})
    try:
        await websocket.send(json.dumps({"type": "scan_results", "devices": found}))
    except:
        pass

async def connect_and_listen(address, name, websocket):
    try:
        async with BleakClient(address, timeout=15) as client:
            try:
                await websocket.send(json.dumps({"type": "connected", "name": name}))
            except:
                pass
            await activate_device(client)
            handler = make_notification_handler(name)
            await client.start_notify(NOTIFY_UUID, handler)
            while True:
                await asyncio.sleep(1)
                if not client.is_connected:
                    break
    except Exception as e:
        print(f"Connection lost ({name}): {e}")
    finally:
        try:
            await websocket.send(json.dumps({"type": "disconnected", "name": name}))
        except:
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
            except Exception as e:
                pass
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.remove(websocket)

async def start_ws_server():
    server = await websockets.serve(ws_handler, "localhost", 50500)
    return server

async def rabboni_main():
    ws_server = await start_ws_server()
    await asyncio.Future()

def start_rabboni_background():
    try:
        asyncio.run(rabboni_main())
    except Exception as e:
        print(f"Rabboni error: {e}")

# --- HTTP SERVER LOGIC ---
def start_http_server(directory, port=8849):
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=directory, **kwargs)
        def log_message(self, format, *args):
            pass

        def do_POST(self):
            if self.path == '/api/update':
                try:
                    import urllib.request
                    raw_base = "https://raw.githubusercontent.com/PandaPanda6666/PandaPanda6666.github.io/main/game/UAV%20Simulator/file/"
                    req = urllib.request.Request(raw_base + "version.json", headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        v_data = json.loads(resp.read().decode('utf-8'))

                    files_to_update = v_data.get("files", ["index.html", "version.json"])
                    for f in files_to_update:
                        try:
                            f_url = raw_base + f
                            f_req = urllib.request.Request(f_url, headers={'User-Agent': 'Mozilla/5.0'})
                            with urllib.request.urlopen(f_req, timeout=15) as f_resp:
                                content = f_resp.read()
                            dest = os.path.join(directory, f)
                            with open(dest, 'wb') as out_f:
                                out_f.write(content)
                        except Exception as file_err:
                            print(f"Update error for {f}: {file_err}")

                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "ok", "version": v_data.get("version")}).encode('utf-8'))
                    return
                except Exception as e:
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
                    return
            super().do_POST()

    global actual_server_port
    for p in range(port, port + 20):
        try:
            socketserver.TCPServer.allow_reuse_address = True
            httpd = socketserver.TCPServer(("127.0.0.1", p), Handler)
            actual_server_port = p
            httpd.serve_forever()
            break
        except Exception as e:
            continue

# --- MAIN ---
actual_server_port = 8849

def main():
    ctypes.windll.kernel32.SetConsoleTitleW("【PandaPanda的AI日常___無人機模擬器】")
    
    if getattr(sys, 'frozen', False):
        exe_dir = os.path.dirname(sys.executable)
    else:
        exe_dir = os.path.dirname(os.path.abspath(__file__))
    
    threading.Thread(target=start_rabboni_background, daemon=True).start()
    threading.Thread(target=start_http_server, args=(exe_dir,), daemon=True).start()
    import time
    time.sleep(0.5)
    
    index_path = os.path.join(exe_dir, 'index.html')
    if os.path.exists(index_path):
        target_url = f'http://127.0.0.1:{actual_server_port}'
        try:
            window = webview.create_window(
                'UAV Simulator (PandaPanda的AI日常)', 
                target_url,
                width=1280, 
                height=720
            )
            webview.start()
        except Exception as e:
            print(f"[系統] 內嵌視窗無法啟動 ({e})，正在自動切換為預設瀏覽器開啟...")
            import webbrowser
            webbrowser.open(target_url)
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                pass
    else:
        print(f"找不到 {index_path}，請確定執行檔在正確的資料夾！")

if __name__ == '__main__':
    main()
