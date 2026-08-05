import re

file_path = r"scratch\projects\editor\index.html"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# Make sure CSS is applied
text = text.replace('background: #4CAF50;', 'background: var(--panda-green, #4CAF50);')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)
