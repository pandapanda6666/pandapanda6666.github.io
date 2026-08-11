import os
filepath = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure SSO nav uses hover
content = content.replace('.panda-settings-btn.active .panda-dropdown, .panda-sso-nav.active .panda-dropdown {', '.panda-settings-btn.active .panda-dropdown, .panda-sso-nav:hover .panda-dropdown {')

# Bump version
content = content.replace('v=76', 'v=77')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
