const fs = require('fs');
const filepath = "C:/Users/User/.gemini/antigravity/scratch/pandapanda6666.github.io/scratch/projects/editor/index.html";
let content = fs.readFileSync(filepath, 'utf8');

const startMarker = '<!-- PANDASCRATCH INJECT START -->';
const endMarker = '<!-- PANDASCRATCH INJECT END';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf('>', content.indexOf(endMarker)) + 1;

const newInject = `<!-- PANDASCRATCH INJECT START -->
<style>
div[class*="menu-bar_account-info-wrapper_"],
div[class*="menu-bar_account-info-group_"]:not(#custom-sso-nav-wrapper),
div[class*="menu-bar_login-button_"],
div[class*="menu-bar_register-button_"],
.panda-hidden-lang {
    display: none !important;
}

body.bear-style div[class*="green-flag_green-flag-wrapper_"]::after { 
    content: ''; position: absolute; top: -4px; width: 12px; height: 12px; 
    background-color: #81C784; border-radius: 50%; z-index: 10; border: 1.5px solid #4CAF50; 
}

body.high-contrast { filter: contrast(1.2) saturate(1.1); }

:root {
    --panda-green: #81C784;
    --panda-dark-green: #4CAF50;
}
div[class*="menu-bar_menu-bar_"],
[class*="button_mod-primary_"],
[class*="share-button_share-button_"],
[class*="community-button_community-button_"],
[class*="gui_extension-button_"],
[class*="action-menu_button_"],
[class*="action-menu_more-buttons_"],
[class*="react-tabs_react-tabs__tab--selected_"],
[class*="library-item_featured-extension-metadata_"],
.scratchCategoryMenuItem.categorySelected {
    background-color: var(--panda-green) !important;
}

[class*="menu-item_menu-item_"]:hover,
[class*="menu-item_hoverable_"]:hover,
[class*="menu_menu_"] li:hover,
[class*="context-menu_menu-item_"]:hover {
    background-color: var(--panda-green) !important;
    color: white !important;
}

[class*="sprite-selector-item_is-selected_"] {
    border-color: var(--panda-green) !important;
}
input:focus,
[class*="prompt_input_"]:focus,
[class*="input_input-form_"]:focus {
    border-color: var(--panda-green) !important;
    box-shadow: 0 0 0 4px rgba(129, 199, 132, 0.25) !important;
}

.panda-custom-menu {
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 15px;
    font-size: 0.85rem;
    font-weight: bold;
    color: white;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    transition: background-color 0.2s;
    user-select: none;
}
.panda-custom-menu:hover, .panda-custom-menu.active {
    background-color: rgba(0, 0, 0, 0.15);
}
.panda-dropdown {
    display: none;
    position: absolute;
    top: 100%;
    background: white;
    border: 1px solid rgba(0,0,0,0.15);
    border-top: none;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    min-width: 160px;
    padding: 0.25rem 0;
    margin: 0;
    list-style: none;
    z-index: 10001;
    color: #575E75;
}
.panda-dropdown.left { left: 0; }
.panda-dropdown.right { right: 0; }
.panda-custom-menu:hover .panda-dropdown, .panda-custom-menu.active .panda-dropdown {
    display: block;
}
.panda-dropdown li {
    padding: 10px 15px;
    font-weight: normal;
    font-size: 0.85rem;
    cursor: pointer;
}
.panda-dropdown li:hover {
    background-color: var(--panda-green) !important;
    color: white !important;
}
</style>
<script>
document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver((mutations) => {
        const menuBar = document.querySelector('.menu-bar_menu-bar_1gLUp') || document.querySelector('div[class*="menu-bar_menu-bar_"]');
        
        const logoImgs = document.querySelectorAll('img[class*="menu-bar_scratch-logo_"]');
        logoImgs.forEach(logoImg => {
            if (!logoImg.dataset.injected) {
                logoImg.dataset.injected = 'true';
                const wrapper = logoImg.closest('a') || logoImg.closest('div[class*="menu-bar_menu-bar-item_"]');
                if (wrapper) {
                    wrapper.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = 'https://pandapanda6666.github.io/scratch';
                    }, true);
                }
            }
        });
        
        const langMenu = document.querySelector('div[class*="menu-bar_language-menu_"]');
        if (langMenu && !langMenu.classList.contains('panda-hidden-lang') && !langMenu.dataset.active) {
            langMenu.classList.add('panda-hidden-lang');
        }

        if (menuBar && !document.getElementById('custom-sso-nav-wrapper')) {
            const authWrapper = document.createElement('div');
            authWrapper.id = 'custom-sso-nav-wrapper';
            authWrapper.style.cssText = 'display: flex; align-items: center; height: 100%; margin-left: auto; z-index: 10000; pointer-events: auto;';
            
            if (localStorage.getItem('sso_auth') === 'true' || localStorage.getItem('panda_session_token')) {
                const username = localStorage.getItem('panda_nickname') || localStorage.getItem('sso_nickname') || localStorage.getItem('panda_session_user') || '\u4f7f\u7528\u8005';
                let avatar = localStorage.getItem('panda_avatar');
                if (!avatar || avatar === 'undefined' || avatar === 'null') avatar = 'https://cdn.discordapp.com/embed/avatars/0.png';
                const balance = localStorage.getItem('panda_balance') || 0;
                
                authWrapper.innerHTML = `
                    <div class="panda-custom-menu" title="\u6211\u7684\u6771\u897f" onclick="window.location.href='/scratch/mystuff/'" style="padding: 0 10px;">
                        <img src="https://pandapanda6666.github.io/scratch/projects/editor/mystuff.png" style="width: 24px; filter: brightness(0) invert(1);" onerror="this.src='https://scratch.mit.edu/images/mystuff.png'" />
                    </div>
                    <div class="panda-custom-menu">
                        <img src="${avatar}" style="width:32px; height:32px; border-radius:50%; margin-right:8px; border:1px solid rgba(255,255,255,0.4); background:#fff; object-fit: cover;">
                        <span style="display: flex; align-items: center;">
                            ${username}
                            <span style="margin-left: 10px; color: gold; display: flex; align-items: center;">
                                <img src="https://pandapanda6666.github.io/shop/coin.svg" style="width:16px;height:16px;margin-right:2px;" onerror="this.onerror=null; this.src='https://pandapanda6666.github.io/login-hub/pandacoin.png'" />${balance}
                            </span>
                        </span>
                        <ul class="panda-dropdown right">
                            <li onclick="window.location.href='https://pandapanda6666.github.io/login-hub/?action=editProfile'">\u500b\u4eba\u8cc7\u6599</li>
                            <li onclick="window.location.href='/scratch/mystuff/'">\u6211\u7684\u6771\u897f</li>
                            <li onclick="window.location.href='/scratch/settings/'">\u5e33\u865f\u8a2d\u5b9a</li>
                            <hr style="margin: 5px 0; border: none; border-top: 1px solid rgba(0,0,0,0.15);">
                            <li onclick="logout()">\u767b\u51fa</li>
                        </ul>
                    </div>`;
            } else {
                authWrapper.innerHTML = `
                    <button onclick="window.location.href='https://pandapanda6666.github.io/login-hub/?action=login&from=' + encodeURIComponent(window.location.href)" style="background: transparent; color: white; border: 1px solid white; padding: 5px 15px; border-radius: 20px; font-weight: bold; cursor: pointer; margin-right: 10px;">\u767b\u5165</button>
                    <button onclick="window.location.href='https://pandapanda6666.github.io/login-hub/?action=register&from=' + encodeURIComponent(window.location.href)" style="background: white; color: #81C784; border: none; padding: 5px 15px; border-radius: 20px; font-weight: bold; cursor: pointer; margin-right: 15px;">\u52a0\u5165</button>`;
            }
            menuBar.appendChild(authWrapper);
        }

        if (langMenu && !document.getElementById('custom-settings-menu')) {
            const settingsDiv = document.createElement('div');
            settingsDiv.id = 'custom-settings-menu';
            settingsDiv.className = 'panda-custom-menu';
            
            const fileMenu = document.querySelector('div[class*="menu-bar_file-group_"] > div[class*="menu-bar_menu-bar-item_"]');
            if (fileMenu) {
                const baseClass = fileMenu.className.split(' ').find(c => c.includes('menu-bar_menu-bar-item_'));
                if (baseClass) settingsDiv.classList.add(baseClass);
            }
            
            let bearEnabled = localStorage.getItem('panda-bear-style') === 'true';
            let highContrast = localStorage.getItem('panda-high-contrast') === 'true';
            
            settingsDiv.innerHTML = `
                <span>\u8a2d\u5b9a</span>
                <ul class="panda-dropdown left">
                    <li id="btn-lang">\u8a9e\u8a00 (Language)</li>
                    <li id="btn-style">\u98a8\u683c (<span id="style-text">${bearEnabled ? '\u718a\u7a4d\u6728' : '\u666e\u901a'}</span>)</li>
                    <li id="btn-contrast">\u5c0d\u6bd4\u5ea6 (<span id="contrast-text">${highContrast ? '\u9ad8\u5c0d\u6bd4' : '\u539f\u59cb'}</span>)</li>
                </ul>`;
            
            langMenu.parentNode.insertBefore(settingsDiv, langMenu.nextSibling);
            
            document.getElementById('btn-lang').addEventListener('click', (e) => {
                e.stopPropagation();
                langMenu.dataset.active = "true";
                langMenu.classList.remove('panda-hidden-lang');
                const nativeBtn = langMenu.querySelector('button, div');
                if(nativeBtn) nativeBtn.click();
                else langMenu.click();
                
                const hideLang = () => {
                    setTimeout(() => {
                        langMenu.dataset.active = "";
                        langMenu.classList.add('panda-hidden-lang');
                        document.removeEventListener('click', hideLang);
                    }, 200);
                };
                document.addEventListener('click', hideLang);
            });
            
            if (bearEnabled) document.body.classList.add('bear-style');
            document.getElementById('btn-style').addEventListener('click', (e) => {
                e.stopPropagation();
                bearEnabled = !bearEnabled;
                localStorage.setItem('panda-bear-style', bearEnabled);
                if (bearEnabled) document.body.classList.add('bear-style');
                else document.body.classList.remove('bear-style');
                document.getElementById('style-text').innerText = bearEnabled ? '\u718a\u7a4d\u6728' : '\u666e\u901a';
            });
            
            if (highContrast) document.body.classList.add('high-contrast');
            document.getElementById('btn-contrast').addEventListener('click', (e) => {
                e.stopPropagation();
                highContrast = !highContrast;
                localStorage.setItem('panda-high-contrast', highContrast);
                if (highContrast) document.body.classList.add('high-contrast');
                else document.body.classList.remove('high-contrast');
                document.getElementById('contrast-text').innerText = highContrast ? '\u9ad8\u5c0d\u6bd4' : '\u539f\u59cb';
            });
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
});
function logout() {
    window.location.href = 'https://pandapanda6666.github.io/login-hub/?action=logout&from=' + encodeURIComponent(window.location.href);
}
</script>
<!-- PANDASCRATCH INJECT END -->`;

if (startIdx !== -1 && endIdx !== -1) {
    let newContent = content.substring(0, startIdx) + newInject + content.substring(endIdx);
    newContent = newContent.replace('v=67', 'v=68');
    fs.writeFileSync(filepath, newContent, 'utf8');
    console.log("Successfully fixed using pure ASCII Node.js script");
} else {
    console.log("Markers not found");
}
