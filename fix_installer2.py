import re
with open('installer.py', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove uninstall.exe from dict
text = re.sub(r'\"uninstall\.exe\": \"uninstall\.exe\"\n\s*', '', text)
text = text.replace(',\n    }', '\n    }')

# 2. Add bat generation block before Registry logic
block = r"""
        # 建立解除安裝腳本
        uninst_path = os.path.join(target_dir, "uninstall.bat")
        with open(uninst_path, 'w', encoding='big5') as f:
            f.write("@echo off\n")
            f.write(f"echo 解除安裝...\n")
            f.write(f"del /f /q \"{exe_path}\"\n")
            f.write(f"del /f /q \"{os.path.join(os.environ.get('USERPROFILE', 'C:\\\\'), 'Desktop', '字幕編輯工具.lnk')}\"\n")
            f.write(f"reg delete HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\PandaSubtitleEditor /f\n")
            f.write(f"(goto) 2>nul & del \"%~f0\"\n")
"""

text = text.replace('        winreg.SetValueEx(key, "UninstallString", 0, winreg.REG_SZ, f\'"{os.path.join(target_dir, "uninstall.exe")}"\')', 
                   block + '        winreg.SetValueEx(key, "UninstallString", 0, winreg.REG_SZ, f\'"{uninst_path}"\')')

with open('installer.py', 'w', encoding='utf-8') as f:
    f.write(text)
print("installer fixed")