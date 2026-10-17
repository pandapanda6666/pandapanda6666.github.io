// 版權所有 © 2026 PandaPanda的AI日常 (https://pandapanda6666.github.io) All Rights Reserved.
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();

const oldLog = console.log;
const oldError = console.error;
const globalLogBuffer = [];
let globalLogId = 0;
const MAX_LOGS = 500;

function addGlobalLog(type, args) {
    try {
        const util = require('util');
        const msg = util.format(...args);
        globalLogBuffer.push({ type, msg, id: ++globalLogId, time: Date.now() });
        if (globalLogBuffer.length > MAX_LOGS) globalLogBuffer.shift();
    } catch(e) {}
}

console.log = function(...args) {
    oldLog.apply(console, args);
    addGlobalLog('log', args);
};
console.error = function(...args) {
    oldError.apply(console, args);
    addGlobalLog('error', args);
};

app.get('/api/system/logs', (req, res) => {
    res.json({ logs: globalLogBuffer });
});

const server = http.createServer(app);

const PORT = process.env.PORT || 48921;
const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";

const recordFile = path.join(__dirname, '系統紀錄.txt');
const historyFile = path.join(__dirname, 'history.json');
const issuesFile = path.join(__dirname, 'issues.json');
const errorFile = path.join(__dirname, 'error.json');
const systemLogsFile = path.join(__dirname, 'system_logs.txt');
const remoteCommandFile = path.join(__dirname, 'remote_command.txt');

let currentSystemLogs = "";
if (fs.existsSync(systemLogsFile)) {
    try { currentSystemLogs = fs.readFileSync(systemLogsFile, 'utf8'); } catch(e){}
}
fs.watchFile(systemLogsFile, { interval: 1000 }, (curr, prev) => {
    try {
        if (fs.existsSync(systemLogsFile)) {
            const newLogs = fs.readFileSync(systemLogsFile, 'utf8');
            if (newLogs !== currentSystemLogs) {
                currentSystemLogs = newLogs;
                io.emit('systemLogs', currentSystemLogs);
            }
        }
    } catch(e){}
});

let isLoginHubOpen = true;
function isInvalidName(name) {
    if(!name) return false;
    const lower = name.toLowerCase();
    const forbidden = ['admin', 'system', '管理員', '系統', '官方'];
    return forbidden.some(f => lower.includes(f));
}
let db = { 
    users: {}, admins: [], blacklist: [], banned: {}, muted: {}, allowedOrigins: ["*"], appData: {}, broadcasts: [], siteBroadcasts: {}, products: []
};
const activeUsers = new Set(); 
const activeUserSockets = {};
const sessionTokens = new Map(); // token -> username
function generateToken() { return crypto.randomBytes(32).toString('hex'); } 

function loadDB() {
    if (fs.existsSync(recordFile)) {
        try {
            const data = fs.readFileSync(recordFile, 'utf8');
            if (data.trim() !== "") {
                const parsed = JSON.parse(data);
                if (parsed.users) { db = parsed; } else { db.users = parsed; }
                if (!db.allowedOrigins) db.allowedOrigins = ["*"];
                if (!db.appData) db.appData = {};
                if (!db.broadcasts) db.broadcasts = [];
                if (!db.siteBroadcasts) db.siteBroadcasts = {};
                if (!db.products) db.products = [];
            }
            console.log(`[系統] 成功讀取資料庫。共 ${Object.keys(db.users).length} 筆帳號。`);
        } catch (e) { console.error("[系統] 讀取資料庫失敗", e); }
    } else { saveDB(); }
}

function saveDB() {
    try { fs.writeFileSync(recordFile, JSON.stringify(db, null, 2), 'utf8'); } catch (e) { console.error("[系統] 寫入資料庫失敗", e); }
}

function addHistory(user, action, details, targetUser = null, beforeData = null, afterData = null, location = '伺服器端', device = '系統背景') {
    let history = [];
    if (fs.existsSync(historyFile)) { try { history = JSON.parse(fs.readFileSync(historyFile, 'utf8')); } catch(e){} }
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 8);

    history.unshift({ id: uniqueId, time: timeStr, location, device, user: user || '系統', targetUser, action, details: details || '', before: beforeData, after: afterData });
    if (history.length > 5000) history = history.slice(0, 5000); 
    try { fs.writeFileSync(historyFile, JSON.stringify(history, null, 2), 'utf8'); } catch(e){}
}

function addIssueRecord(user, text, location, device, url = "無提供") {
    let issues = [];
    if (fs.existsSync(issuesFile)) { try { issues = JSON.parse(fs.readFileSync(issuesFile, 'utf8')); } catch(e){} }
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 8);
    issues.unshift({ id: uniqueId, time: timeStr, user, text, location, device, url });
    try { fs.writeFileSync(issuesFile, JSON.stringify(issues, null, 2), 'utf8'); } catch(e){}
}

function addErrorRecord(source, message, location, device, user) {
    let errors = [];
    if (fs.existsSync(errorFile)) { try { errors = JSON.parse(fs.readFileSync(errorFile, 'utf8')); } catch(e){} }
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    errors.unshift({ timestamp: timeStr, source, error_message: message, location: location || '未知', device: device || '未知', user: user || '系統' });
    if (errors.length > 2000) errors = errors.slice(0, 2000);
    try { fs.writeFileSync(errorFile, JSON.stringify(errors, null, 2), 'utf8'); } catch(e){}
}

loadDB();

setInterval(() => {
    let changed = false; 
    const now = Date.now();
    for (let u in db.banned) { 
        if (db.banned[u] !== 0 && db.banned[u] < now) { 
            delete db.banned[u]; changed = true; 
            addHistory('系統', '自動解封', `玩家 ${u} 已過期自動解封`, u);
        } 
    }
    for (let u in db.muted) { 
        if (db.muted[u] !== 0 && db.muted[u] < now) { 
            delete db.muted[u]; changed = true; 
            addHistory('系統', '自動解禁', `玩家 ${u} 已過期自動解禁`, u);
        } 
    }
    if (changed) saveDB();
}, 60000);

const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["ngrok-skip-browser-warning", "Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin"] }, pingInterval: 15000, pingTimeout: 30000, maxHttpBufferSize: 1e8 });

const statsFile = path.join(__dirname, 'stats.json');
let systemStats = { totalUniqueIps: 0, totalVisits: 0, knownIps: [], ipStats: {} };
try {
    if (fs.existsSync(statsFile)) {
        systemStats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
    }
} catch(e) {}
function saveStats() {
    try { fs.writeFileSync(statsFile, JSON.stringify(systemStats, null, 2)); } catch(e) {}
}
let activeIps = new Map();
let onlineIps = new Set();
function broadcastStats() {
    onlineIps.clear();
    for (let ip of activeIps.values()) {
        onlineIps.add(ip);
    }
    if (io) {
        io.emit('systemStats', {
            onlineUsers: new Set(activeIps.values()).size,
            totalUniqueIps: systemStats.totalUniqueIps,
            totalVisits: systemStats.totalVisits
        });
    }
}
setInterval(broadcastStats, 10000);

app.use(express.json({ limit: '10mb' }));

app.get('/api/debug_sockets', (req, res) => {
    res.json({
        activeIpsSize: activeIps.size,
        activeIps: Array.from(activeIps.entries()),
        onlineIpsSize: onlineIps.size,
        onlineIps: Array.from(onlineIps)
    });
});


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, ngrok-skip-browser-warning, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }
    next();
});

app.use((req, res, next) => {
    const ext = path.extname(req.path).toLowerCase();
    const isRootFile = req.path.split('/').length === 2 && req.path !== '/';
    const forbiddenExts = ['.txt', '.json', '.js', '.py', '.log', '.bat'];
    const forbiddenFiles = ['github_config.json', '紀錄.txt', 'issues.json', 'error.json', 'server.js', 'run.py'];
    
    if (isRootFile && forbiddenExts.includes(ext)) {
        return res.status(403).send('<h1>403 Forbidden: Access Denied</h1><p>基於安全考量，拒絕存取伺服器原始碼與資料檔。</p>');
    }
    if (forbiddenFiles.some(f => req.path.includes(f)) || ext === '.py') {
        return res.status(403).send('<h1>403 Forbidden: Access Denied</h1><p>基於安全考量，拒絕存取伺服器原始碼與資料檔。</p>');
    }
    next();
});


app.use((req, res, next) => {
    const forbidden = ['server.js', 'run.py', '.json', '.bat', '.env'];
    for(let str of forbidden) {
        if(req.path.toLowerCase().includes(str)) return res.status(403).send('Forbidden');
    }
    next();
});
app.use(express.static(path.join(__dirname, '.')));

app.post('/api/upload_video', (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('Missing id');
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    const videoPath = path.join(uploadsDir, videoId + '.webm');
    
    const writeStream = fs.createWriteStream(videoPath);
    req.pipe(writeStream);
    
    writeStream.on('finish', () => {
        res.send({ success: true, url: `/uploads/${videoId}.webm` });
    });
    writeStream.on('error', (err) => {
        console.error('Upload Error:', err);
        res.status(500).send('Upload Error');
    });
});



const sysAuthConfig = {
    apiKey: "AIzaSyBx_C4b1krEoKQVc1VDuCsPE0t2XrHHzbQ",
    authDomain: "brawl-survival-27c30.firebaseapp.com",
    projectId: "brawl-survival-27c30",
    storageBucket: "brawl-survival-27c30.firebasestorage.app",
    messagingSenderId: "968683230232",
    appId: "1:968683230232:web:5fec3f105cfe9907e81f6d"
};

app.use('/api', (req, res, next) => {
    const ip = req.ip || (req.connection && req.connection.remoteAddress) || (req.socket && req.socket.remoteAddress) || '';
    const ipStr = String(ip);
    if (ipStr.includes('127.0.0.1') || ipStr.includes('::1') || ipStr === '::ffff:127.0.0.1') { next(); } else { res.status(403).send('Forbidden'); }
});

app.get('/api/history', (req, res) => {
    let history = [];
    if (fs.existsSync(historyFile)) { try { history = JSON.parse(fs.readFileSync(historyFile, 'utf8')); } catch(e){} }
    res.json({ history });
});

