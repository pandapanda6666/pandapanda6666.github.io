import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target1 = "const shareBtn = e.target.closest('div[class*=\"share-button_share-button_\"]');"
replace1 = "const shareBtn = e.target.closest('#panda-cloud-share-btn');"

target2 = "const projectPageBtn = e.target.closest('div[class*=\"community-button_community-button_\"]');"
replace2 = "const projectPageBtn = e.target.closest('#panda-project-page-btn');"

target3 = "window.location.href = '/scratch/mystuff/';"
replace3 = '''if (window.appId) {
                        window.location.href = '/scratch/projects/editor/player.html?id=' + window.appId;
                    } else {
                        alert('請先儲存專案才能前往專案頁面！');
                    }'''

if target1 in content:
    content = content.replace(target1, replace1)
    content = content.replace(target2, replace2)
    content = content.replace(target3, replace3)
    
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND")
