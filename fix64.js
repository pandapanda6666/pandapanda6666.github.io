const fs = require('fs');

function fix() {
    let path = 'C:/Users/User/.gemini/antigravity/scratch/pandapanda6666.github.io/Edit/Video/Add subtitles/index.html';
    let html = fs.readFileSync(path, 'utf-8');

    // 1. Update window.defaultSubtitleStyle to use outlines array
    html = html.replace(/outlineWidth: 2, outlineColor: '#000000', outlineAlpha: 1,/, 
        outlines: [{width: 2, color: '#000000', alpha: 1}],);

    // 2. Replace the HTML UI for outlines
    const outlineUiRegex = /<div class="style-group">\s*<h4>外框設定<\/h4>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<div class="style-group">\s*<h4>背景設定<\/h4>/;
    const newOutlineUi = <div class="style-group">
                        <div class="flex justify-between items-center mb-2">
                            <h4>外框設定</h4>
                            <button id="btnAddOutline" class="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-white">+ 新增外框</button>
                        </div>
                        <div id="outlineList" class="space-y-2">
                            <!-- Outlines injected here -->
                        </div>
                    </div>

                    <div class="style-group">
                        <h4>背景設定</h4>;
    html = html.replace(outlineUiRegex, newOutlineUi);

    // 3. Remove old styleInputs outline keys
    html = html.replace(/'sty_outlineWidth', 'sty_outlineWidth_num', 'sty_outlineColor', 'sty_outlineAlpha', 'sty_outlineAlpha_num',/, '');

    // 4. Update the syncing and logic
    const applyLogicOld = /function applyStyleToSub\(sub\) \{[\s\S]*?sub\.posY = \(cy \/ 1080\) \+ 0\.5;\s*\}/;
    const applyLogicNew = unction applyStyleToSub(sub) {
            sub.fontSize = parseInt(document.getElementById('sty_fontSize').value);
            sub.color1 = document.getElementById('sty_color1').value;
            sub.color2 = document.getElementById('sty_color2').value;
            sub.textAlpha = parseFloat(document.getElementById('sty_textAlpha').value);
            sub.bold = document.getElementById('sty_bold').checked;
            sub.bgColor1 = document.getElementById('sty_bgColor1').value;
            sub.bgColor2 = document.getElementById('sty_bgColor2').value;
            sub.bgAlpha = parseFloat(document.getElementById('sty_bgAlpha').value);
            sub.borderRadius = parseInt(document.getElementById('sty_borderRadius').value);
            
            let cx = parseFloat(document.getElementById('sty_posX').value) || 0;
            let cy = parseFloat(document.getElementById('sty_posY').value) || 0;
            sub.posX = (cx / 1920) + 0.5;
            sub.posY = (cy / 1080) + 0.5;
            
            // Outlines are synced via renderOutlineList UI directly
        };
    html = html.replace(applyLogicOld, applyLogicNew);

    // 5. In btnEditDefaultStyle click listener, change outline assignments to outline renderer
    const defaultFillRegex = /document\.getElementById\('sty_outlineWidth'\)\.value = def\.outlineWidth;\s*document\.getElementById\('sty_outlineColor'\)\.value = def\.outlineColor;\s*document\.getElementById\('sty_outlineAlpha'\)\.value = def\.outlineAlpha;/;
    html = html.replace(defaultFillRegex, window.currentEditingOutlines = JSON.parse(JSON.stringify(def.outlines || [])); renderOutlineList(););
    
    // Fix the numbers sync in btnEditDefaultStyle
    html = html.replace(/\['sty_textAlpha', 'sty_outlineWidth', 'sty_outlineAlpha', 'sty_bgAlpha', 'sty_borderRadius'\]/, 
        ['sty_textAlpha', 'sty_bgAlpha', 'sty_borderRadius']);

    // 6. In btnApplyAllStyles, handle outlines
    html = html.replace(/s\.outlineWidth = refSub\.outlineWidth;\s*s\.outlineColor = refSub\.outlineColor;\s*s\.outlineAlpha = refSub\.outlineAlpha;/, 
        s.outlines = JSON.parse(JSON.stringify(refSub.outlines || [])););
    html = html.replace(/outlineWidth: refSub\.outlineWidth, outlineColor: refSub\.outlineColor, outlineAlpha: refSub\.outlineAlpha,/, 
        outlines: JSON.parse(JSON.stringify(refSub.outlines || [])),);

    // 7. Inject renderOutlineList and D&D logic and Outline UI listeners
    const outlineScript = 
        window.currentEditingOutlines = [];
        
        function getActiveSubtitleForOutlines() {
            if (window.isEditingDefault) return window.defaultSubtitleStyle;
            if (window.selectedSubtitleIds && window.selectedSubtitleIds.size > 0) {
                return window.subtitles.find(s => s.id === Array.from(window.selectedSubtitleIds)[0]);
            }
            return null;
        }

        function triggerOutlineUpdate() {
            const active = getActiveSubtitleForOutlines();
            if (active) {
                active.outlines = JSON.parse(JSON.stringify(window.currentEditingOutlines));
                if (!window.isEditingDefault && window.selectedSubtitleIds) {
                    // Sync to all selected
                    window.selectedSubtitleIds.forEach(id => {
                        const s = window.subtitles.find(sub => sub.id === id);
                        if (s) s.outlines = JSON.parse(JSON.stringify(window.currentEditingOutlines));
                    });
                }
                if (window.renderCanvasOverlay) window.renderCanvasOverlay();
            }
        }

        window.renderOutlineList = function() {
            const list = document.getElementById('outlineList');
            list.innerHTML = '';
            window.currentEditingOutlines.forEach((ol, index) => {
                const el = document.createElement('div');
                el.className = "p-2 bg-slate-800 rounded border border-slate-600 flex flex-col gap-2 relative group";
                el.draggable = true;
                el.dataset.idx = index;
                el.innerHTML = \
                    <div class="flex items-center justify-between cursor-move bg-slate-700 -mx-2 -mt-2 p-1 rounded-t">
                        <span class="text-slate-300 text-xs font-bold px-1 select-none">≡ 外框 \ (層級：\)</span>
                        <button class="text-red-400 hover:text-red-300 text-xs px-2" onclick="removeOutline(\)">✕</button>
                    </div>
                    <div class="setting-row mt-1">
                        <label>延伸粗細</label>
                        <div class="flex items-center gap-2 w-full">
                            <input type="range" class="outl-w" data-idx="\" min="0" max="50" step="1" value="\">
                            <input type="number" class="outl-wn bg-slate-900 border border-slate-600 rounded px-1 w-16" data-idx="\" min="0" max="50" step="1" value="\">
                        </div>
                    </div>
                    <div class="setting-row">
                        <label>顏色</label>
                        <input type="color" class="outl-c" data-idx="\" value="\">
                    </div>
                    <div class="setting-row">
                        <label>透明度</label>
                        <div class="flex items-center gap-2 w-full">
                            <input type="range" class="outl-a" data-idx="\" min="0" max="1" step="0.1" value="\">
                            <input type="number" class="outl-an bg-slate-900 border border-slate-600 rounded px-1 w-16" data-idx="\" min="0" max="1" step="0.1" value="\">
                        </div>
                    </div>
                \;
                
                el.addEventListener('dragstart', e => { 
                    e.dataTransfer.setData('text/plain', index); 
                    el.classList.add('opacity-50');
                });
                el.addEventListener('dragend', () => el.classList.remove('opacity-50'));
                el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('border-blue-500'); });
                el.addEventListener('dragleave', e => el.classList.remove('border-blue-500'));
                el.addEventListener('drop', e => {
                    e.preventDefault();
                    el.classList.remove('border-blue-500');
                    const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
                    const toIdx = index;
                    if(fromIdx === toIdx) return;
                    const item = window.currentEditingOutlines.splice(fromIdx, 1)[0];
                    window.currentEditingOutlines.splice(toIdx, 0, item);
                    triggerOutlineUpdate();
                    renderOutlineList();
                });
                list.appendChild(el);
            });

            // Bind listeners
            document.querySelectorAll('.outl-w').forEach(el => el.addEventListener('input', e => {
                const idx = e.target.dataset.idx;
                window.currentEditingOutlines[idx].width = parseInt(e.target.value) || 0;
                document.querySelector(\.outl-wn[data-idx="\"]\).value = e.target.value;
                triggerOutlineUpdate();
            }));
            document.querySelectorAll('.outl-wn').forEach(el => el.addEventListener('input', e => {
                const idx = e.target.dataset.idx;
                window.currentEditingOutlines[idx].width = parseInt(e.target.value) || 0;
                document.querySelector(\.outl-w[data-idx="\"]\).value = e.target.value;
                triggerOutlineUpdate();
            }));
            document.querySelectorAll('.outl-c').forEach(el => el.addEventListener('input', e => {
                const idx = e.target.dataset.idx;
                window.currentEditingOutlines[idx].color = e.target.value;
                triggerOutlineUpdate();
            }));
            document.querySelectorAll('.outl-a').forEach(el => el.addEventListener('input', e => {
                const idx = e.target.dataset.idx;
                window.currentEditingOutlines[idx].alpha = parseFloat(e.target.value) || 0;
                document.querySelector(\.outl-an[data-idx="\"]\).value = e.target.value;
                triggerOutlineUpdate();
            }));
            document.querySelectorAll('.outl-an').forEach(el => el.addEventListener('input', e => {
                const idx = e.target.dataset.idx;
                window.currentEditingOutlines[idx].alpha = parseFloat(e.target.value) || 0;
                document.querySelector(\.outl-a[data-idx="\"]\).value = e.target.value;
                triggerOutlineUpdate();
            }));
        };

        window.removeOutline = function(index) {
            window.currentEditingOutlines.splice(index, 1);
            triggerOutlineUpdate();
            renderOutlineList();
        };

        document.getElementById('btnAddOutline').addEventListener('click', () => {
            window.currentEditingOutlines.push({width: 2, color: '#000000', alpha: 1});
            triggerOutlineUpdate();
            renderOutlineList();
        });
    ;
    html = html.replace(/\/\/ --- Style bindings ---/, '// --- Style bindings ---\n' + outlineScript);

    // 8. Update updateEditor to init outlines properly
    const updateEditorModRegex = /document\.getElementById\('sty_outlineWidth'\)\.value = sub\.outlineWidth !== undefined \? sub\.outlineWidth : 2;\s*document\.getElementById\('sty_outlineColor'\)\.value = sub\.outlineColor \|\| '#000000';\s*document\.getElementById\('sty_outlineAlpha'\)\.value = sub\.outlineAlpha !== undefined \? sub\.outlineAlpha : 1;\s*/;
    
    html = html.replace(updateEditorModRegex, 
                    // Migrate old data on the fly
                    if (sub.outlines === undefined) {
                        sub.outlines = [];
                        if (sub.outlineWidth > 0) {
                            sub.outlines.push({width: sub.outlineWidth, color: sub.outlineColor || '#000000', alpha: sub.outlineAlpha !== undefined ? sub.outlineAlpha : 1});
                        }
                    }
                    window.currentEditingOutlines = JSON.parse(JSON.stringify(sub.outlines));
                    window.renderOutlineList();
    );

    // Remove the num syncing for outline inside updateEditor
    html = html.replace(/document\.getElementById\('sty_outlineWidth_num'\)\.value = document\.getElementById\('sty_outlineWidth'\)\.value;\s*document\.getElementById\('sty_outlineAlpha_num'\)\.value = document\.getElementById\('sty_outlineAlpha'\)\.value;/, '');

    // 9. Update renderCanvasOverlay to use layered div approach
    const renderCanvasRegex = /const div = document\.createElement\('div'\);\s*div\.className = "draggable-sub pointer-events-auto";[\s\S]*?overlayContainer\.appendChild\(div\);/g;
    
    const newRenderCanvas = 
                const container = document.createElement('div');
                container.className = "draggable-sub pointer-events-auto";
                // Pos
                let px = sub.posX !== undefined ? sub.posX : 0.5;
                let py = sub.posY !== undefined ? sub.posY : 0.9;
                container.style.left = \\%\;
                container.style.top = \\%\;
                
                // Backgound style on container
                let bgAlpha = sub.bgAlpha !== undefined ? sub.bgAlpha : 0.5;
                if (bgAlpha > 0) {
                    let bgC1 = hexToRgba(sub.bgColor1 || '#000000', bgAlpha);
                    let bgC2 = hexToRgba(sub.bgColor2 || '#000000', bgAlpha);
                    container.style.background = \linear-gradient(to right, \, \)\;
                    container.style.padding = '5px 15px';
                    container.style.borderRadius = \\px\;
                }

                // Create text layers
                const fontSize = sub.fontSize || 32;
                const fw = sub.bold ? 'bold' : 'normal';
                
                const outlines = sub.outlines || [];
                let currentTotalWidth = 0;
                
                // Base structure for layers: they all need to perfectly overlap
                // We will create a relative container inside the absolute container to hold absolute layers
                const layerWrapper = document.createElement('div');
                layerWrapper.style.position = 'relative';
                // The wrapper needs to have the same layout as the text to size correctly
                layerWrapper.style.display = 'inline-block';

                // We must render layers from BOTTOM to TOP.
                // Bottom is the thickest outline (all outlines summed).
                // Top is the main text.
                
                let totalWidthSum = outlines.reduce((acc, ol) => acc + parseInt(ol.width || 0), 0);
                
                // Generate outline layers (reverse order: thickest to thinnest)
                let currentThick = totalWidthSum;
                for (let i = outlines.length - 1; i >= 0; i--) {
                    const ol = outlines[i];
                    if (currentThick > 0) {
                        const olLayer = document.createElement('div');
                        olLayer.style.position = 'absolute';
                        olLayer.style.left = '0';
                        olLayer.style.top = '0';
                        olLayer.style.whiteSpace = 'nowrap';
                        olLayer.style.fontSize = \\px\;
                        olLayer.style.fontWeight = fw;
                        
                        const c = hexToRgba(ol.color, ol.alpha !== undefined ? ol.alpha : 1);
                        olLayer.style.webkitTextStroke = \\px \\; // *2 because stroke is centered
                        olLayer.style.color = c; // Fill with outline color so it blocks layers below
                        olLayer.innerText = sub.text;
                        layerWrapper.appendChild(olLayer);
                    }
                    currentThick -= parseInt(ol.width || 0);
                }

                // Finally, the top text layer
                const topLayer = document.createElement('div');
                topLayer.style.position = 'relative'; // This one dictates the size of the wrapper
                topLayer.style.whiteSpace = 'nowrap';
                topLayer.style.fontSize = \\px\;
                topLayer.style.fontWeight = fw;
                topLayer.style.color = hexToRgba(sub.color1 || '#ffffff', sub.textAlpha !== undefined ? sub.textAlpha : 1);
                topLayer.innerText = sub.text;
                layerWrapper.appendChild(topLayer);
                
                container.appendChild(layerWrapper);

                // Dragging Logic
                container.addEventListener('mousedown', (e) => {
                    subDragData = {
                        id: sub.id,
                        startX: e.clientX,
                        startY: e.clientY,
                        startPx: px,
                        startPy: py
                    };
                    container.classList.add('dragging');
                    e.stopPropagation();
                });

                overlayContainer.appendChild(container);
    ;
    
    html = html.replace(renderCanvasRegex, newRenderCanvas);

    // Ensure we fix the old draggable dragging reset logic
    html = html.replace(/document\.querySelectorAll\('\.draggable-sub'\)\.forEach\(el => el\.classList\.remove\('dragging'\)\);/, if (overlayContainer) { overlayContainer.querySelectorAll('.draggable-sub').forEach(el => el.classList.remove('dragging')); });


    // 10. ASS Subtitle generation logic
    const assRegex = /let c1 = toAssColor[\s\S]*?let text = sub\.text\.replace\(\/\\\\n\/g, '\\\\\\\\N'\);\s*assContent \+= Dialogue: 0,\$\{start\},\$\{end\},Default,,0,0,0,,\$\{tags\}\$\{text\}\\\\n;/g;
    
    const newAssLogic = 
                    let c1 = toAssColor(sub.color1 || '#ffffff', sub.textAlpha !== undefined ? sub.textAlpha : 1);
                    let bc = toAssColor(sub.bgColor1 || '#000000', sub.bgAlpha !== undefined ? sub.bgAlpha : 0.5);
                    
                    let fs = sub.fontSize || 32;
                    let bold = sub.bold ? -1 : 0; 
                    
                    let px = sub.posX !== undefined ? sub.posX : 0.5;
                    let py = sub.posY !== undefined ? sub.posY : 0.9;
                    let x = Math.round(px * 1920);
                    let y = Math.round(py * 1080);
                    
                    let text = sub.text.replace(/\\n/g, '\\\\N');
                    
                    const outlines = sub.outlines || [];
                    
                    // We generate multiple dialogue lines for stacked outlines.
                    // Bottom layer first.
                    let totalWidth = outlines.reduce((acc, ol) => acc + parseInt(ol.width || 0), 0);
                    let currentWidth = totalWidth;
                    
                    for (let i = outlines.length - 1; i >= 0; i--) {
                        const ol = outlines[i];
                        if (currentWidth > 0) {
                            let oc = toAssColor(ol.color || '#000000', ol.alpha !== undefined ? ol.alpha : 1);
                            // \\1c is fill, \\3c is border color. Make fill same as border so it's a solid shape block
                            let tags = \{\\\\pos(\,\)\\\\fs\\\\\1c\\\\\3c\\\\\4c\\\\\b\\\\\bord\\\\\BorderStyle3}\;
                            assContent += \Dialogue: 0,\,\,Default,,0,0,0,,\\\\n\;
                        }
                        currentWidth -= parseInt(ol.width || 0);
                    }
                    
                    // Top layer (Main text)
                    let mainTags = \{\\\\pos(\,\)\\\\fs\\\\\1c\\\\\3c\\\\\4c\\\\\b\\\\\bord0\\\\BorderStyle3}\;
                    assContent += \Dialogue: 0,\,\,Default,,0,0,0,,\\\\n\;
    ;
    
    html = html.replace(assRegex, newAssLogic);

    fs.writeFileSync(path, html, 'utf-8');
}

fix();