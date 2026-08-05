(function() {
    console.log("PandaGuard: Initializing universal download interceptor...");

    const originalClick = HTMLAnchorElement.prototype.click;

    HTMLAnchorElement.prototype.click = function() {
        // Check if this is an sb3 download
        if (this.download && this.download.endsWith('.sb3') && this.href && this.href.startsWith('blob:')) {
            // Check if we already modified it to avoid infinite loop
            if (this.dataset.pandaModified) {
                console.log("PandaGuard: Allowing modified download to proceed.");
                return originalClick.call(this);
            }

            console.log("PandaGuard: Intercepted .sb3 download click!");

            // Save properties
            const filename = this.download;
            const originalHref = this.href;

            // We must process this asynchronously
            processAndDownloadSb3(originalHref, filename).catch(e => {
                console.error("PandaGuard: Error processing sb3:", e);
                // Fallback to original download if error
                this.dataset.pandaModified = "true";
                originalClick.call(this);
            });

            // Cancel the original click!
            return;
        }

        // Standard click
        return originalClick.call(this);
    };

    async function processAndDownloadSb3(blobUrl, filename) {
        // 1. Fetch the original blob
        const res = await fetch(blobUrl);
        const originalBlob = await res.blob();
        
        const JSZip = window.JSZip;
        if (!JSZip) throw new Error("JSZip not found!");

        const originalZip = await JSZip.loadAsync(originalBlob);
        
        // 3. Move all original files to panda_project/
        const newZip = new JSZip();
        const pandaFolder = newZip.folder("panda_project");
        
        for (const f of Object.keys(originalZip.files)) {
            const fileData = await originalZip.files[f].async("uint8array");
            pandaFolder.file(f, fileData);
        }
        
        // 4. Inject the warning project to the root
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

        // 5. Generate the new protected blob
        const newBlob = await newZip.generateAsync({type: "blob"});
        const newUrl = URL.createObjectURL(newBlob);

        // 6. Trigger download
        const a = document.createElement('a');
        a.href = newUrl;
        a.download = filename;
        a.dataset.pandaModified = "true";
        document.body.appendChild(a);
        originalClick.call(a);
        a.remove();
        URL.revokeObjectURL(newUrl);
    }
    
    // For loading, the VM monkey patch still works, but just in case findVM was failing, let's keep it.
    // However, if the user imports via input element, we can also intercept the input element!
    // When a user selects a file, it's a File object.
    
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
                        if (f.startsWith("panda_project/project.json")) {
                            hasPandaProject = true;
                            break;
                        }
                    }

                    if (hasPandaProject) {
                        console.log("PandaGuard: Detected PandaScratch protected project, unwrapping...");
                        const unwrappedZip = new JSZip();
                        for (const f of Object.keys(zip.files)) {
                            if (f.startsWith("panda_project/") && !zip.files[f].dir) {
                                const newFilename = f.substring("panda_project/".length);
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
