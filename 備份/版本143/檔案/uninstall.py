import tkinter as tk
from tkinter import messagebox, ttk
import winreg
import os
import sys
import subprocess

def start_uninstall():
    btn.config(state="disabled")
    status_var.set("正在移除檔案...")
    root.update()
    
    install_dir = os.path.dirname(os.path.abspath(sys.argv[0]))
    
    try:
        winreg.DeleteKey(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Uninstall\PandaSubtitleEditor")
    except:
        pass
        
    desktop = os.path.join(os.environ.get('USERPROFILE', ''), 'Desktop')
    shortcut_path = os.path.join(desktop, '字幕編輯工具.lnk')
    if os.path.exists(shortcut_path):
        try: os.remove(shortcut_path)
        except: pass
        
    bat_path = os.path.join(os.environ.get('TEMP', ''), 'panda_remove.bat')
    bat_content = '''@echo off
ping 127.0.0.1 -n 3 >nul
rmdir /s /q "{}"
del "%~f0"
'''.format(install_dir)
    with open(bat_path, "w", encoding="utf-8") as f:
        f.write(bat_content)
        
    subprocess.Popen(bat_path, shell=True, creationflags=subprocess.CREATE_NO_WINDOW)
    
    messagebox.showinfo("解除安裝完成", "字幕編輯工具已成功從您的電腦中移除！")
    root.destroy()
    sys.exit(0)

root = tk.Tk()
root.title("解除安裝 - 字幕編輯工具")
root.geometry("400x150")
root.resizable(False, False)
root.eval('tk::PlaceWindow . center')

frame = ttk.Frame(root, padding=20)
frame.pack(fill="both", expand=True)

ttk.Label(frame, text="您確定要解除安裝「字幕編輯工具」嗎？", font=("", 10, "bold")).pack(pady=10)

status_var = tk.StringVar()
ttk.Label(frame, textvariable=status_var, foreground="gray").pack()

btn = ttk.Button(frame, text="解除安裝", command=start_uninstall)
btn.pack(pady=10)

root.mainloop()