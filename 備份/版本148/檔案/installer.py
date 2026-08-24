import tkinter as tk
import winreg
from tkinter import filedialog, messagebox, ttk
import os, sys, urllib.request, subprocess

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
    
    # 1. 下載獨立執行檔
    status_var.set("正在下載主程式與相關檔案...")
    root.update()
    
    base_url = "https://raw.githubusercontent.com/pandapanda6666/pandapanda6666.github.io/main/"
    files = {
        "PandaPanda的AI日常___字幕編輯工具.exe": "PandaPanda%E7%9A%84AI%E6%97%A5%E5%B8%B8___%E5%AD%97%E5%B9%95%E7%B7%A8%E8%BC%AF%E5%B7%A5%E5%85%B7.exe",
        "uninstall.exe": "uninstall.exe"
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
            
    # 2. 建立桌面捷徑 (透過 VBScript)
    status_var.set("正在建立捷徑與註冊資訊...")
    root.update()
    
    exe_path = os.path.join(target_dir, "PandaPanda的AI日常___字幕編輯工具.exe")
    vbs_content = f'''Set oWS = WScript.CreateObject("WScript.Shell")
strDesktop = oWS.SpecialFolders("Desktop")
Set oLink = oWS.CreateShortcut(strDesktop & "\字幕編輯工具.lnk")
oLink.TargetPath = "{exe_path}"
oLink.WorkingDirectory = "{target_dir}"
oLink.Save
'''
    vbs_path = os.path.join(target_dir, "create_shortcut.vbs")
    with open(vbs_path, "w", encoding="utf-16") as f:
        f.write(vbs_content)
        
    subprocess.run(["cscript", "//nologo", vbs_path], creationflags=subprocess.CREATE_NO_WINDOW)
    
    # 寫入控制台解除安裝登錄檔
    try:
        key_path = r"Software\Microsoft\Windows\CurrentVersion\Uninstall\PandaSubtitleEditor"
        key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, key_path)
        winreg.SetValueEx(key, "DisplayName", 0, winreg.REG_SZ, "字幕編輯工具 (PandaPanda的AI日常)")
        winreg.SetValueEx(key, "DisplayVersion", 0, winreg.REG_SZ, "1.0.0")
        winreg.SetValueEx(key, "Publisher", 0, winreg.REG_SZ, "PandaPanda")
        winreg.SetValueEx(key, "UninstallString", 0, winreg.REG_SZ, f'"{os.path.join(target_dir, "uninstall.exe")}"')
        winreg.SetValueEx(key, "InstallLocation", 0, winreg.REG_SZ, target_dir)
        winreg.SetValueEx(key, "DisplayIcon", 0, winreg.REG_SZ, f'"{exe_path}"')
        winreg.SetValueEx(key, "NoModify", 0, winreg.REG_DWORD, 1)
        winreg.SetValueEx(key, "NoRepair", 0, winreg.REG_DWORD, 1)
        winreg.CloseKey(key)
    except Exception as e:
        pass
        
    status_var.set("安裝完成！您現在可以從桌面開啟捷徑。")
    messagebox.showinfo("完成", "安裝已順利完成！桌面已建立捷徑。")
    root.destroy()

def browse():
    d = filedialog.askdirectory()
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

default_dir = os.path.join(os.environ.get('USERPROFILE', 'C:\\\\'), 'PandaSubtitleEditor')
path_var = tk.StringVar(value=default_dir)

ttk.Entry(path_frame, textvariable=path_var).pack(side="left", fill="x", expand=True, padx=(0,5))
ttk.Button(path_frame, text="瀏覽...", command=browse).pack(side="right")

status_var = tk.StringVar(value="準備就緒")
ttk.Label(frame, textvariable=status_var, foreground="gray").pack(anchor="w", pady=10)

btn = ttk.Button(frame, text="立即安裝", command=start_install)
btn.pack(pady=10)

root.mainloop()