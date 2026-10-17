# 版權所有 © 2026 PandaPanda的AI日常 (https://pandapanda6666.github.io) All Rights Reserved.
import os
import sys
import subprocess
import threading
import json
import base64
import time
from io import BytesIO
import tkinter as tk
from tkinter import scrolledtext, messagebox, ttk, filedialog
import tkinter.simpledialog as simpledialog

def check_and_install_modules():
    packages = {
        'requests': 'requests',
        'PIL': 'Pillow',
        'plyer': 'plyer'
    }
    for mod, pkg in packages.items():
        try:
            __import__(mod)
        except ImportError:
            print(f"[系統] 正在自動安裝缺少模組: {pkg}，請稍候...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", pkg], stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

check_and_install_modules()
import requests
from PIL import Image, ImageTk

CREATE_NO_WINDOW = 0x08000000 if os.name == 'nt' else 0
CONFIG_FILE = "github_config.json"
LOCAL_API = "http://127.0.0.1:48921/api"

def is_port_listening(port):
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.2)
        s.connect(('127.0.0.1', port))
        s.close()
        return True
    except:
        return False

class ServerControlGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("PandaPanda的AI日常___面板")
        self.root.geometry("850x980")
        try:
            self.root.state("zoomed")
        except:
            pass
        self.root.configure(bg="#0f172a")
        self.processes = []
        self.mc_process = None
        self.github_config = self.load_config()
        self.current_url = ""
        self.current_selected_app_id = ""
        self.deploy_paths = {}
        
        self.is_restarting = False
        self.is_running = False
        self.last_start_time = 0
        self.timer_check_id = None
        self.health_fail_count = 0
        self.current_history_data = []
        self.current_issues_data = []
        self.current_apps_data = {}
        self.last_broadcasts_hash = None
        self.ngrok_url = ""
        self.is_failover_to_cf = False
        self.last_ngrok_probe_time = 0
        self.ngrok_fail_count = 0
        self.ngrok_paths = []
        
        title_frame = tk.Frame(self.root, bg="#0f172a")
        title_frame.pack(fill=tk.X, pady=15)
        tk.Label(title_frame, text="PandaPanda的AI日常", font=("Microsoft JhengHei", 24, "bold"), bg="#0f172a", fg="#818cf8").pack()
        tk.Label(title_frame, text="伺服器：本地連線與外網穿透自動化", font=("Microsoft JhengHei", 14), bg="#0f172a", fg="#94a3b8").pack(pady=5)

        btn_frame = tk.Frame(self.root, bg="#0f172a")
        btn_frame.pack(fill=tk.X, padx=40, pady=5)
        self.auto_btn = tk.Button(btn_frame, text="🚀 手動啟動伺服器", font=("Microsoft JhengHei", 16, "bold"), bg="#4ade80", fg="#022c22", command=self.one_click_start, cursor="hand2", relief=tk.FLAT, pady=10)
        self.auto_btn.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        self.stop_btn = tk.Button(btn_frame, text="⏹️ 停止所有服務", font=("Microsoft JhengHei", 14, "bold"), bg="#ef4444", fg="white", command=self.stop_all, cursor="hand2", relief=tk.FLAT, pady=10)
        self.stop_btn.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        
        self.account_btn = tk.Button(btn_frame, text="👥 系統與權限管理", font=("Microsoft JhengHei", 14, "bold"), bg="#f59e0b", fg="white", command=self.open_account_manager, cursor="hand2", relief=tk.FLAT, pady=10)
        self.account_btn.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        self.setting_btn = tk.Button(btn_frame, text="⚙️ 設定 GitHub 聯動", font=("Microsoft JhengHei", 14, "bold"), bg="#8b5cf6", fg="white", command=self.open_settings, cursor="hand2", relief=tk.FLAT, pady=10)
        self.setting_btn.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        self.restart_ui_btn = tk.Button(btn_frame, text="🔄 重啟面板", font=("Microsoft JhengHei", 12, "bold"), bg="#8b5cf6", fg="white", activebackground="#6366f1", activeforeground="white", relief=tk.FLAT, cursor="hand2", command=self.restart_ui)
        self.restart_ui_btn.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)
        
        self.restart_all_btn = tk.Button(btn_frame, text="🔥 重啟服務與面板", font=("Microsoft JhengHei", 12, "bold"), bg="#818cf8", fg="white", activebackground="#6366f1", activeforeground="white", relief=tk.FLAT, cursor="hand2", command=self.restart_services)
        self.restart_all_btn.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)

        tunnel_opt_frame = tk.LabelFrame(self.root, text="🌐 穿透通道設定 (雙通道分流)", bg="#0f172a", fg="#60a5fa", font=("Microsoft JhengHei", 12, "bold"), bd=1)
        tunnel_opt_frame.pack(fill=tk.X, padx=40, pady=(10, 0))
        
        self.var_use_ngrok = tk.BooleanVar(value=self.github_config.get("use_ngrok", True))
        tk.Checkbutton(tunnel_opt_frame, text="✅ 啟用 Ngrok 專屬網域 (適合官網與登入中心，高穩定)", variable=self.var_use_ngrok, bg="#0f172a", fg="#e2e8f0", selectcolor="#1e293b", activebackground="#0f172a", activeforeground="white", font=("Microsoft JhengHei", 11), command=self.save_config).grid(row=0, column=0, sticky=tk.W, padx=10, pady=2)
        
        self.var_use_cf = tk.BooleanVar(value=self.github_config.get("use_cf", False))
        tk.Checkbutton(tunnel_opt_frame, text="✅ 啟用 Cloudflare 隧道 (適合遠端監控等高流量)", variable=self.var_use_cf, bg="#0f172a", fg="#e2e8f0", selectcolor="#1e293b", activebackground="#0f172a", activeforeground="white", font=("Microsoft JhengHei", 11), command=self.save_config).grid(row=1, column=0, sticky=tk.W, padx=10, pady=2)

        opt_frame = tk.LabelFrame(self.root, text="🔄 自動重啟防護設定", bg="#0f172a", fg="#fcd34d", font=("Microsoft JhengHei", 12, "bold"), bd=1)
        opt_frame.pack(fill=tk.X, padx=40, pady=10)
        
        self.var_health_check = tk.BooleanVar(value=self.github_config.get("opt_health", True))
        tk.Checkbutton(opt_frame, text="1. 啟用外網穿透心跳偵測 (連續 3 次無回應自動重啟)", variable=self.var_health_check, bg="#0f172a", fg="#e2e8f0", selectcolor="#1e293b", activebackground="#0f172a", activeforeground="white", font=("Microsoft JhengHei", 11), command=self.save_config).grid(row=0, column=0, sticky=tk.W, padx=10, pady=2)

        self.var_backend_err = tk.BooleanVar(value=self.github_config.get("opt_backend", True))
        tk.Checkbutton(opt_frame, text="2. 啟用伺服器崩潰攔截 (後端報錯時自動重啟)", variable=self.var_backend_err, bg="#0f172a", fg="#e2e8f0", selectcolor="#1e293b", activebackground="#0f172a", activeforeground="white", font=("Microsoft JhengHei", 11), command=self.save_config).grid(row=1, column=0, sticky=tk.W, padx=10, pady=2)

        self.var_unknown_err = tk.BooleanVar(value=self.github_config.get("opt_unknown", True))
        tk.Checkbutton(opt_frame, text="3. 偵測到伺服器未知錯誤訊息自動重啟 (包含穿透斷線偵測)", variable=self.var_unknown_err, bg="#0f172a", fg="#e2e8f0", selectcolor="#1e293b", activebackground="#0f172a", activeforeground="white", font=("Microsoft JhengHei", 11), command=self.save_config).grid(row=2, column=0, sticky=tk.W, padx=10, pady=2)

        timer_frame = tk.Frame(opt_frame, bg="#0f172a")
        timer_frame.grid(row=3, column=0, sticky=tk.W, padx=10, pady=2)
        self.var_timer = tk.BooleanVar(value=self.github_config.get("opt_timer", False))
        tk.Checkbutton(timer_frame, text="4. 每隔指定時間自動重啟 (分鐘):", variable=self.var_timer, bg="#0f172a", fg="#e2e8f0", selectcolor="#1e293b", activebackground="#0f172a", activeforeground="white", font=("Microsoft JhengHei", 11), command=self.save_config).pack(side=tk.LEFT)
        self.timer_minutes = tk.IntVar(value=self.github_config.get("timer_min", 120))
        entry_timer = tk.Entry(timer_frame, textvariable=self.timer_minutes, width=5, bg="#1e293b", fg="white", font=("Consolas", 11), insertbackground="white")
        entry_timer.pack(side=tk.LEFT, padx=5)
        entry_timer.bind("<KeyRelease>", lambda e: self.save_config())

        url_frame = tk.Frame(self.root, bg="#1e293b", padx=15, pady=10)
        url_frame.pack(fill=tk.X, padx=40, pady=5)
        tk.Label(url_frame, text="🌐 外網連線網址：", font=("Microsoft JhengHei", 14, "bold"), bg="#1e293b", fg="#e2e8f0").pack(side=tk.LEFT)
        self.url_var = tk.StringVar(value="等待伺服器啟動中...")
        self.url_entry = tk.Entry(url_frame, textvariable=self.url_var, font=("Consolas", 14, "bold"), state="readonly", width=40, fg="#60a5fa", bg="#0f172a", relief=tk.FLAT)
        self.url_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=10)

        prog_frame = tk.Frame(self.root, bg="#0f172a")
        prog_frame.pack(fill=tk.X, padx=40, pady=5)
        self.progress_var = tk.DoubleVar()
        style = ttk.Style()
        style.theme_use('default')
        style.configure("TProgressbar", thickness=15, background='#4ade80', troughcolor='#1e293b')
        self.progress_bar = ttk.Progressbar(prog_frame, variable=self.progress_var, maximum=100, mode='determinate', style="TProgressbar")
        self.progress_bar.pack(fill=tk.X, expand=True)

        log_frame = tk.Frame(self.root, bg="#0f172a")
        log_frame.pack(fill=tk.BOTH, expand=True, padx=40, pady=10)
        
        self.log_area = tk.Text(log_frame, bg="#020617", fg="#34d399", font=("Consolas", 11), state=tk.DISABLED, relief=tk.FLAT, wrap=tk.NONE)
        log_vs = ttk.Scrollbar(log_frame, orient=tk.VERTICAL, command=self.log_area.yview)
        log_hs = ttk.Scrollbar(log_frame, orient=tk.HORIZONTAL, command=self.log_area.xview)
        self.log_area.configure(yscrollcommand=log_vs.set, xscrollcommand=log_hs.set)
        self.log_area.grid(row=0, column=0, sticky="nsew")
        log_vs.grid(row=0, column=1, sticky="ns")
        log_hs.grid(row=1, column=0, sticky="ew")
        log_frame.grid_rowconfigure(0, weight=1)
        log_frame.grid_columnconfigure(0, weight=1)

        footer = tk.Label(self.root, text="版權所有 © 2026 PandaPanda的AI日常 All Rights Reserved.", font=("Microsoft JhengHei", 10), bg="#0f172a", fg="#64748b", cursor="hand2")
        footer.pack(pady=5)
        footer.bind("<Button-1>", lambda e: __import__('webbrowser').open("https://pandapanda6666.github.io"))

        # 自動啟動背景守護進程 (如果沒在運行的話)
        try:
            import subprocess
            # 不限於 pythonw.exe，只要命令列包含 remote_daemon.pyw 就視為已運行
            daemon_check = subprocess.check_output('wmic process where "commandline like \'%remote_daemon.pyw%\'" get processid', shell=True).decode('cp950', errors='ignore')
            if "ProcessId" not in daemon_check:
                # 尋找與當前 Python 解譯器相同目錄下的 pythonw.exe 或是 PandaPython.exe
                python_dir = os.path.dirname(sys.executable)
                import shutil
                pythonw_path = os.path.join(python_dir, "pythonw.exe")
                panda_daemon_path = os.path.join(python_dir, "PandaPythonw.exe")
                if os.path.exists(pythonw_path) and not os.path.exists(panda_daemon_path):
                    try: shutil.copy(pythonw_path, panda_daemon_path)
                    except: pass
                exe_to_use = panda_daemon_path if os.path.exists(panda_daemon_path) else (pythonw_path if os.path.exists(pythonw_path) else sys.executable)
                subprocess.Popen([exe_to_use, "remote_daemon.pyw"], creationflags=0x08000000)
        except: pass

        # 自動啟動背景守護進程 (如果沒在運行的話)
        try:
            import subprocess
            # 不限於 pythonw.exe，只要命令列包含 remote_daemon.pyw 就視為已運行
            daemon_check = subprocess.check_output('wmic process where "commandline like \'%remote_daemon.pyw%\'" get processid', shell=True).decode('cp950', errors='ignore')
            if "ProcessId" not in daemon_check:
                # 尋找與當前 Python 解譯器相同目錄下的 pythonw.exe 或是 PandaPython.exe
                python_dir = os.path.dirname(sys.executable)
                import shutil
                pythonw_path = os.path.join(python_dir, "pythonw.exe")
                panda_daemon_path = os.path.join(python_dir, "PandaPythonw.exe")
                if os.path.exists(pythonw_path) and not os.path.exists(panda_daemon_path):
                    try: shutil.copy(pythonw_path, panda_daemon_path)
                    except: pass
                exe_to_use = panda_daemon_path if os.path.exists(panda_daemon_path) else (pythonw_path if os.path.exists(pythonw_path) else sys.executable)
                subprocess.Popen([exe_to_use, "remote_daemon.pyw"], creationflags=0x08000000)
        except: pass

        try:
            import socket, os
            self.app_lock_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.app_lock_socket.bind(('127.0.0.1', 48922))
        except OSError:
            import tkinter.messagebox
            tkinter.messagebox.showerror("錯誤", "PandaPanda 管理面板已經在運行中！\n請檢查右下角系統匣或工作管理員。")
            self.root.destroy()
            import os; os._exit(0)

        try:
            import socket
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            result = s.connect_ex(('127.0.0.1', 48921))
            self.is_background_hooked = (result == 0)
            s.close()
        except:
            self.is_background_hooked = False

        self.log("[系統] PandaPanda 管理面板準備就緒。")
        if not self.github_config.get("token"): self.log("[提醒] 您尚未設定 GitHub 聯動，請先設定。\n")
        
        if not self.is_background_hooked:
            self.root.after(1500, self.one_click_start)
        else:
            self.log("\n[系統] 偵測到背景伺服器已在運行，成功接管狀態！")
            try:
                import os, threading, time
                log_path1 = os.path.join(os.path.dirname(os.path.abspath(__file__)), "server_out.log")
                
                def tail_logs(path, prefix):
                    if not os.path.exists(path): return
                    with open(path, "r", encoding="utf-8") as f:
                        f.seek(0, 2)
                        while self.is_running:
                            line = f.readline()
                            if not line:
                                time.sleep(0.1); continue
                            if prefix == "[伺服器]":
                                self.log(f"{prefix} {line.strip()}")
                
                threading.Thread(target=tail_logs, args=(log_path1, "[伺服器]"), daemon=True).start()
            except: pass
            
            try:
                import os
                url_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "current_url.txt")
                if os.path.exists(url_file):
                    with open(url_file, "r", encoding="utf-8") as uf:
                        self.current_url = uf.read().strip()
                        self.url_var.set(self.current_url)
            except: pass
        self.root.after(20000, self.check_health_loop)
        self.root.after(10000, self.poll_broadcasts)
        self.root.after(1000, self.check_remote_command)
        self.root.after(2000, self.check_hot_patch)

    def load_config(self):
        conf = {"token": "", "repo": "", "path": "server_url.txt", "cf_path": "monitor_url.txt", "ngrok_domain": "tile-amber-unit.ngrok-free.dev", "use_ngrok": True, "use_cf": False, "tunnel_routes": {}, "opt_url": True, "opt_known": True, "opt_unknown": True, "opt_timer": False, "opt_health": True, "opt_backend": True, "timer_min": 120}
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r', encoding='utf-8') as f: conf.update(json.load(f))
            except: pass
        return conf

    def save_config(self, *args):
        try: min_val = self.timer_minutes.get()
        except: min_val = 120
        new_conf = { "token": self.github_config.get("token", ""), "repo": self.github_config.get("repo", ""), "path": self.github_config.get("path", "server_url.txt"), "cf_path": self.github_config.get("cf_path", "monitor_url.txt"), "ngrok_domain": self.github_config.get("ngrok_domain", "tile-amber-unit.ngrok-free.dev"), "use_ngrok": getattr(self, 'var_use_ngrok', __import__('tkinter').BooleanVar(value=True)).get(), "use_cf": getattr(self, 'var_use_cf', __import__('tkinter').BooleanVar(value=False)).get(), "opt_url": self.github_config.get("opt_url", True), "opt_known": self.var_known_err.get() if hasattr(self, 'var_known_err') else True, "opt_unknown": self.var_unknown_err.get(), "opt_health": self.var_health_check.get(), "opt_backend": self.var_backend_err.get(), "opt_timer": self.var_timer.get(), "timer_min": min_val, "mc_jar": self.github_config.get("mc_jar", ""), "mc_mem": self.github_config.get("mc_mem", "4"), "tunnel_routes": getattr(self, "tunnel_routes", self.github_config.get("tunnel_routes", {})) }
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f: json.dump(new_conf, f, ensure_ascii=False, indent=4)
        self.github_config = new_conf
        self.tunnel_routes = new_conf.get("tunnel_routes", {})

    def check_timer(self):
        if getattr(self, 'is_background_hooked', False):
            self.timer_check_id = self.root.after(5000, self.check_timer)
            return
        if self.is_running and self.var_timer.get():
            try:
                mins = self.timer_minutes.get()
                if time.time() - self.last_start_time >= mins * 60:
                    self.log(f"\n[防護] 已達定時重啟設定 ({mins} 分鐘)，觸發自動重啟...")
                    self.restart_services()
                    return
            except: pass
        self.timer_check_id = self.root.after(5000, self.check_timer)

    def test_tunnel_reachable(self, url, max_retries=3, delay=2):
        if not url: return False
        headers = {"ngrok-skip-browser-warning": "true", "User-Agent": "Mozilla/5.0", "Connection": "close"}
        for attempt in range(max_retries):
            try:
                res = requests.get(url.rstrip("/") + "/api/ping", headers=headers, timeout=6)
                if res.status_code == 200:
                    return True
            except: pass
            if attempt < max_retries - 1:
                time.sleep(delay)
        return False

    def switch_to_cloudflare(self, reason="Ngrok 連線失敗"):
        if getattr(self, 'is_failover_to_cf', False):
            return
        cf_url = getattr(self, 'cf_current_url', None)
        if not cf_url:
            self.log("      ⏳ 正在等待 Cloudflare 備援隧道就緒...")
            for _ in range(15):
                time.sleep(1)
                cf_url = getattr(self, 'cf_current_url', None)
                if cf_url: break
                
        if not cf_url:
            self.log(f"      ❌ {reason}，且 Cloudflare 備援通道尚未取得網址，無法切換！")
            return

        self.is_failover_to_cf = True
        self.current_url = cf_url
        self.health_fail_count = 0
        self.root.after(0, lambda: self.url_var.set(f"[CF備援] {cf_url}"))
        
        try:
            with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "current_url.txt"), "w", encoding="utf-8") as uf:
                uf.write(cf_url)
        except: pass

        ai_notify_msg = f"""[AI通報 - 穿透容錯切換]
時間: {time.strftime('%Y-%m-%d %H:%M:%S')}
事件: NGROK_FAILED_SWITCHED_TO_CLOUDFLARE
原因: {reason} (經多次主動重試仍無法連線)
切換目標: Cloudflare 備援通道 ({cf_url})
處理動作: 已自動將 GitHub 所有站點的 server_url.txt 同步指向 Cloudflare 備援網址，確保前端運作正常
"""
        self.log("\n" + "="*45)
        self.log(f"[AI通知] 🚨 {reason} (多次重試無效)")
        self.log(f"[AI通知] 🔄 已自動暫時切換為 Cloudflare 備援通道: {cf_url}")
        self.log(f"[AI通知] 📢 正在將 Cloudflare 備援網址推送至各站點...")
        self.log("="*45 + "\n")

        # 專門通報給 AI 紀錄 (不在使用者螢幕彈出視窗)
        try:
            notify_paths = [
                os.path.join(os.path.dirname(os.path.abspath(__file__)), "ai_notification.txt"),
                r"C:\Users\User\.gemini\config\對話紀錄\AI通知.txt"
            ]
            for np in notify_paths:
                try:
                    os.makedirs(os.path.dirname(np), exist_ok=True)
                    with open(np, "w", encoding="utf-8") as nf:
                        nf.write(ai_notify_msg)
                except: pass
        except: pass

        self.save_error_log(f"Ngrok連線失敗已暫時切換Cloudflare: {cf_url}")

        paths_to_update = getattr(self, 'ngrok_paths', ["server_url.txt"])
        main_path = self.github_config.get("path")
        for path in paths_to_update:
            threading.Thread(target=self.push_to_github_and_wait, args=(cf_url, path), kwargs={"silent": True}, daemon=True).start()
        if main_path and main_path not in paths_to_update:
            threading.Thread(target=self.push_to_github_and_wait, args=(cf_url, main_path), kwargs={"silent": True}, daemon=True).start()

    def _verify_ngrok_startup(self, ngrok_url):
        time.sleep(3)
        if not self.is_running: return
        if not self.test_tunnel_reachable(ngrok_url, max_retries=3, delay=2):
            self.log("      ⚠️ Ngrok 啟動後初次連線檢測異常，正在主動重試連線...")
            if not self.test_tunnel_reachable(ngrok_url, max_retries=3, delay=2):
                self.switch_to_cloudflare("Ngrok 啟動後無法連通")

    def check_health_loop(self):
        if getattr(self, 'is_background_hooked', False):
            self.root.after(20000, self.check_health_loop)
            return
        if self.is_running and self.current_url and self.var_health_check.get():
            def do_ping():
                is_cf_failover = getattr(self, 'is_failover_to_cf', False)
                ngrok_url = getattr(self, 'ngrok_url', None)

                # 若目前處於 Cloudflare 備援狀態，每隔 60 秒在背景探測 Ngrok 是否已自癒恢復
                if is_cf_failover and ngrok_url:
                    last_probe = getattr(self, 'last_ngrok_probe_time', 0)
                    if time.time() - last_probe > 60:
                        self.last_ngrok_probe_time = time.time()
                        if self.test_tunnel_reachable(ngrok_url, max_retries=2, delay=2):
                            self.is_failover_to_cf = False
                            self.current_url = ngrok_url
                            self.health_fail_count = 0
                            self.root.after(0, lambda: self.url_var.set(ngrok_url))
                            try:
                                with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "current_url.txt"), "w", encoding="utf-8") as uf:
                                    uf.write(ngrok_url)
                            except: pass
                            ai_recover_msg = f"""[AI通報 - 穿透自動自癒恢復]
時間: {time.strftime('%Y-%m-%d %H:%M:%S')}
事件: NGROK_RECOVERED_SWITCHED_BACK
通道: Ngrok 主通道 ({ngrok_url})
處理動作: 偵測到 Ngrok 已恢復正常連線，已自動切換回 Ngrok 並同步更新 GitHub 網址
"""
                            self.log(f"\n[AI通知] 🎉 偵測到 Ngrok 通道已完全恢復連線！已自動切換回 Ngrok 主網域 ({ngrok_url})")
                            try:
                                notify_paths = [
                                    os.path.join(os.path.dirname(os.path.abspath(__file__)), "ai_notification.txt"),
                                    r"C:\Users\User\.gemini\config\對話紀錄\AI通知.txt"
                                ]
                                for np in notify_paths:
                                    try:
                                        os.makedirs(os.path.dirname(np), exist_ok=True)
                                        with open(np, "w", encoding="utf-8") as nf:
                                            nf.write(ai_recover_msg)
                                    except: pass
                            except: pass
                            paths_to_update = getattr(self, 'ngrok_paths', ["server_url.txt"])
                            for path in paths_to_update:
                                threading.Thread(target=self.push_to_github_and_wait, args=(ngrok_url, path), kwargs={"silent": True}, daemon=True).start()
                            return

                try:
                    headers = {"ngrok-skip-browser-warning": "true", "User-Agent": "Mozilla/5.0", "Connection": "close"}
                    res = requests.get(self.current_url.rstrip("/") + "/api/ping", headers=headers, timeout=10)
                    if res.status_code != 200: 
                        is_cf = ".trycloudflare.com" in self.current_url
                        if is_cf and (time.time() - getattr(self, 'cf_start_time', 0) < 60):
                            pass
                        else:
                            self.health_fail_count += 1
                            self.root.after(0, lambda: self.log(f"[系統警告] 健康檢查 API 回應異常 (HTTP {res.status_code})"))
                    else: 
                        self.health_fail_count = 0
                except Exception as e:
                    error_msg = str(e)
                    is_cf = ".trycloudflare.com" in self.current_url
                    if "SSLEOFError" in error_msg or "EOF occurred in violation of protocol" in error_msg:
                        self.health_fail_count = 0
                    elif is_cf and (time.time() - getattr(self, 'cf_start_time', 0) < 60):
                        pass
                    else:
                        self.health_fail_count += 1
                        self.root.after(0, lambda msg=error_msg: self.log(f"[系統警告] 健康檢查 API 無法連線: {msg}"))

                # 當處於 Ngrok 主通道且連續 2 次以上健康檢查失敗時，進行連續重試驗證；失敗則無縫切換到 Cloudflare
                if not is_cf_failover and ngrok_url and self.current_url == ngrok_url and self.health_fail_count >= 2:
                    self.log("[系統檢測] 偵測到 Ngrok 通道連線異常，正在進行連續重試驗證...")
                    if not self.test_tunnel_reachable(ngrok_url, max_retries=3, delay=2):
                        self.switch_to_cloudflare("Ngrok 通道無回應或連線中斷")
                        return
                    else:
                        self.health_fail_count = 0

                if self.health_fail_count >= 15:
                    try:
                        local_res = requests.get("http://127.0.0.1:48921/api/ping", timeout=3)
                        if local_res.status_code == 200:
                            self.health_fail_count = 0
                            self.root.after(0, lambda: self.log("[系統提醒] 外網通道暫時波動，但本地核心伺服器運作正常，不觸發中斷重啟。"))
                            return
                    except: pass
                    self.health_fail_count = 0
                    self.root.after(0, lambda: self.log("\n[防護] 偵測到伺服器無回應，觸發緊急重啟..."))
                    self.root.after(0, lambda: self.save_error_log("伺服器無回應或連線中斷"))
                    self.root.after(0, self.restart_services)
            threading.Thread(target=do_ping, daemon=True).start()
        self.root.after(20000, self.check_health_loop)

    def poll_broadcasts(self):
        if self.is_running:
            try:
                res = requests.get(f"{LOCAL_API}/broadcasts", timeout=3)
                if res.status_code == 200:
                    b_data = res.json().get('broadcasts', [])
                    current_hash = hash(json.dumps(b_data, sort_keys=True))
                    if self.last_broadcasts_hash != current_hash:
                        if self.last_broadcasts_hash is not None:
                            self.push_broadcast_to_github(b_data)
                            if hasattr(self, 'refresh_broadcast_tree'): self.refresh_broadcast_tree()
                        self.last_broadcasts_hash = current_hash
            except: pass
        self.root.after(10000, self.poll_broadcasts)

    def check_remote_command(self):
        if self.is_running:
            try:
                import os
                if os.path.exists("current_url.txt"):
                    with open("current_url.txt", "r", encoding="utf-8") as uf:
                        url = uf.read().strip()
                    if url and url != self.current_url:
                        self.current_url = url
                        self.url_var.set(url)
            except: pass

            cmd_file = "remote_command.txt"
            if os.path.exists(cmd_file):
                try:
                    try:
                        with open(cmd_file, 'r', encoding='utf-8', errors='ignore') as f:
                            lines = f.readlines()
                    finally:
                        try: os.remove(cmd_file)
                        except: pass
                    for line in lines:
                        cmd = line.strip()
                        if cmd:
                            self.log(f"[系統] 收到遠端指令: {cmd}")
                            if cmd == "start_mc" and hasattr(self, 'start_mc'): self.start_mc()
                            elif cmd == "stop_mc" and hasattr(self, 'stop_mc'): self.stop_mc()
                            elif cmd == "restart_system": self.restart_services()
                            elif cmd == "open_account" and hasattr(self, 'open_account_manager'): self.open_account_manager()
                            elif cmd == "open_settings" and hasattr(self, 'open_settings'): self.open_settings()
                except Exception as e: self.log(f"[錯誤] 解析遠端指令失敗: {e}")
        self.root.after(1000, self.check_remote_command)

    def check_hot_patch(self):
        if self.is_running:
            patch_file = "hot_patch.py"
            if os.path.exists(patch_file):
                try:
                    with open(patch_file, 'r', encoding='utf-8') as f: code = f.read()
                    os.remove(patch_file)
                    local_vars = {'self': self, 'tk': tk, 'os': os, 'sys': sys, 'json': json, 'requests': requests, 'subprocess': subprocess, 'threading': threading, 'time': time}
                    exec(code, globals(), local_vars)
                    self.log("[系統] 🔥 黑科技：熱更新補丁已成功注入並執行！")
                except Exception as e: self.log(f"[錯誤] 熱更新補丁注入失敗: {e}")
        self.root.after(2000, self.check_hot_patch)

    def restart_services(self):
        import traceback
        with open("restart_debug.txt", "a", encoding="utf-8") as df:
            df.write("RESTART CALLED AT:\n" + "".join(traceback.format_stack()) + "\n\n")
        if self.is_restarting: return
        self.is_restarting = True
        self.is_running = False
        self.log("\n[系統] 正在執行防護機制：關閉並重新啟動整個面板...")
        self.stop_all(silent=True, force=True)
        def do_relaunch():
            time.sleep(2)
            subprocess.Popen([sys.executable] + sys.argv, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=0x00000208)
            os._exit(0)
        threading.Thread(target=do_relaunch, daemon=False).start()
        self.root.destroy()

    def open_settings(self):
        set_win = tk.Toplevel(self.root)
        set_win.title("GitHub 聯動設定")
        set_win.geometry("600x600")
        set_win.configure(bg="#1e293b")
        tk.Label(set_win, text="⚙️ GitHub 聯動設定", font=("Microsoft JhengHei", 18, "bold"), bg="#1e293b", fg="#818cf8").pack(pady=20)
        tk.Label(set_win, text="1. 輸入 GitHub Token:", bg="#1e293b", fg="#fcd34d", font=("Microsoft JhengHei", 12, "bold")).pack(pady=(10,5))
        token_entry = tk.Entry(set_win, width=50, show="*", font=("Consolas", 11), bg="#0f172a", fg="white", relief=tk.FLAT, insertbackground="white")
        token_entry.insert(0, self.github_config.get("token", ""))
        token_entry.pack(pady=5, ipady=5)
        self.repo_var = tk.StringVar(value=self.github_config.get("repo", ""))
        self.path_var = tk.StringVar(value=self.github_config.get("path", "server_url.txt"))
        def open_browser():
            if not token_entry.get().strip(): return messagebox.showerror("錯誤", "請先輸入 Token！", parent=set_win)
            self.show_github_browser(set_win, token_entry.get().strip())
        tk.Button(set_win, text="🔍 登入並選擇路徑", bg="#3b82f6", fg="white", font=("Microsoft JhengHei", 12, "bold"), command=open_browser, relief=tk.FLAT, padx=20, pady=5).pack(pady=15)
        tk.Label(set_win, text="目標儲存庫:", bg="#1e293b", fg="#cbd5e1", font=("Microsoft JhengHei", 11)).pack(pady=(15,5))
        tk.Entry(set_win, textvariable=self.repo_var, state='readonly', width=50, font=("Consolas", 11), bg="#0f172a", fg="#94a3b8", relief=tk.FLAT).pack(pady=5, ipady=5)
        tk.Label(set_win, text="存放路徑 (預設 server_url.txt):", bg="#1e293b", fg="#cbd5e1", font=("Microsoft JhengHei", 11)).pack(pady=(10,5))
        tk.Entry(set_win, textvariable=self.path_var, width=50, font=("Consolas", 11), bg="#0f172a", fg="white", relief=tk.FLAT, insertbackground="white").pack(pady=5, ipady=5)
        def save():
            self.github_config["token"] = token_entry.get().strip()
            self.github_config["repo"] = self.repo_var.get().strip()
            self.github_config["path"] = self.path_var.get().strip()
            if not all([self.github_config["token"], self.github_config["repo"], self.github_config["path"]]): return messagebox.showerror("錯誤", "皆為必填！", parent=set_win)
            self.save_config()
            self.log("[系統] GitHub 設定已儲存！")
            set_win.destroy()
        tk.Button(set_win, text="💾 儲存並關閉", bg="#10b981", fg="white", font=("Microsoft JhengHei", 14, "bold"), command=save, relief=tk.FLAT, padx=30, pady=10).pack(pady=30)

    def show_github_browser(self, parent_win, token):
        browser_win = tk.Toplevel(parent_win)
        browser_win.title("GitHub 儲存庫瀏覽器")
        browser_win.geometry("900x600")
        browser_win.configure(bg="#0f172a")
        status_label = tk.Label(browser_win, text="🔄 正在連線至 GitHub...", bg="#0f172a", fg="#fcd34d", font=("Microsoft JhengHei", 11, "bold"))
        status_label.pack(side=tk.BOTTOM, fill=tk.X, pady=5)
        left_frame = tk.Frame(browser_win, bg="#0f172a", width=300)
        left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=15, pady=15)
        right_frame = tk.Frame(browser_win, bg="#0f172a")
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=15, pady=15)
        tk.Label(left_frame, text="您的儲存庫", bg="#0f172a", fg="#818cf8", font=("Microsoft JhengHei", 12, "bold")).pack(pady=(0,10))
        repo_listbox = tk.Listbox(left_frame, bg="#1e293b", fg="#e2e8f0", font=("Consolas", 11), selectbackground="#3b82f6", relief=tk.FLAT, borderwidth=0)
        repo_listbox.pack(fill=tk.BOTH, expand=True)
        tk.Label(right_frame, text="檔案結構", bg="#0f172a", fg="#818cf8", font=("Microsoft JhengHei", 12, "bold")).pack(pady=(0,10))
        
        style = ttk.Style()
        style.configure("Treeview", background="#1e293b", foreground="#e2e8f0", fieldbackground="#1e293b", borderwidth=0, font=("Consolas", 11))
        style.map('Treeview', background=[('selected', '#3b82f6')])
        tree = ttk.Treeview(right_frame, columns=('type', 'path', 'repo'), show='tree')
        tree.pack(fill=tk.BOTH, expand=True)
        headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"}
        def fetch_repos():
            try:
                res = requests.get("https://api.github.com/user/repos?per_page=100&sort=updated", headers=headers)
                if res.status_code == 200:
                    repos = [repo['full_name'] for repo in res.json()]
                    def update_ui():
                        repo_listbox.delete(0, tk.END)
                        for r in repos: repo_listbox.insert(tk.END, r)
                        status_label.config(text=f"✅ 成功載入 {len(repos)} 個儲存庫", fg="#4ade80")
                    browser_win.after(0, update_ui)
                elif res.status_code == 401: browser_win.after(0, lambda: status_label.config(text="❌ Token 無效或已過期", fg="#ef4444"))
                else: browser_win.after(0, lambda: status_label.config(text=f"❌ API 錯誤 ({res.status_code})", fg="#ef4444"))
            except Exception as e: browser_win.after(0, lambda: status_label.config(text=f"❌ 網路連線失敗: {str(e)}", fg="#ef4444"))
                
        def load_tree(repo_full_name):
            browser_win.after(0, lambda: status_label.config(text=f"🔄 正在讀取 {repo_full_name} ...", fg="#fcd34d"))
            try:
                res_repo = requests.get(f"https://api.github.com/repos/{repo_full_name}", headers=headers)
                if res_repo.status_code == 200:
                    default_branch = res_repo.json().get('default_branch', 'main')
                    res_tree = requests.get(f"https://api.github.com/repos/{repo_full_name}/git/trees/{default_branch}?recursive=1", headers=headers)
                    if res_tree.status_code == 200:
                        tree_data = sorted(res_tree.json().get('tree', []), key=lambda x: len(x['path'].split('/')))
                        def update_tree_ui():
                            for i in tree.get_children(): tree.delete(i)
                            tree.insert('', 'end', 'root', text='/ (根目錄)', values=('tree', '', repo_full_name))
                            for item in tree_data:
                                parts = item['path'].split('/')
                                parent_id = 'root' if len(parts) == 1 else '/'.join(parts[:-1])
                                display_text = f"📁 {parts[-1]}" if item['type'] == 'tree' else f"📄 {parts[-1]}"
                                try: tree.insert(parent_id, 'end', item['path'], text=display_text, values=(item['type'], item['path'], repo_full_name))
                                except: pass
                            status_label.config(text=f"✅ 成功載入 {repo_full_name}", fg="#4ade80")
                        browser_win.after(0, update_tree_ui)
                    else: browser_win.after(0, lambda: status_label.config(text=f"❌ 無法讀取檔案結構 ({res_tree.status_code})", fg="#ef4444"))
                else: browser_win.after(0, lambda: status_label.config(text=f"❌ 無法存取儲存庫 ({res_repo.status_code})", fg="#ef4444"))
            except Exception as e: browser_win.after(0, lambda: status_label.config(text=f"❌ 網路連線失敗: {str(e)}", fg="#ef4444"))
                
        repo_listbox.bind('<<ListboxSelect>>', lambda e: threading.Thread(target=load_tree, args=(repo_listbox.get(repo_listbox.curselection()[0]),), daemon=True).start() if repo_listbox.curselection() else None)
        def confirm_selection():
            selected = tree.selection()
            if not selected: return messagebox.showwarning("提醒", "請選擇路徑！", parent=browser_win)
            vals = tree.item(selected[0], 'values')
            final_path = "server_url.txt" if selected[0] == 'root' else f"{vals[1]}/server_url.txt" if vals[0] == 'tree' else vals[1]
            self.repo_var.set(vals[2])
            self.path_var.set(final_path)
            browser_win.destroy()
        tk.Button(right_frame, text="✔️ 確定選擇", bg="#10b981", fg="white", font=("Microsoft JhengHei", 12, "bold"), command=confirm_selection, relief=tk.FLAT, pady=10).pack(fill=tk.X, pady=(15,0))
        threading.Thread(target=fetch_repos, daemon=True).start()

    def edit_user_profile(self, parent_win, username, refresh_callback):
        if not username: return
        try:
            res = requests.get(f"{LOCAL_API}/users", timeout=3)
            data = res.json()
            user_data = data.get('users', {}).get(username)
            if not user_data: return messagebox.showerror("錯誤", "無法獲取此玩家的詳細資料！", parent=parent_win)
        except Exception as e: return messagebox.showerror("錯誤", f"無法連線至伺服器：{e}", parent=parent_win)

        edit_win = tk.Toplevel(parent_win)
        edit_win.title(f"檢視與編輯詳細資料 - {username}")
        edit_win.geometry("550x700")
        edit_win.configure(bg="#1e293b")

        tk.Label(edit_win, text=f"👤 {username} 的個人檔案", font=("Microsoft JhengHei", 18, "bold"), bg="#1e293b", fg="#818cf8").pack(pady=15)

        avatar_frame = tk.Frame(edit_win, bg="#1e293b")
        avatar_frame.pack(pady=10)
        lbl_avatar = tk.Label(avatar_frame, bg="#1e293b")
        lbl_avatar.pack(side=tk.LEFT, padx=15)
        new_avatar_base64 = [user_data.get('avatar', '')]

        def load_base64_image(b64_str, max_size=(100, 100)):
            def create_solid_fallback():
                img = Image.new("RGB", max_size, "#cbd5e1")
                return ImageTk.PhotoImage(img)
            if not b64_str or "image/svg+xml" in b64_str: return create_solid_fallback()
            try:
                if b64_str.startswith("http://") or b64_str.startswith("https://"):
                    response = requests.get(b64_str, timeout=5)
                    img_data = response.content
                else:
                    if "," in b64_str: b64_str = b64_str.split(",")[1]
                    img_data = base64.b64decode(b64_str)
                img = Image.open(BytesIO(img_data))
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
                return ImageTk.PhotoImage(img)
            except Exception as e: return create_solid_fallback()

        initial_img = load_base64_image(new_avatar_base64[0])
        lbl_avatar.config(image=initial_img, text="")
        lbl_avatar.image = initial_img

        def pick_image():
            filepath = filedialog.askopenfilename(title="選擇新大頭貼", filetypes=[("Image files", "*.jpg *.jpeg *.png")], parent=edit_win)
            if filepath:
                try:
                    img = Image.open(filepath)
                    img.thumbnail((200, 200), Image.Resampling.LANCZOS)
                    buffered = BytesIO()
                    img.convert('RGB').save(buffered, format="JPEG", quality=80)
                    b64_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
                    new_avatar_base64[0] = f"data:image/jpeg;base64,{b64_str}"
                    img_preview = load_base64_image(new_avatar_base64[0])
                    lbl_avatar.config(image=img_preview, text="")
                    lbl_avatar.image = img_preview
                except Exception as e: messagebox.showerror("錯誤", f"讀取圖片失敗: {e}", parent=edit_win)

        btn_avatar_frame = tk.Frame(avatar_frame, bg="#1e293b")
        btn_avatar_frame.pack(side=tk.LEFT, padx=10)
        tk.Button(btn_avatar_frame, text="📁 更換圖片", bg="#3b82f6", fg="white", font=("Microsoft JhengHei", 10, "bold"), command=pick_image, relief=tk.FLAT, width=12).pack(pady=5)
        tk.Button(btn_avatar_frame, text="🗑️ 刪除圖片", bg="#ef4444", fg="white", font=("Microsoft JhengHei", 10, "bold"), command=lambda: (new_avatar_base64.__setitem__(0, ""), lbl_avatar.config(image=load_base64_image(""), text=""), setattr(lbl_avatar, 'image', load_base64_image(""))), relief=tk.FLAT, width=12).pack(pady=5)

        form_frame = tk.Frame(edit_win, bg="#1e293b")
        form_frame.pack(fill=tk.BOTH, expand=True, padx=20)
        fields = [("公開暱稱", "nickname", user_data.get('nickname', '')), ("真實姓名", "realName", user_data.get('realName', '')), ("登入密碼", "password", user_data.get('password', '')), ("電子信箱", "gmail", user_data.get('gmail', '')), ("性別", "gender", user_data.get('gender', '')), ("生日", "birthday", user_data.get('birthday', '')), ("聯絡電話", "phone", user_data.get('phone', '')), ("玩家等級", "level", str(user_data.get('level', 1))), ("目前經驗", "exp", str(user_data.get('exp', 0))), ("帳戶 P 幣", "p_coin", str(user_data.get('p_coin', 0)))]
        entries = {}
        for i, (label_text, key, val) in enumerate(fields):
            row = i // 2; col = (i % 2) * 2
            tk.Label(form_frame, text=label_text, font=("Microsoft JhengHei", 11, "bold"), bg="#1e293b", fg="#cbd5e1").grid(row=row, column=col, sticky=tk.E, padx=5, pady=10)
            if key == "gender":
                ent = ttk.Combobox(form_frame, values=["男", "女", "其他"], font=("Microsoft JhengHei", 11), width=18, state="readonly")
                if val: ent.set(val)
                ent.grid(row=row, column=col+1, sticky=tk.W, padx=5, pady=10)
            else:
                ent = tk.Entry(form_frame, font=("Microsoft JhengHei", 11), width=20, bg="#0f172a", fg="white", insertbackground="white", relief=tk.FLAT)
                ent.insert(0, val)
                if key == "password" and val == "GOOGLE_AUTH": ent.config(state="readonly", fg="#94a3b8")
                ent.grid(row=row, column=col+1, sticky=tk.W, padx=5, pady=10, ipady=3)
            entries[key] = ent

        def save_changes():
            new_data = {}
            for key, ent in entries.items():
                val = ent.get().strip()
                if key in ['level', 'exp', 'p_coin']:
                    try: val = int(val)
                    except: pass
                new_data[key] = val
            new_data['avatar'] = new_avatar_base64[0]
            try:
                res = requests.post(f"{LOCAL_API}/users/update", json={"username": username, "data": new_data}, timeout=3)
                if res.status_code == 200 and res.json().get('success'):
                    messagebox.showinfo("成功", "✅ 玩家資料已成功更新並生效！", parent=edit_win)
                    refresh_callback()
                    edit_win.destroy()
                else: messagebox.showerror("錯誤", "更新失敗", parent=edit_win)
            except Exception as e: messagebox.showerror("錯誤", f"連線至伺服器發生錯誤：{e}", parent=edit_win)
        tk.Button(edit_win, text="💾 儲存並套用變更", bg="#10b981", fg="white", font=("Microsoft JhengHei", 14, "bold"), command=save_changes, relief=tk.FLAT, padx=20, pady=5).pack(pady=20)

    def open_account_manager(self):
        mgr_win = tk.Toplevel(self.root)
        mgr_win.title("PandaPanda的AI日常 - 系統與權限管理")
        mgr_win.geometry("1650x850")
        mgr_win.configure(bg="#0f172a")
        
        style = ttk.Style()
        style.configure("TNotebook", background="#0f172a", borderwidth=0)
        style.configure("TNotebook.Tab", background="#1e293b", foreground="#cbd5e1", padding=[15, 8], font=("Microsoft JhengHei", 11))
        style.map("TNotebook.Tab", background=[("selected", "#3b82f6")], foreground=[("selected", "white")])
        
        tab_control = ttk.Notebook(mgr_win)
        tab_users = tk.Frame(tab_control, bg="#0f172a")
        tab_history = tk.Frame(tab_control, bg="#0f172a")
        tab_issues = tk.Frame(tab_control, bg="#0f172a")
        tab_errors = tk.Frame(tab_control, bg="#0f172a")
        tab_apps = tk.Frame(tab_control, bg="#0f172a")
        tab_broadcast = tk.Frame(tab_control, bg="#0f172a")
        tab_settings = tk.Frame(tab_control, bg="#0f172a")
        tab_prompt_gen = tk.Frame(tab_control, bg="#0f172a")
        tab_shop = tk.Frame(tab_control, bg="#0f172a")
        tab_mc_server = tk.Frame(tab_control, bg="#0f172a")
        
        tab_control.add(tab_users, text='🧑‍💻 帳號與權限')
        tab_control.add(tab_history, text='📜 歷史紀錄')
        tab_control.add(tab_issues, text='🚨 問題回報')
        tab_control.add(tab_errors, text='❌ 錯誤診斷')
        tab_control.add(tab_apps, text='🌐 網頁部署')
        tab_control.add(tab_broadcast, text='📢 跑馬燈與廣播排程')
        tab_control.add(tab_settings, text='🌐 CORS 白名單')
        tab_control.add(tab_prompt_gen, text='🪄 提示詞生成')
        tab_control.add(tab_shop, text='🏪 商城管理')
        tab_control.add(tab_mc_server, text='⛏️ MC開服專區')
        tab_control.pack(expand=1, fill="both", padx=10, pady=10)
        
        # --- 帳號管理 ---
        top_frame = tk.Frame(tab_users, bg="#0f172a")
        top_frame.pack(fill=tk.X, padx=10, pady=10)
        tk.Label(top_frame, text="註冊用戶清單", font=("Microsoft JhengHei", 18, "bold"), bg="#0f172a", fg="#818cf8").pack(side=tk.LEFT)
        tk.Label(top_frame, text=" | 若想遠端隨時隨地操控此面板功能，請登入：https://pandapanda6666.github.io/server/manage", font=("Microsoft JhengHei", 12), bg="#0f172a", fg="#4ade80").pack(side=tk.LEFT, padx=10)

        tree_frame = tk.Frame(tab_users, bg="#1e293b")
        
        # Define action frame and pack it AT THE BOTTOM before tree_frame expands
        action_frame = tk.Frame(tab_users, bg="#1e293b", padx=10, pady=10)
        action_frame.pack(side=tk.BOTTOM, fill=tk.X, padx=10, pady=10)
        
        tree_frame.pack(side=tk.TOP, fill=tk.BOTH, expand=True, padx=10, pady=5)
        tree_style = ttk.Style()
        tree_style.configure("Custom.Treeview", background="#1e293b", foreground="white", fieldbackground="#1e293b", borderwidth=0, font=("Microsoft JhengHei", 11), rowheight=30)
        tree_style.configure("Custom.Treeview.Heading", background="#334155", foreground="black", font=("Microsoft JhengHei", 12, "bold"))
        tree_style.map('Custom.Treeview', background=[('selected', '#3b82f6')])
        tree = ttk.Treeview(tree_frame, columns=("username", "nickname", "level", "p_coin", "email", "online", "admin", "banned"), show='headings', style="Custom.Treeview")
        for col, text in zip(tree["columns"], ["系統帳號", "公開暱稱", "等級", "P幣", "綁定信箱", "狀態", "權限", "封鎖"]): 
            tree.heading(col, text=text)
            tree.column(col, width=200 if col == "email" else 80 if col == "p_coin" else 60 if col == "level" else 120, anchor=tk.CENTER if col != "email" else tk.W)
        tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar = ttk.Scrollbar(tree_frame, orient=tk.VERTICAL, command=tree.yview)
        tree.configure(yscroll=scrollbar.set)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        def get_sel(): sel = tree.selection(); return tree.item(sel[0], "values")[0] if sel else None
        
        def del_user():
            u = get_sel()
            if not u: return messagebox.showwarning("提醒", "請先選擇用戶")
            if messagebox.askyesno("確認", f"確定刪除用戶 {u}？"):
                try:
                    requests.post(f"{LOCAL_API}/users/delete", json={"username": u}, timeout=3)
                    refresh_list()
                except: pass
                
        def ban_user():
            u = get_sel()
            if not u: return messagebox.showwarning("提醒", "請先選擇用戶")
            m = simpledialog.askinteger("封鎖", "請輸入封鎖分鐘數 (0為永久，負數解鎖):", initialvalue=60)
            if m is not None:
                try:
                    requests.post(f"{LOCAL_API}/users/ban", json={"tgtUser": u, "minutes": m}, timeout=3)
                    refresh_list()
                except: pass

        def toggle_admin():
            u = get_sel()
            if not u: return messagebox.showwarning("提醒", "請先選擇用戶")
            if messagebox.askyesno("確認", f"確定要切換用戶 {u} 的管理員權限？"):
                try:
                    res = requests.get(f"{LOCAL_API}/users", timeout=3)
                    if res.status_code == 200:
                        data = res.json()
                        admins = data.get("admins", [])
                        is_admin = u in admins
                        requests.post(f"{LOCAL_API}/users/admin", json={"username": u, "isAdmin": not is_admin}, timeout=3)
                        refresh_list()
                except: pass

        tk.Button(action_frame, text="✏️ 詳細資料與編輯", bg="#8b5cf6", fg="white", font=("Microsoft JhengHei", 11, "bold"), command=lambda: self.edit_user_profile(mgr_win, get_sel(), refresh_list), relief=tk.FLAT, padx=10).pack(side=tk.LEFT, padx=5)
        tk.Button(action_frame, text="🗑️ 刪除選擇用戶", bg="#ef4444", fg="white", font=("Microsoft JhengHei", 11, "bold"), command=del_user, relief=tk.FLAT, padx=10).pack(side=tk.LEFT, padx=5)
        tk.Button(action_frame, text="⛔ 封鎖/解鎖", bg="#64748b", fg="white", font=("Microsoft JhengHei", 11, "bold"), command=ban_user, relief=tk.FLAT, padx=10).pack(side=tk.LEFT, padx=5)
        tk.Button(action_frame, text="👑 切換權限", bg="#f59e0b", fg="white", font=("Microsoft JhengHei", 11, "bold"), command=toggle_admin, relief=tk.FLAT, padx=10).pack(side=tk.LEFT, padx=5)

        # --- 歷史紀錄 ---
        tk.Label(tab_history, text="📜 系統操作與行為追蹤", font=("Microsoft JhengHei", 18, "bold"), bg="#0f172a", fg="#818cf8").pack(pady=(20,10), padx=20, anchor=tk.W)
        htree_frame = tk.Frame(tab_history, bg="#1e293b")
        htree_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=5)
        htree = ttk.Treeview(htree_frame, columns=("time", "location", "device", "user", "action", "details", "id"), displaycolumns=("time", "location", "device", "user", "action", "details"), show='headings', style="Custom.Treeview")
        for col, text, width in zip(("time", "location", "device", "user", "action", "details"), ["發生時間", "地點/IP", "連線裝置", "操作者", "動作類型", "詳細資訊"], [150, 150, 150, 100, 120, 350]):
            htree.heading(col, text=text); htree.column(col, width=width, anchor=tk.W if col in ["details", "location"] else tk.CENTER)
        htree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        hscrollbar = ttk.Scrollbar(htree_frame, orient=tk.VERTICAL, command=htree.yview)
        htree.configure(yscroll=hscrollbar.set)
        hscrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        def refresh_history():
            for i in htree.get_children(): htree.delete(i)
            try:
                res = requests.get(f"{LOCAL_API}/history", timeout=2).json()
                self.current_history_data = res.get('history', [])
                for log in self.current_history_data:
                    device_str = log.get('device', '未知')
                    if len(device_str) > 25: device_str = device_str[:22] + "..."
                    htree.insert("", tk.END, values=(log['time'], log.get('location', '未知'), device_str, log['user'], log['action'], log['details'], log.get('id', '')))
            except: pass
        h_action_frame = tk.Frame(tab_history, bg="#0f172a")
        h_action_frame.pack(fill=tk.X, padx=20, pady=10)
        tk.Button(h_action_frame, text="🔄 重新載入紀錄", bg="#3b82f6", fg="white", font=("Microsoft JhengHei", 12, "bold"), command=refresh_history, relief=tk.FLAT, padx=15).pack(side=tk.LEFT, padx=5)

        # --- 🚨 跑馬燈與廣播排程 ---
        tk.Label(tab_broadcast, text="📢 跑馬燈與廣播排程系統", font=("Microsoft JhengHei", 18, "bold"), bg="#0f172a", fg="#818cf8").pack(pady=(20,10), padx=20, anchor=tk.W)
        btree_frame = tk.Frame(tab_broadcast, bg="#1e293b")
        btree_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=5)
        btree = ttk.Treeview(btree_frame, columns=("id", "site", "mode", "time_info", "msg", "offline"), show='headings', style="Custom.Treeview")
        for col, text, width in zip(("id", "site", "mode", "time_info", "msg", "offline"), ["ID", "適用網站", "模式", "時間條件", "廣播訊息內容", "離線儲存"], [80, 110, 80, 230, 360, 80]):
            btree.heading(col, text=text); btree.column(col, width=width, anchor=tk.W if col=="msg" else tk.CENTER)
        btree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        def refresh_broadcast_tree():
            for i in btree.get_children(): btree.delete(i)
            try:
                res = requests.get(f"{LOCAL_API}/broadcasts", timeout=3).json()
                b_list = res.get('broadcasts', [])
                site_map = res.get('siteBroadcasts', {})
                site_names = {
                    "all": "全站廣播 (官網+全部)",
                    "main": "僅官網首頁",
                    "seeker": "探險者總覽",
                    "competition": "探險者大賽網",
                    "fanfic": "探險者同人文網",
                    "review": "探險者心得網",
                    "seekerpedia": "探險者百科",
                    "shop": "胖達商城"
                }
                for b in b_list:
                    s_label = site_names.get(b.get('site', 'all'), b.get('site', 'all'))
                    t_info = f"{b['startTime']} ~ {b['endTime']}" if b['mode'] == 2 else f"{b['startTime']} (重複 {b['repeatCount']} 次, 間隔 {b['intervalMin']} 分)"
                    btree.insert("", tk.END, values=(b['id'], s_label, f"模式 {b['mode']}", t_info, b['message'], "✅" if b['offline'] else "❌"))
                if isinstance(site_map, dict):
                    for sk, slist in site_map.items():
                        s_label = site_names.get(sk, sk)
                        for b in slist:
                            t_info = f"{b['startTime']} ~ {b['endTime']}" if b['mode'] == 2 else f"{b['startTime']} (重複 {b['repeatCount']} 次, 間隔 {b['intervalMin']} 分)"
                            btree.insert("", tk.END, values=(b['id'], s_label, f"模式 {b['mode']}", t_info, b['message'], "✅" if b['offline'] else "❌"))
            except: pass
        self.refresh_broadcast_tree = refresh_broadcast_tree
        
        b_action_frame = tk.Frame(tab_broadcast, bg="#0f172a")
        b_action_frame.pack(fill=tk.X, padx=20, pady=10)
        
        def del_broadcast():
            sel = btree.selection()
            if not sel: return messagebox.showwarning("提醒", "請先選擇一筆廣播", parent=mgr_win)
            b_id = btree.item(sel[0], "values")[0]
            try:
                res = requests.get(f"{LOCAL_API}/broadcasts", timeout=2).json()
                current_b = res.get('broadcasts', [])
                site_map = res.get('siteBroadcasts', {})
                del_site = None
                
                # Check global broadcasts
                if any(b['id'] == b_id for b in current_b):
                    current_b = [b for b in current_b if b['id'] != b_id]
                    requests.post(f"{LOCAL_API}/broadcasts/update", json={"broadcasts": current_b, "siteBroadcasts": site_map}, timeout=2)
                    self.push_broadcast_to_github(current_b)
                elif isinstance(site_map, dict):
                    for sk, slist in site_map.items():
                        if any(b['id'] == b_id for b in slist):
                            site_map[sk] = [b for b in slist if b['id'] != b_id]
                            del_site = sk
                            requests.post(f"{LOCAL_API}/broadcasts/update", json={"broadcasts": current_b, "siteBroadcasts": site_map}, timeout=2)
                            self.push_broadcast_to_github(site_map[sk], site=sk)
                            break
                refresh_broadcast_tree()
            except Exception as e: messagebox.showerror("錯誤", f"刪除失敗: {e}", parent=mgr_win)

        def edit_broadcast():
            sel = btree.selection()
            if not sel: return messagebox.showwarning("提醒", "請先選擇一筆廣播", parent=mgr_win)
            b_id = btree.item(sel[0], "values")[0]
            try:
                res = requests.get(f"{LOCAL_API}/broadcasts", timeout=2).json()
                current_b = res.get('broadcasts', [])
                site_map = res.get('siteBroadcasts', {})
                if not isinstance(site_map, dict): site_map = {}
                
                target = next((b for b in current_b if b['id'] == b_id), None)
                target_site = None
                if not target:
                    for sk, slist in site_map.items():
                        target = next((b for b in slist if b['id'] == b_id), None)
                        if target:
                            target_site = sk
                            break
                            
                if not target: return
                
                edit_win = tk.Toplevel(mgr_win)
                edit_win.title("編輯廣播")
                edit_win.geometry("500x350")
                edit_win.configure(bg="#1e293b")
                
                tk.Label(edit_win, text="編輯廣播", bg="#1e293b", fg="#fcd34d", font=("Microsoft JhengHei", 14, "bold")).pack(pady=10)
                
                form_frame = tk.Frame(edit_win, bg="#1e293b")
                form_frame.pack(fill=tk.BOTH, expand=True, padx=20)
                
                tk.Label(form_frame, text="廣播訊息內容:", bg="#1e293b", fg="white", font=("Microsoft JhengHei", 11)).grid(row=0, column=0, sticky=tk.E, pady=5)
                e_msg = tk.Entry(form_frame, width=35, bg="#0f172a", fg="white", font=("Consolas", 11), insertbackground="white", relief=tk.FLAT)
                e_msg.insert(0, target.get('message', ''))
                e_msg.grid(row=0, column=1, pady=5, padx=5, sticky=tk.W)
                
                e_offline = tk.BooleanVar(value=target.get('offline', True))
                tk.Checkbutton(form_frame, text="啟用離線儲存", variable=e_offline, bg="#1e293b", fg="#e2e8f0", selectcolor="#0f172a", activebackground="#1e293b", activeforeground="white", font=("Microsoft JhengHei", 11)).grid(row=1, column=0, columnspan=2, pady=5, sticky=tk.W)
                
                tk.Label(form_frame, text="開始時間:", bg="#1e293b", fg="white", font=("Microsoft JhengHei", 11)).grid(row=2, column=0, sticky=tk.E, pady=5)
                e_st = tk.Entry(form_frame, width=25, bg="#0f172a", fg="white", font=("Consolas", 11), insertbackground="white", relief=tk.FLAT)
                e_st.insert(0, target.get('startTime', ''))
                e_st.grid(row=2, column=1, pady=5, padx=5, sticky=tk.W)
                
                is_m1 = target.get('mode') == 1
                
                tk.Label(form_frame, text="重複次數(Mode1):", bg="#1e293b", fg="white" if is_m1 else "gray", font=("Microsoft JhengHei", 11)).grid(row=3, column=0, sticky=tk.E, pady=5)
                e_rc = tk.Entry(form_frame, width=10, bg="#0f172a", fg="white" if is_m1 else "gray", state=tk.NORMAL if is_m1 else tk.DISABLED, font=("Consolas", 11), relief=tk.FLAT)
                if 'repeatCount' in target: e_rc.insert(0, str(target['repeatCount']))
                e_rc.grid(row=3, column=1, pady=5, padx=5, sticky=tk.W)
                
                tk.Label(form_frame, text="間隔分鐘(Mode1):", bg="#1e293b", fg="white" if is_m1 else "gray", font=("Microsoft JhengHei", 11)).grid(row=4, column=0, sticky=tk.E, pady=5)
                e_int = tk.Entry(form_frame, width=10, bg="#0f172a", fg="white" if is_m1 else "gray", state=tk.NORMAL if is_m1 else tk.DISABLED, font=("Consolas", 11), relief=tk.FLAT)
                if 'intervalMin' in target: e_int.insert(0, str(target['intervalMin']))
                e_int.grid(row=4, column=1, pady=5, padx=5, sticky=tk.W)
                
                tk.Label(form_frame, text="結束時間(Mode2):", bg="#1e293b", fg="white" if not is_m1 else "gray", font=("Microsoft JhengHei", 11)).grid(row=5, column=0, sticky=tk.E, pady=5)
                e_et = tk.Entry(form_frame, width=25, bg="#0f172a", fg="white" if not is_m1 else "gray", state=tk.NORMAL if not is_m1 else tk.DISABLED, font=("Consolas", 11), relief=tk.FLAT)
                if 'endTime' in target: e_et.insert(0, target['endTime'])
                e_et.grid(row=5, column=1, pady=5, padx=5, sticky=tk.W)
                
                def save_edit():
                    target['message'] = e_msg.get().strip()
                    target['offline'] = e_offline.get()
                    target['startTime'] = e_st.get().strip()
                    if is_m1:
                        try: target['repeatCount'] = int(e_rc.get())
                        except: pass
                        try: target['intervalMin'] = int(e_int.get())
                        except: pass
                    else:
                        target['endTime'] = e_et.get().strip()
                    
                    try:
                        requests.post(f"{LOCAL_API}/broadcasts/update", json={"broadcasts": current_b, "siteBroadcasts": site_map}, timeout=2)
                        refresh_broadcast_tree()
                        if target_site:
                            if any(b.get('offline') for b in site_map[target_site]) or not target['offline']:
                                self.push_broadcast_to_github(site_map[target_site], site=target_site)
                        else:
                            if any(b.get('offline') for b in current_b) or not target['offline']:
                                self.push_broadcast_to_github(current_b)
                        edit_win.destroy()
                    except Exception as e: messagebox.showerror("錯誤", f"儲存失敗: {e}", parent=edit_win)
                
                tk.Button(edit_win, text="💾 儲存修改", bg="#10b981", fg="white", font=("Microsoft JhengHei", 12, "bold"), command=save_edit, relief=tk.FLAT, padx=20).pack(pady=15)
                
            except Exception as e: messagebox.showerror("錯誤", f"無法載入編輯畫面: {e}", parent=mgr_win)

        tk.Button(b_action_frame, text="🗑️ 刪除選取廣播", bg="#ef4444", fg="white", font=("Microsoft JhengHei", 12, "bold"), command=del_broadcast, relief=tk.FLAT, padx=15).pack(side=tk.LEFT, padx=5)
        tk.Button(b_action_frame, text="✏️ 編輯選取廣播", bg="#f59e0b", fg="white", font=("Microsoft JhengHei", 12, "bold"), command=edit_broadcast, relief=tk.FLAT, padx=15).pack(side=tk.LEFT, padx=5)
        tk.Button(b_action_frame, text="🔄 重新載入", bg="#3b82f6", fg="white", font=("Microsoft JhengHei", 12, "bold"), command=refresh_broadcast_tree, relief=tk.FLAT, padx=15).pack(side=tk.LEFT, padx=5)

        b_add_frame = tk.LabelFrame(tab_broadcast, text="➕ 新增排程廣播", bg="#1e293b", fg="#fcd34d", font=("Microsoft JhengHei", 12, "bold"))
        b_add_frame.pack(fill=tk.X, padx=20, pady=10)

        site_choices = [
            ("all", "🌐 全站通用廣播 (官網+探險者+商城)"),
            ("main", "🏠 僅官網首頁"),
            ("seeker", "🧭 探險者總覽網 (專屬)"),
            ("competition", "🏆 探險者大賽網 (專屬)"),
            ("fanfic", "📖 探險者同人文網 (專屬)"),
            ("review", "⭐ 探險者心得網 (專屬)"),
            ("seekerpedia", "📚 探險者百科 (專屬)"),
            ("shop", "🛒 胖達商城 (專屬)")
        ]
        tk.Label(b_add_frame, text="發送網站目標:", bg="#1e293b", fg="#38bdf8", font=("Microsoft JhengHei", 11, "bold")).grid(row=0, column=0, sticky=tk.E, padx=5, pady=5)
        b_site_var = tk.StringVar(value="all")
        b_site_menu = ttk.Combobox(b_add_frame, textvariable=b_site_var, values=[f"{k}: {v}" for k, v in site_choices], width=35, state="readonly", font=("Microsoft JhengHei", 10))
        b_site_menu.current(0)
        b_site_menu.grid(row=0, column=1, columnspan=2, sticky=tk.W, padx=5, pady=5)

        b_offline_var = tk.BooleanVar(value=True)
        tk.Checkbutton(b_add_frame, text="啟用離線儲存 (推送至對應站點 server_broadcast.json)", variable=b_offline_var, bg="#1e293b", fg="#e2e8f0", selectcolor="#0f172a", activebackground="#1e293b", activeforeground="white", font=("Microsoft JhengHei", 11)).grid(row=0, column=3, columnspan=2, sticky=tk.W, padx=10)

        tk.Label(b_add_frame, text="廣播訊息內容:", bg="#1e293b", fg="white", font=("Microsoft JhengHei", 11)).grid(row=1, column=0, sticky=tk.E, padx=5, pady=5)
        b_msg_entry = tk.Entry(b_add_frame, width=50, bg="#0f172a", fg="white", font=("Consolas", 11), insertbackground="white", relief=tk.FLAT)
        b_msg_entry.grid(row=1, column=1, columnspan=3, sticky=tk.W, padx=5, pady=5, ipady=3)

        tk.Label(b_add_frame, text="Mode 1 (定時重複):", bg="#1e293b", fg="#a855f7", font=("Microsoft JhengHei", 11, "bold")).grid(row=2, column=0, sticky=tk.E, padx=5, pady=5)
        b1_st = tk.Entry(b_add_frame, width=20, bg="#0f172a", fg="white", font=("Consolas", 11))
        b1_st.insert(0, time.strftime('%Y-%m-%dT%H:%M'))
        b1_st.grid(row=2, column=1, sticky=tk.W, padx=5)
        tk.Label(b_add_frame, text="重複次數:", bg="#1e293b", fg="white", font=("Microsoft JhengHei", 10)).grid(row=2, column=2, sticky=tk.E)
        b1_rc = tk.Entry(b_add_frame, width=5, bg="#0f172a", fg="white", font=("Consolas", 11))
        b1_rc.insert(0, "3")
        b1_rc.grid(row=2, column=3, sticky=tk.W)
        tk.Label(b_add_frame, text="間隔(分鐘):", bg="#1e293b", fg="white", font=("Microsoft JhengHei", 10)).grid(row=2, column=4, sticky=tk.W)
        b1_int = tk.Entry(b_add_frame, width=5, bg="#0f172a", fg="white", font=("Consolas", 11))
        b1_int.insert(0, "10")
        b1_int.grid(row=2, column=4, sticky=tk.W, padx=80)
        
        def add_mode1():
            if not b_msg_entry.get().strip(): return messagebox.showwarning("提醒", "請輸入訊息", parent=mgr_win)
            sel_target = b_site_var.get().split(":")[0].strip()
            new_b = { "id": str(int(time.time())) + "m1", "mode": 1, "site": sel_target, "startTime": b1_st.get(), "repeatCount": int(b1_rc.get()), "intervalMin": int(b1_int.get()), "message": b_msg_entry.get().strip(), "offline": b_offline_var.get() }
            try:
                res = requests.get(f"{LOCAL_API}/broadcasts", timeout=2).json()
                curr = res.get('broadcasts', [])
                site_map = res.get('siteBroadcasts', {})
                if not isinstance(site_map, dict): site_map = {}
                
                if sel_target in ["all", "main"]:
                    curr.append(new_b)
                    requests.post(f"{LOCAL_API}/broadcasts/update", json={"broadcasts": curr, "siteBroadcasts": site_map}, timeout=2)
                    if new_b['offline']: self.push_broadcast_to_github(curr)
                else:
                    if sel_target not in site_map: site_map[sel_target] = []
                    site_map[sel_target].append(new_b)
                    requests.post(f"{LOCAL_API}/broadcasts/update", json={"broadcasts": curr, "siteBroadcasts": site_map}, timeout=2)
                    if new_b['offline']: self.push_broadcast_to_github(site_map[sel_target], site=sel_target)
                    
                refresh_broadcast_tree()
                b_msg_entry.delete(0, tk.END)
            except Exception as e: messagebox.showerror("錯誤", f"新增失敗: {e}", parent=mgr_win)

        tk.Button(b_add_frame, text="新增 Mode 1", bg="#10b981", fg="white", font=("Microsoft JhengHei", 10, "bold"), command=add_mode1).grid(row=2, column=5, padx=5, pady=5)

        tk.Label(b_add_frame, text="Mode 2 (區間顯示):", bg="#1e293b", fg="#3b82f6", font=("Microsoft JhengHei", 11, "bold")).grid(row=3, column=0, sticky=tk.E, padx=5, pady=5)
        tk.Label(b_add_frame, text="開始時間:", bg="#1e293b", fg="white", font=("Microsoft JhengHei", 10)).grid(row=3, column=1, sticky=tk.W)
        b2_st = tk.Entry(b_add_frame, width=20, bg="#0f172a", fg="white", font=("Consolas", 11))
        b2_st.insert(0, time.strftime('%Y-%m-%dT%H:%M'))
        b2_st.grid(row=3, column=1, sticky=tk.W, padx=70)
        tk.Label(b_add_frame, text="結束時間:", bg="#1e293b", fg="white", font=("Microsoft JhengHei", 10)).grid(row=3, column=2, sticky=tk.E)
        b2_et = tk.Entry(b_add_frame, width=20, bg="#0f172a", fg="white", font=("Consolas", 11))
        b2_et.insert(0, time.strftime('%Y-%m-%dT23:59'))
        b2_et.grid(row=3, column=3, columnspan=2, sticky=tk.W)
        
        def add_mode2():
            if not b_msg_entry.get().strip(): return messagebox.showwarning("提醒", "請輸入訊息", parent=mgr_win)
            sel_target = b_site_var.get().split(":")[0].strip()
            new_b = { "id": str(int(time.time())) + "m2", "mode": 2, "site": sel_target, "startTime": b2_st.get(), "endTime": b2_et.get(), "message": b_msg_entry.get().strip(), "offline": b_offline_var.get() }
            try:
                res = requests.get(f"{LOCAL_API}/broadcasts", timeout=2).json()
                curr = res.get('broadcasts', [])
                site_map = res.get('siteBroadcasts', {})
                if not isinstance(site_map, dict): site_map = {}
                
                if sel_target in ["all", "main"]:
                    curr.append(new_b)
                    requests.post(f"{LOCAL_API}/broadcasts/update", json={"broadcasts": curr, "siteBroadcasts": site_map}, timeout=2)
                    if new_b['offline']: self.push_broadcast_to_github(curr)
                else:
                    if sel_target not in site_map: site_map[sel_target] = []
                    site_map[sel_target].append(new_b)
                    requests.post(f"{LOCAL_API}/broadcasts/update", json={"broadcasts": curr, "siteBroadcasts": site_map}, timeout=2)
                    if new_b['offline']: self.push_broadcast_to_github(site_map[sel_target], site=sel_target)
                    
                refresh_broadcast_tree()
                b_msg_entry.delete(0, tk.END)
            except Exception as e: messagebox.showerror("錯誤", f"新增失敗: {e}", parent=mgr_win)

        tk.Button(b_add_frame, text="新增 Mode 2", bg="#10b981", fg="white", font=("Microsoft JhengHei", 10, "bold"), command=add_mode2).grid(row=3, column=5, padx=5, pady=5)

        # --- 🚨 問題回報處理分頁 ---
        tk.Label(tab_issues, text="🚨 玩家問題回報專區", font=("Microsoft JhengHei", 18, "bold"), bg="#0f172a", fg="#818cf8").pack(pady=(20,10), padx=20, anchor=tk.W)
        itree_frame = tk.Frame(tab_issues, bg="#1e293b")
        itree_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=5)
        itree = ttk.Treeview(itree_frame, columns=("time", "user", "location", "device", "text", "id"), displaycolumns=("time", "user", "location", "device", "text"), show='headings', style="Custom.Treeview")
        for col, text, width in zip(("time", "user", "location", "device", "text"), ["回報時間", "回報者", "地點/IP", "連線裝置", "問題內容"], [150, 100, 150, 150, 400]):
            itree.heading(col, text=text); itree.column(col, width=width, anchor=tk.W if col in ["text", "location"] else tk.CENTER)
        itree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        iscrollbar = ttk.Scrollbar(itree_frame, orient=tk.VERTICAL, command=itree.yview)
        itree.configure(yscroll=iscrollbar.set)
        iscrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        def refresh_issues():
            for i in itree.get_children(): itree.delete(i)
            try:
                res = requests.get(f"{LOCAL_API}/issues", timeout=2).json()
                self.current_issues_data = res.get('issues', [])
                for log in self.current_issues_data:
                    device_str = log.get('device', '未知')
                    if len(device_str) > 25: device_str = device_str[:22] + "..."
                    itree.insert("", tk.END, values=(log['time'], log['user'], log.get('location', '未知'), device_str, log['text'], log.get('id', '')))
            except: pass
        def view_issue_details():
            sel = itree.selection()
            if not sel: return messagebox.showwarning("提醒", "請先選擇一筆問題回報！", parent=mgr_win)
            
            rec_id = itree.item(sel[0], "values")[5]
            record = next((r for r in self.current_issues_data if r.get('id') == rec_id), None)
            if not record: return

            detail_win = tk.Toplevel(mgr_win)
            detail_win.title("問題回報詳情")
            detail_win.geometry("600x550")
            detail_win.configure(bg="#1e293b")

            tk.Label(detail_win, text="🚨 玩家問題回報內容", font=("Microsoft JhengHei", 18, "bold"), bg="#1e293b", fg="#ef4444").pack(pady=(15,5))
            tk.Label(detail_win, text=f"時間: {record.get('time')} | 回報者: {record.get('user')}", font=("Microsoft JhengHei", 12), bg="#1e293b", fg="#cbd5e1").pack()
            tk.Label(detail_win, text=f"來源網址: {record.get('url', '無提供')}", font=("Microsoft JhengHei", 11), bg="#1e293b", fg="#60a5fa").pack(pady=(5,0))
            tk.Label(detail_win, text=f"📍 地點: {record.get('location', '未知')}\n💻 裝置: {record.get('device', '未知')}", font=("Microsoft JhengHei", 11), bg="#1e293b", fg="#94a3b8", justify=tk.CENTER).pack(pady=5)
            
            text_frame = tk.Frame(detail_win, bg="#1e293b")
            text_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
            text_box = tk.Text(text_frame, bg="#0f172a", fg="white", font=("Microsoft JhengHei", 12), state=tk.NORMAL, wrap=tk.WORD)
            t_vs = ttk.Scrollbar(text_frame, orient=tk.VERTICAL, command=text_box.yview)
            text_box.configure(yscrollcommand=t_vs.set)
            text_box.grid(row=0, column=0, sticky="nsew")
            t_vs.grid(row=0, column=1, sticky="ns")
            text_frame.grid_rowconfigure(0, weight=1)
            text_frame.grid_columnconfigure(0, weight=1)
            
            text_box.insert(tk.END, record.get('text', ''))
            text_box.config(state=tk.DISABLED)

            def mark_resolved():
                if messagebox.askyesno("確認", "確定要將此問題標記為已解決並刪除嗎？", parent=detail_win):
                    try:
                        res = requests.post(f"{LOCAL_API}/issues/delete", json={"id": rec_id}, timeout=3)
                        if res.status_code == 200:
                            messagebox.showinfo("成功", "✅ 已刪除！", parent=detail_win)
                            refresh_issues()
                            detail_win.destroy()
                    except: pass

            tk.Button(detail_win, text="✅ 標記已解決並刪除", bg="#10b981", fg="white", font=("Microsoft JhengHei", 12, "bold"), command=mark_resolved, relief=tk.FLAT, padx=20, pady=5).pack(pady=10)

        i_action_frame = tk.Frame(tab_issues, bg="#0f172a")
        i_action_frame.pack(fill=tk.X, padx=20, pady=10)
        tk.Button(i_action_frame, text="🔄 重新載入", bg="#3b82f6", fg="white", font=("Microsoft JhengHei", 12, "bold"), command=refresh_issues, relief=tk.FLAT, padx=15).pack(side=tk.LEFT, padx=5)
        tk.Button(i_action_frame, text="🔍 檢視詳細內容與處理", bg="#f59e0b", fg="white", font=("Microsoft JhengHei", 12, "bold"), command=view_issue_details, relief=tk.FLAT, padx=15).pack(side=tk.LEFT, padx=5)

        # --- ❌ 錯誤診斷與搜集分頁 ---
        tk.Label(tab_errors, text="❌ 系統錯誤診斷與搜集專區", font=("Microsoft JhengHei", 18, "bold"), bg="#0f172a", fg="#ef4444").pack(pady=(20,10), padx=20, anchor=tk.W)
        etree_frame = tk.Frame(tab_errors, bg="#1e293b")
        etree_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=5)
        etree = ttk.Treeview(etree_frame, columns=("time", "source", "user", "location", "device", "msg"), displaycolumns=("time", "source", "user", "location", "device", "msg"), show='headings', style="Custom.Treeview")
        for col, text, width in zip(("time", "source", "user", "location", "device", "msg"), ["發生時間", "錯誤來源", "觸發者", "地點/IP", "裝置資訊", "錯誤內容"], [150, 100, 100, 120, 120, 400]):
            etree.heading(col, text=text); etree.column(col, width=width, anchor=tk.W if col in ["msg", "location"] else tk.CENTER)
        etree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        escrollbar = ttk.Scrollbar(etree_frame, orient=tk.VERTICAL, command=etree.yview)
        etree.configure(yscroll=scrollbar.set)
        escrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        def refresh_errors():
            for i in etree.get_children(): etree.delete(i)
            try:
                res = requests.get(f"{LOCAL_API}/errors", timeout=2).json()
                for err in res.get('errors', []):
                    device_str = err.get('device', '未知')
                    if len(device_str) > 20: device_str = device_str[:17] + "..."
                    etree.insert("", tk.END, values=(err.get('timestamp', ''), err.get('source', '未知'), err.get('user', '未知'), err.get('location', '未知'), device_str, err.get('error_message', '')))
            except Exception as e: pass
        e_action_frame = tk.Frame(tab_errors, bg="#0f172a")
        e_action_frame.pack(fill=tk.X, padx=20, pady=10)
        tk.Button(e_action_frame, text="🔄 重新載入", bg="#3b82f6", fg="white", font=("Microsoft JhengHei", 12, "bold"), command=refresh_errors, relief=tk.FLAT, padx=15).pack(side=tk.LEFT, padx=5)
        tk.Button(e_action_frame, text="🗑️ 清空紀錄", bg="#ef4444", fg="white", font=("Microsoft JhengHei", 12, "bold"), command=lambda: requests.post(f"{LOCAL_API}/errors/clear"), relief=tk.FLAT, padx=15).pack(side=tk.LEFT, padx=5)

        # --- 🌐 嵌入網頁與檔案部署 ---
        app_list_frame = tk.Frame(tab_apps, bg="#0f172a", width=300)
        app_list_frame.pack(side=tk.LEFT, fill=tk.Y, padx=10, pady=10)
        tk.Label(app_list_frame, text="🌐 您部署的前端專案", bg="#0f172a", fg="#818cf8", font=("Microsoft JhengHei", 13, "bold")).pack(pady=(5,10), anchor=tk.W)
        list_scroll_frame = tk.Frame(app_list_frame)
        list_scroll_frame.pack(fill=tk.BOTH, expand=True)
        self.apps_listbox = tk.Listbox(list_scroll_frame, bg="#1e293b", fg="#e2e8f0", font=("Consolas", 11), selectbackground="#3b82f6", relief=tk.FLAT, borderwidth=0)
        self.apps_listbox.grid(row=0, column=0, sticky='nsew')
        app_detail_frame = tk.Frame(tab_apps, bg="#0f172a")
        app_detail_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10, pady=10)
        app_content_notebook = ttk.Notebook(app_detail_frame)
        app_content_notebook.pack(fill=tk.BOTH, expand=True)
        tab_app_dashboard = tk.Frame(app_content_notebook, bg="#0f172a")
        tab_app_deploy = tk.Frame(app_content_notebook, bg="#1e293b")
        app_content_notebook.add(tab_app_dashboard, text="🎛️ 資料與控制面板")
        app_content_notebook.add(tab_app_deploy, text="📦 檔案部署與提示詞")

        def refresh_apps():
            self.apps_listbox.delete(0, tk.END)
            try:
                settings_res = requests.get(f"{LOCAL_API}/settings", timeout=3).json()
                origins = settings_res.get('allowedOrigins', [])
                
                res = requests.get(f"{LOCAL_API}/apps", timeout=3).json()
                self.current_apps_data = res.get('apps', {})
                
                for origin in origins:
                    if origin == "*": continue
                    self.apps_listbox.insert(tk.END, origin)
            except: pass
        tk.Button(app_list_frame, text="🔄 重新整理", command=refresh_apps, bg="#3b82f6", fg="white", font=("Microsoft JhengHei", 11, "bold"), relief=tk.FLAT).pack(fill=tk.X, pady=5)

        def load_app_detail(event):
            sel = self.apps_listbox.curselection()
            if not sel: return
            app_id = self.apps_listbox.get(sel[0])
            app_info = self.current_apps_data.get(app_id, {})
            
            for widget in tab_app_dashboard.winfo_children(): widget.destroy()
            for widget in tab_app_deploy.winfo_children(): widget.destroy()
            
            code = app_info.get('dashboardCode', '')
            if code:
                try:
                    local_vars = {}
                    exec(code, globals(), local_vars)
                    if 'init_dashboard' in local_vars:
                        local_vars['init_dashboard'](tab_app_dashboard, app_id, LOCAL_API)
                    else:
                        tk.Label(tab_app_dashboard, text="此應用未提供有效的控制面板程式碼", fg="white", bg="#0f172a", font=("Microsoft JhengHei", 12)).pack(pady=20)
                except Exception as e:
                    tk.Label(tab_app_dashboard, text=f"面板載入失敗:\n{e}", fg="#ef4444", bg="#0f172a", font=("Microsoft JhengHei", 12)).pack(pady=20)
            else:
                tk.Label(tab_app_dashboard, text="此應用沒有專屬控制面板", fg="white", bg="#0f172a", font=("Microsoft JhengHei", 12)).pack(pady=20)
                
            # --- 編輯器版面 ---
            editor_notebook = ttk.Notebook(tab_app_deploy)
            editor_notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
            
            tab_code = tk.Frame(editor_notebook, bg="#0f172a")
            tab_data = tk.Frame(editor_notebook, bg="#0f172a")
            tab_logs = tk.Frame(editor_notebook, bg="#0f172a")
            
            editor_notebook.add(tab_code, text="💻 自訂面板程式碼")
            editor_notebook.add(tab_data, text="🗄️ JSON 資料")
            editor_notebook.add(tab_logs, text="📜 日誌紀錄")
            
            # --- Code Editor ---
            code_text = tk.Text(tab_code, bg="#1e293b", fg="#e2e8f0", font=("Consolas", 11), relief=tk.FLAT, undo=True)
            code_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
            code_text.insert(tk.END, app_info.get('dashboardCode', ''))
            
            # --- Data Editor ---
            data_text = tk.Text(tab_data, bg="#1e293b", fg="#4ade80", font=("Consolas", 11), relief=tk.FLAT, undo=True)
            data_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
            data_text.insert(tk.END, json.dumps(app_info.get('data', {}), indent=2, ensure_ascii=False))
            
            # --- Logs ---
            log_text = tk.Text(tab_logs, bg="#0f172a", fg="#cbd5e1", font=("Consolas", 11), relief=tk.FLAT)
            log_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
            logs = app_info.get('logs', [])
            for log in logs:
                log_text.insert(tk.END, f"[{log.get('time')}] {log.get('user')}: {log.get('message')}\n")
            log_text.config(state=tk.DISABLED)
            
            # --- Save Frame ---
            save_frame = tk.Frame(tab_app_deploy, bg="#1e293b", padx=10, pady=10)
            save_frame.pack(fill=tk.X)
            
            def save_app_changes():
                new_code = code_text.get("1.0", tk.END).strip()
                try:
                    new_data = json.loads(data_text.get("1.0", tk.END).strip())
                except Exception as e:
                    messagebox.showerror("JSON 錯誤", f"資料格式錯誤：\n{e}", parent=mgr_win)
                    return
                try:
                    res = requests.post(f"{LOCAL_API}/apps/update", json={"appId": app_id, "dashboardCode": new_code, "data": new_data}, timeout=3)
                    if res.status_code == 200:
                        messagebox.showinfo("成功", "應用設定已更新！", parent=mgr_win)
                        refresh_apps() # reload to update dashboard
                    else:
                        messagebox.showerror("錯誤", "儲存失敗", parent=mgr_win)
                except Exception as e:
                    messagebox.showerror("網路錯誤", f"無法連接伺服器：{e}", parent=mgr_win)
                    
            tk.Button(save_frame, text="💾 儲存並重新載入", bg="#10b981", fg="white", font=("Microsoft JhengHei", 12, "bold"), command=save_app_changes, relief=tk.FLAT, padx=20).pack(side=tk.RIGHT)

        self.apps_listbox.bind('<<ListboxSelect>>', load_app_detail)

        # --- 授權網域管理分頁 (CORS 白名單) ---
        tk.Label(tab_settings, text="允許存取此登入系統的網域 (CORS 白名單)", font=("Microsoft JhengHei", 18, "bold"), bg="#0f172a", fg="#818cf8").pack(pady=(20,10), padx=20, anchor=tk.W)
        
        cors_frame = tk.Frame(tab_settings, bg="#1e293b")
        cors_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=5)
        cors_listbox = tk.Listbox(cors_frame, bg="#0f172a", fg="white", font=("Consolas", 12), relief=tk.FLAT, selectbackground="#3b82f6")
        cors_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10, pady=10)

        def refresh_cors():
            cors_listbox.delete(0, tk.END)
            try:
                res = requests.get(f"{LOCAL_API}/settings", timeout=3).json()
                self.cors_origins_cache = res.get("allowedOrigins", ["*"])
                routes = getattr(self, "tunnel_routes", self.github_config.get("tunnel_routes", {}))
                for origin in self.cors_origins_cache:
                    if origin == "*":
                        cors_listbox.insert(tk.END, origin)
                        continue
                    route = routes.get(origin, "ngrok")
                    tag = "[🔥Ngrok]" if route == "ngrok" else "[☁️Cloudflare]"
                    cors_listbox.insert(tk.END, f"{tag} {origin}")
            except: pass

        cors_action_frame = tk.Frame(tab_settings, bg="#0f172a")
        cors_action_frame.pack(fill=tk.X, padx=20, pady=10)

        tk.Label(cors_action_frame, text="新增網域:", bg="#0f172a", fg="white", font=("Microsoft JhengHei", 12)).pack(side=tk.LEFT, padx=5)
        new_cors_entry = tk.Entry(cors_action_frame, font=("Consolas", 12), width=30, bg="#1e293b", fg="white", insertbackground="white", relief=tk.FLAT)
        new_cors_entry.pack(side=tk.LEFT, padx=5, ipady=3)

        def add_cors():
            val = new_cors_entry.get().strip()
            if val:
                current = self.cors_origins_cache.copy()
                if val not in current:
                    current.append(val)
                    try:
                        requests.post(f"{LOCAL_API}/settings/origins", json={"origins": current}, timeout=3)
                        refresh_cors()
                        new_cors_entry.delete(0, tk.END)
                    except Exception as e: messagebox.showerror("錯誤", f"儲存失敗: {e}", parent=mgr_win)

        def del_cors():
            sel = cors_listbox.curselection()
            if sel:
                current = self.cors_origins_cache.copy()
                current.pop(sel[0])
                if not current: current = ["*"]
                try:
                    requests.post(f"{LOCAL_API}/settings/origins", json={"origins": current}, timeout=3)
                    refresh_cors()
                except Exception as e: messagebox.showerror("錯誤", f"刪除失敗: {e}", parent=mgr_win)
            else: messagebox.showwarning("提醒", "請先選擇要刪除的網域", parent=mgr_win)

        def toggle_route():
            sel = cors_listbox.curselection()
            if sel:
                origin = self.cors_origins_cache[sel[0]]
                if origin == "*": return
                routes = getattr(self, "tunnel_routes", self.github_config.get("tunnel_routes", {}))
                curr = routes.get(origin, "ngrok")
                routes[origin] = "cloudflare" if curr == "ngrok" else "ngrok"
                self.tunnel_routes = routes
                self.save_config()
                refresh_cors()
                cors_listbox.selection_set(sel[0])
            else: messagebox.showwarning("提醒", "請先選擇網域", parent=mgr_win)

        tk.Button(cors_action_frame, text="➕ 新增網域", bg="#10b981", fg="white", font=("Microsoft JhengHei", 12, "bold"), command=add_cors, relief=tk.FLAT, padx=10).pack(side=tk.LEFT, padx=5)
        tk.Button(cors_action_frame, text="🗑️ 刪除", bg="#ef4444", fg="white", font=("Microsoft JhengHei", 12, "bold"), command=del_cors, relief=tk.FLAT, padx=10).pack(side=tk.LEFT, padx=5)
        tk.Button(cors_action_frame, text="🔄 切換通道 (Ngrok/CF)", bg="#8b5cf6", fg="white", font=("Microsoft JhengHei", 12, "bold"), command=toggle_route, relief=tk.FLAT, padx=10).pack(side=tk.LEFT, padx=5)

        refresh_cors()
        
        # --- 🪄 提示詞生成工具分頁 ---
        tk.Label(tab_prompt_gen, text="🪄 AI 專屬提示詞生成工具", font=("Microsoft JhengHei", 18, "bold"), bg="#0f172a", fg="#818cf8").pack(pady=(20,10), padx=20, anchor=tk.W)
        options_frame = tk.Frame(tab_prompt_gen, bg="#1e293b", padx=20, pady=15)
        options_frame.pack(fill=tk.X, padx=20, pady=5)
        self.var_dev_mode = tk.StringVar(value="done_same_chat")
        self.var_p_login = tk.BooleanVar(value=True)
        self.var_p_server = tk.BooleanVar(value=True)
        self.var_p_storage = tk.BooleanVar(value=True)
        self.var_p_whitelist = tk.BooleanVar(value=True)
        self.var_p_python = tk.BooleanVar(value=True)
        self.var_p_issue_btn = tk.BooleanVar(value=False)
        self.var_p_noti_bar = tk.BooleanVar(value=True)
        chk_style = {"bg": "#1e293b", "fg": "#e2e8f0", "selectcolor": "#0f172a", "activebackground": "#1e293b", "activeforeground": "white", "font": ("Microsoft JhengHei", 12)}
        rad_style = {"bg": "#1e293b", "fg": "#fcd34d", "selectcolor": "#0f172a", "activebackground": "#1e293b", "activeforeground": "white", "font": ("Microsoft JhengHei", 12, "bold")}
        tk.Radiobutton(options_frame, text="◉ 網頁已經做好了 這是AI已經給出原始碼的對話", variable=self.var_dev_mode, value="done_same_chat", **rad_style).grid(row=0, column=0, sticky=tk.W, pady=5, padx=10, columnspan=2)
        tk.Radiobutton(options_frame, text="◉ 網頁已經做好了 開一個新對話 要給它原始碼", variable=self.var_dev_mode, value="done_new_chat", **rad_style).grid(row=1, column=0, sticky=tk.W, pady=5, padx=10, columnspan=2)
        tk.Radiobutton(options_frame, text="◉ 網頁還沒開始做 開一個新對話 先在原本提示後面加入這些提示", variable=self.var_dev_mode, value="not_started", **rad_style).grid(row=2, column=0, sticky=tk.W, pady=5, padx=10, columnspan=2)

        tk.Checkbutton(options_frame, text="☑ 加上統一登入系統 (SSO) 與帳號介面", variable=self.var_p_login, **chk_style).grid(row=3, column=0, sticky=tk.W, pady=5, padx=10)
        tk.Checkbutton(options_frame, text="☑ 加上伺服器連線與動態多人連線", variable=self.var_p_server, **chk_style).grid(row=3, column=1, sticky=tk.W, pady=5, padx=10)
        tk.Checkbutton(options_frame, text="☑ 加上雲端資料儲存與日誌上報 (連動管理面板)", variable=self.var_p_storage, **chk_style).grid(row=4, column=0, sticky=tk.W, pady=5, padx=10)
        tk.Checkbutton(options_frame, text="☑ 加上防護機制 (網域白名單攔截)", variable=self.var_p_whitelist, **chk_style).grid(row=4, column=1, sticky=tk.W, pady=5, padx=10)
        tk.Checkbutton(options_frame, text="☑ 加上頂端跑馬燈與廣播接收功能", variable=self.var_p_noti_bar, **chk_style).grid(row=5, column=0, sticky=tk.W, pady=5, padx=10)
        tk.Checkbutton(options_frame, text="☑ 生成專屬 Python 管理面板注入代碼", variable=self.var_p_python, **chk_style).grid(row=5, column=1, sticky=tk.W, pady=5, padx=10)
        tk.Checkbutton(options_frame, text="☑ 加入外部回報問題按鈕", variable=self.var_p_issue_btn, **chk_style).grid(row=6, column=0, sticky=tk.W, pady=5, padx=10, columnspan=2)
        prompt_btn_frame = tk.Frame(tab_prompt_gen, bg="#0f172a")
        prompt_btn_frame.pack(fill=tk.X, padx=20, pady=10)
        
        prompt_text_frame = tk.Frame(tab_prompt_gen, bg="#0f172a")
        prompt_text_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        self.prompt_text_area = tk.Text(prompt_text_frame, bg="#020617", fg="#34d399", font=("Consolas", 11), relief=tk.FLAT, state=tk.DISABLED, wrap=tk.NONE)
        p_vs = ttk.Scrollbar(prompt_text_frame, orient=tk.VERTICAL, command=self.prompt_text_area.yview)
        p_hs = ttk.Scrollbar(prompt_text_frame, orient=tk.HORIZONTAL, command=self.prompt_text_area.xview)
        self.prompt_text_area.configure(yscrollcommand=p_vs.set, xscrollcommand=p_hs.set)
        self.prompt_text_area.grid(row=0, column=0, sticky="nsew")
        p_vs.grid(row=0, column=1, sticky="ns")
        p_hs.grid(row=1, column=0, sticky="ew")
        prompt_text_frame.grid_rowconfigure(0, weight=1)
        prompt_text_frame.grid_columnconfigure(0, weight=1)

        def copy_prompt():
            text = self.prompt_text_area.get("1.0", tk.END).strip()
            if not text: return messagebox.showwarning("提醒", "請先生成提示詞！", parent=mgr_win)
            mgr_win.clipboard_clear()
            mgr_win.clipboard_append(text)
            messagebox.showinfo("成功", "✅ 提示詞已複製！請直接貼給開發 AI 使用。", parent=mgr_win)

        tk.Button(prompt_btn_frame, text="📋 複製提示詞", bg="#10b981", fg="white", font=("Microsoft JhengHei", 12, "bold"), command=copy_prompt, relief=tk.FLAT, padx=15, pady=8).pack(side=tk.LEFT, padx=10)
        # Note: generate_prompt is defined later so we use a lambda or just define generate_prompt above. Actually, generate_prompt is defined right below this. So we can use lambda.
        tk.Button(prompt_btn_frame, text="🪄 根據勾選項目生成提示詞", bg="#3b82f6", fg="white", font=("Microsoft JhengHei", 12, "bold"), command=lambda: generate_prompt(), relief=tk.FLAT, padx=15, pady=8).pack(side=tk.LEFT, padx=10)

        def generate_prompt():
            mode = self.var_dev_mode.get()
            prompt = ""
            import os
            repo = self.github_config.get("repo", "pandapanda6666/pandapanda6666.github.io")
            path = self.github_config.get("path", "login-hub/server_url.txt")
            owner = repo.split("/")[0] if "/" in repo else "pandapanda6666"
            repo_name = repo.split("/")[1] if "/" in repo else ""
            if repo_name and repo_name.lower() != f"{owner.lower()}.github.io":
                pages_base_url = f"https://{owner}.github.io/{repo_name}"
            else:
                pages_base_url = f"https://{owner}.github.io"
            path_dir = os.path.dirname(path).replace("\\", "/").strip('/')
            if path_dir:
                login_hub_url = f"{pages_base_url}/{path_dir}/"
                server_url_file = f"{pages_base_url}/{path_dir}/server_url.txt"
                broadcast_file = f"{pages_base_url}/{path_dir}/server_broadcast.json"
            else:
                login_hub_url = f"{pages_base_url}/"
                server_url_file = f"{pages_base_url}/server_url.txt"
                broadcast_file = f"{pages_base_url}/server_broadcast.json"

            if mode == "not_started":
                prompt += "請幫我做一個全新的網頁(請根據我前面的需求設計)，並在其中直接加入「即時多人連線與雲端存檔功能」，整合我專屬的「統一登入系統(SSO)」。\n\n"
                prompt += "【絕對防禦與防刪指令】：請寫出完整且立即可用的網頁代碼，包含完整的樣式與邏輯。千萬不要無中生有！請嚴格遵守以下對接規範來開發你的程式碼：\n\n"
            elif mode == "done_new_chat":
                prompt += "請幫我修改以下我提供的網頁程式碼，直接加入「即時多人連線與雲端存檔功能」，並整合我專屬的「統一登入系統(SSO)」。\n\n"
                prompt += "【絕對防禦與防刪指令】：絕對不可以刪除、簡化或修改我提供的原始碼中既有的任何功能、按鈕與邏輯！若是原本有其完整功能，只允許加上我要求的連線或儲存功能！千萬不要無中生有！請嚴格遵守以下對接規範來修改你的程式碼：\n\n"
            else:
                prompt += "請幫我在目前的網頁程式碼中，修改與新增以下功能，加入「即時多人連線與雲端存檔功能」，並整合我專屬的「統一登入系統(SSO)」。\n\n"
                prompt += "【絕對防禦與防刪指令】：絕對不可以刪除、簡化或修改我提供的原始碼中既有的任何功能、按鈕與邏輯！若是原本有其完整功能，只允許加上我要求的連線或儲存功能！千萬不要無中生有！請嚴格遵守以下對接規範來修改你的程式碼：\n\n"

            if self.var_p_login.get() or getattr(self, 'var_p_issue_btn', None) and self.var_p_issue_btn.get():
                prompt += f"我的登入中心網址為：{login_hub_url}\n\n"

            section_idx = 1
            if self.var_p_server.get():
                prompt += f"### {section_idx}. 強制建立連線與全域錯誤捕捉 (無論是否登入皆須連線)\n"
                prompt += "- 引入 Socket.IO CDN：https://cdn.socket.io/4.7.2/socket.io.min.js\n"
                prompt += "- 請將以下這段錯誤捕捉程式碼加入到你的 <script> 最上方 (必須包含 Promise 的錯誤攔截)：\n"
                prompt += "  ```javascript\n"
                prompt += "  const originalWarn = console.warn;\n"
                prompt += "  console.warn = function(...args) {\n"
                prompt += "      if (args[0] && typeof args[0] === 'string' && args[0].includes('cdn.tailwindcss.com should not be used in production')) return;\n"
                prompt += "      originalWarn.apply(console, args);\n"
                prompt += "  };\n"
                prompt += "  window.onerror = function(msg, url, line) { \n"
                prompt += "      if (typeof socket !== 'undefined' && socket.connected) socket.emit('logError', { errorMsg: msg, url: url, line: line }); \n"
                prompt += "  };\n"
                prompt += "  window.addEventListener('unhandledrejection', function(event) {\n"
                prompt += "      if (typeof socket !== 'undefined' && socket.connected) socket.emit('logError', { errorMsg: 'Promise異常: ' + (event.reason ? event.reason.message || event.reason : '未知錯誤'), url: window.location.href, line: 0 });\n"
                prompt += "  });\n"
                prompt += f"- 獲取伺服器網址：優先讀取 URL 參數的 server。若無此參數，請用 fetch 去登入頁面讀取絕對路徑 {server_url_file} 來拿網址。\n"
                prompt += "- [極度重要：網址解密] 伺服器網址在 GitHub 上是經過 Base64 與反轉加密的，讀取到 text 後，請務必使用 `const serverUrl = atob(text.trim().split('').reverse().join(''));` 來解密還原真實網址，否則將無法連線！\n"
                prompt += "- 嚴格禁止使用 localhost：如果 fetch 失敗，請直接在畫面上顯示「伺服器連線失敗，請稍後再試」，絕對不要自動 Fallback 去連線 localhost 或是 3000 等預設埠號！\n"
                prompt += "- 取得網址後建立連線：`const socket = io(serverUrl, { transports: ['websocket'] });`\n"
                prompt += "- 連線成功後，發送裝置資訊：`socket.emit('initClientInfo', { location: '未知地點', device: navigator.userAgent });`\n"
                prompt += "- 【極度重要：動態網址 ID】：請在 JavaScript 頂端宣告一個常數，以獲取網頁的絕對路徑(不含參數)作為此應用的專屬識別碼：\n"
                prompt += "  `const appId = window.location.hostname + window.location.pathname;`\n\n"
                section_idx += 1

            if self.var_p_whitelist.get():
                prompt += f"### {section_idx}. 網域白名單阻擋機制\n"
                prompt += "- 伺服器會在客戶端連線時驗證白名單，若違規會立刻推播 `illegalWebpage` 事件。請監聽此事件，收到時請立刻將整個網頁畫面 (document.body) 抹除，替換為違規提示：\n"
                prompt += "  ```javascript\n"
                prompt += "  socket.on('illegalWebpage', () => { document.body.innerHTML = '<div style=\"display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background-color:#ffffff; color:#dc2626; font-family:sans-serif; font-size:32px; font-weight:bold; text-align:center;\">這是詐騙<br>請立刻撥打165反詐騙專線</div>'; });\n"
                prompt += "  ```\n\n"
                section_idx += 1

            if self.var_p_login.get():
                prompt += f"### {section_idx}. 登入狀態檢查與 Token 驗證機制 (重點 UI 修改)\n"
                prompt += "- 【資安升級警告】：系統已全面改用 Session Token 機制，嚴禁在前端傳遞或儲存密碼明文，且所有敏感操作都不可直接傳遞 username！\n"
                prompt += "- 網頁連線後，優先檢查 URLSearchParams 中是否有 `token` 參數，或 localStorage 中是否有 `panda_session_token`。\n"
                prompt += "- 如果有 Token：\n"
                prompt += "  1. 發送 `socket.emit('tokenLogin', { token: token });` 進行自動登入與身分驗證。\n"
                prompt += "  2. 監聽 `socket.on('loginResult', (data) => { ... })`。如果 `data.success` 為真，表示登入成功，儲存新的 Token。\n"
                prompt += "  3. 用 `history.replaceState` 清除網址列參數。\n"
                prompt += "  4. 【介面要求】：請在畫面上使用以下的 HTML 結構與樣式來建立玩家個人資料區塊與下拉選單，取代登入按鈕。下拉選單的內容「可以新增其他功能按鈕，但絕對不可減少原本的『帳號設定』與『登出』」：\n"
                prompt += "     ```javascript\n"
                prompt += "     const avatarUrl = res.avatar;\n"
                prompt += "     const nick = res.nickname || res.username;\n"
                prompt += "     if (!avatarUrl) return console.error('頭像資料遺失');\n"
                prompt += "     const avatarHTML = `<img src=\"${avatarUrl}\" style=\"width:100%;height:100%;border-radius:50%;object-fit:cover;\">`;\n"
                prompt += "     authContainer.innerHTML = `\n"
                prompt += "     <div class=\"user-profile-panel\" style=\"position:relative; display:flex;align-items:center;gap:10px; cursor:pointer;\" id=\"user-profile-toggle\">\n"
                prompt += "         <div class=\"user-info\" style=\"display:flex;align-items:center;gap:8px;\">\n"
                prompt += "             <div class=\"avatar\" style=\"width:36px;height:36px;border-radius:50%;background:#e8f5e9;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid #c8e6c9;\">${avatarHTML}</div>\n"
                prompt += "             <div class=\"details\" style=\"display:flex;flex-direction:column;\">\n"
                prompt += "                 <span class=\"status\" style=\"font-size:11px;color:#2e7d32;font-weight:bold;\">已登入</span>\n"
                prompt += "                 <span class=\"name\" title=\"${nick}\" style=\"font-size:14px;font-weight:bold;color:#1b5e20;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;\">${nick}</span>\n"
                prompt += "             </div>\n"
                prompt += "         </div>\n"
                prompt += "         <svg style=\"width:16px;height:16px;fill:#1b5e20;\" viewBox=\"0 0 24 24\"><path d=\"M7 10l5 5 5-5z\"/></svg>\n"
                prompt += "         <div id=\"user-dropdown\" style=\"display:none; position:absolute; top:100%; right:0; margin-top:10px; background:white; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15); min-width:150px; z-index:1000; overflow:hidden;\">\n"
                prompt += "             <div id=\"btn-settings\" style=\"padding:12px 16px; cursor:pointer; font-size:14px; font-weight:bold; color:#333; border-bottom:1px solid #eee;\">⚙️ 帳號設定</div>\n"
                prompt += "             <div id=\"btn-logout\" style=\"padding:12px 16px; cursor:pointer; font-size:14px; font-weight:bold; color:#d32f2f;\">🚪 登出</div>\n"
                prompt += "         </div>\n"
                prompt += "     </div>`;\n"
                prompt += "     // 點擊 #user-profile-toggle 切換下拉選單顯示/隱藏\n"
                prompt += "     // 點擊 btn-settings 導向： window.location.href = '" + login_hub_url + "?action=editProfile&from=' + encodeURIComponent(window.location.href);\n"
                prompt += "     // 點擊 btn-logout 需清除 localStorage 中的 Token 及相關資料，並重新載入網頁\n"
                prompt += "     ```\n"
                prompt += "- 如果沒有 Token 或登入失敗 (訪客模式)：維持訪客身分。在畫面上方顯示登入/註冊按鈕，點擊時導向登入中心 (帶入參數 &require=1)。\n\n"
                section_idx += 1

            if self.var_p_server.get():
                prompt += f"### {section_idx}. 動態多人連線與狀態同步\n"
                prompt += "- 加入房間：連線後發送 `socket.emit('joinGameRoom', { room: appId, characterData: {} });`\n"
                prompt += "- 生成其他玩家：監聽 `playerJoined` 事件，`data.allPlayers` 包含房間內所有人的資訊。\n"
                prompt += "- 同步狀態(若適用遊戲)：當觸發狀態改變時，發送 `syncPlayerState`；並監聽 `playerStateUpdated` 更新其他玩家狀態。\n"
                prompt += "- 通用資料轉發(萬用通道)：你可以把所有需要的資料包裝成物件，發送端：`socket.emit('appData', { room: appId, action: '自訂標籤', ... });`，接收端監聽 `appData` 事件。\n"
                prompt += "- 玩家離開：監聽 `playerLeft` 事件，從畫面上移除該玩家。\n\n"
                section_idx += 1

            if self.var_p_storage.get():
                prompt += f"### {section_idx}. 網頁雲端存取與上報日誌 (伺服器儲存)\n"
                prompt += "- 現在伺服器提供每張網頁專屬的雲端儲存空間。請將原本網頁內部的 LocalStorage 或內存變數存取，替換成伺服器的雲端存取！\n"
                prompt += "- 雲端儲存：當進度更新時發送：`socket.emit('saveAppData', { appId: appId, data: { ...JSON進度資料... } });`\n"
                prompt += "- 雲端讀取：載入網頁時發送：`socket.emit('getAppData', { appId: appId }, (res) => { ...還原進度... });`\n"
                prompt += "- 雲端上報日誌：每當玩家進行了重要操作，發送日誌至伺服器：`socket.emit('logAppMessage', { appId: appId, message: '操作訊息', type: 'info' });`\n"
                prompt += "- 取得全系統權限與資料(如有需要)：可發送 `socket.emit('getSystemContext', (res) => { ... })` 查詢 `res.isAdmin` 權限等資料。\n\n"
                section_idx += 1

            if getattr(self, 'var_p_python', None) and self.var_p_python.get():
                prompt += f"### {section_idx}. 動態 Python 管理面板生成 (管理端注入)\n"
                prompt += "- 為了讓我能直接在主伺服器控制面板中管理您寫的這個網頁，請你在生成網頁代碼後，在最下方為我額外提供一段專屬於這個應用的 Python Tkinter 代碼，符合以下接口規格：\n"
                prompt += "  ```python\n"
                prompt += "  def init_dashboard(parent_frame, current_app_id, api_url):\n"
                prompt += "      # parent_frame: 管理面板提供的 Tkinter 框架容器\n"
                prompt += "      # current_app_id: 當前應用的識別碼\n"
                prompt += "      # 使用 requests.get(f\"{api_url}/apps\").json()['apps'][current_app_id]['data'] 來讀取資料\n"
                prompt += "      # 使用 requests.post(f\"{api_url}/apps/update\", json=...) 來寫入更新資料\n"
                prompt += "  ```\n\n"
                section_idx += 1

            if getattr(self, 'var_p_issue_btn', None) and self.var_p_issue_btn.get():
                prompt += f"### {section_idx}. 外部回報問題按鈕\n"
                prompt += "- 請在網頁的適當位置（例如右下角浮動按鈕或選單內）加入一個「回報問題」的按鈕。\n"
                prompt += "- 點擊該按鈕時，請直接導向至登入中心的回報頁面，並帶上當前網址參數：\n"
                prompt += "  `window.location.href = '{login_hub_url}?action=reportIssue&from=' + encodeURIComponent(window.location.href);`\n\n"
                section_idx += 1

            if getattr(self, 'var_p_noti_bar', None) and self.var_p_noti_bar.get():
                prompt += f"### {section_idx}. 頂端跑馬燈與廣播接收功能 (通知條)\n"
                prompt += "* 請在網頁的最上方（緊貼螢幕頂端）加入一個橫幅的滾動跑馬燈區塊 (Notification Bar)，預設設定為隱藏。跑馬燈必須使用 CSS 動畫讓文字不斷由右至左平滑滾動。\n"
                prompt += "* 線上更新：監聽 `socket.on('broadcastSchedule', (list) => { ... })`，將接收到的排程陣列儲存至 `localStorage.setItem('broadcasts', JSON.stringify(list))` 並更新至全域變數 `window.broadcasts = list;`。\n"
                prompt += "* 離線支援：在網頁載入時，無論 Socket 是否成功，都必須執行 `fetch('{broadcast_file}').then(res=>res.json()).then(list => { window.broadcasts = list; localStorage.setItem('broadcasts', JSON.stringify(list)); }).catch(() => { window.broadcasts = JSON.parse(localStorage.getItem('broadcasts')||'[]'); });` 確保斷線仍有資料。\n"
                prompt += "* 顯示邏輯：請設定一個 `setInterval` 每 1000 毫秒檢查一次 `window.broadcasts`，並根據以下邏輯判斷是否要顯示跑馬燈：\n"
                prompt += "  ```javascript\n"
                prompt += "  setInterval(() => {\n"
                prompt += "      const now = Date.now(); const bar = document.getElementById('notificationBar'); const msgText = document.getElementById('notificationMsg');\n"
                prompt += "      let activeMsg = null; const list = window.broadcasts || JSON.parse(localStorage.getItem('broadcasts') || '[]');\n"
                prompt += "      for (let b of list) {\n"
                prompt += "          const st = new Date(b.startTime).getTime();\n"
                prompt += "          if (b.mode === 1) {\n"
                prompt += "              const intervalMs = b.intervalMin * 60000; const end = st + ((b.repeatCount - 1) * intervalMs) + 60000;\n"
                prompt += "              if (now >= st && now <= end) { const elapsed = now - st; if (elapsed % intervalMs < 60000) activeMsg = b.message; }\n"
                prompt += "          } else if (b.mode === 2) { const et = new Date(b.endTime).getTime(); if (now >= st && now <= et) activeMsg = b.message; }\n"
                prompt += "      }\n"
                prompt += "      if (activeMsg) { msgText.innerText = activeMsg; bar.style.display = 'block'; } else { bar.style.display = 'none'; }\n"
                prompt += "  }, 1000);\n"
                prompt += "  ```\n\n"
                section_idx += 1

            prompt += f"### {section_idx}. 專屬 UI 規範 (P幣金幣圖示)\n"
            prompt += "- 系統中凡是牽涉到「P幣」或是「P」貨幣的文字或數值旁，【絕對禁止】使用純文字顯示「P幣」或「P」字樣！\n"
            prompt += "- 請一律使用以下圖片網址作為圖示：`https://pandapanda6666.github.io/shop/coin.svg`\n"
            prompt += "- 範例寫法：\n"
            prompt += "  ```html\n"
            prompt += "  <img src=\"https://pandapanda6666.github.io/shop/coin.svg\" class=\"w-6 h-6 inline-block\">\n"
            prompt += "  ```\n\n"
            section_idx += 1

            prompt += f"### {section_idx}. 版權宣告\n"
            prompt += f"- 請在網頁最下方加上版權宣告：「版權所有 © 2026 PandaPanda的AI日常 All Rights Reserved.」。點擊文字必須導向 {pages_base_url}\n\n"
            prompt += "### 開發者提醒\n"
            prompt += "- 請在程式碼頂端加上註解提醒：「請記得將此網頁的網址，加入伺服器管理面板的 CORS 授權網域白名單中，否則會無法連線」。\n\n"

            if mode == "done_new_chat":
                prompt += "請直接提供修改後的完整網頁程式碼，並確保所有代碼集中在單一 HTML 檔案中。以下是我目前的程式碼：\n[此處貼上你開發到一半的原始碼]"
            elif mode == "not_started":
                prompt += "請直接提供完整的網頁程式碼，並確保所有代碼集中在單一 HTML 檔案中。"
            else:
                prompt += "請直接提供修改後的完整網頁程式碼，並確保所有代碼集中在單一 HTML 檔案中。"

            self.prompt_text_area.config(state=tk.NORMAL)
            self.prompt_text_area.delete("1.0", tk.END)
            self.prompt_text_area.insert(tk.END, prompt)
            self.prompt_text_area.config(state=tk.DISABLED)

        self.var_dev_mode.trace_add("write", lambda *args: generate_prompt())
        self.var_p_login.trace_add("write", lambda *args: generate_prompt())
        self.var_p_server.trace_add("write", lambda *args: generate_prompt())
        self.var_p_storage.trace_add("write", lambda *args: generate_prompt())
        self.var_p_whitelist.trace_add("write", lambda *args: generate_prompt())
        self.var_p_python.trace_add("write", lambda *args: generate_prompt())
        self.var_p_issue_btn.trace_add("write", lambda *args: generate_prompt())
        self.var_p_noti_bar.trace_add("write", lambda *args: generate_prompt())
        generate_prompt()
        # --- 商城管理 ---
        tk.Label(tab_shop, text="商城與商品管理", font=("Microsoft JhengHei", 18, "bold"), bg="#0f172a", fg="#818cf8").pack(pady=(20,10), padx=20, anchor=tk.W)
        shop_action_frame = tk.Frame(tab_shop, bg="#0f172a")
        shop_action_frame.pack(fill=tk.X, padx=20)
        
        shop_tree_frame = tk.Frame(tab_shop, bg="#1e293b")
        shop_tree_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        self.shop_tree = ttk.Treeview(shop_tree_frame, columns=("id", "name", "price", "image", "origin", "desc"), show="headings", style="Custom.Treeview")
        for col, text in zip(self.shop_tree["columns"], ["ID", "商品名稱", "售價 (P幣)", "圖片網址", "專屬網域", "描述"]):
            self.shop_tree.heading(col, text=text)
            self.shop_tree.column(col, width=100)
        self.shop_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        def refresh_shop():
            try:
                import requests
                res = requests.get("http://127.0.0.1:48921/api/products", timeout=2)
                if res.status_code == 200:
                    for item in self.shop_tree.get_children():
                        self.shop_tree.delete(item)
                    for p in res.json().get("products", []):
                        self.shop_tree.insert("", tk.END, values=(p.get("id"), p.get("name"), p.get("price"), p.get("image"), p.get("origin"), p.get("desc")))
            except: pass
        
        def open_shop_editor(mode, item=None):
            top = tk.Toplevel(self.root)
            top.title("新增商品" if mode == "add" else "編輯商品")
            top.geometry("400x500")
            top.configure(bg="#0f172a")
            
            tk.Label(top, text="商品 ID (唯一, 英數):", bg="#0f172a", fg="white").pack(pady=(10,0))
            e_id = tk.Entry(top); e_id.pack(fill=tk.X, padx=20)
            tk.Label(top, text="商品名稱:", bg="#0f172a", fg="white").pack(pady=(10,0))
            e_name = tk.Entry(top); e_name.pack(fill=tk.X, padx=20)
            tk.Label(top, text="售價 (P幣):", bg="#0f172a", fg="white").pack(pady=(10,0))
            e_price = tk.Entry(top); e_price.pack(fill=tk.X, padx=20)
            tk.Label(top, text="圖片網址:", bg="#0f172a", fg="white").pack(pady=(10,0))
            e_image = tk.Entry(top); e_image.pack(fill=tk.X, padx=20)
            tk.Label(top, text="專屬網域 (Origin):", bg="#0f172a", fg="white").pack(pady=(10,0))
            e_origin = tk.Entry(top); e_origin.pack(fill=tk.X, padx=20)
            tk.Label(top, text="描述:", bg="#0f172a", fg="white").pack(pady=(10,0))
            e_desc = tk.Entry(top); e_desc.pack(fill=tk.X, padx=20)
            
            if mode == "edit" and item:
                e_id.insert(0, str(item[0]))
                e_name.insert(0, str(item[1]))
                e_price.insert(0, str(item[2]))
                e_image.insert(0, str(item[3]))
                e_origin.insert(0, str(item[4]))
                e_desc.insert(0, str(item[5]))
                e_id.config(state='disabled')
                
            def save():
                try:
                    import requests
                    res = requests.get("http://127.0.0.1:48921/api/products", timeout=2)
                    prods = res.json().get("products", [])
                    new_p = {
                        "id": e_id.get(), "name": e_name.get(), "price": int(e_price.get()),
                        "image": e_image.get(), "origin": e_origin.get(), "desc": e_desc.get()
                    }
                    if mode == "add":
                        prods.append(new_p)
                    else:
                        for i, p in enumerate(prods):
                            if str(p["id"]) == new_p["id"]: prods[i] = new_p
                    requests.post("http://127.0.0.1:48921/api/products/update", json={"products": prods}, timeout=2)
                    refresh_shop()
                    top.destroy()
                except Exception as e:
                    print("Error saving:", e)
            tk.Button(top, text="💾 儲存修改", command=save, bg="#10b981", fg="white", font=("Microsoft JhengHei", 12)).pack(pady=20)

        def add_shop_product():
            open_shop_editor("add")
            
        def edit_shop_product():
            selected = self.shop_tree.selection()
            if not selected: return
            item = self.shop_tree.item(selected[0])['values']
            open_shop_editor("edit", item)
            
        def delete_shop_product():
            selected = self.shop_tree.selection()
            if not selected: return
            item = self.shop_tree.item(selected[0])['values']
            try:
                import requests
                res = requests.get("http://127.0.0.1:48921/api/products", timeout=2)
                prods = res.json().get("products", [])
                prods = [p for p in prods if str(p.get("id")) != str(item[0])]
                requests.post("http://127.0.0.1:48921/api/products/update", json={"products": prods}, timeout=2)
                refresh_shop()
            except: pass
            
        tk.Button(shop_action_frame, text="🔄 重新整理", command=refresh_shop, bg="#3b82f6", fg="white", font=("Microsoft JhengHei", 12)).pack(side=tk.LEFT, padx=5)
        tk.Button(shop_action_frame, text="➕ 新增商品", command=add_shop_product, bg="#10b981", fg="white", font=("Microsoft JhengHei", 12)).pack(side=tk.LEFT, padx=5)
        tk.Button(shop_action_frame, text="✏️ 編輯商品", command=edit_shop_product, bg="#f59e0b", fg="white", font=("Microsoft JhengHei", 12)).pack(side=tk.LEFT, padx=5)
        tk.Button(shop_action_frame, text="🗑️ 刪除商品", command=delete_shop_product, bg="#ef4444", fg="white", font=("Microsoft JhengHei", 12)).pack(side=tk.LEFT, padx=5)
        
        # Initial load
        self.root.after(2000, refresh_shop)



        
        # --- MC 開服專區 ---
        tk.Label(tab_mc_server, text="Minecraft 開服專區", font=("Microsoft JhengHei", 18, "bold"), bg="#0f172a", fg="#818cf8").pack(pady=(20,10), padx=20, anchor=tk.W)

        mc_frame = tk.Frame(tab_mc_server, bg="#1e293b", padx=20, pady=20)
        mc_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        tk.Label(mc_frame, text="伺服器核心 (Jar 檔案):", bg="#1e293b", fg="white", font=("Microsoft JhengHei", 12)).grid(row=0, column=0, sticky=tk.W, pady=5)
        self.mc_jar_var = tk.StringVar(value=self.github_config.get("mc_jar", ""))
        tk.Entry(mc_frame, textvariable=self.mc_jar_var, width=50, font=("Consolas", 11), bg="#0f172a", fg="white", relief=tk.FLAT).grid(row=0, column=1, padx=5, pady=5)
        def select_jar():
            path = filedialog.askopenfilename(title="選擇 Minecraft 伺服器核心", filetypes=[("JAR Files", "*.jar")])
            if path:
                self.mc_jar_var.set(path)
                self.github_config["mc_jar"] = path
                self.save_config()
        tk.Button(mc_frame, text="瀏覽...", command=select_jar, bg="#3b82f6", fg="white", font=("Microsoft JhengHei", 10, "bold"), relief=tk.FLAT).grid(row=0, column=2, padx=5, pady=5)

        tk.Label(mc_frame, text="配置記憶體 (GB):", bg="#1e293b", fg="white", font=("Microsoft JhengHei", 12)).grid(row=1, column=0, sticky=tk.W, pady=5)
        self.mc_mem_var = tk.StringVar(value=self.github_config.get("mc_mem", "4"))
        def update_mem(*args):
            self.github_config["mc_mem"] = self.mc_mem_var.get()
            self.save_config()
        self.mc_mem_var.trace_add("write", update_mem)
        tk.Entry(mc_frame, textvariable=self.mc_mem_var, width=10, font=("Consolas", 11), bg="#0f172a", fg="white", relief=tk.FLAT).grid(row=1, column=1, sticky=tk.W, padx=5, pady=5)
        
        def start_mc():
            jar = self.mc_jar_var.get()
            mem = self.mc_mem_var.get()
            if not jar or not os.path.exists(jar):
                return messagebox.showerror("錯誤", "找不到核心檔案，請重新選取", parent=mgr_win)
            self.log(f"\n[系統] 準備啟動 Minecraft 伺服器...\n路徑: {jar}\n記憶體: {mem}G")
            try:
                cmd = ["java", f"-Xmx{mem}G", f"-Xms{mem}G", "-jar", os.path.basename(jar), "nogui"]
                self.mc_process = subprocess.Popen(cmd, cwd=os.path.dirname(jar), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, stdin=subprocess.PIPE, text=True, encoding='utf-8', errors='ignore', creationflags=CREATE_NO_WINDOW)
                def monitor_mc():
                    for line in iter(self.mc_process.stdout.readline, ''):
                        if not line: break
                        self.log(f"[MC] {line.strip()}")
                threading.Thread(target=monitor_mc, daemon=True).start()
            except Exception as e:
                self.log(f"[系統] 啟動 MC 失敗: {e}")

        def stop_mc():
            if self.mc_process and self.mc_process.poll() is None:
                self.log("[系統] 正在關閉 Minecraft 伺服器...")
                try:
                    self.mc_process.stdin.write("stop\n")
                    self.mc_process.stdin.flush()
                except:
                    try: self.mc_process.terminate()
                    except: pass
            else:
                messagebox.showinfo("提示", "Minecraft 伺服器並未執行中", parent=mgr_win)

        btn_action_frame = tk.Frame(mc_frame, bg="#1e293b")
        btn_action_frame.grid(row=2, column=0, columnspan=3, pady=20)
        tk.Button(btn_action_frame, text="▶️ 啟動 Minecraft 伺服器", command=start_mc, bg="#10b981", fg="white", font=("Microsoft JhengHei", 12, "bold"), relief=tk.FLAT, padx=15).pack(side=tk.LEFT, padx=10)
        tk.Button(btn_action_frame, text="⏹️ 關閉伺服器", command=stop_mc, bg="#ef4444", fg="white", font=("Microsoft JhengHei", 12, "bold"), relief=tk.FLAT, padx=15).pack(side=tk.LEFT, padx=10)
        self.start_mc = start_mc
        self.stop_mc = stop_mc

        refresh_apps()
        
        def refresh_list():
            for i in tree.get_children(): tree.delete(i)
            try:
                data = requests.get(f"{LOCAL_API}/users", timeout=2).json()
                for uname, udata in data.get('users', {}).items(): 
                    tree.insert("", tk.END, values=(uname, udata.get('nickname', uname), udata.get('level', 1), udata.get('p_coin', 0), udata.get('gmail') or "未綁定", "🟢 在線" if uname in data.get('online', []) else "⚪ 離線", "⭐ 管理員" if uname in data.get('admins', []) else "一般", "⛔ 封鎖中" if uname in data.get('banned', {}) else "正常"))
            except Exception as e:
                self.log(f"[系統警告] 無法重新整理用戶列表: {str(e)}")
            refresh_history()
            refresh_issues()
            refresh_errors()
            refresh_broadcast_tree()
            refresh_cors()
                
        tk.Button(top_frame, text="🔄 重新整理", bg="#3b82f6", fg="white", font=("Microsoft JhengHei", 12, "bold"), command=refresh_list, relief=tk.FLAT, padx=15).pack(side=tk.RIGHT)
        self.root.after(1000, refresh_list)
        # self.check_local_command() # Removed to prevent AttributeError
        import os
        if os.path.exists("remote_start_flag.txt"):
            try:
                os.remove("remote_start_flag.txt")
                self.root.after(3000, lambda: [getattr(self, 'start_mc')() if hasattr(self, 'start_mc') else None])
            except: pass


    def push_broadcast_to_github(self, broadcasts_data, site=None):
        token = self.github_config.get("token")
        repo = self.github_config.get("repo")
        path = self.github_config.get("path", "server_url.txt")
        if not token or not repo or not path: return
        
        # Site-specific path mappings for GitHub repo
        site_paths = {
            "seeker": "Seeker/server_broadcast.json",
            "competition": "Seeker/Seeker Competition Web/server_broadcast.json",
            "fanfic": "Seeker/Seeker Fanfic Web/server_broadcast.json",
            "review": "Seeker/Seeker Review Web/server_broadcast.json",
            "seekerpedia": "Seeker/Seekerpedia/server_broadcast.json",
            "shop": "shop/server_broadcast.json"
        }
        
        if site and site in site_paths:
            b_path = site_paths[site]
        else:
            b_path = path.replace("server_url.txt", "server_broadcast.json") if "server_url.txt" in path else path + "_broadcast.json"
            
        self.log(f"[系統] 正在將離線廣播設定推送至 GitHub ({b_path})...")
        api_url = f"https://api.github.com/repos/{repo}/contents/{b_path}"
        headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"}
        
        try:
            offline_b = [b for b in broadcasts_data if b.get('offline')]
            content_str = json.dumps(offline_b, ensure_ascii=False)
            
            get_res = requests.get(api_url, headers=headers, timeout=10)
            sha = get_res.json().get('sha') if get_res.status_code == 200 else None
            data = {"message": f"Update Broadcasts ({b_path}): {time.strftime('%Y-%m-%d %H:%M:%S')}", "content": base64.b64encode(content_str.encode('utf-8')).decode('utf-8')}
            if sha: data["sha"] = sha
            requests.put(api_url, headers=headers, json=data)
            self.log(f"[系統] 離線廣播設定推送成功！({b_path})")
        except Exception as e: self.log(f"[系統] 離線廣播推送失敗: {e}")

    def log(self, msg, color=None, remote_sync=True):
        def _do_log():
            try:
                self.log_area.config(state='normal')
                self.log_area.insert('end', msg + "\n")
                self.log_area.see('end')
                self.log_area.config(state='disabled')
                log_file = "system_logs.txt"
                lines = []
                import os
                if os.path.exists(log_file):
                    with open(log_file, 'r', encoding='utf-8', errors='ignore') as f: lines = f.readlines()
                lines.append(msg + "\n")
                if len(lines) > 200: lines = lines[-200:]
                with open(log_file, 'w', encoding='utf-8') as f: f.writelines(lines)
            except: pass
            
            if remote_sync:
                try:
                    import threading, requests
                    def push():
                        try:
                            requests.post("http://127.0.0.1:48921/api/log", json={"text": msg}, timeout=2)
                        except: pass
                    threading.Thread(target=push, daemon=True).start()
                except: pass
                
        self.root.after(0, _do_log)
        
    def run_hidden(self, cmd):
        try: return subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, creationflags=CREATE_NO_WINDOW).decode('utf-8', errors='ignore')
        except subprocess.CalledProcessError as e: return e.output.decode('utf-8', errors='ignore')

    def save_error_log(self, error_msg):
        error_file = "error.json"
        data = []
        if os.path.exists(error_file):
            try:
                with open(error_file, 'r', encoding='utf-8') as f: data = json.load(f)
            except: pass
        data.insert(0, { "timestamp": time.strftime('%Y-%m-%d %H:%M:%S'), "source": "伺服器背景", "error_message": error_msg, "location": "本機伺服器", "device": "管理面板", "user": "系統" })
        data = data[:2000]
        try:
            with open(error_file, 'w', encoding='utf-8') as f: json.dump(data, f, ensure_ascii=False, indent=4)
        except Exception as e: self.log(f"[系統] 無法儲存錯誤紀錄: {e}")
            
    def verify_github(self):
        self.log("[1/6] 驗證 GitHub 設定與權限...")
        token, repo, path = self.github_config.get("token"), self.github_config.get("repo"), self.github_config.get("path")
        if not token or not repo or not path: return False
        api_url = f"https://api.github.com/repos/{repo}/contents/{path}"
        headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"}
        try:
            res = requests.get(api_url, headers=headers, timeout=10)
            if res.status_code == 200: return True
            elif res.status_code == 404: return requests.put(api_url, headers=headers, json={"message": "Auto create", "content": base64.b64encode(b"INITIALIZING").decode('utf-8')}, timeout=10).status_code in [200, 201]
            return False
        except: return False
            
    def push_to_github_and_wait(self, url, path=None, silent=False):
        token, repo = self.github_config.get("token"), self.github_config.get("repo")
        if not path:
            path = self.github_config.get("path")
        if not silent:
            self.log(f"[6/6] 正在將外網網址加密並推送至 GitHub ({repo})...")
        api_url = f"https://api.github.com/repos/{repo}/contents/{path}"
        headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"}
        try:
            encrypted_url = base64.b64encode(url.encode('utf-8')).decode('utf-8')[::-1]
            data_content = base64.b64encode(encrypted_url.encode('utf-8')).decode('utf-8')
            
            put_success = False
            for attempt in range(3):
                get_res = requests.get(api_url, headers=headers, timeout=10)
                sha = get_res.json().get('sha') if get_res.status_code == 200 else None
                data = { "message": f"Update Server URL: {time.strftime('%Y-%m-%d %H:%M:%S')}", "content": data_content }
                if sha: data["sha"] = sha
                put_res = requests.put(api_url, headers=headers, json=data, timeout=10)
                if put_res.status_code in [200, 201]:
                    put_success = True
                    break
                time.sleep(1)
                
            if put_success:
                if silent:
                    return True
                self.log(f"[系統] 網址已加密並推送，等待 GitHub Pages/Actions 部署 (約 1~3 分鐘)...")
                self.root.after(0, lambda: self.progress_var.set(95))
                time.sleep(5)
                for _ in range(30):
                    try:
                        act_res = requests.get(f"https://api.github.com/repos/{repo}/actions/runs", headers=headers)
                        if act_res.status_code == 200 and act_res.json().get('workflow_runs'):
                            if act_res.json()['workflow_runs'][0].get('status') == "completed": return True
                    except: pass
                    time.sleep(5)
                return True
            return False
        except: return False
            
    def cleanup_port(self, port):
        self.log(f"[2/6] 清理並確保連接埠 {port} 可用...")
        try:
            for line in self.run_hidden(f"netstat -ano | findstr :{port}").splitlines():
                if "LISTENING" in line: self.run_hidden(f"taskkill /F /PID {line.strip().split()[-1]}")
        except: pass
        return True
        
    def install_node_modules(self):
        if not os.path.exists("node_modules"): self.log("[3/6] 正在安裝 Node.js 模組..."); self.run_hidden("npm install express socket.io")
        return True
        
    def start_node(self):
        self.log("[4/6] 啟動本地 Node.js 伺服器 (server.js)...")
        try:
            import os
            log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "server_out.log")
            self.node_log_file = open(log_path, "a", encoding="utf-8")
            self.node_process = subprocess.Popen(["node", "server.js"], stdout=self.node_log_file, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, creationflags=0x00000008 | 0x00000200)
            # Do not append to self.processes so it survives UI restart
            def monitor():
                with open(log_path, "r", encoding="utf-8") as f:
                    f.seek(0, 2)
                    while self.is_running:
                        line = f.readline()
                        if not line:
                            import time; time.sleep(0.1); continue
                        stripped = line.strip()
                        if not stripped: continue
                        self.log(f"[伺服器] {stripped}")
            import threading
            threading.Thread(target=monitor, daemon=True).start()
            return True
        except:
            return False
            
    def start_tunnel(self):
        import os
        import threading
        
        use_ngrok = self.var_use_ngrok.get()
        use_cf = self.var_use_cf.get()
        
        if not use_ngrok and not use_cf:
            self.log("[系統] 警告：您沒有啟用任何穿透通道！伺服器將只能在本地端連線。")
            self.current_url = "http://127.0.0.1:48921"
            self.url_var.set(self.current_url)
            return True

        self.log("[5/6] 正在啟動外網穿透通道...")
        
        # 啟動 Ngrok
        def get_routes():
            ngrok_paths = set()
            cf_paths = set()
            try:
                import requests
                import urllib.parse
                import time
                res = None
                for _ in range(10):
                    try:
                        res = requests.get(f"http://127.0.0.1:48921/api/settings", timeout=3).json()
                        break
                    except:
                        time.sleep(1)
                origins = res.get("allowedOrigins", []) if res else []
                routes = getattr(self, "tunnel_routes", self.github_config.get("tunnel_routes", {}))
                for origin in origins:
                    if "github.io" not in origin: continue
                    subpath = origin.split(".github.io")[-1].strip('/')
                    subpath = urllib.parse.unquote(subpath) # Decode %20 to space
                    path = f"{subpath}/server_url.txt" if subpath else "server_url.txt"
                    if routes.get(origin, "ngrok") == "ngrok": ngrok_paths.add(path)
                    else: cf_paths.add(path)
            except: pass
            if not ngrok_paths: ngrok_paths.add("server_url.txt")
            return list(ngrok_paths), list(cf_paths)

        if use_ngrok:
            try:
                ngrok_domain = self.github_config.get("ngrok_domain", "tile-amber-unit.ngrok-free.dev")
                self.log(f"      ▶ 啟動 Ngrok 隧道 (網域: {ngrok_domain})")
                
                ngrok_cmd = "ngrok.exe" if os.path.exists("ngrok.exe") else "ngrok"
                p_ngrok = subprocess.Popen([ngrok_cmd, "http", "--domain=" + ngrok_domain, "48921"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, stdin=subprocess.DEVNULL, creationflags=0x00000008 | 0x00000200)
                self.processes.append(p_ngrok)
                
                ngrok_url = f"https://{ngrok_domain}"
                self.current_url = ngrok_url
                self.url_var.set(self.current_url)
                
                try:
                    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "current_url.txt"), "w", encoding="utf-8") as uf: uf.write(self.current_url)
                except: pass
                
                self.ngrok_url = ngrok_url
                self.is_failover_to_cf = False
                ngrok_paths, _ = get_routes()
                self.ngrok_paths = list(ngrok_paths)
                self.log(f"      ▶ 正在將 Ngrok 網址推送至 Github ({len(ngrok_paths)} 個路徑)...")
                main_path = self.github_config.get("path")
                for path in ngrok_paths:
                    if path == main_path:
                        continue
                    threading.Thread(target=self.push_to_github_and_wait, args=(ngrok_url, path), kwargs={"silent": True}, daemon=True).start()
                threading.Thread(target=self._verify_ngrok_startup, args=(ngrok_url,), daemon=True).start()
            except Exception as e:
                self.log(f"      ❌ Ngrok 啟動失敗: {e}")

        if use_cf:
            try:
                self.log("      ▶ 啟動 Cloudflare 隧道 (高流量專用)")
                log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tunnel_out.log")
                self.cf_log_file = open(log_path, "w", encoding="utf-8")
                p_cf = subprocess.Popen(["cloudflared.exe", "tunnel", "--protocol", "http2", "--url", "http://localhost:48921"], stdout=self.cf_log_file, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, creationflags=0x00000008 | 0x00000200)
                
                def monitor():
                    with open(log_path, "r", encoding="utf-8") as f:
                        f.seek(0, 2)
                        while self.is_running:
                            line = f.readline()
                            if not line:
                                import time; time.sleep(0.1); continue
                            if "https://" in line and ".trycloudflare.com" in line:
                                for part in line.strip().split():
                                    if "https://" in part and ".trycloudflare.com" in part:
                                        new_url = part.replace('|', '').strip()
                                        if not getattr(self, 'cf_current_url', None) or new_url != self.cf_current_url:
                                            self.cf_current_url = new_url
                                            self.cf_start_time = time.time()
                                            if not use_ngrok:
                                                self.current_url = new_url
                                                self.url_var.set(self.current_url)
                                                try:
                                                    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "current_url.txt"), "w", encoding="utf-8") as uf: uf.write(self.current_url)
                                                except: pass
                                            if use_ngrok:
                                                self.log(f"[通道] 成功獲取 Cloudflare 網址: {new_url} (主監控保持 Ngrok: {self.current_url})")
                                            
                                            _, cf_paths = get_routes()
                                            if cf_paths:
                                                self.log(f"      ▶ 正在將 Cloudflare 網址推送至 Github ({len(cf_paths)} 個路徑)...")
                                                main_path = self.github_config.get("path")
                                                for path in cf_paths:
                                                    if path == main_path and not use_ngrok:
                                                        continue
                                                    threading.Thread(target=self.push_to_github_and_wait, args=(new_url, path), kwargs={"silent": True}, daemon=True).start()
                threading.Thread(target=monitor, daemon=True).start()
            except Exception as e:
                self.log(f"      ❌ Cloudflare 啟動失敗: {e}")
        
        return True
            
    def restart_ui(self):
        self.log("\n[系統] 正在套用更新並重新啟動面板... (網頁伺服器不受影響)")
        import subprocess, os, sys
        try:
            if hasattr(sys.modules[__name__], 'app_lock_socket'):
                sys.modules[__name__].app_lock_socket.close()
            
            python_exe = sys.executable
            if python_exe.lower().endswith("python.exe"):
                panda_exe = python_exe[:-10] + "PandaPython.exe"
                if os.path.exists(panda_exe):
                    python_exe = panda_exe
            elif python_exe.lower().endswith("pythonw.exe"):
                panda_exe = python_exe[:-11] + "PandaPythonw.exe"
                if os.path.exists(panda_exe):
                    python_exe = panda_exe

            subprocess.Popen([python_exe, sys.argv[0]], stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=0x00000208)
            self.root.destroy()
            os._exit(0)
        except Exception as e:
            self.log(f"[錯誤] 重啟面板失敗: {e}")

    def _run_sequence(self):
        
        # 1. 停止我們先前啟動的所有服務 (清空 self.processes)
        self.stop_all(silent=True, force=True)
        self.is_running = True
        self.current_url = ""
        self.root.after(0, lambda: self.progress_var.set(5))
        
        # 2. 等待並檢測 Port 48921 是否被背景守護進程佔用
        port_in_use = False
        import time
        time.sleep(1) # 等待 stop_all 徹底關閉進程
        for _ in range(6):
            if is_port_listening(48921):
                port_in_use = True
                break
            time.sleep(0.5)

        if port_in_use:
            self.log("[系統] 檢測到背景網頁服務已在運行，跳過網頁初始化。")
            self.root.after(0, lambda: self.progress_var.set(100))
            self.is_running = True
            self.is_restarting = False
            self.log("\n[完成] 所有服務已就緒！")
            self.root.after(0, lambda: self.auto_btn.config(state=tk.NORMAL, text="🔄 手動重新啟動", bg="#34d399"))
            
            # 確保啟動時開啟登入中心
            def open_hub_api():
                import requests, time as t
                for _ in range(5):
                    try:
                        res = requests.post("http://127.0.0.1:48921/api/system/status", json={"open": True}, timeout=2)
                        if res.status_code == 200:
                            break
                    except: pass
                    t.sleep(1)
            
            def poll_bg_logs():
                import requests, time as t
                last_id = -1
                while self.is_running:
                    try:
                        res = requests.get("http://127.0.0.1:48921/api/system/logs", timeout=2)
                        if res.status_code == 200:
                            logs = res.json().get("logs", [])
                            if logs:
                                if last_id == -1:
                                    # Print up to last 20 logs on first connection
                                    start_idx = max(0, len(logs) - 20)
                                    self.log("[系統] 已連線至背景伺服器，載入最近日誌...")
                                    for log in logs[start_idx:]:
                                        self.log(f"[背景] {log.get('msg', '')}")
                                    last_id = logs[-1].get("id", 0)
                                else:
                                    for log in logs:
                                        lid = log.get("id", 0)
                                        if lid > last_id:
                                            self.log(f"[背景] {log.get('msg', '')}")
                                            last_id = lid
                    except: pass
                    t.sleep(1)

            import threading
            threading.Thread(target=open_hub_api, daemon=True).start()
            threading.Thread(target=poll_bg_logs, daemon=True).start()

            try:
                from plyer import notification
                notification.notify(title="伺服器啟動成功", message="管理面板與所有外網連線隧道已準備就緒！", app_name="PandaPanda管理系統", timeout=5)
            except: pass
            return

        # 3. 如果沒有背景進程，則由 run.py 自己啟動
        if not self.verify_github() or not self.cleanup_port(48921) or not self.install_node_modules() or not self.start_node() or not self.start_tunnel(): 
            return self.root.after(0, lambda: self.auto_btn.config(state=tk.NORMAL, text="啟動失敗", bg="#f87171"))
        
        # 啟動後開啟登入中心
        def open_hub_api_new():
            import requests, time as t
            for _ in range(10):
                try:
                    res = requests.post("http://127.0.0.1:48921/api/system/status", json={"open": True}, timeout=2)
                    if res.status_code == 200:
                        break
                except: pass
                t.sleep(1)
        import threading
        threading.Thread(target=open_hub_api_new, daemon=True).start()

        waited = 0
        while not self.current_url and waited < 40: time.sleep(1); waited += 1
        if not self.current_url: return self.root.after(0, lambda: self.auto_btn.config(state=tk.NORMAL, text="連線逾時", bg="#f87171"))
        if not self.push_to_github_and_wait(self.current_url): return self.root.after(0, lambda: self.auto_btn.config(state=tk.NORMAL, text="推送失敗", bg="#f87171"))
        if hasattr(self, "ngrok_pushed_event"): self.ngrok_pushed_event.set()
        
        self.root.after(0, lambda: self.progress_var.set(100))
        self.log("\n[完成] 所有服務已就緒！")
        self.root.after(0, lambda: self.auto_btn.config(state=tk.NORMAL, text="🔄 手動重新啟動", bg="#34d399"))
        self.is_running = True
        self.is_restarting = False
        self.is_background_hooked = False
        try:
            from plyer import notification
            notification.notify(title="伺服器啟動成功", message="管理面板與所有外網連線隧道已準備就緒！", app_name="PandaPanda管理系統", timeout=5)
        except: pass
    
    def one_click_start(self):
        if self.is_restarting: return
        self.is_restarting = False; self.is_running = False; self.last_start_time = time.time()
        if self.timer_check_id: self.root.after_cancel(self.timer_check_id); self.timer_check_id = None
        self.check_timer(); self.health_fail_count = 0; self.url_var.set("系統啟動中..."); self.current_url = ""
        self.auto_btn.config(state=tk.DISABLED, text="⏳ 啟動中...", bg="#94a3b8"); self.progress_var.set(0)
        self.log("\n" + "="*40 + "\n自動啟動流程開始...")
        
        def do_hard_reset():
            self.stop_all(silent=True, force=True)
            try:
                import subprocess
                out1 = subprocess.check_output("netstat -ano | findstr :48921", shell=True).decode("cp950", errors="ignore")
                for line in out1.splitlines():
                    if "LISTENING" in line:
                        pid = line.strip().split()[-1]
                        self.run_hidden(f"taskkill /F /PID {pid} /T")
                out2 = subprocess.check_output('wmic process where "name=\'cloudflared.exe\'" get processid,commandline', shell=True).decode("cp950", errors="ignore")
                for line in out2.splitlines():
                    if "48921" in line:
                        pid = line.strip().split()[-1]
                        if pid.isdigit():
                            self.run_hidden(f"taskkill /F /PID {pid} /T")
            except: pass
            self._run_sequence()
        threading.Thread(target=do_hard_reset, daemon=True).start()
        
    def stop_all(self, silent=False, force=False):
        self.is_running = False
        if self.timer_check_id: self.root.after_cancel(self.timer_check_id); self.timer_check_id = None
        if self.mc_process and self.mc_process.poll() is None:
            try: self.mc_process.stdin.write("stop\n"); self.mc_process.stdin.flush(); self.mc_process.wait(timeout=5)
            except: 
                try: self.mc_process.terminate()
                except: pass
            self.mc_process = None
        
        if not silent:
            try:
                import requests
                requests.post("http://127.0.0.1:48921/api/system/status", json={"open": False}, timeout=3)
            except: pass

        for p in self.processes:
            try:
                self.run_hidden(f"taskkill /F /PID {p.pid} /T")
            except: pass
            try: p.terminate()
            except: pass
        if force:
            try:
                self.run_hidden("taskkill /F /IM node.exe /T")
                self.run_hidden("taskkill /F /IM cloudflared.exe /T")
                self.run_hidden("taskkill /F /IM PandaPythonw.exe /T")
            except: pass
            if hasattr(self, 'node_process') and self.node_process:
                try: self.node_process.terminate()
                except: pass
                self.node_process = None
        self.processes = []
        if not silent: 
            self.url_var.set("伺服器已離線"); self.progress_var.set(0)
            self.log("\\n[系統] ⏹️ 已停止所有服務。\\n" + "="*40 + "\n")
            self.is_restarting = False

if __name__ == '__main__':
    import sys
    root = tk.Tk()
    app = ServerControlGUI(root)
    
    if len(sys.argv) > 1:
        if sys.argv[1] == 'open_account':
            root.withdraw()
            app.open_account_manager()
        elif sys.argv[1] == 'open_settings':
            root.withdraw()
            app.open_settings()
            
        def check_exit():
            has_toplevel = False
            for widget in root.winfo_children():
                if isinstance(widget, tk.Toplevel) and widget.winfo_exists():
                    has_toplevel = True
                    break
            if not has_toplevel:
                root.destroy()
            else:
                root.after(1000, check_exit)
        root.after(1000, check_exit)
    
    root.protocol("WM_DELETE_WINDOW", lambda: (app.stop_all(silent=True), root.destroy()))
    root.mainloop()
# 版權所有 © 2026 PandaPanda的AI日常 (https://pandapanda6666.github.io) All Rights Reserved.