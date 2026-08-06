// Scratch SSO Integration
document.addEventListener('DOMContentLoaded', () => {
    // 1. 橋接 panda_sso.js 與 Scratch React DOM
    const observer = new MutationObserver(() => {
        const accountGroup = document.querySelector('div[class*="menu-bar_account-info-group"]');
        if (accountGroup && !document.getElementById('panda-sso-integrated')) {
            // 清除原生的按鈕
            accountGroup.innerHTML = '';
            accountGroup.style.display = 'flex';
            accountGroup.style.alignItems = 'center';
            accountGroup.style.gap = '10px';
            
            // 注入我們的 SSO 結構
            const ssoDiv = document.createElement('div');
            ssoDiv.id = 'panda-sso-integrated';
            ssoDiv.style.display = 'flex';
            ssoDiv.style.alignItems = 'center';
            ssoDiv.style.gap = '10px';
            ssoDiv.innerHTML = 
                <!-- 雲端專案按鈕 -->
                <div id="cloud-manager-btn" style="cursor:pointer; display:flex; align-items:center; justify-content:center; width:32px; height:32px; background:rgba(0,0,0,0.1); border-radius:50%; margin-right:10px;" title="我的雲端專案">
                    <img src="https://pandapanda6666.github.io/scratch/projects/editor/mystuff.svg" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'white\'><path d=\'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z\'/></svg>'" style="width:20px; height:20px; filter: brightness(0) invert(1);">
                </div>
                <!-- SSO Auth Actions (Guest) -->
                <div id="auth-actions" style="display:none; align-items:center;">
                    <span style="cursor:pointer; color:white; font-weight:bold; font-size:12px; padding:5px 10px; background:rgba(0,0,0,0.1); border-radius:4px;" onclick="window.location.href='https://pandapanda6666.github.io/login-hub/?require=1&from='+encodeURIComponent(window.location.href)">登入 / 註冊</span>
                </div>
                <!-- SSO User Menu (Logged In) -->
                <div id="user-menu" style="display:none; align-items:center; gap:8px; cursor:pointer;" onclick="window.location.href='https://pandapanda6666.github.io/login-hub/?from='+encodeURIComponent(window.location.href)">
                    <img id="nav-avatar" src="" style="width:32px; height:32px; border-radius:50%; object-fit:cover; border:2px solid rgba(255,255,255,0.5);">
                    <div id="nav-username" style="font-weight:bold; color:white; display:flex; flex-direction:column; line-height:1.2; font-size:12px;"></div>
                </div>
            ;
            accountGroup.appendChild(ssoDiv);
            
            // 由於 panda_sso.js 可能已經跑完，我們手動更新一次介面
            const authData = getAuthData();
            if (authData.isLogged) {
                document.getElementById('auth-actions').style.display = 'none';
                document.getElementById('user-menu').style.display = 'flex';
                document.getElementById('nav-avatar').src = authData.avatarUrl;
                document.getElementById('nav-username').innerHTML = <span style="max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">\</span><span style="color:#ffdd59;display:flex;align-items:center;"><img src="https://pandapanda6666.github.io/shop/coin.svg" style="width:12px;height:12px;margin-right:2px;" onerror="this.src='https://pandapanda6666.github.io/login-hub/pandacoin.png'"> \</span>;
            } else {
                document.getElementById('auth-actions').style.display = 'flex';
                document.getElementById('user-menu').style.display = 'none';
            }
            
            // 綁定雲端專案管理按鈕
            document.getElementById('cloud-manager-btn').addEventListener('click', openCloudManager);
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    function getAuthData() {
        const username = localStorage.getItem('sso_user') || localStorage.getItem('panda_session_user') || localStorage.getItem('panda_auto_user') || '使用者';
        const nickname = localStorage.getItem('sso_nickname') || localStorage.getItem('panda_nickname') || username;
        const avatar = localStorage.getItem('sso_avatar') || localStorage.getItem('panda_avatar') || 'https://cdn.discordapp.com/embed/avatars/0.png';
        const balance = localStorage.getItem('panda_balance') || 0;
        const isLogged = localStorage.getItem('sso_auth') === 'true' || localStorage.getItem('panda_session_token');
        return { username, nickname, avatarUrl: avatar, pCoin: balance, isLogged };
    }
    
    // 2. 雲端專案管理系統
    function openCloudManager() {
        const authData = getAuthData();
        if (!authData.isLogged) {
            alert("請先登入才能使用雲端專案功能！");
            return;
        }
        
        let modal = document.getElementById('cloud-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'cloud-modal';
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:9999999; display:flex; align-items:center; justify-content:center;';
            modal.innerHTML = 
                <div style="background:white; width:600px; max-width:90%; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.5); display:flex; flex-direction:column;">
                    <div style="background:#4b97ff; color:white; padding:15px 20px; display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="margin:0; font-size:18px;">☁️ 我的雲端專案</h2>
                        <button id="cloud-modal-close" style="background:none; border:none; color:white; font-size:24px; cursor:pointer;">&times;</button>
                    </div>
                    <div style="padding:20px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee;">
                        <span>點擊專案進行載入。</span>
                        <button id="cloud-modal-new" style="background:#2ed573; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold;">➕ 儲存當前進度為新專案</button>
                    </div>
                    <div id="cloud-projects-list" style="padding:20px; max-height:400px; overflow-y:auto; display:flex; flex-direction:column; gap:10px;">
                        <div style="text-align:center; color:#888;">載入中...</div>
                    </div>
                </div>
            ;
            document.body.appendChild(modal);
            
            document.getElementById('cloud-modal-close').onclick = () => { modal.style.display = 'none'; };
            document.getElementById('cloud-modal-new').onclick = saveAsNewProject;
        }
        
        modal.style.display = 'flex';
        loadProjectList();
    }
    
    function getIndexAppId() {
        return 'PandaScratch_Index_' + getAuthData().username;
    }
    
    function loadProjectList() {
        const listDiv = document.getElementById('cloud-projects-list');
        listDiv.innerHTML = '<div style="text-align:center; color:#888;">載入中...</div>';
        
        if (typeof window.socket === 'undefined' || !window.socket.connected) {
            listDiv.innerHTML = '<div style="text-align:center; color:#ff4757;">伺服器未連線，無法取得雲端專案！</div>';
            return;
        }
        
        window.socket.emit('getAppData', { appId: getIndexAppId() }, (res) => {
            if (res && res.data && res.data.projects) {
                renderProjectList(res.data.projects);
            } else {
                renderProjectList([]);
            }
        });
    }
    
    function renderProjectList(projects) {
        const listDiv = document.getElementById('cloud-projects-list');
        listDiv.innerHTML = '';
        
        if (projects.length === 0) {
            listDiv.innerHTML = '<div style="text-align:center; color:#888;">您還沒有儲存任何雲端專案！</div>';
            return;
        }
        
        // 將專案依時間反序排列
        projects.sort((a,b) => b.timestamp - a.timestamp);
        
        projects.forEach(p => {
            const item = document.createElement('div');
            item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px 15px; background:#f1f2f6; border-radius:8px;';
            item.innerHTML = 
                <div>
                    <div style="font-weight:bold; color:#2f3542; font-size:16px;">\</div>
                    <div style="font-size:12px; color:#747d8c;">\</div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="btn-load-proj" data-id="\" style="background:#1e90ff; color:white; border:none; padding:5px 15px; border-radius:4px; cursor:pointer;">讀取</button>
                    <button class="btn-save-proj" data-id="\" data-name="\" style="background:#ffa502; color:white; border:none; padding:5px 15px; border-radius:4px; cursor:pointer;">覆寫存檔</button>
                    <button class="btn-del-proj" data-id="\" style="background:#ff4757; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">刪除</button>
                </div>
            ;
            listDiv.appendChild(item);
        });
        
        document.querySelectorAll('.btn-load-proj').forEach(btn => {
            btn.onclick = () => loadProject(btn.getAttribute('data-id'));
        });
        document.querySelectorAll('.btn-save-proj').forEach(btn => {
            btn.onclick = () => overwriteProject(btn.getAttribute('data-id'), btn.getAttribute('data-name'));
        });
        document.querySelectorAll('.btn-del-proj').forEach(btn => {
            btn.onclick = () => deleteProject(btn.getAttribute('data-id'));
        });
    }
    
    function saveAsNewProject() {
        const name = prompt("請輸入新專案名稱：", "未命名專案");
        if (!name) return;
        
        const newId = 'proj_' + Math.random().toString(36).substr(2, 9);
        
        // 準備好 ID，請使用者從選單點擊「儲存到你的電腦」
        window.isCloudSaving = true;
        window.currentCloudProjectId = newId;
        window.currentCloudProjectName = name;
        
        document.getElementById('cloud-modal').style.display = 'none';
        alert("✅ 雲端儲存模式已啟動！\n\n請至左上角的【檔案】選單中點選【儲存到你的電腦】，系統會自動攔截並上傳至雲端！");
    }
    
    function overwriteProject(id, name) {
        if (!confirm(確定要將目前的進度覆寫至「\」嗎？)) return;
        
        window.isCloudSaving = true;
        window.currentCloudProjectId = id;
        window.currentCloudProjectName = name;
        
        document.getElementById('cloud-modal').style.display = 'none';
        alert("✅ 雲端儲存模式已啟動！\n\n請至左上角的【檔案】選單中點選【儲存到你的電腦】，系統會自動上傳並覆寫！");
    }
    
    function loadProject(id) {
        document.getElementById('cloud-modal').style.display = 'none';
        
        window.socket.emit('getAppData', { appId: 'PandaScratch_Proj_' + id }, (res) => {
            if (res && res.data && res.data.projectBase64) {
                // 提供給 PandaGuard 載入
                const byteCharacters = atob(res.data.projectBase64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], {type: 'application/x.scratch.sb3'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = "CloudSave_PandaScratch.sb3";
                a.click();
                URL.revokeObjectURL(url);
                alert("雲端專案已下載！請至上方【檔案】->【從你的電腦挑選】進行匯入。");
                
                // 更新網址列
                const urlParams = new URLSearchParams(window.location.search);
                urlParams.set('id', id);
                let newUrl = window.location.pathname + '?' + urlParams.toString();
                if (window.history.replaceState) window.history.replaceState({}, document.title, newUrl);
            } else {
                alert("載入失敗：找不到專案資料。");
            }
        });
    }
    
    function deleteProject(id) {
        if (!confirm("確定要刪除這個專案嗎？此操作無法還原！")) return;
        
        window.socket.emit('getAppData', { appId: getIndexAppId() }, (res) => {
            let projects = [];
            if (res && res.data && res.data.projects) projects = res.data.projects;
            
            projects = projects.filter(p => p.id !== id);
            
            window.socket.emit('saveAppData', { 
                appId: getIndexAppId(), 
                data: { projects: projects } 
            }, () => {
                // 同時清空專案實體
                window.socket.emit('saveAppData', { appId: 'PandaScratch_Proj_' + id, data: null });
                loadProjectList();
            });
        });
    }
    
    // 暴露給 panda_guard.js 呼叫的更新清單方法
    window.updateCloudProjectIndex = function(id, name) {
        window.socket.emit('getAppData', { appId: getIndexAppId() }, (res) => {
            let projects = [];
            if (res && res.data && res.data.projects) projects = res.data.projects;
            
            const existingIndex = projects.findIndex(p => p.id === id);
            if (existingIndex >= 0) {
                projects[existingIndex].timestamp = Date.now();
                if (name) projects[existingIndex].name = name;
            } else {
                projects.push({ id: id, name: name, timestamp: Date.now() });
            }
            
            window.socket.emit('saveAppData', { 
                appId: getIndexAppId(), 
                data: { projects: projects } 
            });
        });
    };
});
