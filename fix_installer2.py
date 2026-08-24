with open('installer.py', 'r', encoding='utf-8') as f:
    installer = f.read()

# Fix double backslashes in registry key path
installer = installer.replace(
    r'key_path = r"Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\PandaSubtitleEditor"',
    r'key_path = r"Software\Microsoft\Windows\CurrentVersion\Uninstall\PandaSubtitleEditor"'
)
installer = installer.replace(
    r'key_path = "Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Uninstall\\\\PandaSubtitleEditor"',
    r'key_path = r"Software\Microsoft\Windows\CurrentVersion\Uninstall\PandaSubtitleEditor"'
)
# Just in case, let's aggressively fix it
import re
installer = re.sub(r'Software\\\\+Microsoft\\\\+Windows\\\\+CurrentVersion\\\\+Uninstall\\\\+PandaSubtitleEditor', r'Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\PandaSubtitleEditor', installer)

with open('installer.py', 'w', encoding='utf-8') as f:
    f.write(installer)