import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()
    
idx = content.find('<ul class="panda-dropdown left">')
if idx != -1:
    end_idx = content.find('</ul>', idx)
    with codecs.open('dropdown.txt', 'w', 'utf-8') as out:
        out.write(content[idx:end_idx+5])
else:
    with codecs.open('dropdown.txt', 'w', 'utf-8') as out:
        out.write('NOT FOUND')
