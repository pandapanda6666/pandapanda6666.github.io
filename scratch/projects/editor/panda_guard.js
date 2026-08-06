(function() {
    console.log("PandaGuard: Initializing universal download interceptor with Blob caching...");

    // 1. Intercept URL.createObjectURL to catch the Blob before it gets downloaded/revoked
    const originalCreateObjectURL = window.URL.createObjectURL;
    window.pandaGuardBlobs = new Map();

    window.URL.createObjectURL = function(blob) {
        const url = originalCreateObjectURL.call(this, blob);
        // Save all blobs just in case, we will clear them later
        if (blob instanceof Blob) {
            window.pandaGuardBlobs.set(url, blob);
        }
        return url;
    };

    // 2. Intercept Anchor click to process the SB3
    const originalClick = HTMLAnchorElement.prototype.click;

    HTMLAnchorElement.prototype.click = function() {
        if (this.download && this.download.endsWith('.sb3') && this.href && this.href.startsWith('blob:')) {
            if (this.dataset.pandaModified) {
                console.log("PandaGuard: Allowing modified download to proceed.");
                return originalClick.call(this);
            }

            console.log("PandaGuard: Intercepted .sb3 download click!");

            const filename = this.download;
            const originalHref = this.href;
            const originalBlob = window.pandaGuardBlobs.get(originalHref);

            if (!originalBlob) {
                console.error("PandaGuard: Could not find original Blob in cache!");
                this.dataset.pandaModified = "true";
                return originalClick.call(this);
            }

            processAndDownloadSb3(originalBlob, filename).catch(e => {
                console.error("PandaGuard: Error processing sb3:", e);
                this.dataset.pandaModified = "true";
                originalClick.call(this);
            });

            return; // Cancel original click
        }
        return originalClick.call(this);
    };

    async function processAndDownloadSb3(originalBlob, filename) {
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

        window.encryptSb3 = async function(originalBlob) {
        const JSZip = window.JSZip;
        if (!JSZip) throw new Error("JSZip not found!");

        const originalZip = await JSZip.loadAsync(originalBlob);
        const newZip = new JSZip();
        const pandaFolder = newZip.folder("panda_project");
        
        for (const f of Object.keys(originalZip.files)) {
            if (!originalZip.files[f].dir) {
                const fileData = await originalZip.files[f].async("uint8array");
                if (f === "project.json") {
                    pandaFolder.file("panda.json", fileData);
                } else {
                    pandaFolder.file(f, fileData);
                }
            }
        }
        
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
    };

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
                    alert("✅ 雲端儲存成功！");
                    window.isCloudSaving = false;
                });
            };
            reader.readAsDataURL(newBlob);
            
            return; // Skip local download
        }

        const newUrl = URL.createObjectURL(newBlob);
        
        const a = document.createElement('a');
        a.href = newUrl;
        a.download = filename;
        a.dataset.pandaModified = "true";
        document.body.appendChild(a);
        originalClick.call(a);
        a.remove();
        
        // We can revoke the new URL safely
        setTimeout(() => URL.revokeObjectURL(newUrl), 1000);
    }
    
    // 3. Keep the VM loadProject patch for loading PandaScratch files
    let vm = null;
    let patchedLoad = false;
    
    function findVM() {
        if (vm) return vm;
        const allElements = document.querySelectorAll('*');
        for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i];
            const internalKey = Object.keys(el).find(key => key.startsWith('__reactInternalInstance$') || key.startsWith('__reactFiber$'));
            if (internalKey) {
                let fiber = el[internalKey];
                let current = fiber;
                while (current) {
                    if (current.memoizedProps && current.memoizedProps.vm) return current.memoizedProps.vm;
                    current = current.return;
                }
            }
        }
        return null;
    }

    function patchVMLoad() {
        vm = findVM();
        if (!vm) return;

        if (!patchedLoad && vm.loadProject) {
            const originalLoad = vm.loadProject.bind(vm);
            vm.loadProject = async function(fileBuffer, ...args) {
                console.log("PandaGuard: Intercepted loadProject");
                try {
                    const JSZip = window.JSZip;
                    if (!JSZip) return originalLoad(fileBuffer, ...args);

                    const zip = await JSZip.loadAsync(fileBuffer);
                    let hasPandaProject = false;
                    for (const f of Object.keys(zip.files)) {
                        if (f.startsWith("panda_project/panda.json")) {
                            hasPandaProject = true;
                            break;
                        }
                    }

                    if (hasPandaProject) {
                        console.log("PandaGuard: Detected PandaScratch protected project, unwrapping...");
                        const unwrappedZip = new JSZip();
                        for (const f of Object.keys(zip.files)) {
                            if (f.startsWith("panda_project/") && !zip.files[f].dir) {
                                let newFilename = f.substring("panda_project/".length);
                                if (newFilename === "panda.json") newFilename = "project.json";
                                const fileData = await zip.files[f].async("uint8array");
                                unwrappedZip.file(newFilename, fileData);
                            }
                        }
                        const unwrappedBuffer = await unwrappedZip.generateAsync({type: "uint8array"});
                        return originalLoad(unwrappedBuffer, ...args);
                    } else {
                        return originalLoad(fileBuffer, ...args);
                    }
                } catch (e) {
                    console.error("PandaGuard Load Error:", e);
                    return originalLoad(fileBuffer, ...args);
                }
            };
            patchedLoad = true;
            console.log("PandaGuard: VM Load successfully patched!");
            
            // ==========================================
            // CLOUD SYSTEM (BACKEND LOGIC)
            // ==========================================
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');
            window.appId = projectId ? projectId : null;

            // 1. Auto Load from Cloud
            if (window.appId && typeof window.socket !== 'undefined' && window.socket.connected) {
                console.log("PandaGuard: Requesting cloud project...", window.appId);
                window.socket.emit('getAppData', { appId: window.appId }, (res) => {
                    if (res && res.data && res.data.projectBase64) {
                        try {
                            const byteCharacters = atob(res.data.projectBase64);
                            const byteNumbers = new Array(byteCharacters.length);
                            for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            originalLoad(byteArray).then(() => {
                                console.log("PandaGuard: Cloud project loaded successfully!");
                            });
                        } catch(e) { console.error("PandaGuard: Cloud load error:", e); }
                    }
                });
            }

            // 2. Manual Save to Cloud (Intercept native "Save now" button)
            document.addEventListener('click', (e) => {
                // Check if they clicked the Save Now button
                const saveNowBtn = e.target.closest('#panda-cloud-save-btn');
                if (saveNowBtn && vm && vm.editingTarget) {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    if (typeof window.socket !== 'undefined' && window.socket.connected) {
                        if (!window.appId) {
                            window.appId = Date.now().toString();
                            history.pushState(null, '', '?id=' + window.appId);
                        }
                        const originalText = saveNowBtn.innerText;
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
                        });
                    } else {
                        alert("伺服器尚未連線，無法儲存至雲端！");
                    }
                }
                
                // Check if they clicked the Share button
                const shareBtn = e.target.closest('div[class*="share-button_share-button_"]');
                if (shareBtn) {
                    e.stopPropagation();
                    e.preventDefault();
                    if (window.appId && typeof window.socket !== 'undefined' && window.socket.connected) {
                        window.socket.emit('shareProject', { projectId: window.appId });
                        alert('專案已分享！');
                    } else {
                        alert('尚未連線到伺服器或尚未儲存專案');
                    }
                }
                
                // Check if they clicked the Project Page button
                const projectPageBtn = e.target.closest('div[class*="community-button_community-button_"]');
                if (projectPageBtn) {
                    e.stopPropagation();
                    e.preventDefault();
                    window.location.href = '/scratch/mystuff/';
                }
            }, true); // Use capture phase to intercept before React
        }
    }

    const interval = setInterval(() => {
        if (patchedLoad) {
            clearInterval(interval);
        } else {
            patchVMLoad();
        }
    }, 1000);
})();
