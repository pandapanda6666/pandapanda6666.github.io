import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target1 = "const shareBtn = e.target.closest('#panda-cloud-share-btn');"
replace1 = "const shareBtn = e.target.closest('div[class*=\"share-button_share-button_\"]');"

target2 = "const projectPageBtn = e.target.closest('#panda-project-page-btn');"
replace2 = "const projectPageBtn = e.target.closest('div[class*=\"community-button_community-button_\"]');"

if target1 in content:
    content = content.replace(target1, replace1)
    content = content.replace(target2, replace2)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND")
