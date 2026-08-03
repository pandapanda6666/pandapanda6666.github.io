import os
import re

filepath = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove .panda-hidden-lang CSS
old_css_hidden = '''  div[class*="menu-bar_account-info-wrapper_"],
  div[class*="menu-bar_account-info-group_"]:not(#custom-sso-nav-wrapper),
  div[class*="menu-bar_login-button_"],
  div[class*="menu-bar_register-button_"],
  .panda-hidden-lang {
      display: none !important;
  }'''
new_css_hidden = '''  div[class*="menu-bar_account-info-wrapper_"],
  div[class*="menu-bar_account-info-group_"]:not(#custom-sso-nav-wrapper),
  div[class*="menu-bar_login-button_"],
  div[class*="menu-bar_register-button_"] {
      display: none !important;
  }'''
content = content.replace(old_css_hidden, new_css_hidden)

# 2. Find the whole block from "const langMenu = ..." to "document.getElementById('btn-style').addEventListener..."
# I will use regex to find this entire block and remove everything except the SSO nav part.
# But wait, it's safer to just replace the specific sections.

# Section A: Hiding langMenu
hide_lang_code = '''        const langMenu = document.querySelector('div[class*="menu-bar_language-menu_"]');
        if (langMenu && !langMenu.classList.contains('panda-hidden-lang') && !langMenu.dataset.active) {
            langMenu.classList.add('panda-hidden-lang');
        }'''
content = content.replace(hide_lang_code, "")

# Section B: The custom-settings-menu logic
# It starts at if (langMenu && !document.getElementById('custom-settings-menu')) {
# and ends right before if (bearEnabled) document.body.classList.add('bear-style');
# I'll use regex to match from if (langMenu && !document.getElementById('custom-settings-menu')) {
# up to document.addEventListener('click', hideSettings);\n                }\n            });\n\n        }

pattern = re.compile(r"if\s*\(langMenu\s*&&\s*!document\.getElementById\('custom-settings-menu'\)\)\s*\{.*?\n\s*\}\n\s*\}\n", re.DOTALL)
content = re.sub(pattern, "", content)

# Remove the btn-style event listener (it's gone now)
pattern2 = re.compile(r"document\.getElementById\('btn-style'\)\.addEventListener[^\}]+\}\);\n", re.DOTALL)
content = re.sub(pattern2, "", content)

# Remove the btn-contrast event listener
pattern3 = re.compile(r"document\.getElementById\('btn-contrast'\)\.addEventListener[^\}]+\}\);\n", re.DOTALL)
content = re.sub(pattern3, "", content)

# 3. Remove the SVG injection logic (setTimeout block)
# TurboWarp has native icons. If I inject them, I cause double icons.
pattern_inject = re.compile(r"// Inject icons into File, Edit, and Tutorials\n\s*setTimeout\(\(\) => \{.*?\n\s*\}\);\n\s*\}, 500\);", re.DOTALL)
content = re.sub(pattern_inject, "", content)

# Version bump
content = content.replace('v=83', 'v=84')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
