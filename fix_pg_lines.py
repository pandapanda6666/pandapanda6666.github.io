import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if 'window.socket.emit(\'saveAppData\'' in line:
        skip = True
        replacement = '''                                // 等待伺服器回傳 ack
                                window.socket.emit('saveAppData', { 
                                    appId: window.appId, 
                                    projectName: projectName,
                                    data: { projectBase64: base64data } 
                                }, (res) => {
                                    if (res && res.status === 'ok') {
                                        console.log("PandaGuard: Cloud Save ACK received.");
                                        saveNowBtn.innerHTML = '<span style="color:lightgreen;font-weight:bold;"> ✅ 已儲存</span>';
                                        setTimeout(() => saveNowBtn.innerHTML = originalHTML, 2000);
                                    } else {
                                        console.error("PandaGuard Cloud Save Error:", res);
                                        saveNowBtn.innerHTML = '<span style="color:#ffcccc;font-weight:bold;"> ❌ 儲存失敗</span>';
                                        setTimeout(() => saveNowBtn.innerHTML = originalHTML, 3000);
                                    }
                                });\n'''
        new_lines.append(replacement)
    elif skip and 'setTimeout(() => saveNowBtn.innerHTML = originalHTML, 2000);' in line:
        skip = False
    elif not skip:
        # Also remove the comment before emit if it exists
        if '//' in line and 'ack' in line and 'Callback' in line:
            continue
        new_lines.append(line)

with codecs.open(path, 'w', 'utf-8') as f:
    f.writelines(new_lines)

html_path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
import time
import re
with codecs.open(html_path, 'r', 'utf-8') as f:
    html_content = f.read()
html_content = re.sub(r'panda_guard\.js\?v=\d+', f'panda_guard.js?v={int(time.time())}', html_content)
with codecs.open(html_path, 'w', 'utf-8') as f:
    f.write(html_content)

print("SUCCESS")
