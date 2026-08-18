const fs = require('fs');

function fix() {
    let html = fs.readFileSync('Edit/Video/Add subtitles/index.html', 'utf-8');

    // 1. Remove Firebase
    // Remove the firebase module imports
    html = html.replace(/import \{ initializeApp \} from "https:\/\/www\.gstatic\.com\/firebasejs\/.*?\n.*?\n.*?\n/, '');
    
    // Remove firebase init block
    html = html.replace(/let app, auth, db, appId, currentUser = null;[\s\S]*?\}\s*catch\s*\(error\)\s*\{\s*console\.warn\("Firebase init failed.*?"\);\s*\}/, 'let currentUser = null;');

    // In saveCurrentProject, remove firebase save
    html = html.replace(/let cloudMsg = "";[\s\S]*?if\s*\(currentUser\s*&&\s*db\)\s*\{[\s\S]*?catch\s*\(err\)\s*\{[\s\S]*?\}\s*\}/, 'let cloudMsg = "";');

    // In loadProjectsList, remove firebase load
    html = html.replace(/\/\/ 2\. 獲取雲端專案 \(如果連線\)[\s\S]*?if\s*\(currentUser\s*&&\s*db\)\s*\{[\s\S]*?catch\s*\(e\)\s*\{[\s\S]*?\}\s*\}/, '');

    // In delete, remove firebase delete
    html = html.replace(/\/\/ 2\. 刪除雲端[\s\S]*?if\s*\(currentUser\s*&&\s*db\)\s*\{[\s\S]*?catch\(err\)\s*\{[\s\S]*?\}\s*\}/, '');

    // 2. Fix Outline issue (-webkit-text-stroke)
    html = html.replace(/if\s*\(sub\.outlineWidth\s*>\s*0\)\s*\{[\s\S]*?div\.style\.textShadow\s*=\s*.*?;[\s\S]*?\}/, 
    if (sub.outlineWidth > 0) {
                    let oc = hexToRgba(sub.outlineColor || '#000000', sub.outlineAlpha !== undefined ? sub.outlineAlpha : 1);
                    div.style.webkitTextStroke = \\px \\;
                });

    // 3 & 4. Sliders with numeric inputs & Position X,Y
    // Replace the Style Panel
    const oldStylePanelRegex = /<div id="stylePanel"[\s\S]*?<\/div>\s*<\/div>\s*<div id="multiEditor"/;
    const newStylePanel = <!-- Style Panel -->
                <div id="stylePanel" class="mt-6 border-t border-slate-600 pt-4 hidden">
                    <h3 class="text-sm font-semibold text-purple-300 mb-3">字體與背景樣式</h3>
                    <div class="flex gap-2 mb-4">
                        <label class="text-xs text-slate-300 flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="applyTarget" value="single" checked class="form-radio text-blue-500"> 僅套用單一
                        </label>
                        <label class="text-xs text-slate-300 flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="applyTarget" value="all" class="form-radio text-blue-500"> 套用至全部
                        </label>
                    </div>

                    <div class="style-group">
                        <h4>位置 (中心為0, 基準: 1920x1080)</h4>
                        <div class="setting-row">
                            <label>X 座標</label>
                            <input type="number" id="sty_posX" value="0">
                        </div>
                        <div class="setting-row">
                            <label>Y 座標</label>
                            <input type="number" id="sty_posY" value="432"> <!-- 預設底部附近 (0.9 - 0.5) * 1080 = 432 -->
                        </div>
                    </div>

                    <div class="style-group">
                        <h4>文字設定</h4>
                        <div class="setting-row">
                            <label>大小</label>
                            <input type="number" id="sty_fontSize" value="32" min="10" max="200">
                        </div>
                        <div class="setting-row">
                            <label>顏色 1</label>
                            <input type="color" id="sty_color1" value="#ffffff">
                        </div>
                        <div class="setting-row">
                            <label>顏色 2 (漸層)</label>
                            <input type="color" id="sty_color2" value="#ffffff">
                        </div>
                        <div class="setting-row">
                            <label>透明度</label>
                            <div class="flex items-center gap-2 w-full">
                                <input type="range" id="sty_textAlpha" min="0" max="1" step="0.1" value="1">
                                <input type="number" id="sty_textAlpha_num" class="w-16" min="0" max="1" step="0.1" value="1">
                            </div>
                        </div>
                        <div class="setting-row">
                            <label>粗體</label>
                            <input type="checkbox" id="sty_bold" class="w-4 h-4">
                        </div>
                    </div>

                    <div class="style-group">
                        <h4>外框設定</h4>
                        <div class="setting-row">
                            <label>粗細</label>
                            <div class="flex items-center gap-2 w-full">
                                <input type="range" id="sty_outlineWidth" min="0" max="20" step="1" value="2">
                                <input type="number" id="sty_outlineWidth_num" class="w-16" min="0" max="20" step="1" value="2">
                            </div>
                        </div>
                        <div class="setting-row">
                            <label>顏色</label>
                            <input type="color" id="sty_outlineColor" value="#000000">
                        </div>
                        <div class="setting-row">
                            <label>透明度</label>
                            <div class="flex items-center gap-2 w-full">
                                <input type="range" id="sty_outlineAlpha" min="0" max="1" step="0.1" value="1">
                                <input type="number" id="sty_outlineAlpha_num" class="w-16" min="0" max="1" step="0.1" value="1">
                            </div>
                        </div>
                    </div>

                    <div class="style-group">
                        <h4>背景設定</h4>
                        <div class="setting-row">
                            <label>顏色 1</label>
                            <input type="color" id="sty_bgColor1" value="#000000">
                        </div>
                        <div class="setting-row">
                            <label>顏色 2 (漸層)</label>
                            <input type="color" id="sty_bgColor2" value="#000000">
                        </div>
                        <div class="setting-row">
                            <label>透明度</label>
                            <div class="flex items-center gap-2 w-full">
                                <input type="range" id="sty_bgAlpha" min="0" max="1" step="0.1" value="0.5">
                                <input type="number" id="sty_bgAlpha_num" class="w-16" min="0" max="1" step="0.1" value="0.5">
                            </div>
                        </div>
                        <div class="setting-row">
                            <label>圓角</label>
                            <div class="flex items-center gap-2 w-full">
                                <input type="range" id="sty_borderRadius" min="0" max="50" step="1" value="4">
                                <input type="number" id="sty_borderRadius_num" class="w-16" min="0" max="50" step="1" value="4">
                            </div>
                        </div>
                    </div>
                </div>

                <div id="multiEditor";
    html = html.replace(oldStylePanelRegex, newStylePanel);

    // Update sync logic in updateEditor()
    html = html.replace(/document\.getElementById\('sty_borderRadius'\)\.value = sub\.borderRadius \|\| 4;/, 
        \document.getElementById('sty_borderRadius').value = sub.borderRadius || 4;
                    document.getElementById('sty_textAlpha_num').value = document.getElementById('sty_textAlpha').value;
                    document.getElementById('sty_outlineWidth_num').value = document.getElementById('sty_outlineWidth').value;
                    document.getElementById('sty_outlineAlpha_num').value = document.getElementById('sty_outlineAlpha').value;
                    document.getElementById('sty_bgAlpha_num').value = document.getElementById('sty_bgAlpha').value;
                    document.getElementById('sty_borderRadius_num').value = document.getElementById('sty_borderRadius').value;
                    document.getElementById('sty_posX').value = Math.round(((sub.posX !== undefined ? sub.posX : 0.5) - 0.5) * 1920);
                    document.getElementById('sty_posY').value = Math.round(((sub.posY !== undefined ? sub.posY : 0.9) - 0.5) * 1080);\);

    // Update logic script
    const logicScriptMod = \
        const styleInputs = [
            'sty_fontSize', 'sty_color1', 'sty_color2', 'sty_textAlpha', 'sty_textAlpha_num', 'sty_bold',
            'sty_outlineWidth', 'sty_outlineWidth_num', 'sty_outlineColor', 'sty_outlineAlpha', 'sty_outlineAlpha_num',
            'sty_bgColor1', 'sty_bgColor2', 'sty_bgAlpha', 'sty_bgAlpha_num', 'sty_borderRadius', 'sty_borderRadius_num',
            'sty_posX', 'sty_posY'
        ];
        
        function applyStyleToSub(sub) {
            sub.fontSize = parseInt(document.getElementById('sty_fontSize').value);
            sub.color1 = document.getElementById('sty_color1').value;
            sub.color2 = document.getElementById('sty_color2').value;
            sub.textAlpha = parseFloat(document.getElementById('sty_textAlpha').value);
            sub.bold = document.getElementById('sty_bold').checked;
            sub.outlineWidth = parseInt(document.getElementById('sty_outlineWidth').value);
            sub.outlineColor = document.getElementById('sty_outlineColor').value;
            sub.outlineAlpha = parseFloat(document.getElementById('sty_outlineAlpha').value);
            sub.bgColor1 = document.getElementById('sty_bgColor1').value;
            sub.bgColor2 = document.getElementById('sty_bgColor2').value;
            sub.bgAlpha = parseFloat(document.getElementById('sty_bgAlpha').value);
            sub.borderRadius = parseInt(document.getElementById('sty_borderRadius').value);
            
            let cx = parseFloat(document.getElementById('sty_posX').value) || 0;
            let cy = parseFloat(document.getElementById('sty_posY').value) || 0;
            sub.posX = (cx / 1920) + 0.5;
            sub.posY = (cy / 1080) + 0.5;
        }

        function syncSliders(id, val) {
            if (id.endsWith('_num')) {
                const base = id.replace('_num', '');
                if (document.getElementById(base)) document.getElementById(base).value = val;
            } else {
                const num = id + '_num';
                if (document.getElementById(num)) document.getElementById(num).value = val;
            }
        }
\;

    html = html.replace(/const styleInputs = \[[\s\S]*?function applyStyleToSub\(sub\) \{[\s\S]*?\}\s*styleInputs\.forEach/, logicScriptMod + '\n\n        styleInputs.forEach');
    
    html = html.replace(/el\.addEventListener\('input', \(\) => \{/, \el.addEventListener('input', (e) => {
                    syncSliders(id, e.target.value);\);

    // 5. FFmpeg CDN change
    html = html.replace(/https:\/\/unpkg\.com\/@ffmpeg\/ffmpeg@0\.11\.8\/dist\/ffmpeg\.min\.js/, "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.8/dist/ffmpeg.min.js");

    // Inside FFmpeg Export logic, change const { createFFmpeg } = FFmpeg; to avoid undefined error. Wait, if it's undefined, we can load it dynamically or alert user to check network.
    // Let's dynamically inject the script if it's undefined.
    const ffmpegLoadLogic = \
                if (typeof FFmpeg === 'undefined') {
                    showToast("FFmpeg 引擎正在載入，請稍候...");
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.8/dist/ffmpeg.min.js';
                        script.onload = resolve;
                        script.onerror = () => reject(new Error('無法載入 FFmpeg 腳本'));
                        document.head.appendChild(script);
                    });
                }
                if (!window.ffmpeg) {
                    const { createFFmpeg } = FFmpeg;
                    window.ffmpeg = createFFmpeg({ 
                        log: true,
                        corePath: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
                    });\;
    html = html.replace(/if \(!window\.ffmpeg\) \{\s*const \{ createFFmpeg \} = FFmpeg;\s*window\.ffmpeg = createFFmpeg\(\{[\s\S]*?\}\);/, ffmpegLoadLogic);


    fs.writeFileSync('Edit/Video/Add subtitles/index.html', html, 'utf-8');
}

fix();