app.get('/api/issues', (req, res) => {
    let issues = [];
    if (fs.existsSync(issuesFile)) { try { issues = JSON.parse(fs.readFileSync(issuesFile, 'utf8')); } catch(e){} }
    res.json({ issues });
});

app.get('/api/errors', (req, res) => {
    let errors = [];
    if (fs.existsSync(errorFile)) { try { errors = JSON.parse(fs.readFileSync(errorFile, 'utf8')); } catch(e){} }
    res.json({ errors });
});


const sharedChatsFile = path.join(__dirname, 'shared_chats.json');

app.post('/api/share', express.json({limit: '50mb'}), (req, res) => {
    try {
        let sharedChats = {};
        if (fs.existsSync(sharedChatsFile)) {
            sharedChats = JSON.parse(fs.readFileSync(sharedChatsFile, 'utf8'));
        }
        const data = req.body;
        if(!data || !data.chatHistory) return res.status(400).json({error: "Invalid data"});
        const id = crypto.randomBytes(4).toString('hex');
        sharedChats[id] = { chatHistory: data.chatHistory, timestamp: Date.now() };
        fs.writeFileSync(sharedChatsFile, JSON.stringify(sharedChats, null, 2));
        res.json({ id: id });
    } catch(e) {
        console.error(e);
        res.status(500).json({error: "Internal Server Error"});
    }
});

app.get('/api/share/:id', (req, res) => {
    try {
        if (!fs.existsSync(sharedChatsFile)) return res.status(404).json({error: "Not found"});
        let sharedChats = JSON.parse(fs.readFileSync(sharedChatsFile, 'utf8'));
        if (sharedChats[req.params.id]) {
            res.json(sharedChats[req.params.id]);
        } else {
            res.status(404).json({error: "Not found"});
        }
    } catch(e) {
        console.error(e);
        res.status(500).json({error: "Internal Server Error"});
    }
});

app.post('/api/errors/clear', (req, res) => {
    try { fs.writeFileSync(errorFile, JSON.stringify([], null, 2), 'utf8'); } catch(e){}
    res.json({ success: true });
});

app.post('/api/issues/delete', (req, res) => {
    const { id } = req.body;
    let issues = [];
    if (fs.existsSync(issuesFile)) { try { issues = JSON.parse(fs.readFileSync(issuesFile, 'utf8')); } catch(e){} }
    issues = issues.filter(issue => issue.id !== id);
    try { fs.writeFileSync(issuesFile, JSON.stringify(issues, null, 2), 'utf8'); } catch(e){}
    res.json({ success: true });
});

app.post('/api/history/restore', (req, res) => {
    const { historyId } = req.body;
    let history = [];
    if (fs.existsSync(historyFile)) { try { history = JSON.parse(fs.readFileSync(historyFile, 'utf8')); } catch(e){} }
    const record = history.find(h => h.id === historyId);
    if (!record || !record.before || !record.targetUser) return res.json({ success: false, msg: '該紀錄無法還原' });
    const targetUser = record.targetUser;
    if (!db.users[targetUser]) return res.json({ success: false, msg: '目標玩家帳號已不存在，無法還原' });

    const currentData = JSON.parse(JSON.stringify(db.users[targetUser]));
    db.users[targetUser] = JSON.parse(JSON.stringify(record.before));
    if (!db.users[targetUser].avatar) db.users[targetUser].avatar = DEFAULT_AVATAR;
    if (db.users[targetUser].p_coin === undefined) db.users[targetUser].p_coin = 0;
    saveDB();
    addHistory('管理員', '還原資料', `將玩家 [${targetUser}] 的資料還原至 ${record.time} 的狀態`, targetUser, currentData, record.before, '控制面板', '管理員');

    if (activeUserSockets[targetUser]) {
        io.to(activeUserSockets[targetUser]).emit('expUpdated', { level: db.users[targetUser].level, exp: db.users[targetUser].exp });
        io.to(activeUserSockets[targetUser]).emit('profileData', { username: targetUser, nickname: db.users[targetUser].nickname, avatar: db.users[targetUser].avatar || DEFAULT_AVATAR, email: db.users[targetUser].gmail, phone: db.users[targetUser].phone, pCoin: db.users[targetUser].p_coin || 0 });
        io.to(activeUserSockets[targetUser]).emit('systemMessage', '[系統公告] 您的帳號資料已被管理員還原至歷史狀態。');
    }
    res.json({ success: true });
});

app.get('/api/settings', (req, res) => res.json({ allowedOrigins: db.allowedOrigins || ["*"] }));
app.post('/api/settings/origins', (req, res) => {
    const { origins } = req.body;
    if (Array.isArray(origins)) { db.allowedOrigins = origins; saveDB(); addHistory('管理員', '修改設定', '更新了 CORS 授權網域白名單', null, null, null, '面板', '管理員'); res.json({ success: true }); } else { res.json({ success: false }); }
});

app.get('/api/users', (req, res) => { res.json({ users: db.users, online: Array.from(activeUsers), admins: db.admins, banned: db.banned, muted: db.muted, blacklist: db.blacklist }); });
app.get('/api/apps', (req, res) => { res.json({ apps: db.appData || {} }); });
app.post('/api/apps/update', (req, res) => {
    const { appId, data, dashboardCode } = req.body;
    if (appId) {
        if (!db.appData[appId]) db.appData[appId] = { data: {}, logs: [], dashboardCode: "" };
        if (data !== undefined) db.appData[appId].data = data;
        if (dashboardCode !== undefined) db.appData[appId].dashboardCode = dashboardCode;
        saveDB();
        if (data !== undefined) io.to(appId).emit('appDataUpdated', db.appData[appId].data);
        res.json({ success: true });
    } else { res.json({ success: false }); }
});

app.post('/api/apps/delete', (req, res) => {
    if (req.body.appId && db.appData[req.body.appId]) { delete db.appData[req.body.appId]; saveDB(); res.json({ success: true }); } else { res.json({ success: false }); }
});

app.post('/api/apps/clearLogs', (req, res) => {
    if (req.body.appId && db.appData[req.body.appId]) { db.appData[req.body.appId].logs = []; saveDB(); res.json({ success: true }); } else { res.json({ success: false }); }
});

app.get('/api/broadcasts', (req, res) => {
    const site = req.query.site;
    const globalList = db.broadcasts || [];
    if (site && db.siteBroadcasts && db.siteBroadcasts[site]) {
        res.json({ broadcasts: globalList, siteBroadcasts: db.siteBroadcasts[site] || [] });
    } else {
        res.json({ broadcasts: globalList, siteBroadcasts: db.siteBroadcasts || {} });
    }
});
app.post('/api/broadcasts/update', (req, res) => {
    db.broadcasts = req.body.broadcasts || [];
    if (req.body.siteBroadcasts) db.siteBroadcasts = req.body.siteBroadcasts;
    saveDB();
    io.emit('broadcastSchedule', { broadcasts: db.broadcasts, siteBroadcasts: db.siteBroadcasts || {} });
    res.json({ success: true });
});
app.get('/api/site-broadcasts/:site', (req, res) => {
    const site = req.params.site;
    const globalList = db.broadcasts || [];
    const siteList = (db.siteBroadcasts && db.siteBroadcasts[site]) ? db.siteBroadcasts[site] : [];
    res.json({ broadcasts: globalList, siteBroadcasts: siteList });
});
app.post('/api/site-broadcasts/:site/update', (req, res) => {
    const site = req.params.site;
    if (!db.siteBroadcasts) db.siteBroadcasts = {};
    db.siteBroadcasts[site] = req.body.broadcasts || [];
    saveDB();
    io.emit('siteBroadcastUpdate', { site, broadcasts: db.siteBroadcasts[site] });
    io.emit('broadcastSchedule', { broadcasts: db.broadcasts, siteBroadcasts: db.siteBroadcasts || {} });
    res.json({ success: true });
});
app.get('/api/products', (req, res) => { res.json({ products: db.products || [] }); });
app.post('/api/admin/collision', (req, res) => {
    console.log('[系統] ⚠️ 警告：偵測到其他電腦/裝置嘗試啟動管理面板，已成功攔截並迫使其停止！');
    io.emit('systemMessage', '⚠️ 警告：剛剛有其他裝置嘗試啟動管理面板，已被防撞車系統攔截！');
    res.json({ success: true, message: 'Collision recorded on primary server.' });
});

app.post('/api/system/status', (req, res) => {
    const { open } = req.body;
    isLoginHubOpen = !!open;
    console.log(`[系統] 登入中心狀態更新：${isLoginHubOpen ? '開啟' : '關閉'}`);
    res.json({ success: true, isLoginHubOpen });
});



// --- GitHub API Proxy with PAT ---
let githubCache = {};
const GITHUB_PAT = process.env.GITHUB_PAT || '';

app.get('/api/github/contents', async (req, res) => {
    const url = 'https://api.github.com/repos/pandapanda6666/pandapanda6666.github.io/contents/';
    if (githubCache[url] && Date.now() - githubCache[url].time < 600000) {
        return res.json(githubCache[url].data);
    }
    try {
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${GITHUB_PAT}`, 'Accept': 'application/vnd.github.v3+json' }
        });
        if (!response.ok) throw new Error('GitHub API Error: ' + response.status);
        const data = await response.json();
        githubCache[url] = { time: Date.now(), data };
        res.json(data);
    } catch(e) {
        if(githubCache[url]) return res.json(githubCache[url].data); // fallback to expired
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/github/tree', async (req, res) => {
    const url = 'https://api.github.com/repos/pandapanda6666/pandapanda6666.github.io/git/trees/main?recursive=1';
    if (githubCache[url] && Date.now() - githubCache[url].time < 3600000) {
        return res.json(githubCache[url].data);
    }
    try {
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${GITHUB_PAT}`, 'Accept': 'application/vnd.github.v3+json' }
        });
        if (!response.ok) throw new Error('GitHub API Error: ' + response.status);
        const data = await response.json();
        githubCache[url] = { time: Date.now(), data };
        res.json(data);
    } catch(e) {
        if(githubCache[url]) return res.json(githubCache[url].data); // fallback to expired
        res.status(500).json({ error: e.message });
    }
});


