import re
with open('installer.py', 'r', encoding='utf-8') as f:
    text = f.read()
text = re.sub(r'with open\(bat_path, "w", encoding="[^"]+"\) as f:', 'with open(bat_path, "w", encoding="utf-8-sig") as f:', text)
with open('installer.py', 'w', encoding='utf-8') as f:
    f.write(text)