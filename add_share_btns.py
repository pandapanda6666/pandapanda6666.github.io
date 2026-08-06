import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = '''<div id="panda-cloud-save-btn" class="panda-settings-btn panda-sso-nav" title="雲端儲存" style="padding: 0 15px; margin-right: 10px; background: rgba(0,0,0,0.15); border-radius: 20px; height: 32px;">
                        <svg class="panda-icon" viewBox="0 0 448 512" width="14" height="14" fill="currentColor" style="margin-right: 5px;"><path d="M144 144v48H304V144c0-26.5-21.5-48-48-48H192c-26.5 0-48 21.5-48 48zM0 80C0 35.8 35.8 0 80 0H368c44.2 0 80 35.8 80 80V432c0 44.2-35.8 80-80 80H80c-44.2 0-80-35.8-80-80V80zM320 352a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM224 256c-53 0-96 43-96 96s43 96 96 96s96-43 96-96s-43-96-96-96z"/></svg>
                        <span data-i18n="save_cloud">立即儲存</span>
                    </div>'''

replacement = target + '''
                    <div id="panda-cloud-share-btn" class="panda-settings-btn panda-sso-nav" title="分享" style="padding: 0 15px; margin-right: 10px; background: rgba(0,0,0,0.15); border-radius: 20px; height: 32px;">
                        <span data-i18n="share">分享</span>
                    </div>
                    <div id="panda-project-page-btn" class="panda-settings-btn panda-sso-nav" title="專案頁面" style="padding: 0 15px; margin-right: 10px; background: rgba(0,0,0,0.15); border-radius: 20px; height: 32px;">
                        <span data-i18n="project_page">切換到專案頁面</span>
                    </div>'''

if target in content:
    content = content.replace(target, replacement)
    
    css_target = 'div[class*="menu-bar_login-button_"],'
    css_replacement = 'div[class*="share-button_share-button_"],\n    div[class*="community-button_community-button_"],\n    div[class*="menu-bar_login-button_"],'
    content = content.replace(css_target, css_replacement)
    
    trans_target = "share: 'Share', project_page: 'Project Page'"
    if trans_target not in content:
        # Add to en
        content = content.replace("saveformat: 'Save Format',", "share: 'Share', project_page: 'Project Page', saveformat: 'Save Format',")
        # Add to tw
        content = content.replace("saveformat: '存檔格式',", "share: '分享', project_page: '切換到專案頁面', saveformat: '存檔格式',")
        # Add to cn
        content = content.replace("saveformat: '存档格式',", "share: '分享', project_page: '切换到项目页面', saveformat: '存档格式',")

    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND")
