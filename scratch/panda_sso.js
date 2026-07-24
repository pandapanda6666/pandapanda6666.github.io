/*
 PandaScratch 統一登入系統與 Socket.IO 全域模組
 版權所有 © 2026 PandaPanda的AI日常 All Rights Reserved.
 請記得將此網頁的網址，加入伺服器管理面板的 CORS 授權網域白名單中，否則會無法連線
*/

(function() {
    // 錯誤攔截
    const originalWarn = console.warn;
    console.warn = function(...args) {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('cdn.tailwindcss.com should not be used in production')) return;
        originalWarn.apply(console, args);
    };
    
    window.onerror = function(msg, url, line) { 
        if (typeof window.socket !== 'undefined' && window.socket.connected) {
            window.socket.emit('logError', { errorMsg: msg, url: url, line: line }); 
        }
    };
    
    window.addEventListener('unhandledrejection', function(event) {
        if (typeof window.socket !== 'undefined' && window.socket.connected) {
            window.socket.emit('logError', { errorMsg: 'Promise異常: ' + (event.reason ? event.reason.message || event.reason : '未知錯誤'), url: window.location.href, line: 0 });
        }
    });

    // 專案 ID 與 appId 產生
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id') || 'default';
    const appId = window.location.hostname + window.location.pathname + projectId;
    window.appId = appId;
    
    // 初始化 Socket.IO 與登入
    async function initSSO() {
        let serverUrl = urlParams.get('server');
        
        if (!serverUrl) {
            try {
                const res = await fetch('https://pandapanda6666.github.io/login-hub/server_url.txt');
                const text = await res.text();
                serverUrl = atob(text.trim().split('').reverse().join(''));
            } catch (e) {
                console.error("無法取得伺服器網址", e);
                // 絕對禁止 fallback 到 localhost
                showConnectionError();
                return;
            }
        }
        
        const socket = io(serverUrl, { transports: ['websocket'] });
        window.socket = socket;
        
        socket.on('connect', () => {
            console.log("已連線至伺服器");
            socket.emit('initClientInfo', { location: '未知地點', device: navigator.userAgent });
            
            // 加入房間
            socket.emit('joinGameRoom', { room: appId, characterData: {} });
            
            // 嘗試 Token 登入
            let token = urlParams.get('token') || localStorage.getItem('panda_session_token');
            if (token) {
                socket.emit('tokenLogin', { token: token });
                
                // 若網址上有 token，將其隱藏
                if (urlParams.get('token')) {
                    urlParams.delete('token');
                    let newUrl = window.location.pathname;
                    if (urlParams.toString()) newUrl += '?' + urlParams.toString();
                    window.history.replaceState({}, document.title, newUrl);
                }
            } else {
                renderGuestUI();
            }
        });
        
        socket.on('connect_error', (err) => {
            console.error("連線錯誤", err);
            showConnectionError();
        });
        
        socket.on('loginResult', (data) => {
            if (data.success) {
                localStorage.setItem('panda_session_token', data.token || localStorage.getItem('panda_session_token'));
                localStorage.setItem('panda_session_user', data.username || data.nickname || data.account || '使用者');
                localStorage.setItem('panda_balance', data.pCoin || data.balance || 0);
                localStorage.setItem('panda_avatar', data.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png');
                renderUserUI(data);
            } else {
                localStorage.removeItem('panda_session_token');
                renderGuestUI();
            }
        });

        // 跑馬燈排程廣播
        socket.on('broadcastSchedule', (list) => {
            localStorage.setItem('broadcasts', JSON.stringify(list));
            window.broadcasts = list;
        });
    }
    
    function showConnectionError() {
        if (document.getElementById('conn-error')) return;
        const errorDiv = document.createElement('div');
        errorDiv.id = 'conn-error';
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '0';
        errorDiv.style.left = '0';
        errorDiv.style.width = '100%';
        errorDiv.style.backgroundColor = 'red';
        errorDiv.style.color = 'white';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.padding = '5px';
        errorDiv.style.zIndex = '99999';
        errorDiv.innerText = '伺服器連線失敗，請稍後再試';
        document.body.appendChild(errorDiv);
    }
    
    // UI 渲染
    function renderGuestUI() {
        const authActions = document.getElementById('auth-actions');
        const userMenu = document.getElementById('user-menu');
        
        if (authActions) authActions.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
    
    function renderUserUI(data) {
        const authActions = document.getElementById('auth-actions');
        const userMenu = document.getElementById('user-menu');
        
        if (authActions) authActions.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        
        const userNickname = data.nickname || data.username || data.account || '使用者';
        const userAvatar = data.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png';
        const balance = data.pCoin || data.balance || 0;
        
        const usernameEl = document.getElementById('nav-username');
        const avatarEl = document.getElementById('nav-avatar');
        if (usernameEl) {
            usernameEl.innerHTML = `${userNickname} <span style="margin-left: 10px; color: gold; font-weight: bold;"><img src="/scratch/projects/editor/static/assets/pandacoin.png" style="width:16px;height:16px;vertical-align:middle;margin-right:2px;" onerror="this.src='https://pandapanda6666.github.io/login-hub/pandacoin.png'" />${balance}</span>`;
        }
        if (avatarEl) {
            avatarEl.src = userAvatar;
        }
        
        // 替換頭像區塊點擊事件導向 login-hub
        const avatarContainer = document.querySelector('.avatar-container');
        if (avatarContainer && !avatarContainer.hasAttribute('data-sso-bound')) {
            avatarContainer.setAttribute('data-sso-bound', 'true');
            const profileLink = avatarContainer.querySelector('a[href*="action=profile"]');
            if (profileLink) {
                profileLink.href = 'https://pandapanda6666.github.io/login-hub/?from=' + encodeURIComponent(window.location.href);
            }
        }
    }
    
    // 跑馬燈初始化
    function initMarquee() {
        // 先嘗試從離線載入
        fetch('https://pandapanda6666.github.io/login-hub/server_broadcast.json')
            .then(res=>res.json())
            .then(list => { 
                window.broadcasts = list; 
                localStorage.setItem('broadcasts', JSON.stringify(list)); 
            })
            .catch(() => { 
                window.broadcasts = JSON.parse(localStorage.getItem('broadcasts')||'[]'); 
            });
            
        setInterval(() => {
            const now = Date.now(); 
            const bar = document.getElementById('notificationBar'); 
            const msgText = document.getElementById('notificationMsg');
            if (!bar || !msgText) return;
            
            let activeMsg = null; 
            const list = window.broadcasts || JSON.parse(localStorage.getItem('broadcasts') || '[]');
            
            for (let b of list) {
                const st = new Date(b.startTime).getTime();
                if (b.mode === 1) {
                    const intervalMs = b.intervalMin * 60000; 
                    const end = st + ((b.repeatCount - 1) * intervalMs) + 60000;
                    if (now >= st && now <= end) { 
                        const elapsed = now - st; 
                        if (elapsed % intervalMs < 60000) activeMsg = b.message; 
                    }
                } else if (b.mode === 2) { 
                    const et = new Date(b.endTime).getTime(); 
                    if (now >= st && now <= et) activeMsg = b.message; 
                }
            }
            if (activeMsg) { 
                msgText.innerText = activeMsg; 
                bar.style.display = 'block'; 
            } else { 
                bar.style.display = 'none'; 
            }
        }, 1000);
    }
    
    window.addEventListener('load', () => {
        initMarquee();
        initSSO();
    });
})();
