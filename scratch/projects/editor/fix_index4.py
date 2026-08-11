import os
filepath = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix CSS to remove hover open
content = content.replace('.panda-custom-menu:hover .panda-dropdown, .panda-custom-menu.active .panda-dropdown {', '.panda-custom-menu.active .panda-dropdown {')

# Add modal header CSS
new_css = '''
/* 將擴充功能等 Modal 的藍色標題列改為綠色 */
div[class*="modal_header_"] {
    background-color: var(--panda-green) !important;
}
'''
if '/* 將擴充功能等 Modal 的藍色標題列改為綠色 */' not in content:
    content = content.replace('/* 將藍色的載入畫面改為綠色 */', new_css + '\n/* 將藍色的載入畫面改為綠色 */')

# Make settings open on click instead of hover
content = content.replace('<span>設定</span>', '<span id="btn-settings-toggle" style="display:flex;align-items:center;height:100%;width:100%;">設定</span>')

js_event_append = '''
            document.getElementById('btn-settings-toggle').addEventListener('click', (e) => {
                e.stopPropagation();
                const isActive = settingsDiv.classList.contains('active');
                if (isActive) {
                    settingsDiv.classList.remove('active');
                } else {
                    settingsDiv.classList.add('active');
                    const hideSettings = (event) => {
                        if (!settingsDiv.contains(event.target)) {
                            settingsDiv.classList.remove('active');
                            document.removeEventListener('click', hideSettings);
                        }
                    };
                    document.addEventListener('click', hideSettings);
                }
            });
'''
if 'btn-settings-toggle' in content and 'hideSettings' not in content:
    content = content.replace('langMenu.parentNode.insertBefore(settingsDiv, langMenu.nextSibling);', 'langMenu.parentNode.insertBefore(settingsDiv, langMenu.nextSibling);' + js_event_append)

# Bump version to 74
content = content.replace('v=73', 'v=74')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
