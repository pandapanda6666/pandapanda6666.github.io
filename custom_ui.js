// =========================================================================
// PandaPanda 智慧網域橋接與全域導覽系統 (Smart Domain Bridge & Global Navigation)
// 舊網站: pandapanda6666.github.io
// 新網站: pandapandaai.vercel.app
// 本腳本設計為根目錄無關 (Root-Agnostic)，在任何子目錄皆可自動生效
// =========================================================================
(function() {
    'use strict';

    var OLD_HOST = 'pandapanda6666.github.io';
    var NEW_HOST = 'pandapandaai.vercel.app';
    var OLD_ORIGIN = 'https://' + OLD_HOST;
    var NEW_ORIGIN = 'https://' + NEW_HOST;

    var curHost = window.location.hostname;
    var isOld = (curHost === OLD_HOST);
    var isNew = (curHost === NEW_HOST);
    var isLocal = (curHost === 'localhost' || curHost === '127.0.0.1' || window.location.protocol === 'file:');

    // 支援以 URL 參數指定偏好，如 ?stay=old, ?from=new, ?stay=1
    var searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('stay') || searchParams.has('legacy') || searchParams.get('from') === 'new') {
        try {
            sessionStorage.setItem('prefer_legacy_site', 'true');
            localStorage.setItem('prefer_legacy_site', 'true');
        } catch(e) {}
    } else if (searchParams.get('prefer') === 'new' || searchParams.has('migrated')) {
        try {
            sessionStorage.removeItem('prefer_legacy_site');
            localStorage.removeItem('prefer_legacy_site');
        } catch(e) {}
    }

    var preferLegacy = false;
    try {
        preferLegacy = (sessionStorage.getItem('prefer_legacy_site') === 'true' || localStorage.getItem('prefer_legacy_site') === 'true');
    } catch(e) {}

    // 檢查是否從遷移而來（保留至記憶體供橫幅判定，隨後立即清理網址列）
    var hasMigratedParam = (searchParams.get('migrated') === '1' || searchParams.get('from') === 'legacy' || searchParams.get('from') === 'old');

    // ---------------------------------------------------------------------
    // 網址列參數立即清理機制 (保持標準乾淨路徑，避免殘留 ?migrated=1 等標記)
    // ---------------------------------------------------------------------
    function cleanMigrationParams() {
        try {
            if (window.history && window.history.replaceState) {
                var url = new URL(window.location.href);
                if (url.searchParams.has('migrated') || url.searchParams.has('from') || url.searchParams.has('prefer')) {
                    url.searchParams.delete('migrated');
                    url.searchParams.delete('from');
                    url.searchParams.delete('prefer');
                    var newSearch = url.searchParams.toString();
                    var cleanUrl = url.pathname + (newSearch ? ('?' + newSearch) : '') + url.hash;
                    window.history.replaceState({}, document.title, cleanUrl);
                }
            }
        } catch(e) {}
    }

    // 若當前已在新網站或非舊站環境，立即抹除 URL 上的遷移參數，讓網址列永遠保持標準乾淨路徑
    if (isNew || (!isOld && !isLocal)) {
        cleanMigrationParams();
    }

    // ---------------------------------------------------------------------
    // 1. 一進入立即重新導向不詢問 (舊網站 -> 新網站)
    // ---------------------------------------------------------------------
    // 檢查是否為搜尋引擎爬蟲 (Googlebot, Bingbot 等)：爬蟲免重定向，讓其完整抓取內容並依據 Canonical 正確索引新網域
    var isBot = /bot|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|facebookexternalhit|ia_archiver/i.test(navigator.userAgent || '');

    if (isOld && !preferLegacy && !isBot) {
        var targetSearch = new URLSearchParams(window.location.search);
        targetSearch.set('migrated', '1');
        var searchStr = targetSearch.toString();
        var targetUrl = NEW_ORIGIN + window.location.pathname + (searchStr ? ('?' + searchStr) : '') + window.location.hash;
        window.location.replace(targetUrl);
        return; // 立即終止後續解析，防畫面閃爍
    }

    // ---------------------------------------------------------------------
    // 2. 全域網站控制工具 (window.PandaSite)
    // ---------------------------------------------------------------------
    window.PandaSite = {
        isOldSite: isOld,
        isNewSite: isNew,
        isLocal: isLocal,
        oldOrigin: OLD_ORIGIN,
        newOrigin: NEW_ORIGIN,
        currentOrigin: window.location.origin,
        
        // 切換至舊網站
        switchToOldSite: function() {
            try {
                sessionStorage.setItem('prefer_legacy_site', 'true');
                localStorage.setItem('prefer_legacy_site', 'true');
            } catch(e) {}
            var s = new URLSearchParams(window.location.search);
            s.delete('migrated');
            s.set('stay', 'old');
            var sStr = s.toString();
            window.location.href = OLD_ORIGIN + window.location.pathname + (sStr ? ('?' + sStr) : '') + window.location.hash;
        },
        
        // 切換至新網站
        switchToNewSite: function() {
            try {
                sessionStorage.removeItem('prefer_legacy_site');
                localStorage.removeItem('prefer_legacy_site');
            } catch(e) {}
            var s = new URLSearchParams(window.location.search);
            s.delete('stay');
            s.set('migrated', '1');
            var sStr = s.toString();
            window.location.href = NEW_ORIGIN + window.location.pathname + (sStr ? ('?' + sStr) : '') + window.location.hash;
        }
    };

    // ---------------------------------------------------------------------
    // 3. 新網站：跳出「網站網址已搬遷」提示橫幅，提供回到舊網站按鈕
    // (僅在從舊官網重定向或帶參數進入新官網時才顯示，正常開啟絕對不顯示)
    // ---------------------------------------------------------------------
    function renderMigrationBanner() {
        if (!hasMigratedParam) {
            return; // 正常造訪新官網或站內點擊，絕對不顯示橫幅！
        }

        try {
            if (sessionStorage.getItem('migration_banner_dismissed') === 'true') {
                return;
            }
        } catch(e) {}

        if (document.getElementById('site-migration-banner')) return;

        var banner = document.createElement('div');
        banner.id = 'site-migration-banner';
        banner.setAttribute('role', 'alert');
        banner.style.cssText = [
            'position: fixed',
            'top: 0',
            'left: 0',
            'right: 0',
            'width: 100%',
            'background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
            'color: #ffffff',
            'padding: 8px 16px',
            'font-size: 13.5px',
            'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            'z-index: 9999999',
            'box-shadow: 0 4px 18px rgba(0,0,0,0.25)',
            'display: flex',
            'align-items: center',
            'justify-content: space-between',
            'flex-wrap: wrap',
            'gap: 10px',
            'box-sizing: border-box',
            'animation: bannerSlideDown 0.3s ease-out'
        ].join(';');

        banner.innerHTML = [
            '<style>',
            '@keyframes bannerSlideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }',
            '.migration-banner-btn { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 20px; font-size: 12.5px; font-weight: 600; cursor: pointer; text-decoration: none !important; transition: all 0.2s ease; border: none; }',
            '.migration-btn-return { background: rgba(255, 255, 255, 0.22); color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.55); }',
            '.migration-btn-return:hover { background: rgba(255, 255, 255, 0.35); transform: translateY(-1px); }',
            '.migration-btn-dismiss { background: #52b788; color: #081c15 !important; }',
            '.migration-btn-dismiss:hover { background: #74c69d; transform: translateY(-1px); }',
            '</style>',
            '<div style="display:flex; align-items:center; gap:8px; flex:1; min-width:260px;">',
            '  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">',
            '    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>',
            '    <line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line>',
            '  </svg>',
            '  <span><strong>網站網址已搬遷！</strong> 官方全新網址為 <strong>pandapandaai.vercel.app</strong>。</span>',
            '</div>',
            '<div style="display:flex; align-items:center; gap:8px;">',
            '  <button type="button" id="migration-return-btn" class="migration-banner-btn migration-btn-return" title="返回舊版網站 (GitHub Pages)">',
            '    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
            '      <line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>',
            '    </svg>',
            '    <span>回到舊網站</span>',
            '  </button>',
            '  <button type="button" id="migration-dismiss-btn" class="migration-banner-btn migration-btn-dismiss" title="我知道了，留在新版網站">',
            '    <span>我知道了</span>',
            '  </button>',
            '</div>'
        ].join('\n');

        (document.body || document.documentElement).appendChild(banner);

        // 避免遮蔽頂部導覽列：動態增加 body padding-top
        var bannerHeight = banner.offsetHeight || 44;
        var originalBodyPadTop = document.body ? document.body.style.paddingTop : '';
        if (document.body) {
            var curPad = parseInt(window.getComputedStyle(document.body).paddingTop || '0', 10);
            document.body.style.paddingTop = (curPad + bannerHeight) + 'px';
        }

        var returnBtn = banner.querySelector('#migration-return-btn');
        var dismissBtn = banner.querySelector('#migration-dismiss-btn');

        if (returnBtn) {
            returnBtn.addEventListener('click', function() {
                cleanMigrationParams();
                window.PandaSite.switchToOldSite();
            });
        }
        if (dismissBtn) {
            dismissBtn.addEventListener('click', function() {
                try {
                    sessionStorage.setItem('migration_banner_dismissed', 'true');
                } catch(e) {}
                cleanMigrationParams();
                if (document.body) {
                    document.body.style.paddingTop = originalBodyPadTop;
                }
                banner.style.animation = 'bannerSlideDown 0.25s ease-in reverse';
                setTimeout(function() { banner.remove(); }, 240);
            });
        }
    }

    // ---------------------------------------------------------------------
    // 4. 導覽列雙向動態切換按鈕 (自動偵測當前網域)
    // ---------------------------------------------------------------------
    function updateNavigationSwitch() {
        if (document.getElementById('site-nav-version-switch')) return;

        // 尋找導覽容器：優先相容官網首頁與各大子系統
        var mainNav = document.getElementById('mainNavBar');
        var langSelect = document.getElementById('siteLangSelect');
        var topNavControls = document.querySelector('.top-nav .nav-controls');
        var topNav = document.querySelector('.top-nav');
        var genericNav = document.querySelector('header nav') || document.querySelector('nav');

        var targetContainer = null;
        var insertBeforeNode = null;

        if (mainNav) {
            targetContainer = mainNav;
            insertBeforeNode = (langSelect && langSelect.parentNode === mainNav) ? langSelect : null;
        } else if (topNavControls) {
            targetContainer = topNavControls;
        } else if (topNav) {
            targetContainer = topNav;
        } else if (genericNav) {
            targetContainer = genericNav;
        } else {
            return;
        }

        var switchLink = document.createElement('a');
        switchLink.id = 'site-nav-version-switch';
        switchLink.className = 'pill-btn site-version-switch-btn';
        switchLink.style.cssText = [
            'display: inline-flex',
            'align-items: center',
            'gap: 6px',
            'text-decoration: none !important',
            'cursor: pointer',
            'font-weight: 600',
            'font-size: 13px',
            'padding: 5px 12px',
            'border-radius: 18px',
            'border: 1.5px solid #2e7d32',
            'background: rgba(46, 125, 50, 0.08)',
            'color: #1b4332 !important',
            'transition: all 0.2s ease',
            'margin: 0 4px',
            'white-space: nowrap'
        ].join(';');

        if (isNew || (!isOld && !isLocal)) {
            // 在新網站：導覽列顯示「舊網站」
            switchLink.title = '切換至舊網站 (pandapanda6666.github.io)';
            switchLink.href = 'javascript:void(0);';
            switchLink.innerHTML = [
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
                '  <polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>',
                '</svg>',
                '<span>舊網站</span>'
            ].join('');
            switchLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.PandaSite.switchToOldSite();
            });
        } else {
            // 在舊網站 (或本地)：導覽列顯示「新網站」
            switchLink.title = '切換至新網站 (pandapandaai.vercel.app)';
            switchLink.href = 'javascript:void(0);';
            switchLink.innerHTML = [
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
                '  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>',
                '  <polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>',
                '</svg>',
                '<span>新網站</span>'
            ].join('');
            switchLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.PandaSite.switchToNewSite();
            });
        }

        // 插入至指定位置
        if (insertBeforeNode) {
            targetContainer.insertBefore(switchLink, insertBeforeNode);
        } else {
            targetContainer.appendChild(switchLink);
        }
    }

    // ---------------------------------------------------------------------
    // 5. 全站網址智慧動態適應 (修復網址不完善問題，任何根目錄皆適用)
    // ---------------------------------------------------------------------
    function adaptAllPageUrls() {
        var currentOrigin = window.location.origin;
        var currentHost = window.location.hostname;

        // 若當前在 Vercel (新網站) 或其它網域：自動將頁面中所有寫死 pandapanda6666.github.io 的內部連結改寫為當前網域
        if (currentHost !== OLD_HOST) {
            var allLinks = document.querySelectorAll('a[href*="pandapanda6666.github.io"]');
            allLinks.forEach(function(a) {
                if (a.id === 'site-nav-version-switch' || a.id === 'migration-return-btn') return;
                try {
                    var parsed = new URL(a.href);
                    a.href = currentOrigin + parsed.pathname + parsed.search + parsed.hash;
                } catch(e) {}
            });
        }

        // 清理各子頁面舊版殘留的過期節點
        var oldContainer = document.getElementById('footer-new-site-container') || document.getElementById('new-site-footer-btn-container');
        if (oldContainer) oldContainer.remove();
        var oldNotice = document.getElementById('domain-migration-notice');
        if (oldNotice) oldNotice.remove();
    }

    // ---------------------------------------------------------------------
    // 初始化執行
    // ---------------------------------------------------------------------
    function init() {
        if (isNew || (!isOld && !isLocal)) {
            cleanMigrationParams();
        }
        renderMigrationBanner();
        updateNavigationSwitch();
        adaptAllPageUrls();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// --- Seeker Bear Video Fallback Helper ---
document.addEventListener("DOMContentLoaded", function() {
    const video = document.querySelector('.bear video');
    if (video) {
        let fallback = document.querySelector('.bear-fallback');
        if (!fallback) {
            fallback = document.createElement('div');
            fallback.className = 'bear-fallback';
            fallback.style.cssText = 'display:none; width:100%; height:100%; align-items:center; justify-content:center;';
            fallback.innerHTML = '<i class="fas fa-paw" style="font-size:28px; color:#4a6c42;"></i>';
            if (video.parentNode) video.parentNode.appendChild(fallback);
        }
        const triggerFb = () => {
            video.style.display = 'none';
            fallback.style.display = 'flex';
        };
        video.addEventListener('error', triggerFb);
        setTimeout(() => {
            if (!video.videoWidth || video.readyState === 0) {
                triggerFb();
            }
        }, 1200);
    }
});

// --- Device Fingerprinting for Online Users ---
function getSyncFingerprint() {
    let fp = "";
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125,1,62,20);
        ctx.fillStyle = "#069";
        ctx.fillText("Hello, world!", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("Hello, world!", 4, 17);
        fp += canvas.toDataURL() + "|||";
    } catch(e) {}
    fp += navigator.userAgent + "|||";
    fp += navigator.language + "|||";
    fp += screen.colorDepth + "|||";
    fp += screen.width + 'x' + screen.height + "|||";
    fp += new Date().getTimezoneOffset() + "|||";
    fp += navigator.hardwareConcurrency + "|||";
    fp += navigator.deviceMemory;
    
    let hash = 0;
    for (let i = 0; i < fp.length; i++) {
        const char = fp.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

if (window.io) {
    const originalIo = window.io;
    window.io = function(...args) {
        let url = args[0];
        let opts = args[1] || {};
        if (typeof url === 'object' && url !== null) {
            opts = url;
            url = undefined;
        }
        opts.query = opts.query || {};
        opts.query.deviceId = getSyncFingerprint();
        
        if (url !== undefined) {
            return originalIo.call(this, url, opts);
        } else {
            return originalIo.call(this, opts);
        }
    };
}

// --- Panda Modal System ---
const customUIStyles = `
<style>
.panda-modal-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.6); z-index: 999999;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.2s ease;
    backdrop-filter: blur(2px);
}
.panda-modal-overlay.active { opacity: 1; }
.panda-modal-box {
    background: white; padding: 25px 30px; border-radius: 16px;
    max-width: 400px; width: 90%; text-align: center;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    transform: translateY(20px) scale(0.95);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.panda-modal-overlay.active .panda-modal-box {
    transform: translateY(0) scale(1);
}
.panda-modal-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
.panda-modal-msg { font-size: 15px; color: #4b5563; margin-bottom: 20px; word-break: break-word; }
.panda-modal-input {
    width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px;
    margin-bottom: 20px; font-size: 15px; outline: none; transition: border 0.2s;
    box-sizing: border-box;
}
.panda-modal-input:focus { border-color: #10b981; }
.panda-modal-btns { display: flex; gap: 10px; justify-content: center; }
.panda-btn {
    padding: 8px 24px; border-radius: 20px; border: none; cursor: pointer;
    font-weight: bold; font-size: 14px; transition: 0.2s; flex: 1;
}
.panda-btn-primary { background: #10b981; color: white; }
.panda-btn-primary:hover { background: #059669; }
.panda-btn-secondary { background: #f3f4f6; color: #4b5563; }
.panda-btn-secondary:hover { background: #e5e7eb; }
</style>
`;
if (document.head) {
    document.head.insertAdjacentHTML('beforeend', customUIStyles);
} else {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.head) document.head.insertAdjacentHTML('beforeend', customUIStyles);
    });
}

