import codecs
import time

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

import re
content = re.sub(r'panda_guard\.js\?v=\d+', f'panda_guard.js?v={int(time.time())}', content)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("SUCCESS")
