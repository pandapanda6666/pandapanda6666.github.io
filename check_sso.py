import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\panda_sso.js'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '開啟前台模式' in line:
        start = max(0, i - 15)
        end = min(len(lines), i + 15)
        for j in range(start, end):
            print(f"{j+1}: {lines[j].rstrip('\n').encode('cp950', errors='ignore').decode('cp950')}")
        break
