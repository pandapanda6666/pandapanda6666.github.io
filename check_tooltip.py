import codecs
import re
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

if "react-tooltip" in content.lower():
    print("Found react-tooltip")
else:
    print("Not found react-tooltip")
