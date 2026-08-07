import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\panda_sso.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

import re
# Find the connect_error handler
match = re.search(r'window\.ssoSocket\.on\(\'connect_error\', \(err\) => \{.*?\n.*?errorDiv\.innerText = \'伺服器連線或逾時，前台離線模式已啟動\';.*?renderGuestUI\(\);\s*\}\);', content, re.DOTALL)
if match:
    replacement = '''window.ssoSocket.on('connect_error', (err) => {
        console.error("SSO Connection Error:", err);
        // 如果連不上伺服器，自動登出
        localStorage.removeItem('panda_session_token');
        localStorage.removeItem('sso_token');
        localStorage.removeItem('panda_session_user');
        localStorage.removeItem('sso_user');
        sessionStorage.removeItem('sso_token');
        sessionStorage.removeItem('sso_user');
        window.ssoSocket.disconnect();
        renderGuestUI();
    });'''
    content = content.replace(match.group(0), replacement)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND IN panda_sso.js")