// --- Site Banners API ---
app.get('/api/banners', (req, res) => { res.json({ banners: db.banners || [] }); });
app.post('/api/banners/update', (req, res) => {
    let newBanners = req.body.banners || [];
    let updatedBanners = [];
    
    const fs = require('fs');
    const path = require('path');
    const bannersDir = path.join(__dirname, 'banners');
    if (!fs.existsSync(bannersDir)) fs.mkdirSync(bannersDir);
    
    for (let i = 0; i < newBanners.length; i++) {
        let b = newBanners[i];
        if (b.imageBase64) {
            const matches = b.imageBase64.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                const data = matches[2];
                const buffer = Buffer.from(data, 'base64');
                const filename = 'banner_' + Date.now() + '_' + i + '.' + ext;
                fs.writeFileSync(path.join(bannersDir, filename), buffer);
                b.imageUrl = '/banners/' + filename;
            }
            delete b.imageBase64;
        }
        updatedBanners.push(b);
    }
    
    db.banners = updatedBanners;
    saveDB();
    res.json({ success: true });
});

app.get('/api/ping', (req, res) => {

    res.json({ success: true, status: 'alive' });
});

app.post('/api/products/update', (req, res) => {
    db.products = req.body.products || []; saveDB(); io.emit('productsUpdated', db.products); res.json({ success: true });
});


app.post('/api/users/update', (req, res) => {
    const { username, data } = req.body;
    if (db.users[username]) {
        if (data.nickname && data.nickname.trim() !== db.users[username].nickname) {
            const targetNicknameLower = data.nickname.trim().toLowerCase();
            for (let u in db.users) {
                if (u !== username && (db.users[u].nickname || u).trim().toLowerCase() === targetNicknameLower) return res.json({ success: false, msg: '此公開暱稱已被其他玩家使用' });
            }
        }
        const beforeData = JSON.parse(JSON.stringify(db.users[username]));
        db.users[username] = { ...db.users[username], ...data }; 
        if (!db.users[username].avatar) db.users[username].avatar = DEFAULT_AVATAR;
        if (db.users[username].p_coin === undefined) db.users[username].p_coin = 0;
        saveDB();
        addHistory('管理員', '修改資料', `強制修改了玩家 [${username}] 的資料`, username, beforeData, JSON.parse(JSON.stringify(db.users[username])), '面板', '管理員');
        if (activeUserSockets[username]) { 
            io.to(activeUserSockets[username]).emit('expUpdated', { level: db.users[username].level, exp: db.users[username].exp }); 
            io.to(activeUserSockets[username]).emit('profileData', { username, nickname: db.users[username].nickname, avatar: db.users[username].avatar, email: db.users[username].gmail, phone: db.users[username].phone, pCoin: db.users[username].p_coin });
        }
        res.json({ success: true });
    } else { res.json({ success: false, msg: '找不到帳號' }); }
});

app.post('/api/users/rename', (req, res) => {
    const { oldName, newName } = req.body;
    if (!db.users[oldName]) return res.json({ success: false, msg: '舊帳號不存在' });
    const targetNewNameLower = newName.trim().toLowerCase();
    for (let u in db.users) {
        if (u.trim().toLowerCase() === targetNewNameLower) return res.json({ success: false, msg: '新帳號名稱已被使用' });
    }
    db.users[newName] = db.users[oldName]; delete db.users[oldName];
    if (db.admins.includes(oldName)) { db.admins = db.admins.filter(a => a !== oldName); db.admins.push(newName); }
    saveDB(); addHistory('管理員', '修改帳號', `將帳號 [${oldName}] 更名為 [${newName}]`, newName, null, null, '面板', '管理員');
    if (activeUserSockets[oldName]) { io.to(activeUserSockets[oldName]).emit('forceLogout', '帳號名稱已被修改，請重新登入。'); const s = io.sockets.sockets.get(activeUserSockets[oldName]); if(s) s.disconnect(true); }
    res.json({ success: true });
});

app.post('/api/users/admin', (req, res) => {
    const { username, isAdmin } = req.body;
    if (isAdmin && !db.admins.includes(username)) { db.admins.push(username); addHistory('管理員', '權限變更', `賦予玩家 [${username}] 管理員權限`, username, null, null, '面板', '管理員'); }
    else if (!isAdmin) { db.admins = db.admins.filter(a => a !== username); addHistory('管理員', '權限變更', `撤銷玩家 [${username}] 的管理員權限`, username, null, null, '面板', '管理員'); }
    saveDB(); res.json({ success: true });
});

app.post('/api/users/delete', (req, res) => {
    const { username, addToBlacklist } = req.body;
    if (db.users[username]) {
        if (addToBlacklist && db.users[username].gmail && !db.blacklist.includes(db.users[username].gmail)) db.blacklist.push(db.users[username].gmail);
        delete db.users[username];
        if (db.admins.includes(username)) {
            db.admins = db.admins.filter(a => a !== username);
        }
        saveDB();
        addHistory('管理員', '刪除帳號', `刪除了玩家帳號 [${username}]`, username, null, null, '面板', '管理員');
        if (activeUserSockets[username]) { io.to(activeUserSockets[username]).emit('forceLogout', '帳號已被刪除。'); const s = io.sockets.sockets.get(activeUserSockets[username]); if(s) s.disconnect(true); }
        res.json({ success: true });
    } else { res.json({ success: false }); }
});

app.post('/api/users/ban', (req, res) => {
    const { username, minutes } = req.body;
    if (minutes === 0) { db.banned[username] = 0; addHistory('管理員', '封鎖帳號', `永久封鎖 [${username}]`, username, null, null, '面板', '管理員'); }
    else if (minutes > 0) { db.banned[username] = Date.now() + minutes * 60000; addHistory('管理員', '封鎖帳號', `封鎖 [${username}] ${minutes} 分鐘`, username, null, null, '面板', '管理員'); }
    else { delete db.banned[username]; addHistory('管理員', '解除封鎖', `解鎖 [${username}]`, username, null, null, '面板', '管理員'); }
    saveDB();
    if (minutes >= 0 && activeUserSockets[username]) { io.to(activeUserSockets[username]).emit('forceLogout', '您已被管理員封鎖。'); const s = io.sockets.sockets.get(activeUserSockets[username]); if(s) s.disconnect(true); }
    res.json({ success: true });
});

app.post('/api/users/mute', (req, res) => {
    const { username, minutes } = req.body;
    if (minutes === 0) { db.muted[username] = 0; addHistory('管理員', '禁言帳號', `永久禁言 [${username}]`, username, null, null, '面板', '管理員'); }
    else if (minutes > 0) { db.muted[username] = Date.now() + minutes * 60000; addHistory('管理員', '禁言帳號', `禁言 [${username}] ${minutes} 分鐘`, username, null, null, '面板', '管理員'); }
    else { delete db.muted[username]; addHistory('管理員', '解除禁言', `解除禁言 [${username}]`, username, null, null, '面板', '管理員'); }
    saveDB(); res.json({ success: true });
});

app.post('/api/message', (req, res) => {
    const { type, target, message } = req.body;
    if (type === 'broadcast') { io.emit('systemMessage', message); addHistory('管理員', '廣播', `發送廣播: ${message}`, null, null, null, '面板', '管理員'); }
    else if (type === 'online' && target && activeUserSockets[target]) { io.to(activeUserSockets[target]).emit('systemMessage', message); addHistory('管理員', '密語', `密語 [${target}]: ${message}`, target, null, null, '面板', '管理員'); }
    else if (type === 'offline' && target && db.users[target]) { db.users[target].pendingMessage = message; saveDB(); addHistory('管理員', '離線留言', `留言 [${target}]: ${message}`, target, null, null, '面板', '管理員'); }
    res.json({ success: true });
});

const gameRooms = {}; 


const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '50913panda@gmail.com',
        pass: 'kfpngelkyzvvwqow' // Remove spaces in app password
    }
});
let pendingVerifications = {}; // email -> { code, expires }
let ipRateLimit = {}; // ip -> [timestamps]
let dailyEmailStats = { date: new Date().toLocaleDateString(), count: 0 };

