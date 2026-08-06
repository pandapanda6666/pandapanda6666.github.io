import codecs

path = 'scratch/projects/editor/panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# 1. Modify the URL.createObjectURL hook to respect the toggle
target_hook = '''        if (blob && blob.type === "application/x.scratch.sb3") {
            const tempUrl = originalURLCreate(blob);
            setTimeout(() => {
                const aElements = document.querySelectorAll("a[download]");
                for (let a of aElements) {
                    if (a.href === tempUrl) {
                        a.addEventListener("click", function(e) {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            const filename = a.download || "project.sb3";
                            processAndDownloadSb3(blob, filename);
                        }, true);
                    }
                }
            }, 100);
            return tempUrl;
        }'''

replacement_hook = '''        if (blob && blob.type === "application/x.scratch.sb3") {
            const tempUrl = originalURLCreate(blob);
            setTimeout(() => {
                const aElements = document.querySelectorAll("a[download]");
                for (let a of aElements) {
                    if (a.href === tempUrl) {
                        a.addEventListener("click", async function(e) {
                            const isEncrypted = localStorage.getItem('panda-encrypt-save') !== 'false';
                            if (isEncrypted) {
                                e.preventDefault();
                                e.stopImmediatePropagation();
                                const filename = a.download || "project.sb3";
                                try {
                                    const newBlob = await encryptSb3(blob);
                                    const finalUrl = originalURLCreate(newBlob);
                                    const link = document.createElement('a');
                                    link.href = finalUrl;
                                    link.download = filename.replace('.sb3', ' (PandaScratch).sb3');
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    setTimeout(() => window.URL.revokeObjectURL(finalUrl), 1000);
                                } catch (err) {
                                    console.error("Encryption failed", err);
                                }
                            }
                        }, true);
                    }
                }
            }, 100);
            return tempUrl;
        }'''
content = content.replace(target_hook, replacement_hook)


# 2. Modify processAndDownloadSb3 to just encryptSb3 and return blob
target_process = '''    async function processAndDownloadSb3(originalBlob, filename) {
        const JSZip = window.JSZip;
        if (!JSZip) throw new Error("JSZip not found!");

        const originalZip = await JSZip.loadAsync(originalBlob);
        
        const newZip = new JSZip();
        const pandaFolder = newZip.folder("panda_project");
        
        // Move all original files to panda_project/
        for (const f of Object.keys(originalZip.files)) {
            // JSZip .files includes folders, we should only copy files
            if (!originalZip.files[f].dir) {
                const fileData = await originalZip.files[f].async("uint8array");
                if (f === "project.json") {
                    pandaFolder.file("panda.json", fileData);
                } else {
                    pandaFolder.file(f, fileData);
                }
            }
        }
        
        // Inject the warning project to the root
        const warningZipBase64 = window.PANDA_WARNING_ZIP_BASE64;
        if (warningZipBase64) {
            const warningZip = await JSZip.loadAsync(warningZipBase64, {base64: true});
            for (const f of Object.keys(warningZip.files)) {
                if (!warningZip.files[f].dir) {
                    const fileData = await warningZip.files[f].async("uint8array");
                    newZip.file(f, fileData);
                }
            }
        }

        const newBlob = await newZip.generateAsync({
            type: "blob",
            mimeType: "application/x.scratch.sb3",
            compression: "DEFLATE",
            compressionOptions: { level: 6 }
        });
        
        if (window.isCloudSaving && typeof window.socket !== 'undefined' && window.socket.connected) {
            console.log("PandaGuard: Cloud Save activated! Uploading...");
            
            // Read Blob as base64
            const reader = new FileReader();
            reader.onloadend = function() {
                const base64data = reader.result.split(',')[1];
                window.socket.emit('saveAppData', { 
                    appId: window.appId, 
                    data: { projectBase64: base64data } 
                }, (response) => {
                    alert("✅ 已成功儲存至雲端！");
                    window.isCloudSaving = false;
                });
            };
            reader.readAsDataURL(newBlob);
        } else {
            const finalUrl = originalURLCreate(newBlob);
            const link = document.createElement('a');
            link.href = finalUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(finalUrl), 1000);
        }
    }'''

replacement_process = '''    async function encryptSb3(originalBlob) {
        const JSZip = window.JSZip;
        if (!JSZip) throw new Error("JSZip not found!");

        const originalZip = await JSZip.loadAsync(originalBlob);
        
        const newZip = new JSZip();
        const pandaFolder = newZip.folder("panda_project");
        
        // Move all original files to panda_project/
        for (const f of Object.keys(originalZip.files)) {
            // JSZip .files includes folders, we should only copy files
            if (!originalZip.files[f].dir) {
                const fileData = await originalZip.files[f].async("uint8array");
                if (f === "project.json") {
                    pandaFolder.file("panda.json", fileData);
                } else {
                    pandaFolder.file(f, fileData);
                }
            }
        }
        
        // Inject the warning project to the root
        const warningZipBase64 = window.PANDA_WARNING_ZIP_BASE64;
        if (warningZipBase64) {
            const warningZip = await JSZip.loadAsync(warningZipBase64, {base64: true});
            for (const f of Object.keys(warningZip.files)) {
                if (!warningZip.files[f].dir) {
                    const fileData = await warningZip.files[f].async("uint8array");
                    newZip.file(f, fileData);
                }
            }
        }

        return await newZip.generateAsync({
            type: "blob",
            mimeType: "application/x.scratch.sb3",
            compression: "DEFLATE",
            compressionOptions: { level: 6 }
        });
    }'''
content = content.replace(target_process, replacement_process)

# 3. Modify Manual Save to Cloud hook
target_cloud = '''                        vm.saveProjectSb3().then(blob => {
                            const reader = new FileReader();
                            reader.onloadend = function() {
                                const base64data = reader.result.split(',')[1];
                                window.socket.emit('saveAppData', { 
                                    appId: appId, 
                                    data: { projectBase64: base64data } 
                                }, (response) => {
                                    saveNowBtn.innerText = '已儲存';
                                    setTimeout(() => saveNowBtn.innerText = originalText, 2000);
                                    // Hack to clear the "project changed" flag in Redux if possible,
                                    // by emitting a fake save completion if needed.
                                });
                                console.log("PandaGuard: Manually saved to cloud.");
                            };
                            reader.readAsDataURL(blob);
                        }).catch(e => {
                            console.error("PandaGuard Manual Save Error:", e);
                            saveNowBtn.innerText = '儲存失敗';
                        });'''

replacement_cloud = '''                        vm.saveProjectSb3().then(async blob => {
                            const isEncrypted = localStorage.getItem('panda-encrypt-save') !== 'false';
                            let finalBlob = blob;
                            if (isEncrypted) {
                                try {
                                    finalBlob = await encryptSb3(blob);
                                } catch (err) {
                                    console.error("Cloud encrypt error:", err);
                                }
                            }
                            const reader = new FileReader();
                            reader.onloadend = function() {
                                const base64data = reader.result.split(',')[1];
                                window.socket.emit('saveAppData', { 
                                    appId: appId, 
                                    data: { projectBase64: base64data } 
                                }, (response) => {
                                    saveNowBtn.innerText = '已儲存';
                                    setTimeout(() => saveNowBtn.innerText = originalText, 2000);
                                });
                                console.log(PandaGuard: Manually saved to cloud (Encrypted: ).);
                            };
                            reader.readAsDataURL(finalBlob);
                        }).catch(e => {
                            console.error("PandaGuard Manual Save Error:", e);
                            saveNowBtn.innerText = '儲存失敗';
                        });'''
content = content.replace(target_cloud, replacement_cloud)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