window.pandaAlert = function(msg, title="提示") {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'panda-modal-overlay';
        overlay.innerHTML = `
            <div class="panda-modal-box">
                <div class="panda-modal-title">${title}</div>
                <div class="panda-modal-msg">${msg}</div>
                <div class="panda-modal-btns">
                    <button class="panda-btn panda-btn-primary">確定</button>
                </div>
            </div>
        `;
        (document.body || document.documentElement).appendChild(overlay);
        setTimeout(() => overlay.classList.add('active'), 10);
        
        const close = () => {
            overlay.classList.remove('active');
            setTimeout(() => { overlay.remove(); resolve(); }, 200);
        };
        overlay.querySelector('.panda-btn-primary').onclick = close;
    });
};

window.pandaConfirm = function(msg, title="請確認") {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'panda-modal-overlay';
        overlay.innerHTML = `
            <div class="panda-modal-box">
                <div class="panda-modal-title">${title}</div>
                <div class="panda-modal-msg">${msg}</div>
                <div class="panda-modal-btns">
                    <button class="panda-btn panda-btn-secondary" id="panda-cancel">取消</button>
                    <button class="panda-btn panda-btn-primary" id="panda-ok">確定</button>
                </div>
            </div>
        `;
        (document.body || document.documentElement).appendChild(overlay);
        setTimeout(() => overlay.classList.add('active'), 10);
        
        const close = (res) => {
            overlay.classList.remove('active');
            setTimeout(() => { overlay.remove(); resolve(res); }, 200);
        };
        overlay.querySelector('#panda-cancel').onclick = () => close(false);
        overlay.querySelector('#panda-ok').onclick = () => close(true);
    });
};

