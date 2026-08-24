const fs = require('fs');
let html = fs.readFileSync('Edit/Video/Add subtitles/index.html', 'utf8');

// Fix showLoading / hideLoading calls
html = html.replace(/showLoading\(/g, 'if(window.showLoading) window.showLoading(');
html = html.replace(/hideLoading\(\)/g, 'if(window.hideLoading) window.hideLoading()');
// Revert the ones that were already if(window.showLoading) if(window.showLoading)
html = html.replace(/if\(window\.showLoading\)\s*if\(window\.showLoading\)\s*window\.showLoading\(/g, 'if(window.showLoading) window.showLoading(');
html = html.replace(/if\(window\.hideLoading\)\s*if\(window\.hideLoading\)\s*window\.hideLoading\(\)/g, 'if(window.hideLoading) window.hideLoading()');

// Fix openLocalDB onblocked
html = html.replace(
    'request.onerror = (e) => reject(e.target.error);',
    'request.onerror = (e) => reject(e.target.error);\n                request.onblocked = () => reject(new Error("資料庫被其他分頁鎖定 (onblocked)"));'
);

let replacement = `        saveDraftBtn.addEventListener('click', async () => {
            try {
                if (!currentProjectId) {
                    const name = await window.customPrompt("請輸入新草稿名稱", "我的字幕專案");
                    if (!name) return;
                    currentProjectId = 'proj_' + Date.now();
                    currentProjectName = name;
                }
                await saveCurrentProject();
            } catch (err) {
                console.error("Save Draft Error:", err);
                if(window.showToast) window.showToast("儲存失敗: " + err.message, true);
                if(window.hideLoading) window.hideLoading();
            }
        });`;

html = html.replace(/saveDraftBtn\.addEventListener\('click', async \(\) => \{[\s\S]*?await saveCurrentProject\(\);\s*\}\);/, replacement);

fs.writeFileSync('Edit/Video/Add subtitles/index.html', html, 'utf8');
console.log("HTML patched.");