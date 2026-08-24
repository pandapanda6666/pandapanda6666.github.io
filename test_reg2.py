import winreg
import os
import traceback
try:
    key_path = r"Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\PandaSubtitleEditor"
    key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, key_path)
    print("SUCCESS")
except Exception as e:
    print("FAILED")
    traceback.print_exc()