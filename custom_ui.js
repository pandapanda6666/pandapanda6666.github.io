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
