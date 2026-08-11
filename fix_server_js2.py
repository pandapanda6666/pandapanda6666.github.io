import codecs

path = r'C:\Users\User\Desktop\伺服器\登入\server.js'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "socket.on('saveAppData', (payload) => {" in line:
        # replace the line directly
        lines[i] = line.replace("socket.on('saveAppData', (payload) => {", "socket.on('saveAppData', (payload, callback) => {")
    if "io.to(appId).emit('appDataSaved', db.appData[appId].data);" in line:
        lines[i] = line + "            if (callback) callback({ status: 'ok' });\n"

with codecs.open(path, 'w', 'utf-8') as f:
    f.writelines(lines)
print("SUCCESS")
