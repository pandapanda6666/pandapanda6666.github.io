
// --- Domain Migration Check & Copyright Links (pandapanda6666.github.io -> pandapandaai.vercel.app) ---
(function() {
    function updateCopyrightLinks() {
        const newSiteUrl = 'https://pandapandaai.vercel.app/';
        const links = document.querySelectorAll('footer a, .copyright a, [data-i18n*="copyright"] a, [data-i18n*="footer"] a, #footer-copyright a');
        links.forEach(a => {
            const href = a.getAttribute('href');
            if (href === './' || href === '../' || href === '/' || (href && href.includes('pandapanda6666.github.io'))) {
                a.href = newSiteUrl;
                a.target = '_blank';
                a.rel = 'noopener';
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateCopyrightLinks);
    } else {
        updateCopyrightLinks();
    }

    if (window.location.hostname === 'pandapanda6666.github.io') {
        const newUrl = 'https://pandapandaai.vercel.app' + window.location.pathname + window.location.search + window.location.hash;

        function showFooterNewSiteButton() {
            let container = document.getElementById('footer-new-site-container') || document.getElementById('new-site-footer-btn-container');
            if (!container) {
                const footer = document.querySelector('footer') || document.body;
                container = document.createElement('div');
                container.id = 'footer-new-site-container';
                container.style.cssText = 'margin-top: 14px; text-align: center;';
                footer.appendChild(container);
            }
            container.style.display = 'block';
            if (!container.querySelector('a')) {
                container.innerHTML = '<a href="' + newUrl + '" id="footer-new-site-btn" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:6px; padding:7px 20px; background:#2c5e32; color:#ffffff !important; border-radius:24px; font-weight:bold; text-decoration:none !important; font-size:13px; border:1.5px solid #dde8d4; box-shadow:0 2px 6px rgba(0,0,0,0.15); transition:all 0.2s ease;">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>' +
                    '<span>切換到新網站 (pandapandaai.vercel.app)</span></a>';
            }
        }

        if (sessionStorage.getItem('migration_dismissed') === 'true') {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', showFooterNewSiteButton);
            } else {
                showFooterNewSiteButton();
            }
            return;
        }

        if (!document.getElementById('domain-migration-notice')) {
            const banner = document.createElement('div');
            banner.id = 'domain-migration-notice';
            banner.style.cssText = 'position:fixed; top:0; left:0; width:100%; background:#2c5e32; color:#ffffff; padding:12px 18px; font-size:14px; font-weight:bold; z-index:9999999; text-align:center; box-shadow:0 4px 15px rgba(0,0,0,0.3); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:12px;';
            
            banner.innerHTML = '<div style="display:flex; align-items:center; gap:8px;">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>' +
                '<span>官方網址已正式遷移至全新網域 <strong>pandapandaai.vercel.app</strong>，即將在 <strong id="migration-timer-count" style="color:#fef08a; font-size:16px;">5</strong> 秒後自動切換...</span>' +
                '</div>' +
                '<div style="display:flex; align-items:center; gap:8px;">' +
                '<button id="migration-confirm-btn" style="background:#10b981; color:#ffffff; border:none; padding:5px 15px; border-radius:18px; font-weight:bold; cursor:pointer; font-size:13px; transition:0.2s;">立即切換</button>' +
                '<button id="migration-cancel-btn" style="background:rgba(255,255,255,0.18); color:#ffffff; border:1px solid rgba(255,255,255,0.5); padding:5px 15px; border-radius:18px; font-weight:bold; cursor:pointer; font-size:13px; transition:0.2s;">取消 (留在本站)</button>' +
                '</div>';
            document.documentElement.appendChild(banner);

            let secondsLeft = 5;
            let timer = null;

            const doSwitch = function() {
                if (timer) clearInterval(timer);
                window.location.replace(newUrl);
            };

            const doCancel = function() {
                if (timer) clearInterval(timer);
                sessionStorage.setItem('migration_dismissed', 'true');
                banner.remove();
                showFooterNewSiteButton();
            };

            const confirmBtn = banner.querySelector('#migration-confirm-btn');
            const cancelBtn = banner.querySelector('#migration-cancel-btn');
            const timerSpan = banner.querySelector('#migration-timer-count');

            if (confirmBtn) confirmBtn.onclick = doSwitch;
            if (cancelBtn) cancelBtn.onclick = doCancel;

            timer = setInterval(function() {
                secondsLeft--;
                if (timerSpan) timerSpan.textContent = secondsLeft;
                if (secondsLeft <= 0) {
                    doSwitch();
                }
            }, 1000);
        }
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
// ----------------------------------------------
﻿const customUIStyles = `
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
document.head.insertAdjacentHTML('beforeend', customUIStyles);

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
        document.body.appendChild(overlay);
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
        document.body.appendChild(overlay);
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
        document.body.appendChild(overlay);
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

// Override native functions globally but wrap them in async (CAUTION: calling code must be modified if relying on synchronous returns)
window.alert = function(msg) { pandaAlert(msg); };
// confirm and prompt must be replaced by pandaConfirm and pandaPrompt in caller code directly
