// PandaGuard: 負責攔截與偽裝 .sb3 檔案
(function() {
    console.log("PandaGuard 初始化...");

    // 1. 攔截檔案讀取 (Load Project)
    const originalReadAsArrayBuffer = FileReader.prototype.readAsArrayBuffer;
    FileReader.prototype.readAsArrayBuffer = function(file) {
        if (file && file.name && file.name.endsWith('.sb3')) {
            console.log("PandaGuard: 攔截到讀取 .sb3 檔案:", file.name);
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const buffer = e.target.result;
                    const zip = await JSZip.loadAsync(buffer);
                    
                    let isPanda = false;
                    const newZip = new JSZip();
                    
                    // 檢查是否包含 panda_project/
                    for (const relativePath in zip.files) {
                        if (relativePath.startsWith('panda_project/')) {
                            isPanda = true;
                            if (!zip.files[relativePath].dir) {
                                const content = await zip.files[relativePath].async("uint8array");
                                const newPath = relativePath.substring('panda_project/'.length);
                                if (newPath) {
                                    newZip.file(newPath, content);
                                }
                            }
                        }
                    }
                    
                    let finalBlob = file;
                    if (isPanda) {
                        console.log("PandaGuard: 偵測到 PandaScratch 專屬專案！正在解開偽裝...");
                        const newBuffer = await newZip.generateAsync({type: "blob"});
                        finalBlob = new File([newBuffer], file.name, {type: file.type});
                    } else {
                        console.log("PandaGuard: 這是一般的 Scratch 專案，直接讀取。");
                    }
                    
                    originalReadAsArrayBuffer.call(this, finalBlob);
                } catch(err) {
                    console.error("PandaGuard: 解壓縮發生錯誤:", err);
                    originalReadAsArrayBuffer.call(this, file);
                }
            };
            reader.readAsArrayBuffer(file);
            return;
        }
        return originalReadAsArrayBuffer.call(this, file);
    };

    // 2. 尋找 VM 並攔截存檔 (Save Project)
    function findVM(node) {
        if (!node) return null;
        if (node.stateNode && node.stateNode.props && node.stateNode.props.vm) return node.stateNode.props.vm;
        if (node.child) {
            let child = node.child;
            while (child) {
                let res = findVM(child);
                if (res) return res;
                child = child.sibling;
            }
        }
        return null;
    }

    let vmObj = null;
    let observer = new MutationObserver(() => {
        if (!vmObj) {
            const root = document.querySelector('#scratch') || document.body;
            const internalKey = Object.keys(root).find(key => key.startsWith('__reactInternalInstance$') || key.startsWith('__reactFiber$'));
            if (internalKey) {
                vmObj = findVM(root[internalKey]);
                if (vmObj && !vmObj._pandaPatched) {
                    vmObj._pandaPatched = true;
                    console.log("PandaGuard: 找到 VM 實例！注入存檔攔截器...");
                    
                    const originalSave = vmObj.saveProjectSb3;
                    vmObj.saveProjectSb3 = async function(...args) {
                        console.log("PandaGuard: 攔截到專案儲存請求！開始偽裝打包...");
                        const originalBlob = await originalSave.apply(this, args);
                        
                        try {
                            const zip = await JSZip.loadAsync(originalBlob);
                            const newZip = new JSZip();
                            
                            // 步驟 A: 將真實檔案移入 panda_project/
                            for (const relativePath in zip.files) {
                                if (!zip.files[relativePath].dir) {
                                    const content = await zip.files[relativePath].async("uint8array");
                                    newZip.file('panda_project/' + relativePath, content);
                                }
                            }
                            
                            // 步驟 B: 注入表層警告專案
                            if (window.PANDA_WARNING_PROJECT) {
                                for (const key in window.PANDA_WARNING_PROJECT) {
                                    if (key === 'project.json') {
                                        newZip.file(key, window.PANDA_WARNING_PROJECT[key]);
                                    } else {
                                        // 資源檔是 base64
                                        newZip.file(key, window.PANDA_WARNING_PROJECT[key], {base64: true});
                                    }
                                }
                            } else {
                                console.warn("PandaGuard: 找不到 PANDA_WARNING_PROJECT，將只儲存 panda_project 目錄！");
                            }
                            
                            console.log("PandaGuard: 偽裝完成！");
                            return await newZip.generateAsync({type: "blob"});
                        } catch(err) {
                            console.error("PandaGuard: 儲存時發生錯誤，退回原始存檔", err);
                            return originalBlob;
                        }
                    };
                }
            }
        }
    });
    observer.observe(document.body, {childList: true, subtree: true});

})();
