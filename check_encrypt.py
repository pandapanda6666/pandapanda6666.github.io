import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'encrypt' in line.lower() or 'download' in line.lower():
        for j in range(max(0, i), min(len(lines), i+1)):
            print(f"{j+1}: {lines[j].strip()}")
