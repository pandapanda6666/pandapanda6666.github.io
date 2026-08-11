import os
import re

filepath = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove .panda-hidden-lang hiding logic
# In CSS:
content = content.replace("  .panda-hidden-lang {\n      display: none !important;\n  }", "")
# wait, it was grouped:
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

# 2. Remove the JS that hides langMenu and creates custom-settings-menu
# We need to find the block and remove it entirely.
# Let's use regex to remove everything from:
# const langMenu = document.querySelector('div[class*="menu-bar_language-menu_"]');
# down to document.getElementById('btn-style').addEventListener(...) (which we also need to remove).
