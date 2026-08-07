import codecs
import time
import re

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

start_str = 'async function processAndDownloadSb3(originalBlob, filename) {'
end_str = 'const newUrl = URL.createObjectURL(newBlob);'

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    replacement = '''async function processAndDownloadSb3(originalBlob, filename) {
        const finalBlob = await window.encryptSb3(originalBlob);
        
        if (window.isCloudSaving && typeof window.socket !== 'undefined' && window.socket.connected) {
            console.log("PandaGuard: Cloud Save activated! Uploading...");
            
            const reader = new FileReader();
            reader.onloadend = function() {
                const base64data = reader.result.split(',')[1];
                window.socket.emit('saveAppData', { 
                    appId: window.appId, 
                    data: { projectBase64: base64data } 
                }, (response) => {
                    alert("✅ 雲端儲存成功！");
                    window.isCloudSaving = false;
                });
            };
            reader.readAsDataURL(finalBlob);
            
            return;
        }

        const newUrl = URL.createObjectURL(finalBlob);
'''
    new_content = content[:start_idx] + replacement + content[end_idx + len(end_str):]
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(new_content)
        
    html_path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
    with codecs.open(html_path, 'r', 'utf-8') as f:
        html_content = f.read()
    html_content = re.sub(r'panda_guard\.js\?v=\d+', f'panda_guard.js?v={int(time.time())}', html_content)
    with codecs.open(html_path, 'w', 'utf-8') as f:
        f.write(html_content)
    print("SUCCESS")
else:
    print("FAILED TO FIND")