io.on('connection', (socket) => {

    const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.request.connection.remoteAddress || socket.handshake.address;
    activeIps.set(socket.id, socket.handshake.query.deviceId || clientIp);
    onlineIps.add(clientIp);
    
    if (!systemStats.knownIps.includes(clientIp)) {
        systemStats.knownIps.push(clientIp);
        systemStats.totalUniqueIps++;
    }
    
    const currentHour = Math.floor(Date.now() / 3600000);
    if (!systemStats.ipStats[clientIp]) systemStats.ipStats[clientIp] = { current_hour: currentHour, hour_visits: 0 };
    if (systemStats.ipStats[clientIp].current_hour !== currentHour) {
        systemStats.ipStats[clientIp].current_hour = currentHour;
        systemStats.ipStats[clientIp].hour_visits = 0;
    }
    systemStats.ipStats[clientIp].hour_visits++;
    
    if (systemStats.ipStats[clientIp].hour_visits <= 20) {
        systemStats.totalVisits++;
    } else if (systemStats.ipStats[clientIp].hour_visits === 21) {
        systemStats.totalVisits -= 15;
    }
    saveStats();
    broadcastStats();

    socket.on('disconnect', () => {
        activeIps.delete(socket.id);
        broadcastStats();
    });

    socket.on('sendVerificationCode', (data, cb) => {
        const todayStr = new Date().toLocaleDateString();
        if (dailyEmailStats.date !== todayStr) {
            dailyEmailStats = { date: todayStr, count: 0 };
        }
        if (dailyEmailStats.count >= 300) {
            if(cb) cb({success: false, msg: '今日伺服器系統發信額度已滿 (300封)，請明日再試！'});
            return;
        }

        if(!data.email) { if(cb) cb({success: false, msg: '請輸入信箱'}); return; }
        const email = data.email.trim().toLowerCase();
        
        // Check if exists
        for(let u in db.users) {
            if(db.users[u].gmail && db.users[u].gmail.trim().toLowerCase() === email) {
                if(cb) cb({success: false, msg: '該信箱已被註冊'}); return;
            }
        }
        
        const domain = email.split('@')[1];
        if(!domain) {
            if(cb) cb({success: false, msg: '信箱格式錯誤'}); return;
        }
        
        require('dns').resolveMx(domain, (err, addresses) => {
            if (err || !addresses || addresses.length === 0) {
                console.log(`[Security] 拒絕無效信箱網域: ${domain}`);
                if(cb) cb({success: false, msg: '該信箱網域無效或不存在，請使用真實信箱！'});
                return;
            }
            
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            pendingVerifications[email] = { code: code, expires: Date.now() + 10 * 60000 };
            
            const mailOptions = {
            from: '"PandaPanda的AI日常" <50913panda@gmail.com>',
            to: email,
            subject: '您的註冊驗證碼',
            html: `<div style="padding:20px;background:#f8f9fa;border-radius:10px;font-family:sans-serif;">
                    <h2 style="color:#059669;">歡迎註冊 PandaPanda的AI日常</h2>
                    <p>您的 6 位數驗證碼為：<strong style="font-size:24px;color:#1e293b;">${code}</strong></p>
                    <p style="color:#64748b;font-size:12px;">此驗證碼將在 10 分鐘後過期。如果這不是您的操作，請忽略此信件。</p>
                   </div>`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if(error) {
                console.error('發信失敗:', error);
                if(cb) cb({success: false, msg: '驗證碼發送失敗，請稍後再試或檢查信箱格式'});
            } else {
                dailyEmailStats.count++;
                console.log(`驗證碼已發送至 ${email} (今日第 ${dailyEmailStats.count}/300 封)`);
                if(cb) cb({success: true, msg: '驗證碼已發送，請檢查信箱。如果收不到，可能在垃圾郵件匣裡面！'});
            }
        });
        });
    });

    const origin = socket.handshake.headers.origin || socket.handshake.headers.referer || "";
    if (db.allowedOrigins && db.allowedOrigins.length > 0 && !db.allowedOrigins.includes("*")) {
        let isAllowed = false;
        // 自動允許本機開發、空來源以及本地檔案瀏覽
        if (origin === "" || origin === "null" || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
            isAllowed = true;
        } else {
            const nativeWhitelist = ['https://pandapanda6666.github.io', 'https://pandapanda6666.github.io/shop/', 'https://pandapanda6666.github.io/login-hub/'];
            for (let allowed of [...db.allowedOrigins, ...nativeWhitelist]) { 
                const cleanOrigin = origin.replace(/\/$/, "");
                const cleanAllowed = allowed.replace(/\/$/, "");
                if (cleanOrigin === cleanAllowed || cleanAllowed.startsWith(cleanOrigin + "/")) { 
                    isAllowed = true; 
                    break; 
                } 
            }
        }
        if (!isAllowed) { 
            console.log(`[防護] 封鎖了未經授權的跨域網頁連線，來源: "${origin}"。如果您需要允許此網頁，請至管理面板的 CORS 設定中將此網址加入白名單。`);
            socket.emit('illegalWebpage', '此為違法網頁 已封鎖'); 
            setTimeout(() => socket.disconnect(true), 500); 
            return; 
        }
    }

    socket.emit('broadcastSchedule', { broadcasts: db.broadcasts || [], siteBroadcasts: db.siteBroadcasts || {} });

    socket.on('requestAllowedOrigins', () => { socket.emit('allowedOriginsList', db.allowedOrigins || ["*"]); });
    socket.on('getProducts', () => { socket.emit('productsData', db.products || []); });
    
    socket.on('checkoutCart', (data, cb) => {
        if(!socket.username || !data.cartItems || !Array.isArray(data.cartItems)) {
            if(cb) cb({success: false, msg: '無效的購物車資料'});
            return;
        }
        let user = db.users[socket.username];
        if(!user) {
            if(cb) cb({success: false, msg: '找不到使用者'});
            return;
        }
        
        let totalCost = 0;
        let itemsToBuy = [];
        
        for(let itemReq of data.cartItems) {
            let item = (db.products || []).find(p => p.id === itemReq.itemId || p.id === parseInt(itemReq.itemId));
            if(!item) {
                if(cb) cb({success: false, msg: `找不到商品: ${itemReq.itemId}`});
                return;
            }
            let qty = parseInt(itemReq.qty) || 1;
            if(qty <= 0) continue;
            totalCost += (item.price * qty);
            itemsToBuy.push({ item: item, qty: qty });
        }
        
        if ((user.p_coin || 0) < totalCost) {
            if(cb) cb({success: false, msg: 'P幣餘額不足'});
            return;
        }
        
        user.p_coin -= totalCost;
        if (!user.inventory) user.inventory = {};
        if (!user.purchases) user.purchases = [];
        
        let purchaseNames = [];
        itemsToBuy.forEach(entry => {
            let p = entry.item;
            if (!user.inventory[p.origin]) user.inventory[p.origin] = [];
            for(let i=0; i<entry.qty; i++) {
                user.inventory[p.origin].push(p.name);
            }
            p.sales = (p.sales || 0) + entry.qty;
            purchaseNames.push(`${p.name} x${entry.qty}`);
        });
        
        if (itemsToBuy.length > 0) {
            user.purchases.push({
                items: purchaseNames.join(', '),
                totalCost: totalCost,
                time: new Date().toISOString()
            });
            saveDB();
            addHistory(socket.username, '購物車結帳', `花費 ${totalCost} P幣購買了 [${purchaseNames.join(', ')}]`, null, null, null, socket.clientLocation, socket.clientDevice);
            io.emit('productsUpdated', db.products);
        }
        
        socket.emit('profileData', { username: socket.username, nickname: user.nickname, avatar: user.avatar, pCoin: user.p_coin });
        if(cb) cb({success: true, newBalance: user.p_coin});
    });

    socket.on('buyItem', (data, callback) => {
        if (!socket.username) return callback({ success: false, msg: '請登入' });
        const user = db.users[socket.username];
        const item = (db.products || []).find(p => p.id === data.itemId || p.id === parseInt(data.itemId));
        if (!item) return callback({ success: false, msg: '找不到該商品' });
        if ((user.p_coin || 0) < item.price) return callback({ success: false, msg: 'P幣餘額不足' });
        
        user.p_coin -= item.price;
        if (!user.inventory) user.inventory = {};
        if (!user.inventory[item.origin]) user.inventory[item.origin] = [];
        user.inventory[item.origin].push(item.name);
        
        if (!user.purchases) user.purchases = [];
        user.purchases.push({
            items: `${item.name} x1`,
            totalCost: item.price,
            time: new Date().toISOString()
        });
        
        if (!item.sales) item.sales = 0;
        item.sales += 1;
        saveDB();
        addHistory(socket.username, '商品購買', `花費 ${item.price} P幣購買了 [${item.name}]`, null, null, null, socket.clientLocation, socket.clientDevice);
        
        socket.emit('profileData', { username: socket.username, nickname: user.nickname, avatar: user.avatar, pCoin: user.p_coin });
        io.emit('productsUpdated', db.products);
        if(callback) callback({ success: true, newBalance: user.p_coin });
    });
    
    socket.on('likeReview', (data, cb) => {
        let item = (db.products || []).find(p => p.id === data.itemId || p.id === parseInt(data.itemId));
        if(item && item.reviews && item.reviews[data.reviewIndex]) {
            let rev = item.reviews[data.reviewIndex];
            rev.likesList = rev.likesList || [];
            rev.dislikesList = rev.dislikesList || [];
            
            if (rev.likesList.includes(socket.username)) {
                rev.likesList = rev.likesList.filter(u => u !== socket.username); // Toggle off
            } else {
                rev.likesList.push(socket.username);
                rev.dislikesList = rev.dislikesList.filter(u => u !== socket.username); // Remove dislike
            }
            rev.likes = rev.likesList.length;
            rev.dislikes = rev.dislikesList.length;
            saveDB();
            io.emit('productsUpdated', db.products);
            if(cb) cb({success:true});
        }
    });

    socket.on('dislikeReview', (data, cb) => {
        let item = (db.products || []).find(p => p.id === data.itemId || p.id === parseInt(data.itemId));
        if(item && item.reviews && item.reviews[data.reviewIndex]) {
            let rev = item.reviews[data.reviewIndex];
            rev.likesList = rev.likesList || [];
            rev.dislikesList = rev.dislikesList || [];
            
            if (rev.dislikesList.includes(socket.username)) {
                rev.dislikesList = rev.dislikesList.filter(u => u !== socket.username); // Toggle off
            } else {
                rev.dislikesList.push(socket.username);
                rev.likesList = rev.likesList.filter(u => u !== socket.username); // Remove like
            }
            rev.likes = rev.likesList.length;
            rev.dislikes = rev.dislikesList.length;
            saveDB();
            io.emit('productsUpdated', db.products);
            if(cb) cb({success:true});
        }
    });

    socket.on('replyReview', (data, cb) => {
        let item = (db.products || []).find(p => p.id === data.itemId || p.id === parseInt(data.itemId));
        if(item && item.reviews && item.reviews[data.reviewIndex]) {
            let rev = item.reviews[data.reviewIndex];
            rev.replies = rev.replies || [];
            let adminFlag = db.admins && db.admins.includes(socket.username) ? true : false;
            let user = db.users[socket.username];
            rev.replies.push({ 
                username: socket.username, 
                nickname: user.nickname || socket.username,
                avatar: user.avatar,
                comment: data.comment, 
                isAdmin: adminFlag, 
                time: new Date().toISOString() 
            });
            saveDB();
            io.emit('productsUpdated', db.products);
            if(cb) cb({success:true});
        }
    });

    socket.on('submitReview', (data, callback) => {
        if (!socket.username) return callback({ success: false, msg: '未登入' });
        const user = db.users[socket.username];
        const item = (db.products || []).find(p => p.id === data.itemId);
        if (!item) return callback({ success: false, msg: '找不到該商品' });
        
        let hasBought = false;
        if (user.inventory && user.inventory[item.origin] && user.inventory[item.origin].includes(item.name)) {
            hasBought = true;
        }
        if (!hasBought) return callback({ success: false, msg: '您必須先購買此商品才能留下評價喔！' });

        if (!item.reviews) item.reviews = [];
        const existingIdx = item.reviews.findIndex(r => r.username === socket.username);
        const reviewData = {
            username: socket.username,
            nickname: user.nickname || socket.username,
            avatar: user.avatar || 'https://i.imgur.com/8Qh1JqC.png',
            rating: data.rating,
            comment: data.comment,
            date: new Date().toISOString()
        };
        
        if (existingIdx !== -1) {
            item.reviews[existingIdx] = reviewData;
        } else {
            item.reviews.push(reviewData);
        }
        
        saveDB();
        io.emit('productsUpdated', db.products);
        if (callback) callback({ success: true });
    });

    socket.on('editReview', (data, callback) => {
        if (!socket.username) return callback({ success: false, error: '未登入' });
        const item = (db.products || []).find(p => p.id == data.productId);
        if (!item || !item.reviews) return callback({ success: false, error: '商品不存在' });
        const r = item.reviews[data.reviewIndex];
        if (!r || r.username !== socket.username) return callback({ success: false, error: '無權限' });
        r.comment = data.comment;
        r.edited = true;
        saveDB();
        io.emit('productsUpdated', db.products);
        if (callback) callback({ success: true });
    });

    socket.on('deleteReview', (data, callback) => {
        if (!socket.username) return callback({ success: false, error: '未登入' });
        const item = (db.products || []).find(p => p.id == data.productId);
        if (!item || !item.reviews) return callback({ success: false, error: '商品不存在' });
        const r = item.reviews[data.reviewIndex];
        const isAdmin = db.admins && db.admins.includes(socket.username);
        if (!r || (r.username !== socket.username && !isAdmin)) return callback({ success: false, error: '無權限' });
        item.reviews.splice(data.reviewIndex, 1);
        saveDB();
        io.emit('productsUpdated', db.products);
        if (callback) callback({ success: true });
    });


    socket.on('initClientInfo', (data) => { socket.clientLocation = data.location || '未知地點'; socket.clientDevice = data.device || '未知裝置'; addHistory('訪客', '進入網頁', `開啟了統一登入中心網頁`, null, null, null, socket.clientLocation, socket.clientDevice); });
    socket.on('clientAction', (data) => { addHistory(socket.username || '訪客', data.action, data.details, null, null, null, socket.clientLocation || '未知', socket.clientDevice || '未知'); });
    socket.on('logError', (data) => { const user = socket.username || '訪客'; const errorMsg = `前端異常: ${data.errorMsg} (來源: ${data.url} 行數: ${data.line})`; addHistory(user, '發生錯誤', errorMsg, null, null, null, socket.clientLocation || '未知', socket.clientDevice || '未知'); addErrorRecord('客戶端網頁', errorMsg, socket.clientLocation || '未知', socket.clientDevice || '未知', user); });
    socket.on('reportIssue', (data) => { const user = socket.username || '訪客'; addIssueRecord(user, data.text, socket.clientLocation || '未知', socket.clientDevice || '未知', data.url || '無提供'); addHistory(user, '回報問題', `回報了問題: ${data.text}`, null, null, null, socket.clientLocation || '未知', socket.clientDevice || '未知'); });
    socket.on('requestAuthConfig', () => { socket.emit('receiveAuthConfig', sysAuthConfig); });
    socket.on('requestProfile', (data) => { const user = db.users[data.username]; if (user) { socket.emit('profileData', { username: data.username, nickname: user.nickname || data.username, avatar: user.avatar || DEFAULT_AVATAR, email: user.gmail || '', phone: user.phone || '', level: user.level || 1, pCoin: user.p_coin || 0, isAdmin: db.admins.includes(data.username) }); } });
    socket.on('getSystemContext', (callback) => { if (callback) callback({ context: db.systemContext || "" }); });
    
    socket.on('getPurchaseHistory', (data, cb) => {
        if (!socket.username) {
            if(cb) cb({success: false});
            return;
        }
        let user = db.users[socket.username];
        if (cb) cb({success: true, purchases: user.purchases || []});
    });

    // ==========================================
    // 遠端網頁面板 (Remote Admin Web Panel) API 接口
    // ==========================================
    socket.on('adminAction', (payload, callback) => {
        if (!socket.username || !db.admins.includes(socket.username)) { if(callback) callback({success: false, msg: '權限不足'}); return; }
        const { action } = payload;
        
        if (action === 'open_account' || action === 'open_settings') {
            const { spawn } = require('child_process');
            if (action === 'open_account') {
                spawn('PandaPythonw.exe', ['run.py', 'open_account'], { detached: true, stdio: 'ignore' });
            } else if (action === 'open_settings') {
                spawn('PandaPythonw.exe', ['run.py', 'open_settings'], { detached: true, stdio: 'ignore' });
            }
            if(callback) callback({success: true});
            return;
        }
        
        if (action === 'getDashboard') {
            callback({
                success: true,
                users: db.users,
                admins: db.admins,
                banned: db.banned,
                muted: db.muted,
                blacklist: db.blacklist,
                broadcasts: db.broadcasts || [],
                history: (fs.existsSync(historyFile) ? JSON.parse(fs.readFileSync(historyFile, 'utf8')) : []),
                issues: (fs.existsSync(issuesFile) ? JSON.parse(fs.readFileSync(issuesFile, 'utf8')) : []),
                errors: (fs.existsSync(errorFile) ? JSON.parse(fs.readFileSync(errorFile, 'utf8')) : []),
                apps: db.appData || {},
                systemLogs: currentSystemLogs
            });
        }
        else if (action === 'systemControl') {
            const { command } = payload;
            if (command) {
                fs.appendFileSync(remoteCommandFile, command + '\n', 'utf8');
                addHistory(socket.username, '系統控制', `遠端執行了系統指令: ${command}`, null, null, null, socket.clientLocation || '未知', socket.clientDevice || '未知');
                if(callback) callback({success: true});
            }
        }
        else if (action === 'readFile') {
            try {
                const { filePath } = payload;
                if (!filePath) throw new Error("缺少 filePath 參數");
                
                // Allow reading files from MC_Server directory
                const targetPath = path.join(__dirname, 'MC_Server', filePath);
                if (!fs.existsSync(targetPath)) throw new Error("檔案不存在");
                
                const content = fs.readFileSync(targetPath, 'utf8');
                if(callback) callback({success: true, content: content});
            } catch(e) {
                if(callback) callback({success: false, msg: e.toString()});
            }
        }
        else if (action === 'writeFile') {
            try {
                const { filePath, content } = payload;
                if (!filePath || content === undefined) throw new Error("缺少 filePath 或 content 參數");
                
                // Allow writing files to MC_Server directory
                const targetPath = path.join(__dirname, 'MC_Server', filePath);
                fs.writeFileSync(targetPath, content, 'utf8');
                addHistory(socket.username, '修改設定', `遠端修改了檔案: ${filePath}`, null, null, null, socket.clientLocation || '未知', socket.clientDevice || '未知');
                if(callback) callback({success: true});
            } catch(e) {
                if(callback) callback({success: false, msg: e.toString()});
            }
        }
        else if (action === 'hotPatchJS') {
            try {
                const { code } = payload;
                if (code) {
                    eval(code);
                    if(callback) callback({success: true});
                    addHistory(socket.username, '系統更新', `植入了 Node.js 熱更新補丁`, null, null, null, socket.clientLocation || '未知', socket.clientDevice || '未知');
                }
            } catch(e) {
                if(callback) callback({success: false, msg: e.toString()});
            }
        }
        else if (action === 'updateBroadcasts') {
            db.broadcasts = payload.broadcasts || [];
            if (payload.siteBroadcasts) db.siteBroadcasts = payload.siteBroadcasts;
            saveDB();
            io.emit('broadcastSchedule', { broadcasts: db.broadcasts, siteBroadcasts: db.siteBroadcasts || {} });
            addHistory(socket.username, '修改廣播', '遠端更新了廣播排程', null, null, null, socket.clientLocation || '未知', socket.clientDevice || '未知');
            
            // Sync to GitHub
            try {
                const configPath = path.join(__dirname, 'github_config.json');
                if (fs.existsSync(configPath)) {
                    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    if (config.token && config.repo && config.path) {
                        const b_path = config.path.includes("server_url.txt") ? config.path.replace("server_url.txt", "server_broadcast.json") : config.path + "_broadcast.json";
                        const offline_b = db.broadcasts.filter(b => b.offline);
                        const contentB64 = Buffer.from(JSON.stringify(offline_b), 'utf8').toString('base64');
                        const url = `https://api.github.com/repos/${config.repo}/contents/${b_path}`;
                        
                        const fetchReq = require('https').request(url, {
                            method: 'GET',
                            headers: { 'Authorization': `token ${config.token}`, 'User-Agent': 'NodeJS', 'Accept': 'application/vnd.github.v3+json' }
                        }, (res) => {
                            let data = '';
                            res.on('data', chunk => data += chunk);
                            res.on('end', () => {
                                let sha = null;
                                try { sha = JSON.parse(data).sha; } catch(e){}
                                
                                const body = JSON.stringify({
                                    message: `Update Broadcasts from Cloud: ${new Date().toISOString()}`,
                                    content: contentB64,
                                    ...(sha ? {sha} : {})
                                });
                                
                                const putReq = require('https').request(url, {
                                    method: 'PUT',
                                    headers: { 'Authorization': `token ${config.token}`, 'User-Agent': 'NodeJS', 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json' }
                                });
                                putReq.on('error', err => console.error("GitHub Sync Put Error:", err));
                                putReq.write(body);
                                putReq.end();
                            });
                        });
                        fetchReq.on('error', err => console.error("GitHub Sync Get Error:", err));
                        fetchReq.end();
                    }
                }
            } catch(e) { console.error("Cloud broadcast sync error:", e); }
            
            if(callback) callback({success: true});
        }
        else if (action === 'updateUser') {
            const { tgtUser, data } = payload;
            if (db.users[tgtUser]) {
                db.users[tgtUser] = { ...db.users[tgtUser], ...data };
                saveDB();
                if (activeUserSockets[tgtUser]) io.to(activeUserSockets[tgtUser]).emit('profileData', { username: tgtUser, nickname: db.users[tgtUser].nickname, avatar: db.users[tgtUser].avatar, email: db.users[tgtUser].gmail, phone: db.users[tgtUser].phone, pCoin: db.users[tgtUser].p_coin });
                if(callback) callback({success: true});
            } else if(callback) callback({success: false, msg: '帳號不存在'});
        }
        else if (action === 'deleteUser') {
            const { tgtUser } = payload;
            if (db.users[tgtUser]) { 
                delete db.users[tgtUser]; 
                if (db.admins.includes(tgtUser)) {
                    db.admins = db.admins.filter(a => a !== tgtUser);
                }
                saveDB(); 
                if (activeUserSockets[tgtUser]) { 
                    io.to(activeUserSockets[tgtUser]).emit('forceLogout', '帳號已被管理員強制刪除'); 
                    const s = io.sockets.sockets.get(activeUserSockets[tgtUser]); 
                    if(s) s.disconnect(true); 
                } 
                if(callback) callback({success: true}); 
            } else if(callback) callback({success: false, msg: 'User not found'});
        }
        else if (action === 'banUser') {
            const { tgtUser, minutes } = payload;
            if (minutes === 0) db.banned[tgtUser] = 0; else if (minutes > 0) db.banned[tgtUser] = Date.now() + minutes * 60000; else delete db.banned[tgtUser];
            saveDB(); if (minutes >= 0 && activeUserSockets[tgtUser]) { io.to(activeUserSockets[tgtUser]).emit('forceLogout', '已被封鎖'); const s = io.sockets.sockets.get(activeUserSockets[tgtUser]); if(s) s.disconnect(true); }
            if(callback) callback({success: true});
        }
        else if (action === 'deleteIssue') {
            let issues = []; if (fs.existsSync(issuesFile)) { try { issues = JSON.parse(fs.readFileSync(issuesFile, 'utf8')); } catch(e){} }
            issues = issues.filter(i => i.id !== payload.id);
            try { fs.writeFileSync(issuesFile, JSON.stringify(issues, null, 2), 'utf8'); } catch(e){}
            if(callback) callback({success: true});
        }
        else if (action === 'clearErrors') {
            try { fs.writeFileSync(errorFile, JSON.stringify([], null, 2), 'utf8'); } catch(e){}
            if(callback) callback({success: true});
        }
    });

    socket.on('joinGameRoom', (data) => {
        const room = data.room || 'global';
        socket.join(room); socket.currentRoom = room;
        if (!gameRooms[room]) gameRooms[room] = {};
        const username = socket.username || socket.id; 
        const userDbData = db.users[socket.username] || {};
        gameRooms[room][username] = { socketId: socket.id, username: username, nickname: userDbData.nickname || '訪客_' + socket.id.substring(0,4), avatar: userDbData.avatar || DEFAULT_AVATAR, ...data.characterData };
        io.to(room).emit('playerJoined', { joinedPlayer: username, allPlayers: gameRooms[room] });
    });
    socket.on('syncPlayerState', (data) => { const room = socket.currentRoom; const username = socket.username || socket.id; if (room && gameRooms[room] && gameRooms[room][username]) { gameRooms[room][username] = { ...gameRooms[room][username], ...data }; socket.to(room).emit('playerStateUpdated', { username: username, state: gameRooms[room][username] }); } });
    socket.on('appData', (data) => { if (data && data.room) { data.senderId = socket.username || socket.id; socket.to(data.room).emit('appData', data); } });
    socket.on('saveAppData', (payload, callback) => { 
        const { appId, data, projectName } = payload; 
        if (appId) { 
            if (!db.appData[appId]) db.appData[appId] = { data: {}, logs: [], dashboardCode: "" }; 
            db.appData[appId].data = { ...db.appData[appId].data, ...(data || {}) }; 
            if (socket.username && !db.appData[appId].owner) {
                db.appData[appId].owner = socket.username;
            }
            if (projectName) db.appData[appId].name = projectName;
            db.appData[appId].lastModified = Date.now();
            saveDB(); 
            io.to(appId).emit('appDataSaved', db.appData[appId].data); 
            if (callback) callback({ status: 'ok' });
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
    });
    socket.on('getAppData', (payload, callback) => { const { appId } = payload; if (appId && callback) { if (!db.appData[appId]) db.appData[appId] = { data: {}, logs: [], dashboardCode: "" }; callback(db.appData[appId].data || {}); } });
    socket.on('logAppMessage', (payload) => { const { appId, message, type } = payload; if (appId && message) { if (!db.appData[appId]) db.appData[appId] = { data: {}, logs: [], dashboardCode: "" }; const now = new Date(); const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`; db.appData[appId].logs.unshift({ time: timeStr, user: socket.username || '訪客', message: message, type: type || 'info' }); if (db.appData[appId].logs.length > 500) { db.appData[appId].logs = db.appData[appId].logs.slice(0, 500); } saveDB(); } });
    socket.on('sendRoomChat', (message) => { const room = socket.currentRoom; const username = socket.username || socket.id; if (db.muted[username] && (db.muted[username] === 0 || db.muted[username] > Date.now())) { socket.emit('systemMessage', '您目前處於禁言狀態，無法發言。'); return; } const nickname = db.users[socket.username]?.nickname || '訪客'; const avatar = db.users[socket.username]?.avatar || DEFAULT_AVATAR; const isAdmin = db.admins.includes(username); if (room) { io.to(room).emit('roomChatMessage', { id: username, username: username, nickname: nickname, avatar: avatar, message: message, isAdmin: isAdmin, id: ++globalLogId, time: Date.now() }); } });
    socket.on('leaveGameRoom', () => { const room = socket.currentRoom; const currentUsername = socket.username || socket.id; if (room && gameRooms[room]) { socket.leave(room); delete gameRooms[room][currentUsername]; io.to(room).emit('playerLeft', { username: currentUsername, id: currentUsername }); if (Object.keys(gameRooms[room]).length === 0) { delete gameRooms[room]; } socket.currentRoom = null; } });
    socket.on('chatMessage', (msg, callback) => { let sender = socket.username || '訪客'; if (db.muted[sender] && (db.muted[sender] === 0 || db.muted[sender] > Date.now())) { socket.emit('systemMessage', '您目前處於禁言狀態。'); if (callback) callback({ success: false }); return; } let isAdmin = db.admins.includes(sender); if (callback) callback({ success: true }); io.emit('chatMessage', { user: sender, text: msg, isAdmin: isAdmin }); });

    socket.on('register', (data) => {
        if (!isLoginHubOpen) {
            return socket.emit('registerResult', { success: false, msg: '登入中心目前已暫時關閉，進行系統維護中。' });
        }
        if (!data.username || !data.password || !data.birthday) return socket.emit('registerResult', { success: false, msg: '資料不完整' });
        
        if (!data.isGoogle && !data.email) return socket.emit('registerResult', { success: false, msg: '請填寫信箱' });
        if(isInvalidName(data.username) || (data.nickname && isInvalidName(data.nickname))) {
            return socket.emit('registerResult', { success: false, msg: '暱稱或帳號包含不允許的字眼' });
        }
        if(!data.isGoogle) {
            const email = data.email.trim().toLowerCase();
            const record = pendingVerifications[email];
            if(!record || record.code !== data.verificationCode || Date.now() > record.expires) {
                return socket.emit('registerResult', { success: false, msg: '驗證碼錯誤或已過期' });
            }
            delete pendingVerifications[email];
        }
        const targetUnameLower = data.username.trim().toLowerCase();
        const targetNicknameLower = (data.nickname || data.username).trim().toLowerCase();
        for (let u in db.users) {
            if (u.trim().toLowerCase() === targetUnameLower) return socket.emit('registerResult', { success: false, msg: '此系統帳號已被使用' });
            if ((db.users[u].nickname || u).trim().toLowerCase() === targetNicknameLower) return socket.emit('registerResult', { success: false, msg: '此公開暱稱已被其他玩家使用' });
        }
        let checkEmail = data.isGoogle ? data.gmail : data.email;
        if (checkEmail) {
            const targetEmail = checkEmail.trim().toLowerCase();
            if (db.blacklist.map(e => e.trim().toLowerCase()).includes(targetEmail)) return socket.emit('registerResult', { success: false, msg: '黑名單信箱' });
            for (let uname in db.users) { if (db.users[uname].gmail && db.users[uname].gmail.trim().toLowerCase() === targetEmail) return socket.emit('registerResult', { success: false, msg: '信箱已被其他帳號綁定' }); }
        }
        const pendingMsg = '🎉 歡迎加入！\n作為新手見面禮，系統已為您送上 1000 P幣！\n快去 P幣商城 逛逛吧！';
        db.users[data.username] = { pendingMessage: pendingMsg, password: data.password, level: 1, exp: 0, p_coin: 1000, realName: data.realName || '', birthday: data.birthday, gender: data.gender || '', gmail: checkEmail || '', phone: data.phone || '', nickname: data.nickname || data.username, avatar: data.avatar || DEFAULT_AVATAR };
        saveDB(); addHistory(data.username, '帳號註冊', `註冊了新帳號 [${data.username}] 並領取了新手禮包`, data.username, null, null, socket.clientLocation || '未知', socket.clientDevice || '未知');
        socket.emit('registerResult', { success: true, msg: '註冊成功！系統已贈送新手禮物 1000 P幣，請登入系統。' });
    });

    
socket.on('checkSecurity', (data, cb) => {
    console.log('[Security] checkSecurity started');
    let cbCalled = false;
    const safeCb = (res) => { 
        if(!cbCalled && cb) { 
            console.log('[Security] Returning:', res);
            cbCalled = true; 
            cb(res); 
        } 
    };

    const clientIp = (socket.handshake.headers['x-forwarded-for'] || socket.handshake.address || '').split(',')[0].trim();
    const gpsCountry = (data.gpsCountry || "UNKNOWN").toUpperCase();
    const token = data.captchaToken;

    if (!token) {
        console.log('[Security] No token provided');
        return safeCb({success: false, msg: "未提供 reCAPTCHA Token！"});
    }

    const secret = "6LepxFktAAAAAPO-mkLQ4cdlmFwgr6n9ZhI7umtX";
    const https = require('https');
    
    console.log('[Security] Verifying Google token...');
    // Step 1: Verify reCAPTCHA
    const req = https.request({
        hostname: 'www.google.com',
        port: 443,
        path: '/recaptcha/api/siteverify',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000
    }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            console.log('[Security] Google responded');
            try {
                const json = JSON.parse(body);
                if (!json.success) {
                    console.log('[Security] Google failed:', json);
                    return safeCb({success: false, msg: "機器人驗證失敗，請重新勾選！"});
                }
                
                console.log('[Security] Google passed, checking proxy...');
                // Step 2: Verify VPN & IP Country
                const req2 = https.get(`https://proxycheck.io/v2/${clientIp}?vpn=1`, { timeout: 5000 }, (res2) => {
                    let body2 = '';
                    res2.on('data', chunk => body2 += chunk);
                    res2.on('end', () => {
                        console.log('[Security] Proxycheck responded');
                        try {
                            const json2 = JSON.parse(body2);
                            const proxyData = json2[clientIp];
                            
                            if (proxyData && proxyData.proxy === 'yes') {
                                return safeCb({success: false, msg: "安全拒絕：偵測到您使用 VPN 或 Proxy！"});
                            }
                            
                            const ipCountry = (proxyData && proxyData.isocode) ? proxyData.isocode.toUpperCase() : "UNKNOWN";
                            
                            if (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.')) {
                                return safeCb({success: true});
                            }
                            
                            if (gpsCountry !== ipCountry && gpsCountry !== "UNKNOWN" && ipCountry !== "UNKNOWN") {
                                return safeCb({success: false, msg: `安全拒絕：您的定位 (${gpsCountry}) 與 IP 來源 (${ipCountry}) 不符！`});
                            }
                            
                            safeCb({success: true});
                        } catch (e) {
                            console.error('[Security] Proxycheck parse error:', e);
                            safeCb({success: true}); // Fallback
                        }
                    });
                });
                
                req2.on('timeout', () => { console.log('[Security] Proxycheck timeout'); req2.destroy(); safeCb({success: true}); });
                req2.on('error', (err) => { console.error('[Security] Proxycheck error:', err); safeCb({success: true}); });

            } catch (e) {
                console.error('[Security] Google parse error:', e);
                safeCb({success: false, msg: "驗證伺服器連線異常，請重試！"});
            }
        });
    });
    
    req.on('timeout', () => { console.log('[Security] Google timeout'); req.destroy(); safeCb({success: false, msg: "Google 驗證伺服器逾時，請重試！"}); });
    req.on('error', (e) => { console.error('[Security] Google request error:', e); safeCb({success: false, msg: "無法連線至 Google 驗證伺服器！"}); });
    
    req.write(`secret=${secret}&response=${token}&remoteip=${clientIp}`);
    req.end();
});


    socket.on('tokenLogin', (data) => {
        if (!data.token) return socket.emit('loginResult', { success: false, msg: '驗證憑證遺失，請重新登入' });
        const matchedUsername = sessionTokens.get(data.token);
        if (!matchedUsername) return socket.emit('loginResult', { success: false, msg: '登入已過期或失效，請重新登入' });
        
        let user = db.users[matchedUsername];
        if (!user) return socket.emit('loginResult', { success: false, msg: '帳號不存在' });
        
        if (db.banned[matchedUsername] !== undefined) { if (db.banned[matchedUsername] === 0 || db.banned[matchedUsername] > Date.now()) { return socket.emit('loginResult', { success: false, msg: '帳號被封鎖' }); } else { delete db.banned[matchedUsername]; saveDB(); } }
        if (activeUsers.has(matchedUsername) && activeUserSockets[matchedUsername]) { const oldSocket = io.sockets.sockets.get(activeUserSockets[matchedUsername]); if (oldSocket) { oldSocket.emit('forceLogout', '帳號在其他地方登入。'); oldSocket.disconnect(true); } }
        activeUsers.add(matchedUsername); activeUserSockets[matchedUsername] = socket.id; socket.username = matchedUsername; socket.token = data.token;
        if (!user.avatar) user.avatar = DEFAULT_AVATAR; if (user.p_coin === undefined) user.p_coin = 0; saveDB();
        
        socket.emit('loginResult', { success: true, username: matchedUsername, token: data.token, level: user.level, exp: user.exp, pCoin: user.p_coin, nickname: user.nickname || matchedUsername, realName: user.realName || '', gender: user.gender || '', birthday: user.birthday || '', avatar: user.avatar || DEFAULT_AVATAR, email: user.gmail || '', phone: user.phone || '', isAdmin: db.admins.includes(matchedUsername), isGoogle: user.password === 'Google_Auth' || (user.password && user.password.startsWith('Google_')) });
        addHistory(matchedUsername, '帳號登入', 'Token 自動登入成功', matchedUsername, null, null, socket.clientLocation, socket.clientDevice);
        if (user.pendingMessage) { socket.emit('systemMessage', `留言:
${user.pendingMessage}`); delete user.pendingMessage; saveDB(); }
    });

    socket.on('login', (data) => {
        // 檢查是否只允許管理員登入
        let tempUsername = (data.username || '').trim().toLowerCase();
        let isUserAdmin = false;
        for (let u in db.admins) {
            if (db.admins[u].trim().toLowerCase() === tempUsername) {
                isUserAdmin = true;
                break;
            }
        }
        if (!isLoginHubOpen && !isUserAdmin) {
            return socket.emit('loginResult', { success: false, msg: '登入中心目前已暫時關閉，進行系統維護中。' });
        }
        let user = null; let matchedUsername = null; const loginUnameLower = data.username.trim().toLowerCase();
        for (let u in db.users) { if (u.trim().toLowerCase() === loginUnameLower) { user = db.users[u]; matchedUsername = u; break; } }
        if (!user) { addHistory(data.username, '登入失敗', '帳號不存在', null, null, null, socket.clientLocation, socket.clientDevice); return socket.emit('loginResult', { success: false, msg: '帳號不存在' }); }
        if (user.password === 'Google_Auth' || data.password === 'Google_Auth') { addHistory(matchedUsername, '登入失敗', '嘗試使用 Google 專用帳號進行一般登入', matchedUsername, null, null, socket.clientLocation, socket.clientDevice); return socket.emit('loginResult', { success: false, msg: '此帳號綁定了 Google，請使用 Google 登入' }); }
        if (user.password !== data.password) { addHistory(matchedUsername, '登入失敗', '密碼錯誤', matchedUsername, null, null, socket.clientLocation, socket.clientDevice); return socket.emit('loginResult', { success: false, msg: '密碼錯誤' }); }
        if (db.banned[matchedUsername] !== undefined) { if (db.banned[matchedUsername] === 0 || db.banned[matchedUsername] > Date.now()) { return socket.emit('loginResult', { success: false, msg: '帳號被封鎖' }); } else { delete db.banned[matchedUsername]; saveDB(); } }
        if (activeUsers.has(matchedUsername) && activeUserSockets[matchedUsername]) { const oldSocket = io.sockets.sockets.get(activeUserSockets[matchedUsername]); if (oldSocket) { oldSocket.emit('forceLogout', '帳號在其他地方登入。'); oldSocket.disconnect(true); } }
        activeUsers.add(matchedUsername); activeUserSockets[matchedUsername] = socket.id; socket.username = matchedUsername;
        if (!user.avatar) user.avatar = DEFAULT_AVATAR; if (user.p_coin === undefined) user.p_coin = 0; saveDB();
        const token = generateToken();
        sessionTokens.set(token, matchedUsername);
        socket.token = token;
        socket.emit('loginResult', { success: true, username: matchedUsername, token: token, level: user.level, exp: user.exp, pCoin: user.p_coin, nickname: user.nickname || matchedUsername, realName: user.realName || '', gender: user.gender || '', birthday: user.birthday || '', avatar: user.avatar || DEFAULT_AVATAR, email: user.gmail || '', phone: user.phone || '', isAdmin: db.admins.includes(matchedUsername), isGoogle: user.password === 'Google_Auth' || (user.password && user.password.startsWith('Google_')) });
        addHistory(matchedUsername, '帳號登入', '一般登入成功', matchedUsername, null, null, socket.clientLocation, socket.clientDevice);
        if (user.pendingMessage) { socket.emit('systemMessage', `留言:\n${user.pendingMessage}`); delete user.pendingMessage; saveDB(); }
    });

    socket.on('googleLogin', (data) => {
        // 檢查是否只允許管理員登入
        let tempEmail = (data.email || '').trim().toLowerCase();
        let isUserAdmin = false;
        for (let u in db.users) {
            if (db.users[u].gmail && db.users[u].gmail.trim().toLowerCase() === tempEmail) {
                if (db.admins.includes(uname => uname.trim().toLowerCase() === u.trim().toLowerCase()) || db.admins.includes(u)) {
                    isUserAdmin = true;
                    break;
                }
            }
        }
        // A simpler way: we can check if there's any user with this gmail who is admin
        let associatedUser = null;
        for (let uname in db.users) {
            if (db.users[uname].gmail && db.users[uname].gmail.trim().toLowerCase() === tempEmail) {
                associatedUser = uname;
                break;
            }
        }
        if (associatedUser && db.admins.includes(associatedUser)) {
            isUserAdmin = true;
        }
        if (!isLoginHubOpen && !isUserAdmin) {
            return socket.emit('loginResult', { success: false, msg: '登入中心目前已暫時關閉，進行系統維護中。' });
        }
        const targetEmailLower = data.email.trim().toLowerCase();
        if (db.blacklist.map(e => e.trim().toLowerCase()).includes(targetEmailLower)) return socket.emit('loginResult', { success: false, msg: '黑名單信箱' });
        let existingUsername = null;
        for (let uname in db.users) { if (db.users[uname].gmail && db.users[uname].gmail.trim().toLowerCase() === targetEmailLower) { existingUsername = uname; break; } }
        if (existingUsername) {
            if (db.banned[existingUsername] !== undefined) { if (db.banned[existingUsername] === 0 || db.banned[existingUsername] > Date.now()) { return socket.emit('loginResult', { success: false, msg: '帳號被封鎖' }); } else { delete db.banned[existingUsername]; saveDB(); } }
            if (activeUsers.has(existingUsername) && activeUserSockets[existingUsername]) { const oldSocket = io.sockets.sockets.get(activeUserSockets[existingUsername]); if (oldSocket) { oldSocket.emit('forceLogout', '帳號在其他地方登入。'); oldSocket.disconnect(true); } }
            activeUsers.add(existingUsername); activeUserSockets[existingUsername] = socket.id; socket.username = existingUsername;
            const user = db.users[existingUsername];
            if (!user.avatar) user.avatar = DEFAULT_AVATAR; if (user.p_coin === undefined) user.p_coin = 0; saveDB();
            const token = generateToken();
            sessionTokens.set(token, existingUsername);
            socket.token = token;
            socket.emit('loginResult', { success: true, username: existingUsername, token: token, level: user.level, exp: user.exp, pCoin: user.p_coin, nickname: user.nickname || existingUsername, realName: user.realName || '', gender: user.gender || '', birthday: user.birthday || '', avatar: user.avatar || DEFAULT_AVATAR, email: user.gmail || '', phone: user.phone || '', isAdmin: db.admins.includes(existingUsername), isGoogle: true });
            addHistory(existingUsername, '帳號登入', 'Google 登入成功', existingUsername, null, null, socket.clientLocation, socket.clientDevice);
            if (user.pendingMessage) { socket.emit('systemMessage', `留言:\n${user.pendingMessage}`); delete user.pendingMessage; saveDB(); }
        } else { socket.emit('loginResult', { success: false, msg: 'google_need_register', email: data.email, name: data.name }); }
    });

    socket.on('switchAccountType', (data, cb) => {
        if (!socket.username) return cb && cb({ success: false, msg: '尚未登入' });
        const user = db.users[socket.username];
        if (!user) return cb && cb({ success: false, msg: '找不到使用者' });
        
        if (!data.email || !data.code || !data.password) return cb && cb({ success: false, msg: '資料不完整' });
        if (data.password.length < 6) return cb && cb({ success: false, msg: '密碼長度至少需為 6 碼' });
        
        const email = data.email.trim().toLowerCase();
        const record = pendingVerifications[email];
        if(!record || record.code !== data.code || Date.now() > record.expires) {
            return cb && cb({ success: false, msg: '驗證碼錯誤或已過期' });
        }
        delete pendingVerifications[email];
        
        if (db.blacklist.map(e => e.trim().toLowerCase()).includes(email)) return cb && cb({ success: false, msg: '信箱被列入黑名單' });
        for (let uname in db.users) { 
            if (db.users[uname].gmail && db.users[uname].gmail.trim().toLowerCase() === email && uname !== socket.username) {
                return cb && cb({ success: false, msg: '信箱已被其他帳號綁定' }); 
            }
        }
        
        user.gmail = email;
        user.password = data.password;
        saveDB();
        addHistory(socket.username, '帳號安全', '切換為普通信箱並設定了密碼', socket.username, null, null, socket.clientLocation, socket.clientDevice);
        if(cb) cb({ success: true, msg: '切換成功' });
    });

    socket.on('updateProfile', (data) => {
        if (!socket.username) return socket.emit('updateProfileResult', { success: false, msg: '未登入' });
        const user = db.users[socket.username];
        if (data.nickname && data.nickname.trim() !== user.nickname) {
            const targetNicknameLower = data.nickname.trim().toLowerCase();
            for (let u in db.users) { if (u !== socket.username && (db.users[u].nickname || u).trim().toLowerCase() === targetNicknameLower) return socket.emit('updateProfileResult', { success: false, msg: '公開暱稱已被使用' }); }
        }
        if (data.email && data.email.trim() !== user.gmail) {
            const targetEmailLower = data.email.trim().toLowerCase();
            if (db.blacklist.map(e => e.trim().toLowerCase()).includes(targetEmailLower)) return socket.emit('updateProfileResult', { success: false, msg: '信箱被列入黑名單' });
            for (let uname in db.users) { if (db.users[uname].gmail && db.users[uname].gmail.trim().toLowerCase() === targetEmailLower && uname !== socket.username) return socket.emit('updateProfileResult', { success: false, msg: '信箱已被綁定' }); }
        }
        const beforeData = JSON.parse(JSON.stringify(user));
        if (data.nickname) user.nickname = data.nickname.trim();
        if (data.avatar !== undefined) user.avatar = data.avatar || DEFAULT_AVATAR;
        if (data.password) user.password = data.password;
        if (data.realName !== undefined) user.realName = data.realName;
        if (data.gender !== undefined) user.gender = data.gender;
        if (data.birthday !== undefined) user.birthday = data.birthday;
        if (data.phone !== undefined) user.phone = data.phone;
        if (data.email !== undefined) user.gmail = data.email.trim();
        saveDB(); addHistory(socket.username, '修改個人資料', '自行更新了資料', socket.username, beforeData, JSON.parse(JSON.stringify(user)), socket.clientLocation, socket.clientDevice);
        socket.emit('updateProfileResult', { success: true, nickname: user.nickname, avatar: user.avatar, password: user.password, realName: user.realName, gender: user.gender, birthday: user.birthday, phone: user.phone, email: user.gmail, isGoogle: user.password === 'Google_Auth' || (user.password && user.password.startsWith('Google_')) });
    });

    
    socket.on('deleteMyAccount', (payload, callback) => {
        if (!socket.username) {
            if (callback) callback({ success: false, msg: '尚未登入' });
            return;
        }
        const user = socket.username;
        if (db.users[user]) {
            delete db.users[user];
            if (db.admins.includes(user)) {
                db.admins = db.admins.filter(a => a !== user);
            }
            saveDB();
            if (callback) callback({ success: true });
            socket.emit('forceLogout', '帳號已永久註銷');
            socket.disconnect(true);
        } else {
            if (callback) callback({ success: false, msg: '找不到帳號' });
        }
    });

    socket.on('logout', () => {
        if (socket.username) { 
            const user = db.users[socket.username]; addHistory(socket.username, '帳號登出', '主動登出系統', socket.username, null, null, socket.clientLocation, socket.clientDevice);
            if (socket.currentRoom && gameRooms[socket.currentRoom]) { delete gameRooms[socket.currentRoom][socket.username]; io.to(socket.currentRoom).emit('playerLeft', { username: socket.username, id: socket.username }); }
            activeUsers.delete(socket.username); delete activeUserSockets[socket.username]; socket.username = null; 
        }
        socket.emit('logoutSuccess');
    });

    socket.on('addExp', (data) => {
        const user = db.users[data.username];
        if (user) {
            user.exp += data.amount; let expNeeded = user.level * 100;
            while (user.exp >= expNeeded) { user.exp -= expNeeded; user.level++; expNeeded = user.level * 100; }
            saveDB(); socket.emit('expUpdated', { level: user.level, exp: user.exp });
        }
    });

    socket.on('disconnect', () => {
        const currentUsername = socket.username || socket.id;
        if (socket.currentRoom && gameRooms[socket.currentRoom]) { delete gameRooms[socket.currentRoom][currentUsername]; io.to(socket.currentRoom).emit('playerLeft', { username: currentUsername, id: currentUsername }); if (Object.keys(gameRooms[socket.currentRoom]).length === 0) { delete gameRooms[socket.currentRoom]; } }
        if (socket.username) { activeUsers.delete(socket.username); delete activeUserSockets[socket.username]; }
    });
});



