import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

idx = content.find('panda-encrypt-save-cb')
if idx != -1:
    print(content[max(0, idx-200):idx+200])
else:
    print('NOT FOUND')
