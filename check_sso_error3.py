import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\panda_sso.js'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'function showConnectionError()' in line:
        for j in range(i, i+15):
            print(repr(lines[j]))
        break
