import re
with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Restore from 148 first
with open('備份/版本148/檔案/Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix 1: showLoading & hideLoading
text = re.sub(r'showLoading\(', r'if(window.showLoading) window.showLoading(', text)
text = re.sub(r'hideLoading\(\)', r'if(window.hideLoading) window.hideLoading()', text)
text = re.sub(r'if\(window\.showLoading\)\s*if\(window\.showLoading\)\s*window\.showLoading\(', r'if(window.showLoading) window.showLoading(', text)
text = re.sub(r'if\(window\.hideLoading\)\s*if\(window\.hideLoading\)\s*window\.hideLoading\(\)', r'if(window.hideLoading) window.hideLoading()', text)

# Fix 2: openLocalDB onblocked
text = text.replace(
    'request.onerror = (e) => reject(e.target.error);',
    'request.onerror = (e) => reject(e.target.error);\n                request.onblocked = () => reject(new Error("資料庫被其他分頁鎖定 (onblocked)"));'
)

# Fix 3: saveDraftBtn try/catch
old_saveDraftBtn = """        saveDraftBtn.addEventListener('click', async () => {
            if (!currentProjectId) {
                const name = await window.customPrompt("請輸入草稿名稱", "我的字幕草稿");
                if (!name) return;
                currentProjectId = 'proj_' + Date.now();
                currentProjectName = name;
            }
            await saveCurrentProject();
        });"""
new_saveDraftBtn = """        saveDraftBtn.addEventListener('click', async () => {
            try {
                if (!currentProjectId) {
                    const name = await window.customPrompt("請輸入草稿名稱", "我的字幕草稿");
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
        });"""
text = text.replace(old_saveDraftBtn, new_saveDraftBtn)

# Fix 4: Extract generateASS to window.generateASS
inline_start = text.find('function toAssColor(hex, alpha) {')
inline_end = text.find('const vidName = \'input_video.mp4\';')

if inline_start != -1 and inline_end != -1:
    inline_code = text[inline_start:inline_end]
    
    # We must patch `formatSrtTime` since it might not be globally available if we extract it,
    # but `window.formatSrtTime` IS globally available. Let's make sure.
    inline_code = inline_code.replace('formatSrtTime(sub.start)', 'window.formatSrtTime(sub.start)')
    inline_code = inline_code.replace('formatSrtTime(sub.end)', 'window.formatSrtTime(sub.end)')
    
    extraction = """
        window.generateASS = function() {
            """ + inline_code + """
            return assContent;
        };
        let assContent = window.generateASS();
        
"""
    text = text[:inline_start] + extraction + text[inline_end:]
else:
    print("Could not find inline ass generation!")

# Fix 5: The Python save dialog fix
# I'll just write it manually later if needed.

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("index.html fixed!")