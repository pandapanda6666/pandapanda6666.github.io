import os
import re

filepath = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("            if (bearEnabled) document.body.classList.add('bear-style');", "")
content = content.replace("              if (highContrast) document.body.classList.add('high-contrast');", "")
content = content.replace("const langMenu = document.querySelector('div[class*=\"menu-bar_language-menu_\"]');", "")
content = content.replace("if (langMenu && !langMenu.dataset.active) {\n            \n        }", "")
content = content.replace("if (langMenu &&  && !langMenu.dataset.active) {\n            \n        }", "")

# To be safe, just remove any dangling logic
content = re.sub(r"if\s*\(langMenu[^\}]+\}\n", "", content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
