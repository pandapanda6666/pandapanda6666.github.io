import os

with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.py', 'r', encoding='utf-8') as f:
    run_py = f.read()

# Replace main block for pyw
old_main = """if __name__ == '__main__':
    is_worker = (len(sys.argv) > 1 and sys.argv[1] == "worker")
    current_exe = os.path.basename(sys.executable).lower()
    
    if not is_worker and current_exe != "pandapython.exe":
        target_exe = os.path.join(os.path.dirname(sys.executable), "PandaPython.exe")
        if not os.path.exists(target_exe):
            try:
                shutil.copy2(sys.executable, target_exe)
            except Exception as e:
                target_exe = sys.executable
        subprocess.Popen([target_exe, os.path.abspath(__file__), "worker"], creationflags=subprocess.CREATE_NEW_CONSOLE)
        sys.exit(0)
    else:
        os.system(f"title {MAGIC_NAME}")
        run_server()"""

new_main = """if __name__ == '__main__':
    # 由於使用 pyw 與 PandaPythonw.exe，直接啟動 server 即可
    # 標題設定在 pyw 中可能不可見，但為符合規則依然設定
    try:
        import ctypes
        ctypes.windll.kernel32.SetConsoleTitleW(f"【PandaPanda的AI日常___{MAGIC_NAME}】")
    except:
        pass
    run_server()"""

run_pyw = run_py.replace(old_main, new_main)

with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.pyw', 'w', encoding='utf-8') as f:
    f.write(run_pyw)