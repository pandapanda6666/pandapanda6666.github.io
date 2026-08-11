import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = "document.addEventListener('click', (e) => {"
replacement = "document.addEventListener('click', (e) => {"

if target in content:
    print("Found exact match")
else:
    print("NOT FOUND")
