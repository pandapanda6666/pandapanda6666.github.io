import codecs

path = r'C:\Users\User\Desktop\伺服器\登入\server.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = "socket.on('saveAppData', (payload) => { const { appId, data } = payload; if (appId) { if (!db.appData[appId]) db.appData[appId] = { data: {}, logs: [], dashboardCode: \"\" }; db.appData[appId].data = data || {}; saveDB(); io.to(appId).emit('appDataSaved', db.appData[appId].data); } });"

replacement = """socket.on('saveAppData', (payload) => { 
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
    });
    
    socket.on('getUserProjects', (payload) => {
        const username = payload.username || socket.username;
        if (username) {
            const projects = [];
            for (let id in db.appData) {
                if (db.appData[id].owner === username) {
                    projects.push({
                        id: id,
                        name: db.appData[id].name || '未命名專案',
                        shared: db.appData[id].shared || false,
                        lastModified: db.appData[id].lastModified || 0,
                        thumbnail: db.appData[id].thumbnail || null
                    });
                }
            }
            socket.emit('userProjectsData', { projects: projects });
        }
    });
    
    socket.on('shareProject', (payload) => {
        const { projectId } = payload;
        if (projectId && db.appData[projectId]) {
            if (db.appData[projectId].owner === socket.username) {
                db.appData[projectId].shared = true;
                saveDB();
            }
        }
    });"""

if target in content:
    content = content.replace(target, replacement)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("TARGET NOT FOUND IN SERVER.JS")
