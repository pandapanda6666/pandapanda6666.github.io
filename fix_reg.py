import re
with open('installer.py', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(r'Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\PandaSubtitleEditor', r'Software\Microsoft\Windows\CurrentVersion\Uninstall\PandaSubtitleEditor')

with open('installer.py', 'w', encoding='utf-8') as f:
    f.write(text)