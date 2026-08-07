import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# 1. Remove my custom buttons
target_btns = '''<div id="panda-cloud-share-btn" class="panda-settings-btn panda-sso-nav" title="分享" style="padding: 0 15px; margin-right: 10px; background: rgba(0,0,0,0.15); border-radius: 20px; height: 32px;">
                        <span data-i18n="share">分享</span>
                    </div>
                    <div id="panda-project-page-btn" class="panda-settings-btn panda-sso-nav" title="專案頁面" style="padding: 0 15px; margin-right: 10px; background: rgba(0,0,0,0.15); border-radius: 20px; height: 32px;">
                        <span data-i18n="project_page">切換到專案頁面</span>
                    </div>'''

if target_btns in content:
    content = content.replace(target_btns, '')

# 2. Remove CSS that hides native buttons
target_css = 'div[class*="share-button_share-button_"],\n    div[class*="community-button_community-button_"],\n    div[class*="menu-bar_login-button_"],'
replace_css = 'div[class*="menu-bar_login-button_"],'

if target_css in content:
    content = content.replace(target_css, replace_css)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("SUCCESS")
