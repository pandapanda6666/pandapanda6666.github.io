import codecs
import time
import re

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

replacement = '''
                    const zip = await JSZip.loadAsync(fileBuffer);
                    let hasPandaProject = false;
                    const allKeys = Object.keys(zip.files);
                    console.log("PandaGuard: Zip files found:", allKeys);
                    
                    for (const f of allKeys) {
                        if (f.includes("panda_project/") && f.includes("panda.json")) {
                            hasPandaProject = true;
                            break;
                        }
                    }

                    if (hasPandaProject) {
                        console.log("PandaGuard: Detected PandaScratch protected project, unwrapping...");
                        const unwrappedZip = new JSZip();
                        for (const f of allKeys) {
                            if (f.includes("panda_project/") && !zip.files[f].dir) {
                                let newFilename = f.substring(f.indexOf("panda_project/") + 14);
                                if (newFilename === "panda.json") newFilename = "project.json";
                                const fileData = await zip.files[f].async("uint8array");
                                unwrappedZip.file(newFilename, fileData);
                            }
                        }
                        const unwrappedBuffer = await unwrappedZip.generateAsync({type: "arraybuffer"});
                        try {
                            const result = await originalLoad(unwrappedBuffer, ...args);
                            return result;
                        } catch (loadErr) {
                            console.error("PandaGuard: Inner load failed:", loadErr);
                            alert("防盜專案解密失敗：內層專案損毀或格式錯誤！\\n" + loadErr.message);
                            return originalLoad(fileBuffer, ...args);
                        }
                    } else {
                        console.log("PandaGuard: No panda_project found, loading normally.");
                        if (allKeys.includes("project.json")) {
                            const pjson = await zip.file("project.json").async("string");
                            if (pjson.includes("不要盜用專案")) {
                                alert("警告：偵測到防盜外層，但找不到內層專案！可能是檔案已經損毀或被不當修改。");
                            }
                        }
                        return originalLoad(fileBuffer, ...args);
                    }
                } catch (e) {
                    console.error("PandaGuard: Intercept error (maybe not a valid zip):", e);
                    alert("防盜專案解析錯誤：\\n" + e.message);
                    return originalLoad(fileBuffer, ...args);
                }
'''

# Find the try block in patchVMLoad
start_str = 'const zip = await JSZip.loadAsync(fileBuffer);'
end_str = 'return originalLoad(fileBuffer, ...args);\n                }'

start_idx = content.find(start_str)
end_idx = content.find(end_str) + len(end_str)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + replacement.strip() + content[end_idx:]
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
    print("FAILED TO FIND TARGET STRING")
