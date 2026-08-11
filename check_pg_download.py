import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if 'URL.createObjectURL' in line:
        start = max(0, i - 2)
        end = min(len(lines), i + 20)
        for j in range(start, end):
            print(f"{j+1}: {lines[j].encode('ascii', errors='replace').decode('ascii').rstrip('\n')}")
