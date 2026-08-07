import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

idx = content.find("document.addEventListener('click'")
if idx != -1:
    print(content[idx:idx+200])
else:
    print('NOT FOUND')
