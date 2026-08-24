import winreg
import os
import traceback
try:
    key_path = r"Software\Microsoft\Windows\CurrentVersion\Uninstall\PandaSubtitleEditor"
    key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, key_path)
    winreg.SetValueEx(key, "DisplayName", 0, winreg.REG_SZ, "字幕編輯工具 (PandaPanda的AI日常)")
    winreg.SetValueEx(key, "DisplayVersion", 0, winreg.REG_SZ, "1.0.0")
    winreg.SetValueEx(key, "Publisher", 0, winreg.REG_SZ, "PandaPanda")
    winreg.SetValueEx(key, "UninstallString", 0, winreg.REG_SZ, os.path.join("C:\\", "uninstall.exe"))
    winreg.SetValueEx(key, "InstallLocation", 0, winreg.REG_SZ, "C:\\")
    winreg.SetValueEx(key, "DisplayIcon", 0, winreg.REG_SZ, os.path.join("C:\\", "PandaEnv", "PandaPythonw.exe"))
    winreg.SetValueEx(key, "NoModify", 0, winreg.REG_DWORD, 1)
    winreg.SetValueEx(key, "NoRepair", 0, winreg.REG_DWORD, 1)
    winreg.CloseKey(key)
    print("SUCCESS")
except Exception as e:
    print("FAILED")
    traceback.print_exc()