import os

path = r'C:\Users\User\Desktop\伺服器\登入\run.py'
with open(path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if '部署' in line or '清單' in line:
            print(f"Line {i}: {line.strip()}")
