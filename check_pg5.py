import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()

for j in range(250, min(330, len(lines))):
    print(f"{j+1}: {lines[j].rstrip('\n').encode('cp950', errors='ignore').decode('cp950')}")
