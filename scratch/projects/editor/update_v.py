import os

filepath = r"C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('v=63', 'v=67')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated cache bust to v=67")
