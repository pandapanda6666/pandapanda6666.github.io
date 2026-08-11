import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

idx = content.find('save_cloud')
if idx != -1:
    print(content[max(0, idx-500):idx+500])
else:
    print('NOT FOUND save_cloud in panda_guard.js')

idx = content.find('panda-cloud-save-btn')
if idx != -1:
    print(content[max(0, idx-500):idx+500])
