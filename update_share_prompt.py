import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = "alert('專案已分享！');"
replacement = "const shareUrl = window.location.origin + '/scratch/projects/editor/player/?id=' + window.appId;\n                        prompt('專案已分享！您可以複製以下連結並傳送給其他人：', shareUrl);"

if target in content:
    content = content.replace(target, replacement)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND")
