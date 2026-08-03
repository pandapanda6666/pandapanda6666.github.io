import os

filepath = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Revert onmousedown to onclick + stopPropagation
content = content.replace('onmousedown="window.location.href', 'onclick="window.location.href')
content = content.replace('onmousedown="logout()"', 'onclick="logout()"')
content = content.replace("addEventListener('mousedown', (e) =>", "addEventListener('click', (e) =>")
content = content.replace("addEventListener('mousedown', hideSettings)", "addEventListener('click', hideSettings)")
content = content.replace("removeEventListener('mousedown', hideSettings)", "removeEventListener('click', hideSettings)")

# Add onmousedown="event.stopPropagation()" to all dropdown list items so React doesn't steal the click
content = content.replace('<li onclick=', '<li onmousedown="event.stopPropagation()" onclick=')
# And for the Settings toggle
content = content.replace('document.getElementById(\'btn-settings-toggle\').addEventListener(\'click\', (e) => {', 'document.getElementById(\'btn-settings-toggle\').addEventListener(\'click\', (e) => {\n                  e.stopPropagation();')

# 2. Fix the File/Edit/Tutorials injection logic to be completely foolproof
old_inject_logic = '''              setTimeout(() => {
                  const fileItem = document.querySelector('div[class*="menu-bar_file-group_"] > div[class*="menu-bar_menu-bar-item_"] > span');
                  if (fileItem && !fileItem.querySelector('.panda-icon')) {
                      fileItem.innerHTML = '<svg class="panda-icon" viewBox="0 0 384 512" width="14" height="14" fill="currentColor" style="margin-right:6px;"><path d="M0 64C0 28.7 28.7 0 64 0H229.5c17 0 33.3 6.7 45.3 18.7l90.5 90.5c12 12 18.7 28.3 18.7 45.3V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z"/></svg>' + fileItem.innerHTML + '<svg class="panda-icon" viewBox="0 0 320 512" width="10" height="10" fill="currentColor" style="margin-left:6px;"><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/></svg>';
                      fileItem.style.display = 'flex'; fileItem.style.alignItems = 'center';
                  }
                  const editItem = document.querySelector('div[class*="menu-bar_edit-menu_"] > div[class*="menu-bar_menu-bar-item_"] > span');
                  if (editItem && !editItem.querySelector('.panda-icon')) {
                      editItem.innerHTML = '<svg class="panda-icon" viewBox="0 0 512 512" width="14" height="14" fill="currentColor" style="margin-right:6px;"><path d="M410.3 23.1C398.4 11.3 381.5 5 364.7 5s-33.8 6.3-45.7 18.1l-289 289c-9.4 9.4-15.2 21.6-16.9 34.5L2.1 484.5c-2.3 17.5 12.1 31.9 29.6 29.6l137.9-11.1c12.9-1.7 25.1-7.5 34.5-16.9l289-289c25.1-25.1 25.1-66 0-91.1l-82.8-82.9zM364.7 50.7l82.8 82.9-41.4 41.4-82.8-82.8 41.4-41.5zM283.3 133.5l82.8 82.8-212 212-82.8-82.8 212-212z"/></svg>' + editItem.innerHTML + '<svg class="panda-icon" viewBox="0 0 320 512" width="10" height="10" fill="currentColor" style="margin-left:6px;"><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/></svg>';
                      editItem.style.display = 'flex'; editItem.style.alignItems = 'center';
                  }
                  // Tutorials (often just a div without span, or with span depending on version)
                  const allItems = document.querySelectorAll('div[class*="menu-bar_menu-bar-item_"]');
                  allItems.forEach(item => {
                      if (item.innerText.includes('教程') && !item.querySelector('.panda-icon')) {
                          const target = item.querySelector('span') || item;
                          target.innerHTML = '<svg class="panda-icon" viewBox="0 0 384 512" width="14" height="14" fill="currentColor" style="margin-right:6px;"><path d="M112.1 454.3c0 6.4 5.2 11.6 11.6 11.6h136.6c6.4 0 11.6-5.2 11.6-11.6v-27.5c0-6.4-5.2-11.6-11.6-11.6H123.7c-6.4 0-11.6 5.2-11.6 11.6v27.5zM192 0C86 0 0 86 0 192c0 47.9 17.4 92 46.1 126.3 3 3.6 4.7 8.2 4.7 12.9v10.5c0 17.7 14.3 32 32 32h218.4c17.7 0 32-14.3 32-32v-10.5c0-4.7 1.7-9.3 4.7-12.9C366.6 284 384 239.9 384 192 384 86 298 0 192 0z"/></svg>' + target.innerHTML;
                          target.style.display = 'flex'; target.style.alignItems = 'center';
                      }
                  });'''

