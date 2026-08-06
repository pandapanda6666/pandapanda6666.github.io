import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

idx = content.find('custom-sso-nav-wrapper')
if idx != -1:
    idx2 = content.find('custom-sso-nav-wrapper', idx+1)
    if idx2 != -1:
        print(content[idx2:idx2+500])
    else:
        print('Only 1 match found')
else:
    print('NOT FOUND')
