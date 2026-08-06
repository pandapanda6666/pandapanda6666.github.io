import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()
    
idx = content.find('<ul class="panda-dropdown left">')
if idx != -1:
    print(content[idx:idx+800])
else:
    print('NOT FOUND')
