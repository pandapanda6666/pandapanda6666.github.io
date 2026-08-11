import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'URL.revokeObjectURL' in line:
        for j in range(max(0, i-2), min(len(lines), i+3)):
            print(f"{j+1}: {lines[j].strip()}")
        print("---")