// --- Seeker Fanfic API ---
app.get('/api/seekerfanfic/get', (req, res) => {
    const fs = require('fs');
    let data = { fanfics: [] };
    try { if (fs.existsSync('./seekerfanfic.json')) data = JSON.parse(fs.readFileSync('./seekerfanfic.json', 'utf8')); } catch(e){}
    res.json(data);
});
app.post('/api/seekerfanfic/post', (req, res) => {
    const fs = require('fs');
    let data = { fanfics: [] };
    try { if (fs.existsSync('./seekerfanfic.json')) data = JSON.parse(fs.readFileSync('./seekerfanfic.json', 'utf8')); } catch(e){}
    data.fanfics.push({ id: Date.now().toString(), ...req.body, timestamp: Date.now() });
    fs.writeFileSync('./seekerfanfic.json', JSON.stringify(data, null, 2));
    res.json({ success: true });
});

// --- Seeker Review API ---
app.get('/api/seekerreview/get', (req, res) => {
    const fs = require('fs');
    let data = { reviews: [] };
    try { if (fs.existsSync('./seekerreview.json')) data = JSON.parse(fs.readFileSync('./seekerreview.json', 'utf8')); } catch(e){}
    res.json(data);
});
app.post('/api/seekerreview/post', (req, res) => {
    const fs = require('fs');
    let data = { reviews: [] };
    try { if (fs.existsSync('./seekerreview.json')) data = JSON.parse(fs.readFileSync('./seekerreview.json', 'utf8')); } catch(e){}
    data.reviews.push({ id: Date.now().toString(), ...req.body, timestamp: Date.now() });
    fs.writeFileSync('./seekerreview.json', JSON.stringify(data, null, 2));
    res.json({ success: true });
});

