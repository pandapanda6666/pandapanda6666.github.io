import os
import re
filepath = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix clicking on SSO nav and Settings by using onmousedown instead of onclick
content = content.replace('onclick="window.location.href', 'onmousedown="window.location.href')
content = content.replace('onclick="logout()"', 'onmousedown="logout()"')
content = content.replace("addEventListener('click', (e) =>", "addEventListener('mousedown', (e) =>")
content = content.replace("addEventListener('click', hideSettings)", "addEventListener('mousedown', hideSettings)")
content = content.replace("removeEventListener('click', hideSettings)", "removeEventListener('mousedown', hideSettings)")

# 2. Fix the hover color inconsistency
# My CSS for .panda-dropdown li:hover was rgba(0,0,0,0.15), but native is var(--panda-dark-green).
# Let's align .panda-dropdown li:hover to var(--panda-dark-green) !important
content = content.replace('background-color: rgba(0,0,0,0.15) !important;', 'background-color: var(--panda-dark-green) !important;')

# 3. Ensure the font sizes and padding exactly match native dropdowns
# In my CSS, .panda-dropdown li has padding: 0.5rem 1rem and font-size: 0.875rem. This is correct for native Scratch.
# Let's also make sure the top bar hover is dark green to match native?
# Wait, native File menu top bar hover is var(--panda-dark-green) ?
# Let's check my CSS for menu-bar-item hover:
# [class*="menu-item_menu-item_"]:hover, [class*="menu-item_hoverable_"]:hover { background-color: var(--panda-dark-green) !important; }
# Yes! So the top bar hover is dark green!
content = content.replace('background-color: rgba(0, 0, 0, 0.15); /* Scratch native hover */', 'background-color: var(--panda-dark-green) !important; /* aligned with global theme */')

# Bump version
content = content.replace('v=79', 'v=80')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
