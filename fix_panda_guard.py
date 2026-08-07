import codecs
import time

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = '''                try {
                    await Promise.race([
                        new Promise((resolve) => {
                            window.ssoSocket.emit('saveAppData', {
                                appId: window.appId,
                                data: projectData,
                                projectName: projectName
                            });
                            // AI 修改：由於伺服器端沒有回傳 ack，直接 resolve 不要乾等
                            resolve({ status: 'ok' });
                        }),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('伺服器連線逾時 (15秒)')), 15000))
                    ]);
                } catch (e) {
                    console.warn("PandaGuard saveAppData timeout or error:", e);
                }'''

replacement = '''                try {
                    await Promise.race([
                        new Promise((resolve, reject) => {
                            window.ssoSocket.emit('saveAppData', {
                                appId: window.appId,
                                data: projectData,
                                projectName: projectName
                            }, (res) => {
                                if (res && res.status === 'ok') {
                                    resolve(res);
                                } else {
                                    reject(new Error('伺服器回傳錯誤'));
                                }
                            });
                        }),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('伺服器連線逾時 (15秒)')), 15000))
                    ]);
                } catch (e) {
                    console.error("PandaGuard saveAppData timeout or error:", e);
                    throw e; // 讓外層捕獲錯誤，不要顯示儲存成功
                }'''

# normalize
target = target.replace('\n', '\r\n')
replacement = replacement.replace('\n', '\r\n')

if target in content:
    content = content.replace(target, replacement)
    
    # Also update cache buster in index.html
    html_path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
    with codecs.open(html_path, 'r', 'utf-8') as f:
        html_content = f.read()
    import re
    html_content = re.sub(r'panda_guard\.js\?v=\d+', f'panda_guard.js?v={int(time.time())}', html_content)
    with codecs.open(html_path, 'w', 'utf-8') as f:
        f.write(html_content)

    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND")
