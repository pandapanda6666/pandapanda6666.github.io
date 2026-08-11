import codecs
import re
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\chunks\gui.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

matches = re.findall(r'[a-zA-Z0-9_-]*share-button[a-zA-Z0-9_-]*', content)
print(set(matches))
