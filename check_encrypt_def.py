import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

idx = content.find('window.encryptSb3 =')
if idx != -1:
    print(f"Found at index {idx}")
    print(content[max(0, idx-100):idx+200])
else:
    print('NOT FOUND')
