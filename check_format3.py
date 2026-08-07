import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()

out = []
for i in range(max(0, 310), min(len(lines), 350)):
    out.append(f"{i+1}: {lines[i].strip()}")

with codecs.open('out2.txt', 'w', 'utf-8') as f:
    f.write('\n'.join(out))