new_inject_logic = '''              setTimeout(() => {
                  const allItems = document.querySelectorAll('div[class*="menu-bar_menu-bar-item_"]');
                  allItems.forEach(item => {
                      // Remove any previously injected icons if they somehow got duplicated
                      const existingIcons = item.querySelectorAll('.panda-icon');
                      if (existingIcons.length > 2) {
                          existingIcons.forEach(i => i.remove());
                      }
                      if (item.querySelector('.panda-icon')) return; // Already injected perfectly
                      
                      const text = item.innerText.trim();
                      const target = item.querySelector('span') || item;
                      
                      const caretSvg = '<svg class="panda-icon" viewBox="0 0 320 512" width="10" height="10" fill="currentColor" style="margin-left:6px;"><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/></svg>';
                      const fileSvg = '<svg class="panda-icon" viewBox="0 0 384 512" width="14" height="14" fill="currentColor" style="margin-right:6px;"><path d="M0 64C0 28.7 28.7 0 64 0H229.5c17 0 33.3 6.7 45.3 18.7l90.5 90.5c12 12 18.7 28.3 18.7 45.3V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z"/></svg>';
                      const penSvg = '<svg class="panda-icon" viewBox="0 0 512 512" width="14" height="14" fill="currentColor" style="margin-right:6px;"><path d="M410.3 23.1C398.4 11.3 381.5 5 364.7 5s-33.8 6.3-45.7 18.1l-289 289c-9.4 9.4-15.2 21.6-16.9 34.5L2.1 484.5c-2.3 17.5 12.1 31.9 29.6 29.6l137.9-11.1c12.9-1.7 25.1-7.5 34.5-16.9l289-289c25.1-25.1 25.1-66 0-91.1l-82.8-82.9zM364.7 50.7l82.8 82.9-41.4 41.4-82.8-82.8 41.4-41.5zM283.3 133.5l82.8 82.8-212 212-82.8-82.8 212-212z"/></svg>';
                      const bulbSvg = '<svg class="panda-icon" viewBox="0 0 384 512" width="14" height="14" fill="currentColor" style="margin-right:6px;"><path d="M112.1 454.3c0 6.4 5.2 11.6 11.6 11.6h136.6c6.4 0 11.6-5.2 11.6-11.6v-27.5c0-6.4-5.2-11.6-11.6-11.6H123.7c-6.4 0-11.6 5.2-11.6 11.6v27.5zM192 0C86 0 0 86 0 192c0 47.9 17.4 92 46.1 126.3 3 3.6 4.7 8.2 4.7 12.9v10.5c0 17.7 14.3 32 32 32h218.4c17.7 0 32-14.3 32-32v-10.5c0-4.7 1.7-9.3 4.7-12.9C366.6 284 384 239.9 384 192 384 86 298 0 192 0z"/></svg>';
                      
                      if (text === '檔案' || text === 'File') {
                          target.innerHTML = fileSvg + text + caretSvg;
                          target.style.display = 'flex'; target.style.alignItems = 'center';
                      } else if (text === '編輯' || text === 'Edit') {
                          target.innerHTML = penSvg + text + caretSvg;
                          target.style.display = 'flex'; target.style.alignItems = 'center';
                      } else if (text === '教程' || text === 'Tutorials') {
                          target.innerHTML = bulbSvg + text;
                          target.style.display = 'flex'; target.style.alignItems = 'center';
                      }
                  });'''
content = content.replace(old_inject_logic, new_inject_logic)

# Version bump
content = content.replace('v=82', 'v=83')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
