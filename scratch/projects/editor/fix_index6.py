import os
filepath = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add FontAwesome
fa_link = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">'
if fa_link not in content:
    content = content.replace('</head>', '    ' + fa_link + '\n  </head>')

# 2. Modify settingsDiv innerHTML to include icons
old_settings_html = '''<span id="btn-settings-toggle" style="display:flex;align-items:center;height:100%;width:100%;">設定</span>
                <ul class="panda-dropdown left">
                    <li id="btn-lang">語言 (Language)</li>
                    <li id="btn-style">風格 (<span id="style-text"></span>)</li>
                    <li id="btn-contrast">對比度 (<span id="contrast-text"></span>)</li>
                </ul>'''

new_settings_html = '''<span id="btn-settings-toggle" style="display:flex;align-items:center;height:100%;width:100%;justify-content:space-between;">
                    <span style="display:flex;align-items:center;"><i class="fa-solid fa-gear" style="margin-right:6px;font-size:0.9em;"></i>設定</span>
                    <i class="fa-solid fa-caret-down" style="margin-left:6px;font-size:0.8em;"></i>
                </span>
                <ul class="panda-dropdown left" style="min-width: 180px;">
                    <li id="btn-lang" style="display:flex;align-items:center;justify-content:space-between;">
                        <span><i class="fa-solid fa-globe" style="margin-right:8px;width:16px;text-align:center;"></i>語言 (Language)</span>
                        <i class="fa-solid fa-caret-right" style="font-size:0.8em;"></i>
                    </li>
                    <li id="btn-style" style="display:flex;align-items:center;justify-content:space-between;">
                        <span><i class="fa-solid fa-palette" style="margin-right:8px;width:16px;text-align:center;"></i>風格 (<span id="style-text"></span>)</span>
                        <i class="fa-solid fa-caret-right" style="font-size:0.8em;"></i>
                    </li>
                    <li id="btn-contrast" style="display:flex;align-items:center;justify-content:space-between;">
                        <span><i class="fa-solid fa-palette" style="margin-right:8px;width:16px;text-align:center;"></i>對比度 (<span id="contrast-text"></span>)</span>
                        <i class="fa-solid fa-caret-right" style="font-size:0.8em;"></i>
                    </li>
                </ul>'''

content = content.replace(old_settings_html, new_settings_html)

# Add icons to Native File and Edit menus (Optional, but makes it perfectly match TurboWarp)
# TurboWarp has icons for File and Edit. I can inject them into the DOM when menuBar is found.
js_inject_native_icons = '''
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
if 'fa-file' not in content:
    content = content.replace('menuBar.appendChild(authWrapper);', 'menuBar.appendChild(authWrapper);' + js_inject_native_icons)

# Bump version
content = content.replace('v=75', 'v=76')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