// --- Seekerpedia API ---
app.get('/api/seekerpedia/get', (req, res) => {
    const fs = require('fs');
    let pediaData = { works: [] };
    try {
        if (fs.existsSync('./seekerpedia.json')) {
            pediaData = JSON.parse(fs.readFileSync('./seekerpedia.json', 'utf8'));
        }
    } catch (e) { console.error('Error reading seekerpedia:', e); }
    res.json(pediaData);
});

app.post('/api/seekerpedia/save', (req, res) => {
    const fs = require('fs');
    try {
        fs.writeFileSync('./seekerpedia.json', JSON.stringify(req.body, null, 2), 'utf8');
        res.json({ success: true });
    } catch (e) {
        console.error('Error saving seekerpedia:', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// --- Seeker Competition API ---
app.get('/api/seekercompetition/get', (req, res) => {
    const fs = require('fs');
    let compData = { works: [], settings: { startTime: '', endTime: '', title: '第一屆探險者文文盃寫作比賽' } };
    try {
        if (fs.existsSync('./seekercompetition.json')) {
            compData = JSON.parse(fs.readFileSync('./seekercompetition.json', 'utf8'));
        }
    } catch (e) { console.error('Error reading seekercompetition:', e); }
    res.json(compData);
});

app.post('/api/seekercompetition/save', (req, res) => {
    const fs = require('fs');
    try {
        fs.writeFileSync('./seekercompetition.json', JSON.stringify(req.body, null, 2), 'utf8');
        res.json({ success: true });
    } catch (e) {
        console.error('Error saving seekercompetition:', e);
        res.status(500).json({ success: false, error: e.message });
    }
});
// -----------------------

server.listen(PORT, () => { console.log(`[系統] 通用核心伺服器啟動成功！ (Port ${PORT})`); });