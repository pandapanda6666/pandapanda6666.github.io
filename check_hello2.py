import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    for i, line in enumerate(f):
        if 'hello' in line.lower():
            print(f"{i+1}: {line.strip()}")
