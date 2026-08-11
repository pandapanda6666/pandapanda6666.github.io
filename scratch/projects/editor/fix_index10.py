import os
filepath = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix ReferenceError
old_code = '''              const settingsDiv = document.createElement('div');
              settingsDiv.id = 'custom-settings-menu';
              settingsDiv.className = 'panda-settings-btn';
              if (fileMenu) settingsDiv.className = 'panda-settings-btn ' + fileMenu.className;
              
              // 讓設定選單使用原生的 menu-bar-item class 以確保樣式一致
              const fileMenu = document.querySelector('div[class*="menu-bar_file-group_"] > div[class*="menu-bar_menu-bar-item_"]');
              if (fileMenu) {
                  const baseClass = fileMenu.className.split(' ').find(c => c.includes('menu-bar_menu-bar-item_'));
                  if (baseClass) settingsDiv.classList.add(baseClass);
              }'''

new_code = '''              const settingsDiv = document.createElement('div');
              settingsDiv.id = 'custom-settings-menu';
              settingsDiv.className = 'panda-settings-btn';
              
              // 讓設定選單使用原生的 menu-bar-item class 以確保樣式一致
              const fileMenu = document.querySelector('div[class*="menu-bar_file-group_"] > div[class*="menu-bar_menu-bar-item_"]');
              if (fileMenu) settingsDiv.className = 'panda-settings-btn ' + fileMenu.className;'''

content = content.replace(old_code, new_code)

# Bump version
content = content.replace('v=77', 'v=78')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
