import codecs
import time
import re

html_path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(html_path, 'r', 'utf-8') as f:
    html_content = f.read()
html_content = re.sub(r'panda_sso\.js\?v=\d+', f'panda_sso.js?v={int(time.time())}', html_content)
with codecs.open(html_path, 'w', 'utf-8') as f:
    f.write(html_content)
