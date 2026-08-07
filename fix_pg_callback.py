import codecs
import time

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = '''                                // 發送出去，目前伺服器沒有 ack
                                window.socket.emit('saveAppData', { 
                                    appId: window.appId, 
                                    projectName: projectName,
                                    data: { projectBase64: base64data } 
                                });
                                console.log("PandaGuard: Manually saved to cloud. Payload sent.");
                                saveNowBtn.innerHTML = '<span style="color:lightgreen;font-weight:bold;"> ✅ 已儲存</span>';
                                setTimeout(() => saveNowBtn.innerHTML = originalHTML, 2000);'''
# It might have slightly different text, so let's use regex
import re
match = re.search(r'// .*?\s*window\.socket\.emit\(\'saveAppData\', \{.*?\}\);\s*console\.log\(.*?\);\s*saveNowBtn\.innerHTML = .*?;\s*setTimeout\(.*?\);', content, re.DOTALL)
if match:
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
                                });'''
    content = content.replace(match.group(0), replacement)
    
    html_path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
    with codecs.open(html_path, 'r', 'utf-8') as f:
        html_content = f.read()
    html_content = re.sub(r'panda_guard\.js\?v=\d+', f'panda_guard.js?v={int(time.time())}', html_content)
    with codecs.open(html_path, 'w', 'utf-8') as f:
        f.write(html_content)

    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NO MATCH")
