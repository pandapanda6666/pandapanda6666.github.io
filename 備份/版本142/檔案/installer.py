import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import os, sys, urllib.request, zipfile, subprocess

def start_install():
    target_dir = path_var.get()
    if not target_dir:
        messagebox.showerror("錯誤", "請選擇安裝路徑")
        return
        
    if not os.path.exists(target_dir):
        try:
            os.makedirs(target_dir, exist_ok=True)
        except Exception as e:
            messagebox.showerror("錯誤", f"無法建立資料夾: {e}")
            return
            
    btn.config(state="disabled")
    
    # 1. 下載免安裝版 Python
    status_var.set("正在下載免安裝版 Python 環境...")
    root.update()
    python_zip_url = "https://www.python.org/ftp/python/3.11.8/python-3.11.8-embed-amd64.zip"
    zip_path = os.path.join(target_dir, "python_env.zip")
    try:
        urllib.request.urlretrieve(python_zip_url, zip_path)
    except Exception as e:
        messagebox.showerror("錯誤", f"下載 Python 環境失敗: {e}")
        btn.config(state="normal")
        return

    # 2. 解壓縮並重新命名 PandaPythonw.exe
    status_var.set("正在配置 Python 環境...")
    root.update()
    env_dir = os.path.join(target_dir, "PandaEnv")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(env_dir)
    os.remove(zip_path)
    
    # 重新命名
    try:
        os.rename(os.path.join(env_dir, "pythonw.exe"), os.path.join(env_dir, "PandaPythonw.exe"))
    except:
        pass # 可能已存在或失敗

    # 3. 下載檔案
    base_url = "https://raw.githubusercontent.com/pandapanda6666/pandapanda6666.github.io/main/"
    files = {
        "run.pyw": "run.pyw",
        "index.html": "Edit/Video/Add%20subtitles/index.html",
        "tailwindcss.js": "Edit/Video/Add%20subtitles/tailwindcss.js"
    }
    
    for name, path in files.items():
        status_var.set(f"正在下載 {name}...")
        root.update()
        try:
            urllib.request.urlretrieve(base_url + path, os.path.join(target_dir, name))
        except Exception as e:
            messagebox.showerror("錯誤", f"下載 {name} 失敗: {e}")
            btn.config(state="normal")
            return
            
    status_var.set("正在建立啟動捷徑...")
    root.update()
    
    # 建立啟動.bat
    bat_content = f"""@echo off\r\nchcp 65001 >nul\r\ncd /d "%~dp0"\r\nstart "" "PandaEnv\\PandaPythonw.exe" run.pyw\r\n"""
    bat_path = os.path.join(target_dir, "啟動字幕編輯器.bat")
    with open(bat_path, "w", encoding="utf-8-sig") as f:
        f.write(bat_content)
        
    # 建立桌面捷徑 (透過 VBScript)
    vbs_content = f"""
Set oWS = WScript.CreateObject("WScript.Shell")
strDesktop = oWS.SpecialFolders("Desktop")
Set oLink = oWS.CreateShortcut(strDesktop & "\字幕編輯工具.lnk")
oLink.TargetPath = "{bat_path}"
oLink.WorkingDirectory = "{target_dir}"
oLink.IconLocation = "shell32.dll, 116"
oLink.Save
"""
    vbs_path = os.path.join(target_dir, "create_shortcut.vbs")
    with open(vbs_path, "w", encoding="utf-8") as f:
        f.write(vbs_content)
    os.system(f'cscript //nologo "{vbs_path}"')
    os.remove(vbs_path)
    
    status_var.set("安裝完成！")
    messagebox.showinfo("安裝成功", "字幕編輯工具 已成功安裝！\n捷徑已建立於您的桌面。")
    root.destroy()

def browse():
    d = filedialog.askdirectory(initialdir=path_var.get())
    if d:
        path_var.set(d)

root = tk.Tk()
root.title("字幕編輯工具 - 安裝程式")
root.geometry("450x200")
root.resizable(False, False)

root.eval('tk::PlaceWindow . center')

frame = ttk.Frame(root, padding=20)
frame.pack(fill="both", expand=True)

ttk.Label(frame, text="請選擇安裝目錄:", font=("", 10, "bold")).pack(anchor="w", pady=(0,5))

path_frame = ttk.Frame(frame)
path_frame.pack(fill="x", pady=5)

default_dir = os.path.join(os.environ.get('USERPROFILE', 'C:'), 'PandaSubtitleEditor')
path_var = tk.StringVar(value=default_dir)

ttk.Entry(path_frame, textvariable=path_var).pack(side="left", fill="x", expand=True, padx=(0,5))
ttk.Button(path_frame, text="瀏覽...", command=browse).pack(side="right")

status_var = tk.StringVar(value="準備就緒")
ttk.Label(frame, textvariable=status_var, foreground="gray").pack(anchor="w", pady=10)

btn = ttk.Button(frame, text="立即安裝", command=start_install)
btn.pack(pady=10)

root.mainloop()