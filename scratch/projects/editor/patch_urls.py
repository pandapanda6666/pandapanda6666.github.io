import os
filepath = r"C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("https://scratch.mit.edu", "https://pandapanda6666.github.io/scratch")
content = content.replace("https://cdn.scratch.mit.edu/scratchr2/static/images/mystuff.png", "https://pandapanda6666.github.io/scratch/projects/editor/mystuff.png")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

