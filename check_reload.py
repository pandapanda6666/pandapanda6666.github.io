import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\panda_sso.js'
with codecs.open(path, 'r', 'utf-8') as f:
    for i, line in enumerate(f):
        if 'reload' in line.lower() or 'location.href' in line.lower() or 'window.location' in line.lower() or 'error' in line.lower():
            print(f"{i+1}: {line.strip()}")
