import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = "alert('請先儲存專案才能前往專案頁面！');\n                    }\n                }\n            });"
replacement = "alert('請先儲存專案才能前往專案頁面！');\n                    }\n                }\n            }, true);"

if target in content:
    content = content.replace(target, replacement)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND")
