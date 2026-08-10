import codecs
path = r'C:\Users\User\Desktop\伺服器\登入\server.js'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()
    for i, line in enumerate(lines[:100]):
        if 'DEFAULT_AVATAR' in line:
            print(f"{i}: {line.strip()}")
