import os
import sys
import shutil
import urllib.request
import winreg
import tkinter as tk
from tkinter import ttk, messagebox, filedialog

TOOL_NAME = "字幕編輯工具"
MAGIC_NAME = f"PandaPanda的AI日常___{TOOL_NAME}"
FIXED_FOLDER = "PandaSubtitleEditor"
TARGET_LAUNCHER = f"{MAGIC_NAME}.exe"

def run_install():
    dest = path_var.get().strip()
    if not dest:
        messagebox.showerror("錯誤", "請輸入有效的安裝目錄！")
        return
    if not dest.endswith(FIXED_FOLDER):
        dest = os.path.join(dest, FIXED_FOLDER)
        path_var.set(dest)

    btn_install.config(state="disabled")
    btn_browse.config(state="disabled")
    chk_shortcut.config(state="disabled")
    
    try:
        os.makedirs(dest, exist_ok=True)
        files_to_install = [
            TARGET_LAUNCHER,
            "run.pyw",
            "index.html",
            "tailwindcss.js",
            "啟動字幕編輯器.bat"
        ]
        base_urls = [
            "https://raw.githubusercontent.com/pandapanda6666/pandapanda6666.github.io/main/",
            "https://raw.githubusercontent.com/pandapanda6666/pandapanda6666.github.io/main/Edit/Video/Add%20subtitles/"
        ]

        script_dir = os.path.dirname(os.path.abspath(__file__))
        total = len(files_to_install)
        for i, file in enumerate(files_to_install):
            status_var.set(f"正在部署核心檔案 ({i+1}/{total}): {file} ...")
            progress_var.set(int(((i+1.0)/(total+1))*80))
            root.update()

            dest_file = os.path.join(dest, file)
            local1 = os.path.join(script_dir, file)
            local2 = os.path.join(script_dir, "Edit", "Video", "Add subtitles", file)
            local3 = os.path.join(r"L:\我的雲端硬碟\硬體及自製軟體\自製軟體\字幕編輯工具", file)

            if os.path.exists(local1):
                shutil.copy2(local1, dest_file)
            elif os.path.exists(local2):
                shutil.copy2(local2, dest_file)
            elif os.path.exists(local3):
                shutil.copy2(local3, dest_file)
            else:
                for base in base_urls:
                    try:
                        urllib.request.urlretrieve(base + urllib.parse.quote(file), dest_file)
                        break
                    except Exception:
                        pass

        # 拷貝 ffmpeg.exe
        dest_ffmpeg = os.path.join(dest, "ffmpeg.exe")
        if not os.path.exists(dest_ffmpeg):
            local_ff1 = os.path.join(script_dir, "ffmpeg.exe")
            local_ff2 = r"L:\我的雲端硬碟\硬體及自製軟體\自製軟體\字幕編輯工具\ffmpeg.exe"
            if os.path.exists(local_ff1): shutil.copy2(local_ff1, dest_ffmpeg)
            elif os.path.exists(local_ff2): shutil.copy2(local_ff2, dest_ffmpeg)

        # 建立解除安裝腳本
        uninst_bat = os.path.join(dest, "uninstall.bat")
        desktop_dir = os.path.join(os.environ.get('USERPROFILE', 'C:\\'), 'Desktop')
        lnk_path = os.path.join(desktop_dir, "字幕編輯工具.lnk")
        with open(uninst_bat, 'w', encoding='big5') as f:
            f.write("@echo off\r\n")
            f.write("chcp 65001 >nul\r\n")
            f.write("echo 正在解除安裝 PandaPanda 字幕編輯工具...\r\n")
            f.write(f'if exist "{lnk_path}" del /f /q "{lnk_path}"\r\n')
            f.write('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\PandaSubtitleEditor" /f >nul 2>nul\r\n')
            f.write("timeout /t 1 >nul\r\n")
            f.write("cd ..\r\n")
            f.write(f'rd /s /q "{dest}"\r\n')
            f.write("echo 解除安裝完成！\r\n")
            f.write("pause\r\n")

        # 寫入註冊表
        status_var.set("正在註冊系統資訊...")
        progress_var.set(90)
        root.update()
        exe_path = os.path.join(dest, TARGET_LAUNCHER)
        try:
            key_path = r"Software\Microsoft\Windows\CurrentVersion\Uninstall\PandaSubtitleEditor"
            key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, key_path)
            winreg.SetValueEx(key, "DisplayName", 0, winreg.REG_SZ, "字幕編輯工具 (PandaPanda的AI日常)")
            winreg.SetValueEx(key, "DisplayVersion", 0, winreg.REG_SZ, "1.0.0")
            winreg.SetValueEx(key, "Publisher", 0, winreg.REG_SZ, "PandaPanda")
            winreg.SetValueEx(key, "InstallLocation", 0, winreg.REG_SZ, dest)
            winreg.SetValueEx(key, "UninstallString", 0, winreg.REG_SZ, f'"{uninst_bat}"')
            winreg.SetValueEx(key, "DisplayIcon", 0, winreg.REG_SZ, f'"{exe_path}"')
            winreg.SetValueEx(key, "NoModify", 0, winreg.REG_DWORD, 1)
            winreg.SetValueEx(key, "NoRepair", 0, winreg.REG_DWORD, 1)
            winreg.CloseKey(key)
        except Exception:
            pass

        # 建立桌面捷徑
        if shortcut_var.get():
            status_var.set("正在建立桌面捷徑...")
            progress_var.set(95)
            root.update()
            vbs = f'''Set oWS = WScript.CreateObject("WScript.Shell")
Set oLink = oWS.CreateShortcut("{lnk_path}")
oLink.TargetPath = "{exe_path}"
oLink.WorkingDirectory = "{dest}"
oLink.Description = "PandaPanda 字幕編輯工具"
oLink.IconLocation = "{exe_path}"
oLink.Save
'''
            vbs_p = os.path.join(dest, "sc.vbs")
            with open(vbs_p, 'w', encoding='utf-16') as vf: vf.write(vbs)
            import subprocess
            subprocess.run(["cscript", "//nologo", vbs_p], creationflags=subprocess.CREATE_NO_WINDOW)
            if os.path.exists(vbs_p): os.remove(vbs_p)

        progress_var.set(100)
        status_var.set("安裝成功！已在桌面建立「字幕編輯工具」捷徑與註冊資訊！")
        btn_install.config(text="立即啟動", command=lambda: launch_and_close(dest), state="normal")
    except Exception as e:
        status_var.set(f"安裝錯誤: {e}")
        btn_install.config(state="normal", text="重試安裝")

