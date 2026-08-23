with open('installer.py', 'r', encoding='utf-8') as f:
    installer = f.read()

# Add winreg to imports
if 'import winreg' not in installer:
    installer = installer.replace('import sys', 'import sys\nimport winreg')

old_files = """    files = {
        "run.pyw": "run.pyw",
        "index.html": "Edit/Video/Add%20subtitles/index.html",
        "tailwindcss.js": "Edit/Video/Add%20subtitles/tailwindcss.js"
    }"""

new_files = """    files = {
        "run.pyw": "run.pyw",
        "index.html": "Edit/Video/Add%20subtitles/index.html",
        "tailwindcss.js": "Edit/Video/Add%20subtitles/tailwindcss.js",
        "uninstall.exe": "uninstall.exe"
    }"""

installer = installer.replace(old_files, new_files)

# Add registry creation
old_vbs = """    vbs_content = f\"\"\"
Set oWS = WScript.CreateObject("WScript.Shell")
strDesktop = oWS.SpecialFolders("Desktop")"""

new_reg = """    # 寫入控制台解除安裝登錄檔
    try:
        key_path = r"Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\PandaSubtitleEditor"
        key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, key_path)
        winreg.SetValueEx(key, "DisplayName", 0, winreg.REG_SZ, "字幕編輯工具 (PandaPanda的AI日常)")
        winreg.SetValueEx(key, "DisplayVersion", 0, winreg.REG_SZ, "1.0.0")
        winreg.SetValueEx(key, "Publisher", 0, winreg.REG_SZ, "PandaPanda")
        winreg.SetValueEx(key, "UninstallString", 0, winreg.REG_SZ, os.path.join(target_dir, "uninstall.exe"))
        winreg.SetValueEx(key, "InstallLocation", 0, winreg.REG_SZ, target_dir)
        winreg.SetValueEx(key, "DisplayIcon", 0, winreg.REG_SZ, os.path.join(target_dir, "PandaEnv", "PandaPythonw.exe"))
        winreg.SetValueEx(key, "NoModify", 0, winreg.REG_DWORD, 1)
        winreg.SetValueEx(key, "NoRepair", 0, winreg.REG_DWORD, 1)
        winreg.CloseKey(key)
    except:
        pass

    vbs_content = f\"\"\"
Set oWS = WScript.CreateObject("WScript.Shell")
strDesktop = oWS.SpecialFolders("Desktop")"""

installer = installer.replace(old_vbs, new_reg)

with open('installer.py', 'w', encoding='utf-8') as f:
    f.write(installer)