import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = '''                const projectPageBtn = e.target.closest('[class*="community-button_community-button_"]');
                if (projectPageBtn) {
                    e.stopPropagation(); e.stopImmediatePropagation();
                    e.preventDefault();
                    if (window.appId) {
                        window.location.href = '/scratch/projects/editor/player/?id=' + window.appId;
                    } else {
                        alert('請先儲存專案才能前往專案頁面！');
                    }
                }'''

replacement = '''                const projectPageBtn = e.target.closest('[class*="community-button_community-button_"]');
                if (projectPageBtn) {
                    e.stopPropagation(); e.stopImmediatePropagation();
                    e.preventDefault();
                    if (window.appId) {
                        window.location.href = '/scratch/projects/?id=' + window.appId;
                    } else {
                        alert('請先儲存專案才能前往專案頁面！');
                    }
                }'''

if target in content:
    content = content.replace(target, replacement)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND")
