import codecs
import re

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\panda_sso.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# Replace connect_error
pattern_connect = re.compile(r"socket\.on\('connect_error', \(err\) => \{.*?\}\);", re.DOTALL)
replacement_connect = '''socket.on('connect_error', (err) => {
            console.error("Socket.io connect_error:", err);
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
            }, 5000);
        });'''
content = pattern_connect.sub(replacement_connect, content)

# Replace window.location.reload()
pattern_reload = re.compile(r"if \(wasLogged\) \{[^}]*window\.location\.reload\(\);[^}]*\} else \{[^}]*renderGuestUI\(\);[^}]*\}", re.DOTALL)
replacement_reload = '''if (wasLogged) {
            alert("伺服器連線中斷，已為您自動登出。建議您先將專案「儲存到電腦」以避免遺失進度！");
            renderGuestUI();
        } else {
            renderGuestUI();
        }'''
content = pattern_reload.sub(replacement_reload, content)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)

print("SUCCESS")
