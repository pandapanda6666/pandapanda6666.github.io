with open('installer.py', 'r', encoding='utf-8') as f:
    installer = f.read()

# Fix registry path (remove double backslashes since it's an r-string)
old_reg = r'key_path = r"Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\PandaSubtitleEditor"'
new_reg = r'key_path = r"Software\Microsoft\Windows\CurrentVersion\Uninstall\PandaSubtitleEditor"'
installer = installer.replace(old_reg, new_reg)

# Fix VBS encoding
old_vbs_write = 'with open(vbs_path, "w", encoding="utf-8") as f:'
new_vbs_write = 'with open(vbs_path, "w", encoding="utf-8-sig") as f:'
installer = installer.replace(old_vbs_write, new_vbs_write)

with open('installer.py', 'w', encoding='utf-8') as f:
    f.write(installer)