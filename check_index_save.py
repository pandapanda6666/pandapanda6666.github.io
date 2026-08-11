import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'saveMetadata' in line:
        start = max(0, i - 2)
        end = min(len(lines), i + 25)
        for j in range(start, end):
            print(f"{j+1}: {lines[j].rstrip('\n').encode('cp950', errors='ignore').decode('cp950')}")
        break
