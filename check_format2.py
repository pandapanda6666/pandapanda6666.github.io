import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()

out = []
for i, line in enumerate(lines):
    if '存檔格式' in line or 'panda-encrypt-save' in line:
        out.append(f"{i+1}: {line.strip()}")

with codecs.open('out.txt', 'w', 'utf-8') as f:
    f.write('\n'.join(out))
