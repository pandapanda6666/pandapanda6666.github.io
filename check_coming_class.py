import codecs
import re
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# search for coming soon class in JS strings
matches = re.findall(r'coming-soon_coming-soon[a-zA-Z0-9_-]*', content)
print("Classes:", set(matches))
