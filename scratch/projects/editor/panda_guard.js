(function() {
    let vm = null;
    let patchedSave = false;
    let patchedLoad = false;

    function findVM() {
        if (vm) return vm;
        const guiNode = document.getElementById('scratch-gui');
        if (!guiNode) return null;
        const internalKey = Object.keys(guiNode).find(key => key.startsWith('__reactInternalInstance$') || key.startsWith('__reactFiber$'));
        if (!internalKey) return null;
        let fiber = guiNode[internalKey];
        while (fiber) {
            if (fiber.stateNode && fiber.stateNode.props && fiber.stateNode.props.vm) {
                return fiber.stateNode.props.vm;
            }
            fiber = fiber.child;
        }
        return null;
    }

    function patchVM() {
        vm = findVM();
        if (!vm) return;

        if (!patchedSave && vm.saveProjectSb3) {
            const originalSave = vm.saveProjectSb3.bind(vm);
            vm.saveProjectSb3 = async function(...args) {
                console.log("PandaGuard: Intercepted saveProjectSb3");
                try {
                    // 1. Get the original project blob
                    const originalBlob = await originalSave(...args);
                    
                    // 2. Load the original zip and the warning zip
                    const JSZip = window.JSZip;
                    if (!JSZip) return originalBlob;

                    const originalZip = await JSZip.loadAsync(originalBlob);
                    
                    // 3. Move all original files to panda_project/
                    const newZip = new JSZip();
                    const pandaFolder = newZip.folder("panda_project");
                    
                    for (const filename of Object.keys(originalZip.files)) {
                        const fileData = await originalZip.files[filename].async("uint8array");
                        pandaFolder.file(filename, fileData);
                    }
                    
                    // 4. Inject the warning project to the root
                    const warningZipBase64 = window.PANDA_WARNING_ZIP_BASE64;
                    if (warningZipBase64) {
                        const warningZip = await JSZip.loadAsync(warningZipBase64, {base64: true});
                        for (const filename of Object.keys(warningZip.files)) {
                            if (!warningZip.files[filename].dir) {
                                const fileData = await warningZip.files[filename].async("uint8array");
                                newZip.file(filename, fileData);
                            }
                        }
                    }

                    // 5. Generate the new protected blob
                    const newBlob = await newZip.generateAsync({type: "blob"});
                    return newBlob;
                } catch (e) {
                    console.error("PandaGuard Save Error:", e);
                    return originalSave(...args); // fallback
                }
            };
            patchedSave = true;
        }

        if (!patchedLoad && vm.loadProject) {
            const originalLoad = vm.loadProject.bind(vm);
            vm.loadProject = async function(fileBuffer, ...args) {
                console.log("PandaGuard: Intercepted loadProject");
                try {
                    const JSZip = window.JSZip;
                    if (!JSZip) return originalLoad(fileBuffer, ...args);

                    const zip = await JSZip.loadAsync(fileBuffer);
                    
                    // Check if it has panda_project folder
                    let hasPandaProject = false;
                    for (const filename of Object.keys(zip.files)) {
                        if (filename.startsWith("panda_project/project.json")) {
                            hasPandaProject = true;
                            break;
                        }
                    }

                    if (hasPandaProject) {
                        console.log("PandaGuard: Detected PandaScratch protected project, unwrapping...");
                        const unwrappedZip = new JSZip();
                        
                        // Copy all files from panda_project/ to root
                        for (const filename of Object.keys(zip.files)) {
                            if (filename.startsWith("panda_project/") && !zip.files[filename].dir) {
                                const newFilename = filename.substring("panda_project/".length);
                                const fileData = await zip.files[filename].async("uint8array");
                                unwrappedZip.file(newFilename, fileData);
                            }
                        }
                        
                        const unwrappedBuffer = await unwrappedZip.generateAsync({type: "uint8array"});
                        return originalLoad(unwrappedBuffer, ...args);
                    } else {
                        // Standard scratch project
                        return originalLoad(fileBuffer, ...args);
                    }
                } catch (e) {
                    console.error("PandaGuard Load Error:", e);
                    return originalLoad(fileBuffer, ...args);
                }
            };
            patchedLoad = true;
        }
    }

    // Try to patch periodically until successful
    const interval = setInterval(() => {
        if (patchedSave && patchedLoad) {
            clearInterval(interval);
            console.log("PandaGuard: VM successfully patched!");
        } else {
            patchVM();
        }
    }, 1000);
})();
