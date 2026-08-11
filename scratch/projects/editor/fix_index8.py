import os
filepath = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace panda-custom-menu and panda-dropdown CSS
old_css_start = content.find('.panda-custom-menu {')
old_css_end = content.find('</style>', old_css_start)

new_css = '''
  /* 完美的設定選單樣式，完全還原 Scratch 原生質感 */
  .panda-settings-btn {
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0 0.75rem; /* 12px */
      height: 100%;
      user-select: none;
      font-weight: bold;
      font-size: 0.85rem;
  }
  .panda-settings-btn:hover, .panda-settings-btn.active {
      background-color: rgba(0, 0, 0, 0.15); /* Scratch native hover */
  }
  
  .panda-dropdown {
      display: none;
      position: absolute;
      top: 100%;
      background: var(--panda-green);
      border-radius: 0 0 4px 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.25);
      padding: 0;
      margin: 0;
      list-style: none;
      z-index: 10001;
      color: white;
      min-width: 180px;
  }
  .panda-dropdown.left { left: 0; }
  .panda-dropdown.right { right: 0; }
  .panda-settings-btn.active .panda-dropdown, .panda-sso-nav.active .panda-dropdown {
      display: block;
  }
  .panda-dropdown li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 1rem !important; /* 8px 16px */
      font-size: 0.875rem !important; /* 14px */
      font-weight: normal !important;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important;
      cursor: pointer;
      white-space: nowrap;
  }
  .panda-dropdown li:hover {
      background-color: rgba(0,0,0,0.15) !important;
  }
'''
if old_css_start != -1:
    content = content[:old_css_start] + new_css + '\n  ' + content[old_css_end:]

# Fix settingsDiv class logic
# Replace settingsDiv.className = 'panda-custom-menu';
content = content.replace("settingsDiv.className = 'panda-custom-menu';", "settingsDiv.className = 'panda-settings-btn';\n            if (fileMenu) settingsDiv.className = 'panda-settings-btn ' + fileMenu.className;")

# Fix auth wrapper class logic too
content = content.replace('<div class="panda-custom-menu"', '<div class="panda-settings-btn panda-sso-nav"')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
