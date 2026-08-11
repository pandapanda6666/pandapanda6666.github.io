import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\panda_sso.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

import re
match = re.search(r'function showConnectionError\(\) \{.*?\n.*?errorDiv\.innerText = \'伺服器連線或逾時，前台離線模式已啟動\';.*?\}', content, re.DOTALL)
if match:
    replacement = '''function showConnectionError() {
        console.error("SSO Connection Error.");
        // 自動登出並轉導
        localStorage.removeItem('panda_session_token');
        localStorage.removeItem('sso_token');
        localStorage.removeItem('panda_session_user');
        localStorage.removeItem('sso_user');
        sessionStorage.removeItem('sso_token');
        sessionStorage.removeItem('sso_user');
        
        // 為了避免無限重新整理，只在已經登入的狀態下登出並轉導，否則只顯示 Guest UI
        const authActions = document.getElementById('auth-actions');
        if (authActions && authActions.style.display === 'none') {
            window.location.reload();
        } else {
            renderGuestUI();
        }
    }'''
    content = content.replace(match.group(0), replacement)
    
    # Let's also update the cache buster in index.html for panda_sso.js
    import time
    html_path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\index.html'
    if __import__('os').path.exists(html_path):
        with codecs.open(html_path, 'r', 'utf-8') as f:
            html_content = f.read()
        html_content = re.sub(r'panda_sso\.js\?v=\d+', f'panda_sso.js?v={int(time.time())}', html_content)
        with codecs.open(html_path, 'w', 'utf-8') as f:
            f.write(html_content)

    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND showConnectionError")
