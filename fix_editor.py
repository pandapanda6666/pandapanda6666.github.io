import os

base_dir = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io'
fp = os.path.join(base_dir, 'scratch', 'projects', 'editor', 'index.html')

with open(fp, 'rb') as f:
    text = f.read().decode('utf-8', 'ignore')

editor_sso_css = '''
    <style>
        /* 隱藏未實作與舊版登入相關按鈕 */
        .share-button_share-button_36Wbh,
        .community-button_community-button_20Q0O,
        .menu-bar_account-info-group_1CTpL,
        .login-dropdown_login_82DKk,
        .menu-bar_account-nav-menu_1ts18 {
            display: none !important;
        }
        
        .avatar-container:hover .dropdown-content { display: block !important; }
        .dropdown-content a:hover { background-color: #f1f1f1 !important; }
    </style>
'''

editor_sso_html = '''
    <!-- 覆蓋在編輯器右上方的新版 SSO 登入介面 -->
    <div class="sso-custom-nav" style="position: absolute; top: 0; right: 0; height: 48px; display: flex; align-items: center; z-index: 10000; padding-right: 15px; pointer-events: auto;">
        <div class="auth-actions" id="auth-actions" style="margin-left: 10px; display: none;">
            <a href="https://pandapanda6666.github.io/login-hub/?require=1&from=https%3A%2F%2Fpandapanda6666.github.io%2Fscratch%2Fprojects%2Feditor%2F" style="margin-right: 10px; color: white; text-decoration: none; font-weight: bold; background: rgba(0,0,0,0.1); padding: 5px 10px; border-radius: 4px;">登入 / 註冊</a>
        </div>

        <div class="user-menu" id="user-menu" style="display: none; align-items: center; height: 100%;">
            <div class="avatar-container" style="display: flex; align-items: center; cursor: pointer; padding: 0 10px; height: 100%; position: relative;">
                <img src="" alt="Avatar" class="avatar" id="nav-avatar" style="width: 32px; height: 32px; border-radius: 50%; margin-right: 8px; object-fit: cover; border: 1px solid rgba(255,255,255,0.4);">
                <span class="username" id="nav-username" style="color: white; font-size: 14px; font-weight: bold; display: flex; align-items: center;">使用者</span>
                
                <div class="dropdown-content" style="display: none; position: absolute; top: 48px; right: 0; background-color: white; min-width: 160px; box-shadow: 0px 8px 16px rgba(0,0,0,0.2); z-index: 10000; border-radius: 6px; overflow: hidden;">
                    <a href="https://pandapanda6666.github.io/login-hub/?action=editProfile" style="color: #333; padding: 12px 16px; text-decoration: none; display: block; font-size: 14px;">個人資訊</a>
                    <a href="/scratch/mystuff/" style="color: #333; padding: 12px 16px; text-decoration: none; display: block; font-size: 14px;">我的東西</a>
                    <a href="https://pandapanda6666.github.io/login-hub/?action=editProfile" style="color: #333; padding: 12px 16px; text-decoration: none; display: block; font-size: 14px;">帳戶設定</a>
                    <a href="javascript:void(0)" onclick="logout()" style="color: #333; padding: 12px 16px; text-decoration: none; display: block; font-size: 14px;">登出</a>
                </div>
            </div>
        </div>
    </div>
    <script>
        function logout() {
            localStorage.removeItem('sso_auth');
            localStorage.removeItem('sso_user');
            localStorage.removeItem('sso_server');
            localStorage.removeItem('panda_session_token');
            localStorage.removeItem('panda_session_user');
            localStorage.removeItem('panda_auto_user');
            localStorage.removeItem('panda_auto_pass');
            window.location.href = 'https://pandapanda6666.github.io/login-hub/?action=logout&from=' + encodeURIComponent(window.location.href);
        }
    </script>
'''

if '/* 隱藏未實作與舊版登入相關按鈕 */' not in text:
    text = text.replace('</head>', editor_sso_css + '</head>')
if 'id="auth-actions"' not in text:
    text = text.replace('<body>', '<body>\n' + editor_sso_html)

with open(fp, 'wb') as f:
    f.write(text.encode('utf-8'))

