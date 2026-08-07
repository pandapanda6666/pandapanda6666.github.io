import codecs

path = r'C:\Users\User\Desktop\伺服器\登入\server.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = '''    socket.on('saveAppData', (payload) => { 
        const { appId, data, projectName } = payload; 
        if (appId) { 
            if (!db.appData[appId]) db.appData[appId] = { data: {}, logs: [], dashboardCode: "" }; 
            db.appData[appId].data = data || {}; 
            if (socket.username && !db.appData[appId].owner) {
                db.appData[appId].owner = socket.username;
            }
            if (projectName) db.appData[appId].name = projectName;
            db.appData[appId].lastModified = Date.now();
            saveDB(); 
            io.to(appId).emit('appDataSaved', db.appData[appId].data); 
        } 
    });'''

replacement = '''    socket.on('saveAppData', (payload, callback) => { 
        const { appId, data, projectName } = payload; 
        if (appId) { 
            if (!db.appData[appId]) db.appData[appId] = { data: {}, logs: [], dashboardCode: "" }; 
            db.appData[appId].data = data || {}; 
            if (socket.username && !db.appData[appId].owner) {
                db.appData[appId].owner = socket.username;
            }
            if (projectName) db.appData[appId].name = projectName;
            db.appData[appId].lastModified = Date.now();
            saveDB(); 
            io.to(appId).emit('appDataSaved', db.appData[appId].data); 
            if (callback) callback({ status: 'ok' });
        } else {
            if (callback) callback({ status: 'error', message: 'No appId provided' });
        }
    });'''

# normalize newlines
target = target.replace('\n', '\r\n')
replacement = replacement.replace('\n', '\r\n')

if target in content:
    content = content.replace(target, replacement)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND")
