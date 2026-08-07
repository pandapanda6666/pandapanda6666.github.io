import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = '''                        const originalText = saveNowBtn.innerText;
                        saveNowBtn.innerText = '儲存中...';
                        
                        vm.saveProjectSb3().then(async blob => {
                            const isEncrypted = localStorage.getItem('panda-encrypt-save') !== 'false';
                            let finalBlob = blob;
                            if (isEncrypted) {
                                try {
                                    finalBlob = await window.encryptSb3(blob);
                                } catch (err) {
                                    console.error("Cloud encrypt error:", err);
                                }
                            }
                            const reader = new FileReader();
                            reader.onloadend = function() {
                                const base64data = reader.result.split(',')[1];
                                const projectNameInput = document.querySelector('input[class*="project-title-input_title-field_"]');
                                const projectName = projectNameInput ? projectNameInput.value : '未命名專案';
                                window.socket.emit('saveAppData', { 
                                    appId: window.appId, 
                                    projectName: projectName,
                                    data: { projectBase64: base64data } 
                                }, (response) => {
                                    saveNowBtn.innerText = '已儲存';
                                    setTimeout(() => saveNowBtn.innerText = originalText, 2000);
                                });
                                console.log("PandaGuard: Manually saved to cloud.");
                            };
                            reader.readAsDataURL(finalBlob);
                        }).catch(e => {
                            console.error("PandaGuard Manual Save Error:", e);
                            saveNowBtn.innerText = '儲存失敗';
                        });'''

replacement = '''                        const originalHTML = saveNowBtn.innerHTML;
                        saveNowBtn.innerHTML = '<span style="color:white;font-weight:bold;">儲存中...</span>';
                        
                        // 加上超時機制，以防 vm.saveProjectSb3 卡住
                        const savePromise = vm.saveProjectSb3();
                        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('VM Save Timeout')), 15000));
                        
                        Promise.race([savePromise, timeoutPromise]).then(async blob => {
                            const isEncrypted = localStorage.getItem('panda-encrypt-save') !== 'false';
                            let finalBlob = blob;
                            if (isEncrypted) {
                                try {
                                    finalBlob = await window.encryptSb3(blob);
                                } catch (err) {
                                    console.error("Cloud encrypt error:", err);
                                }
                            }
                            const reader = new FileReader();
                            reader.onloadend = function() {
                                const base64data = reader.result.split(',')[1];
                                const projectNameInput = document.querySelector('input[class*="menu-bar_title-field_"]');
                                const projectName = projectNameInput ? projectNameInput.value : '未命名專案';
                                
                                // 直接送出，不等待伺服器 Callback，因為伺服器可能沒有實作 ack
                                window.socket.emit('saveAppData', { 
                                    appId: window.appId, 
                                    projectName: projectName,
                                    data: { projectBase64: base64data } 
                                });
                                console.log("PandaGuard: Manually saved to cloud. Payload sent.");
                                saveNowBtn.innerHTML = '<span style="color:lightgreen;font-weight:bold;">✅ 已儲存</span>';
                                setTimeout(() => saveNowBtn.innerHTML = originalHTML, 2000);
                            };
                            reader.readAsDataURL(finalBlob);
                        }).catch(e => {
                            console.error("PandaGuard Manual Save Error:", e);
                            saveNowBtn.innerHTML = '<span style="color:#ffcccc;font-weight:bold;">❌ 儲存失敗</span>';
                            setTimeout(() => saveNowBtn.innerHTML = originalHTML, 3000);
                        });'''

if target in content:
    content = content.replace(target, replacement)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND")
