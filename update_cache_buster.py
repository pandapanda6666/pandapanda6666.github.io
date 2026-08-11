import codecs
import time

def update_version(path):
    with codecs.open(path, 'r', 'utf-8') as f:
        content = f.read()
    
    timestamp = str(int(time.time()))
    import re
    # Replace panda_guard.js with panda_guard.js?v=TIMESTAMP
    content = re.sub(r'panda_guard\.js(\?v=\d+)?', f'panda_guard.js?v={timestamp}', content)
    
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)

update_version(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html')
update_version(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\player\index.html')

print("SUCCESS")
