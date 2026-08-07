(function() {
    console.log("PandaGuard: Initializing universal download interceptor with Blob caching...");

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

                                    // 等待伺服器回傳 ack
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
                                });
                            };
                            reader.readAsDataURL(finalBlob);
                        }).catch(e => {
                            console.error("PandaGuard Manual Save Error:", e);
                            saveNowBtn.innerHTML = '<span style="color:#ffcccc;font-weight:bold;">❌ 儲存失敗</span>';
                            setTimeout(() => saveNowBtn.innerHTML = originalHTML, 3000);
                        });
                    } else {
                        alert("伺服器尚未連線，無法儲存至雲端！");
                    }
                }
                
                // Check if they clicked the Share button
                const shareBtn = e.target.closest('[class*="share-button_share-button_"]');
                if (shareBtn) {
                    e.stopPropagation(); e.stopImmediatePropagation();
                    e.preventDefault();
                    if (window.appId && typeof window.socket !== 'undefined' && window.socket.connected) {
                        window.socket.emit('shareProject', { projectId: window.appId });
                        const shareUrl = window.location.origin + '/scratch/projects/editor/player/?id=' + window.appId;
                        prompt('專案已分享！您可以複製以下連結並傳送給其他人：', shareUrl);
                    } else {
                        alert('尚未連線到伺服器或尚未儲存專案');
                    }
                }
                
                // Check if they clicked the Project Page button
                const projectPageBtn = e.target.closest('[class*="community-button_community-button_"]');
                if (projectPageBtn) {
                    e.stopPropagation(); e.stopImmediatePropagation();
                    e.preventDefault();
                    if (window.appId) {
                        window.location.href = '/scratch/projects/?id=' + window.appId;
                    } else {
                        alert('請先儲存專案才能前往專案頁面！');
                    }
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
