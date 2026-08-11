import codecs

path = r'C:\Users\User\Desktop\伺服器\登入\server.js'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "db.appData[appId].data = data || {};" in line:
        print(f"FOUND EXACT LINE AT {i+1}: {line.strip()}")
