import os
import codecs
import time
import re

html_path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
old_str = "https://cdn.discordapp.com/embed/avatars/0.png"
new_str = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>"

with codecs.open(html_path, 'r', 'utf-8') as f:
    content = f.read()

if old_str in content:
    content = content.replace(old_str, new_str)

content = re.sub(r'panda_sso\.js\?v=\d+', f'panda_sso.js?v={int(time.time())}', content)

with codecs.open(html_path, 'w', 'utf-8') as f:
    f.write(content)
