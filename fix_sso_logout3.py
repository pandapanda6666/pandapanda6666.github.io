import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\panda_sso.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

import re
match = re.search(r'    function showConnectionError\(\) \{.*?\n.*?setTimeout\(\(\) => \{ if \(errorDiv && errorDiv\.parentNode\) errorDiv\.parentNode\.removeChild\(errorDiv\); \}, 5000\);\r?\n    \}', content, re.DOTALL)
if match:
    replacement = '''    function showConnectionError() {
        console.error("SSO Connection Error.");
        
        // 判斷是否已經處於登入狀態
        const wasLogged = getStoredAuthData().isLogged;
        
        // 自動登出並清除驗證資料
        localStorage.removeItem('panda_session_token');
        localStorage.removeItem('sso_token');
        localStorage.removeItem('panda_session_user');
        localStorage.removeItem('sso_user');
        sessionStorage.removeItem('sso_token');
        sessionStorage.removeItem('sso_user');
        
        if (wasLogged) {
            // 原本已登入，連線中斷則強制登出並轉導
            window.location.reload();
        } else {
            // 未登入，切換為訪客介面
            renderGuestUI();
        }
    }'''
    content = content.replace(match.group(0), replacement)
    
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
        
    # Update cache buster in index.html
    import time
    html_path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\index.html'
    if __import__('os').path.exists(html_path):
        with codecs.open(html_path, 'r', 'utf-8') as f:
            html_content = f.read()
        html_content = re.sub(r'panda_sso\.js\?v=\d+', f'panda_sso.js?v={int(time.time())}', html_content)
        with codecs.open(html_path, 'w', 'utf-8') as f:
            f.write(html_content)

    print("SUCCESS")
else:
    print("NOT FOUND showConnectionError")
