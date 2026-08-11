import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = "const newBlob = await newZip.generateAsync({"
replacement = '''window.encryptSb3 = async function(originalBlob) {
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

    const newBlob = await newZip.generateAsync({'''

if target in content:
    content = content.replace(target, replacement)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND")
