import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

idx = content.find('vm.saveProjectSb3')
if idx != -1:
    print(content[max(0, idx-50):idx+800])
