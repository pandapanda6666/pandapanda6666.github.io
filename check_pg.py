import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'window.ssoSocket.emit(\'saveAppData\'' in line:
        start = max(0, i - 5)
        end = min(len(lines), i + 15)
        for j in range(start, end):
            print(f"{j+1}: {lines[j].rstrip('\n').encode('cp950', errors='ignore').decode('cp950')}")
        break
