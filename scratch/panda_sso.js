/*
 PandaScratch 統一登入系統與 Socket.IO 全域模組
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
    
    let projectId = urlParams.get('id');
    if (!projectId && window.location.pathname.includes('/projects/editor')) {
        projectId = 'panda_' + Math.random().toString(36).substring(2, 9);
        # urlParams.set('id', projectId); 
        # window.history.replaceState({}, '', '?' + urlParams.toString());
    } else if (!projectId) {
        projectId = 'default';
    }

    const appId = window.location.hostname + window.location.pathname + projectId;
    window.appId = appId;
    
    // 初始化 Socket.IO 與登入
    function getStoredAuthData() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('auth') === 'true' || urlParams.get('user') || urlParams.get('nickname') || urlParams.get('avatar')) {
            if (urlParams.get('user')) {
                localStorage.setItem('sso_user', urlParams.get('user'));
                localStorage.setItem('panda_session_user', urlParams.get('user'));
                localStorage.setItem('panda_auto_user', urlParams.get('user'));
            }
            if (urlParams.get('nickname')) {
                localStorage.setItem('sso_nickname', urlParams.get('nickname'));
                localStorage.setItem('panda_nickname', urlParams.get('nickname'));
            }
            if (urlParams.get('avatar')) {
                localStorage.setItem('sso_avatar', urlParams.get('avatar'));
                localStorage.setItem('panda_avatar', urlParams.get('avatar'));
            }
            localStorage.setItem('sso_auth', 'true');
        }
        const username = localStorage.getItem('sso_user') || localStorage.getItem('panda_session_user') || localStorage.getItem('panda_auto_user') || '使用者';
        const nickname = urlParams.get('nickname') || localStorage.getItem('sso_nickname') || localStorage.getItem('panda_nickname') || username;
        const avatar = urlParams.get('avatar') || localStorage.getItem('sso_avatar') || localStorage.getItem('panda_avatar') || 'https://cdn.discordapp.com/embed/avatars/0.png';
        const balance = localStorage.getItem('panda_balance') || 0;
        const isLogged = localStorage.getItem('sso_auth') === 'true' || localStorage.getItem('panda_session_token') || localStorage.getItem('panda_session_user') || localStorage.getItem('panda_auto_user') || localStorage.getItem('sso_user');
        return {
            username: username,
            nickname: nickname,
            avatarUrl: avatar,
            pCoin: balance,
            isLogged: isLogged
        };
    }

    async function initSSO() {
        const authData = getStoredAuthData();
        if (authData.isLogged) {
            renderUserUI(authData);
        } else {
            renderGuestUI();
        }

        let serverUrl = urlParams.get('server') || localStorage.getItem('sso_server');
        if (!serverUrl) {
            try {
                const res = await fetch('https://pandapanda6666.github.io/login-hub/server_url.txt');
                const text = await res.text();
                serverUrl = atob(text.trim().split('').reverse().join(''));
                if (serverUrl) localStorage.setItem('sso_server', serverUrl);
            } catch (e) {
                console.error("無法取得伺服器網址", e);
                showConnectionError();
                return;
            }
        }
        
        const socket = io(serverUrl, { transports: ['websocket'] });
        window.socket = socket;
        
        socket.on('connect', () => {
            console.log("已連線至伺服器");
            socket.emit('initClientInfo', { location: '未知地點', device: navigator.userAgent });
            socket.emit('joinGameRoom', { room: appId, characterData: {} });
            
            let token = urlParams.get('token') || localStorage.getItem('panda_session_token');
            if (token) {
                socket.emit('tokenLogin', { token: token });
                if (urlParams.get('token')) {
                    urlParams.delete('token');
                    let newUrl = window.location.pathname;
                    if (urlParams.toString()) newUrl += '?' + urlParams.toString();
                    if (window.history.replaceState) window.history.replaceState({}, document.title, newUrl);
                }
            } else if (getStoredAuthData().isLogged) {
                const u = localStorage.getItem('sso_user') || localStorage.getItem('panda_session_user') || localStorage.getItem('panda_auto_user');
                if (u) socket.emit('requestProfile', { username: u });
            } else {
                renderGuestUI();
            }
        });
        
        socket.on('connect_error', (err) => {
            console.error("連線錯誤", err);
            showConnectionError();
            if (!getStoredAuthData().isLogged) {
                renderGuestUI();
            }
        });
        
        socket.on('loginResult', (data) => {
            if (data.success) {
                if (data.token) localStorage.setItem('panda_session_token', data.token);
                const u = data.username || data.nickname || data.account;
                if (u) {
                    localStorage.setItem('panda_session_user', u);
                    localStorage.setItem('sso_user', u);
                    localStorage.setItem('panda_auto_user', u);
                }
                const nick = data.nickname || data.username || u;
                if (nick) {
                    localStorage.setItem('sso_nickname', nick);
                    localStorage.setItem('panda_nickname', nick);
                }
                const av = data.avatarUrl || data.avatar;
                if (av) {
                    localStorage.setItem('panda_avatar', av);
                    localStorage.setItem('sso_avatar', av);
                }
                localStorage.setItem('panda_balance', data.pCoin || data.balance || 0);
                localStorage.setItem('sso_auth', 'true');
                renderUserUI(data);
            } else {
                if (!getStoredAuthData().isLogged) {
                    localStorage.removeItem('panda_session_token');
                    renderGuestUI();
                }
            }
        });

        socket.on('profileData', (data) => {
            if (data) {
                if (data.token) localStorage.setItem('panda_session_token', data.token);
                const u = data.username || data.account || data.nickname;
                if (u) {
                    localStorage.setItem('sso_user', u);
                    localStorage.setItem('panda_session_user', u);
                }
                const nick = data.nickname || data.username || u;
                if (nick) {
                    localStorage.setItem('sso_nickname', nick);
                    localStorage.setItem('panda_nickname', nick);
                }
                const av = data.avatarUrl || data.avatar;
                if (av) {
                    localStorage.setItem('sso_avatar', av);
                    localStorage.setItem('panda_avatar', av);
                }
                if (data.pCoin !== undefined) localStorage.setItem('panda_balance', data.pCoin);
                localStorage.setItem('sso_auth', 'true');
                renderUserUI(data);
            }
        });

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
        errorDiv.style.backgroundColor = '#d32f2f';
        errorDiv.style.color = 'white';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.padding = '5px';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.zIndex = '99999';
        errorDiv.innerText = '伺服器連線中或暫時離線，前台離線模式已啟動';
        document.body.appendChild(errorDiv);
        setTimeout(() => { if (errorDiv && errorDiv.parentNode) errorDiv.parentNode.removeChild(errorDiv); }, 5000);
    }
    
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
        
        const userNickname = data.nickname || localStorage.getItem('sso_nickname') || localStorage.getItem('panda_nickname') || data.username || data.account || localStorage.getItem('sso_user') || localStorage.getItem('panda_session_user') || '使用者';
        const userAvatar = data.avatarUrl || data.avatar || localStorage.getItem('sso_avatar') || localStorage.getItem('panda_avatar') || 'https://cdn.discordapp.com/embed/avatars/0.png';
        const balance = data.pCoin !== undefined ? data.pCoin : (data.balance !== undefined ? data.balance : (localStorage.getItem('panda_balance') || 0));
        
        const usernameEl = document.getElementById('nav-username');
        const avatarEl = document.getElementById('nav-avatar');
        if (usernameEl) {
            usernameEl.innerHTML = `<span class="user-nickname-text" style="display:inline-block;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle;">${userNickname}</span> <span style="margin-left: 8px; color: #ffb700; font-weight: bold; white-space: nowrap; display:inline-flex; align-items:center;"><img src="https://pandapanda6666.github.io/shop/coin.svg" style="width:16px;height:16px;margin-right:2px;" onerror="this.onerror=null; this.src='https://pandapanda6666.github.io/login-hub/pandacoin.png'" />${balance}</span>`;
        }
        if (avatarEl) {
            avatarEl.src = userAvatar;
        }
        
        const avatarContainer = document.querySelector('.avatar-container');
        if (avatarContainer && !avatarContainer.hasAttribute('data-sso-bound')) {
            avatarContainer.setAttribute('data-sso-bound', 'true');
            const currentUrlEnc = encodeURIComponent(window.location.href);
            const profileLink = avatarContainer.querySelector('a[href*="action=profile"]');
            if (profileLink) {
                profileLink.href = 'https://pandapanda6666.github.io/login-hub/?action=profile&from=' + currentUrlEnc;
            }
            const settingsLink = avatarContainer.querySelector('a[href*="action=settings"], a[href*="action=editProfile"]');
            if (settingsLink) {
                settingsLink.href = 'https://pandapanda6666.github.io/login-hub/?action=editProfile&from=' + currentUrlEnc;
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
