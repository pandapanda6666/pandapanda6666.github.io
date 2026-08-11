import re
with open(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\chunks\gui.js', 'r', encoding='utf-8') as f:
    content = f.read()
    
idx = content.find('loadExtensionURL')
if idx != -1:
    print(content[idx-50:idx+50].encode('utf-8'))
else:
    print("Not found loadExtensionURL in gui.js")
