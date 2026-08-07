import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()
import re
match = re.search(r'try \{\s*await Promise\.race\(\[\s*new Promise\(\(resolve\) => \{.*?\}\);\s*\}\s*\]\);\s*\}\s*catch', content, re.DOTALL)
if match:
    print(match.group(0).encode('cp950', errors='ignore').decode('cp950'))
else:
    print("NO MATCH")
