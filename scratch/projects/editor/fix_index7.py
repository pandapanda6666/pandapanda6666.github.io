import os
filepath = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the injected JS for native icons to also include Tutorials
js_inject_native_icons_old = '''
            // Inject icons into File and Edit
            setTimeout(() => {
                const fileItem = document.querySelector('div[class*="menu-bar_file-group_"] > div[class*="menu-bar_menu-bar-item_"] > span');
                if (fileItem && !fileItem.querySelector('.fa-file')) {
                    fileItem.innerHTML = '<i class="fa-solid fa-file" style="margin-right:6px;font-size:0.9em;"></i>' + fileItem.innerHTML + '<i class="fa-solid fa-caret-down" style="margin-left:6px;font-size:0.8em;"></i>';
                    fileItem.style.display = 'flex'; fileItem.style.alignItems = 'center';
                }
                const editItem = document.querySelector('div[class*="menu-bar_edit-menu_"] > div[class*="menu-bar_menu-bar-item_"] > span');
                if (editItem && !editItem.querySelector('.fa-pen')) {
                    editItem.innerHTML = '<i class="fa-solid fa-pen" style="margin-right:6px;font-size:0.9em;"></i>' + editItem.innerHTML + '<i class="fa-solid fa-caret-down" style="margin-left:6px;font-size:0.8em;"></i>';
                    editItem.style.display = 'flex'; editItem.style.alignItems = 'center';
                }
            }, 500);
'''

js_inject_native_icons_new = '''
            // Inject icons into File, Edit, and Tutorials
            setTimeout(() => {
                const fileItem = document.querySelector('div[class*="menu-bar_file-group_"] > div[class*="menu-bar_menu-bar-item_"] > span');
                if (fileItem && !fileItem.querySelector('.fa-file')) {
                    fileItem.innerHTML = '<i class="fa-solid fa-file" style="margin-right:6px;font-size:0.9em;"></i>' + fileItem.innerHTML + '<i class="fa-solid fa-caret-down" style="margin-left:6px;font-size:0.8em;"></i>';
                    fileItem.style.display = 'flex'; fileItem.style.alignItems = 'center';
                }
                const editItem = document.querySelector('div[class*="menu-bar_edit-menu_"] > div[class*="menu-bar_menu-bar-item_"] > span');
                if (editItem && !editItem.querySelector('.fa-pen')) {
                    editItem.innerHTML = '<i class="fa-solid fa-pen" style="margin-right:6px;font-size:0.9em;"></i>' + editItem.innerHTML + '<i class="fa-solid fa-caret-down" style="margin-left:6px;font-size:0.8em;"></i>';
                    editItem.style.display = 'flex'; editItem.style.alignItems = 'center';
                }
                // Tutorials (often just a div without span, or with span depending on version)
                const allItems = document.querySelectorAll('div[class*="menu-bar_menu-bar-item_"]');
                allItems.forEach(item => {
                    if (item.innerText.includes('教程') && !item.querySelector('.fa-lightbulb')) {
                        const target = item.querySelector('span') || item;
                        target.innerHTML = '<i class="fa-regular fa-lightbulb" style="margin-right:6px;font-size:1.1em;"></i>' + target.innerHTML;
                        target.style.display = 'flex'; target.style.alignItems = 'center';
                    }
                });
            }, 500);
'''

content = content.replace(js_inject_native_icons_old, js_inject_native_icons_new)
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
