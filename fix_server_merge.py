import codecs

path = r'C:\Users\User\Desktop\伺服器\登入\server.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = "db.appData[appId].data = data || {};"
replacement = "db.appData[appId].data = { ...db.appData[appId].data, ...(data || {}) };"

if target in content:
    content = content.replace(target, replacement)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND")
