import codecs
import time
import re

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\panda_sso.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# Replace connect_error
content = content.replace('''        socket.on('connect_error', (err) => {
            console.error("連線錯誤", err);
            showConnectionError();
            if (!getStoredAuthData().isLogged) {
                renderGuestUI();
            }
        });''', '''        socket.on('connect_error', (err) => {
            console.error("Socket.io connect_error:", err);
            // Let it auto-reconnect, do not immediately log out here!
        });
        
        socket.on('disconnect', (reason) => {
            console.log("Socket.io disconnected:", reason);
            setTimeout(() => {
                if (window.socket && !window.socket.connected) {
                    showConnectionError();
                    if (!getStoredAuthData().isLogged) {
                        renderGuestUI();
                    }
                }
            }, 5000); // Wait 5 seconds before giving up and logging out
        });''')

# Replace showConnectionError
content = content.replace('''        if (wasLogged) {
            // 原本已登入但連線中斷，強制登出並轉址
            window.location.reload();
        } else {
            // 未登入，維持訪客模式
            renderGuestUI();
        }''', '''        if (wasLogged) {
            // 原本已登入但連線中斷，不准 reload，否則會遺失使用者未儲存的專案！
            alert("伺服器連線中斷，已為您自動登出。建議您先將專案「儲存到電腦」以避免遺失進度！");
            renderGuestUI();
        } else {
            renderGuestUI();
        }''')

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)

# Update version in index.html
html_path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(html_path, 'r', 'utf-8') as f:
    html_content = f.read()
html_content = re.sub(r'panda_sso\.js\?v=\d+', f'panda_sso.js?v={int(time.time())}', html_content)
with codecs.open(html_path, 'w', 'utf-8') as f:
    f.write(html_content)

print("SUCCESS")
