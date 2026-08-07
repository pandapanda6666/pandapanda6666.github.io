import codecs
import re
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# find "Coming Soon" or something near share-button
match = re.search(r'(.{0,100})Coming Soon(.{0,100})', content, re.IGNORECASE)
if match:
    print(match.group(0))
else:
    print("Coming Soon not found")
