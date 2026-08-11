import codecs

path = r'C:\Users\User\Desktop\伺服器\登入\server.js'
with codecs.open(path, 'r', 'utf-8') as f:
    for line in f:
        if 'fs.writeFile' in line or 'fs.readFile' in line:
            print(line.strip())
