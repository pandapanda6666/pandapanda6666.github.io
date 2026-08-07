import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()

out = []
in_style = False
for i, line in enumerate(lines):
    if '<style>' in line:
        in_style = True
    if in_style:
        out.append(f"{i+1}: {line.strip()}")
    if '</style>' in line:
        in_style = False

with codecs.open('styles_out2.txt', 'w', 'utf-8') as f:
    f.write('\n'.join(out))