def launch_and_close(dest):
    exe_path = os.path.join(dest, TARGET_LAUNCHER)
    bat_path = os.path.join(dest, "啟動字幕編輯器.bat")
    if os.path.exists(exe_path):
        os.startfile(exe_path)
    elif os.path.exists(bat_path):
        os.startfile(bat_path)
    root.destroy()

def browse_dir():
    d = filedialog.askdirectory(initialdir=os.environ.get('USERPROFILE', 'C:\\'))
    if d:
        if not d.endswith(FIXED_FOLDER):
            d = os.path.join(d, FIXED_FOLDER)
        path_var.set(d)

root = tk.Tk()
root.title("PandaPanda 字幕編輯工具 - 官方安裝精靈")
root.geometry("540x360")
root.resizable(False, False)

default_dest = os.path.join(os.environ.get('USERPROFILE', 'C:\\'), FIXED_FOLDER)
path_var = tk.StringVar(value=default_dest)
status_var = tk.StringVar(value="準備就緒，請點擊「開始安裝」。")
progress_var = tk.IntVar(value=0)
shortcut_var = tk.BooleanVar(value=True)

frame = ttk.Frame(root, padding=20)
frame.pack(fill="both", expand=True)

ttk.Label(frame, text="PandaPanda AI日常 字幕編輯工具", font=("Microsoft JhengHei", 14, "bold")).pack(anchor="w")
ttk.Label(frame, text="雙語字幕智慧對齊 · 專業 ASS 特效渲染 · 獨立高效本機轉檔核心", font=("Microsoft JhengHei", 9), foreground="gray").pack(anchor="w", pady=(2, 15))

path_frame = ttk.LabelFrame(frame, text=" 安裝位置設定 ", padding=10)
path_frame.pack(fill="x", pady=5)
ttk.Entry(path_frame, textvariable=path_var).pack(side="left", fill="x", expand=True, padx=(0, 5))
btn_browse = ttk.Button(path_frame, text="瀏覽...", command=browse_dir)
btn_browse.pack(side="right")

chk_shortcut = ttk.Checkbutton(frame, text="在桌面建立「字幕編輯工具」捷徑 (推薦)", variable=shortcut_var)
chk_shortcut.pack(anchor="w", pady=10)

ttk.Label(frame, textvariable=status_var, font=("Microsoft JhengHei", 9)).pack(anchor="w")
ttk.Progressbar(frame, variable=progress_var, maximum=100).pack(fill="x", pady=(5, 15))

btn_box = ttk.Frame(frame)
btn_box.pack(anchor="e")
btn_install = ttk.Button(btn_box, text="開始安裝", command=run_install)
btn_install.pack(side="left", padx=5)
ttk.Button(btn_box, text="取消", command=root.destroy).pack(side="left")

root.eval('tk::PlaceWindow . center')
if __name__ == '__main__':
    root.mainloop()