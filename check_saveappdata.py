import codecs

path = r'C:\Users\User\Desktop\伺服器\登入\server.js'
with codecs.open(path, 'r', 'utf-8') as f:
    for i, line in enumerate(f):
        if 'saveAppData' in line or 'appData' in line:
            print(f"{i+1}: {line.strip()}")
