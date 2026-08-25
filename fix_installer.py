with open('installer.py', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Remove uninstall.exe from files to download
text = re.sub(r'"uninstall\.exe": "uninstall\.exe"', '', text)

# Remove trailing comma if any
text = text.replace('"PandaPanda%E7%9A%84AI%E6%97%A5%E5%B8%B8___%E5%AD%97%E5%B9%95%E7%B7%A8%E8%BC%AF%E5%B7%A5%E5%85%B7.exe",\n    }', '"PandaPanda%E7%9A%84AI%E6%97%A5%E5%B8%B8___%E5%AD%97%E5%B9%95%E7%B7%A8%E8%BC%AF%E5%B7%A5%E5%85%B7.exe"\n    }')

# Write uninstall.bat creation
uninstall_script = """
    # 建立解除安裝腳本
    uninst_path = os.path.join(target_dir, "uninstall.bat")
    with open(uninst_path, 'w', encoding='big5') as f:
        f.write("@echo off\\n")
        f.write(f"echo 準備解除安裝...\\n")
        f.write(f"del /f /q \\"{exe_path}\\"\\n")
        f.write(f"del /f /q \\"{os.path.join(os.environ.get('USERPROFILE', 'C:\\\\'), 'Desktop', '字幕編輯工具.lnk')}\\"\\n")
        f.write(f"reg delete HKCU\\\\Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Uninstall\\\\PandaSubtitleEditor /f\\n")
        f.write(f"(goto) 2>nul & del \\"%~f0\\"\\n")

    winreg.SetValueEx(key, "UninstallString", 0, winreg.REG_SZ, f'"{uninst_path}"')
"""

# Replace uninstall.exe registry entry
text = text.replace('winreg.SetValueEx(key, "UninstallString", 0, winreg.REG_SZ, f\'"{os.path.join(target_dir, "uninstall.exe")}"\')', uninstall_script.strip())

with open('installer.py', 'w', encoding='utf-8') as f:
    f.write(text)
print("installer.py patched for uninstall.bat.")