import winreg

def create_uninstaller_registry(app_name, install_dir, uninstall_string):
    key_path = fr"Software\Microsoft\Windows\CurrentVersion\Uninstall\{app_name}"
    try:
        key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, key_path)
        winreg.SetValueEx(key, "DisplayName", 0, winreg.REG_SZ, "字幕編輯工具 (PandaPanda的AI日常)")
        winreg.SetValueEx(key, "DisplayVersion", 0, winreg.REG_SZ, "1.0.0")
        winreg.SetValueEx(key, "Publisher", 0, winreg.REG_SZ, "PandaPanda")
        winreg.SetValueEx(key, "UninstallString", 0, winreg.REG_SZ, uninstall_string)
        winreg.SetValueEx(key, "InstallLocation", 0, winreg.REG_SZ, install_dir)
        winreg.SetValueEx(key, "NoModify", 0, winreg.REG_DWORD, 1)
        winreg.SetValueEx(key, "NoRepair", 0, winreg.REG_DWORD, 1)
        winreg.CloseKey(key)
        print("Registry created!")
    except Exception as e:
        print("Error:", e)

create_uninstaller_registry("PandaSubtitleEditor", r"C:\TestDir", r"C:\TestDir\uninst.bat")