window.pandaPrompt = function(msg, defaultText="", title="請輸入") {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'panda-modal-overlay';
        overlay.innerHTML = `
            <div class="panda-modal-box">
                <div class="panda-modal-title">${title}</div>
                <div class="panda-modal-msg">${msg}</div>
                <input type="text" class="panda-modal-input" value="${defaultText}">
                <div class="panda-modal-btns">
                    <button class="panda-btn panda-btn-secondary" id="panda-cancel">取消</button>
                    <button class="panda-btn panda-btn-primary" id="panda-ok">確定</button>
                </div>
            </div>
        `;
        (document.body || document.documentElement).appendChild(overlay);
        setTimeout(() => {
            overlay.classList.add('active');
            overlay.querySelector('input').focus();
        }, 10);
        
        const close = (res) => {
            overlay.classList.remove('active');
            setTimeout(() => { overlay.remove(); resolve(res); }, 200);
        };
        overlay.querySelector('#panda-cancel').onclick = () => close(null);
        overlay.querySelector('#panda-ok').onclick = () => {
            close(overlay.querySelector('input').value);
        };
        overlay.querySelector('input').onkeydown = (e) => {
            if(e.key === 'Enter') close(overlay.querySelector('input').value);
            if(e.key === 'Escape') close(null);
        };
    });
};

// Override native functions globally
window.alert = function(msg) { pandaAlert(msg); };
