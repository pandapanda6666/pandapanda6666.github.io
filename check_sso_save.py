import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

idx = content.find('id="panda-cloud-save-btn"')
if idx != -1:
    print(content[idx-100:idx+800])
else:
    print('NOT FOUND')
