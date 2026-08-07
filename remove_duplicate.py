import codecs
import re

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# 1. Remove the checkbox li
content = re.sub(r'<li style="display: flex; align-items: center;" onclick="event\.stopPropagation\(\);">\s*<input type="checkbox" id="panda-encrypt-save-cb"[^>]*>\s*<label for="panda-encrypt-save-cb"[^>]*>.*?</label>\s*</li>', '', content, flags=re.DOTALL)

# 2. Remove the script that initializes it
content = re.sub(r'<script>\s*setTimeout\(\(\) => \{\s*const cb = document\.getElementById\(\'panda-encrypt-save-cb\'\);\s*if \(cb\) \{\s*cb\.checked = localStorage\.getItem\(\'panda-encrypt-save\'\) !== \'false\';\s*\}\s*\}, 1000\);\s*</script>', '', content, flags=re.DOTALL)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("SUCCESS")
