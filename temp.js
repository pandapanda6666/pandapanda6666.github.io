
        // --- Style bindings ---

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
                el.innerHTML = `
                    <div class="flex items-center justify-between cursor-move bg-slate-700 -mx-2 -mt-2 p-1 rounded-t">
                        <span class="text-slate-300 text-xs font-bold px-1 select-none">≡ 外框 ${index + 1} (層級：${index === 0 ? '最內層' : '第'+(index+1)+'層'})</span>
                        <button class="text-red-400 hover:text-red-300 text-xs px-2" onclick="removeOutline(${index})">✕</button>
                    </div>
                    <div class="setting-row mt-1">
                        <label>延伸粗細</label>
                        <div class="flex items-center gap-2 w-full">
                            <input type="range" class="outl-w" data-idx="${index}" min="0" max="50" step="1" value="${ol.width}">
                            <input type="number" class="outl-wn bg-slate-900 border border-slate-600 rounded px-1 w-16" data-idx="${index}" min="0" max="50" step="1" value="${ol.width}">
                        </div>
                    </div>
                    <div class="setting-row">
                        <label>顏色</label>
                        <input type="color" class="outl-c" data-idx="${index}" value="${ol.color}">
                    </div>
                    <div class="setting-row">
                        <label>透明度</label>
                        <div class="flex items-center gap-2 w-full">
                            <input type="range" class="outl-a" data-idx="${index}" min="0" max="1" step="0.1" value="${ol.alpha}">
                            <input type="number" class="outl-an bg-slate-900 border border-slate-600 rounded px-1 w-16" data-idx="${index}" min="0" max="1" step="0.1" value="${ol.alpha}">
                        </div>
                    </div>
                `;
                
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
                    window.renderOutlineList();
                });
                list.appendChild(el);
            });

            // Bind listeners
            document.querySelectorAll('.outl-w').forEach(el => el.addEventListener('input', e => {
                const idx = e.target.dataset.idx;
                window.currentEditingOutlines[idx].width = parseInt(e.target.value) || 0;
                document.querySelector(`.outl-wn[data-idx="${idx}"]`).value = e.target.value;
                triggerOutlineUpdate();
            }));
            document.querySelectorAll('.outl-wn').forEach(el => el.addEventListener('input', e => {
                const idx = e.target.dataset.idx;
                window.currentEditingOutlines[idx].width = parseInt(e.target.value) || 0;
                document.querySelector(`.outl-w[data-idx="${idx}"]`).value = e.target.value;
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
                document.querySelector(`.outl-an[data-idx="${idx}"]`).value = e.target.value;
                triggerOutlineUpdate();
            }));
            document.querySelectorAll('.outl-an').forEach(el => el.addEventListener('input', e => {
                const idx = e.target.dataset.idx;
                window.currentEditingOutlines[idx].alpha = parseFloat(e.target.value) || 0;
                document.querySelector(`.outl-a[data-idx="${idx}"]`).value = e.target.value;
                triggerOutlineUpdate();
            }));
        };

        window.removeOutline = function(index) {
            window.currentEditingOutlines.splice(index, 1);
            triggerOutlineUpdate();
            window.renderOutlineList();
        };

        document.getElementById('btnAddOutline').addEventListener('click', () => {
            window.currentEditingOutlines.push({width: 2, color: '#000000', alpha: 1});
            triggerOutlineUpdate();
            window.renderOutlineList();
        });
    
        
        
        window.defaultSubtitleStyle = {
            fontFamily: 'sans-serif',
            fontSize: 32, color1: '#ffffff', color2: '#ffffff', textAlpha: 1, bold: false,
            outlines: [{width: 2, color: '#000000', alpha: 1}],
            bgColor1: '#000000', bgColor2: '#000000', bgAlpha: 0.5, borderRadius: 4,
            posX: 0.5, posY: 0.9
        };
        window.isEditingDefault = false;
        
        document.getElementById('btnEditDefaultStyle').addEventListener('click', () => {
            document.getElementById('noSelection').classList.add('hidden');
            document.getElementById('stylePanel').classList.remove('hidden');
            document.querySelector('#stylePanel h3').innerText = '全域預設字體與背景樣式';
            window.isEditingDefault = true;
            
            const def = window.defaultSubtitleStyle;
            document.getElementById('sty_fontFamily').value = def.fontFamily || 'sans-serif';
            document.getElementById('sty_fontSize').value = def.fontSize;
            document.getElementById('sty_color1').value = def.color1;
            document.getElementById('sty_color2').value = def.color2;
            document.getElementById('sty_textAlpha').value = def.textAlpha;
            document.getElementById('sty_bold').checked = def.bold;
            window.currentEditingOutlines = JSON.parse(JSON.stringify(def.outlines || [])); window.renderOutlineList();
            document.getElementById('sty_bgColor1').value = def.bgColor1;
            document.getElementById('sty_bgColor2').value = def.bgColor2;
            document.getElementById('sty_bgAlpha').value = def.bgAlpha;
            document.getElementById('sty_borderRadius').value = def.borderRadius;
            document.getElementById('sty_posX').value = Math.round((def.posX - 0.5) * 1920);
            document.getElementById('sty_posY').value = Math.round((def.posY - 0.5) * 1080);
            
            ['sty_textAlpha', 'sty_bgAlpha', 'sty_borderRadius'].forEach(id => {
                document.getElementById(id + '_num').value = document.getElementById(id).value;
            });
        });
        
        document.getElementById('btnApplyAllStyles').addEventListener('click', () => {
            let refSub = window.isEditingDefault ? window.defaultSubtitleStyle : null;
            if (!refSub && window.selectedSubtitleIds && window.selectedSubtitleIds.size > 0) {
                const refId = Array.from(window.selectedSubtitleIds)[0];
                refSub = window.subtitles.find(s => s.id === refId);
            }
            if (refSub) {
                if (window.subtitles) {
                    window.subtitles.forEach(s => {
                        s.fontSize = refSub.fontSize; s.color1 = refSub.color1; s.color2 = refSub.color2; s.textAlpha = refSub.textAlpha; s.bold = refSub.bold;
                        s.bgColor1 = refSub.bgColor1; s.bgColor2 = refSub.bgColor2; s.bgAlpha = refSub.bgAlpha; s.borderRadius = refSub.borderRadius;
                        s.posX = refSub.posX; s.posY = refSub.posY;
                        s.outlines = JSON.parse(JSON.stringify(refSub.outlines || []));
                    });
                }
                if (window.renderCanvasOverlay) window.renderCanvasOverlay();
                if(window.showToast) window.showToast("已套用至全部現有字幕");
            }
        });

        document.getElementById('btnSetAsDefault').addEventListener('click', () => {
            let refSub = window.isEditingDefault ? window.defaultSubtitleStyle : null;
            if (!refSub && window.selectedSubtitleIds && window.selectedSubtitleIds.size > 0) {
                const refId = Array.from(window.selectedSubtitleIds)[0];
                refSub = window.subtitles.find(s => s.id === refId);
            }
            if (refSub) {
                Object.assign(window.defaultSubtitleStyle, {
                    fontFamily: refSub.fontFamily, fontSize: refSub.fontSize, color1: refSub.color1, color2: refSub.color2, textAlpha: refSub.textAlpha, bold: refSub.bold,
                    bgColor1: refSub.bgColor1, bgColor2: refSub.bgColor2, bgAlpha: refSub.bgAlpha, borderRadius: refSub.borderRadius,
                    posX: refSub.posX, posY: refSub.posY,
                    outlines: JSON.parse(JSON.stringify(refSub.outlines || []))
                });
                if(window.showToast) window.showToast("已更新新增字幕的預設樣式");
            }
        });
        
        const styleInputs = [
            'sty_fontFamily', 'sty_fontSize', 'sty_color1', 'sty_color2', 'sty_textAlpha', 'sty_textAlpha_num', 'sty_bold',
            
            'sty_bgColor1', 'sty_bgColor2', 'sty_bgAlpha', 'sty_bgAlpha_num', 'sty_borderRadius', 'sty_borderRadius_num',
            'sty_posX', 'sty_posY'
        ];
        
        function applyStyleToSub(sub) {
            sub.fontFamily = document.getElementById('sty_fontFamily').value;
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


        styleInputs.forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                el.addEventListener('input', (e) => {
                    syncSliders(id, e.target.value);
                    if (window.isEditingDefault) {
                        applyStyleToSub(window.defaultSubtitleStyle);
                    } else if (window.selectedSubtitleIds) {
                        window.selectedSubtitleIds.forEach(subId => {
                            const sub = window.subtitles.find(s => s.id === subId);
                            if (sub) applyStyleToSub(sub);
                        });
                    }
                    if(window.renderCanvasOverlay) window.renderCanvasOverlay();
                });
            }
        });

        // --- Draggable Subtitle on Canvas ---
        const videoContainer = document.getElementById('videoContainer');
        const overlayContainer = document.getElementById('subtitleOverlay');
        if (overlayContainer) {
            overlayContainer.className = "absolute inset-0 pointer-events-none overflow-hidden";
            overlayContainer.innerHTML = '';
        }
        
        let subDragData = null;

        function hexToRgba(hex, alpha) {
            let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r},${g},${b},${alpha})`;
        }

        window.renderCanvasOverlay = function() {
            if (!window.mediaFile || window.mediaFile.type !== 'video' || !overlayContainer) return;
            const player = document.getElementById('mainVideo');
            const time = player.currentTime + window.mediaFile.offset;
            const currentSubs = (window.subtitles || []).filter(s => time >= s.start && time <= s.end);
            
            overlayContainer.innerHTML = '';
            
            currentSubs.forEach(sub => {
                
                const container = document.createElement('div');
                container.className = "draggable-sub pointer-events-auto";
                // Pos
                let px = sub.posX !== undefined ? sub.posX : 0.5;
                let py = sub.posY !== undefined ? sub.posY : 0.9;
                container.style.left = `${px * 100}%`;
                container.style.top = `${py * 100}%`;
                
                // Backgound style on container
                let bgAlpha = sub.bgAlpha !== undefined ? sub.bgAlpha : 0.5;
                if (bgAlpha > 0) {
                    let bgC1 = hexToRgba(sub.bgColor1 || '#000000', bgAlpha);
                    let bgC2 = hexToRgba(sub.bgColor2 || '#000000', bgAlpha);
                    container.style.background = `linear-gradient(to right, ${bgC1}, ${bgC2})`;
                    container.style.padding = '5px 15px';
                    container.style.borderRadius = `${sub.borderRadius || 4}px`;
                }

                // Create text layers
                const fontSize = sub.fontSize || 32;
                const fw = sub.bold ? 'bold' : 'normal';
                
                const outlines = sub.outlines || [];
                
                const layerWrapper = document.createElement('div');
                layerWrapper.style.position = 'relative';
                layerWrapper.style.display = 'inline-block';

                let totalWidthSum = outlines.reduce((acc, ol) => acc + parseInt(ol.width || 0), 0);
                let currentThick = totalWidthSum;
                
                for (let i = outlines.length - 1; i >= 0; i--) {
                    const ol = outlines[i];
                    if (currentThick > 0) {
                        const olLayer = document.createElement('div');
                        olLayer.style.position = 'absolute';
                        olLayer.style.left = '0';
                        olLayer.style.top = '0';
                        olLayer.style.whiteSpace = 'nowrap';
                        olLayer.style.fontSize = `${fontSize}px`;
                        olLayer.style.fontWeight = fw;
                        
                        const c = hexToRgba(ol.color, ol.alpha !== undefined ? ol.alpha : 1);
                        olLayer.style.webkitTextStroke = `${currentThick * 2}px ${c}`; // *2 because stroke is centered
                        olLayer.style.color = c; // Fill with outline color
                        olLayer.innerText = sub.text;
                        layerWrapper.appendChild(olLayer);
                    }
                    currentThick -= parseInt(ol.width || 0);
                }

                // Top text layer
                const topLayer = document.createElement('div');
                topLayer.style.position = 'relative'; // This dictates the size
                topLayer.style.whiteSpace = 'nowrap';
                topLayer.style.fontSize = `${fontSize}px`;
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
    
            });
        };

        window.addEventListener('mousemove', (e) => {
            if (subDragData && overlayContainer) {
                const rect = overlayContainer.getBoundingClientRect();
                const dx = (e.clientX - subDragData.startX) / rect.width;
                const dy = (e.clientY - subDragData.startY) / rect.height;
                
                
                if (window.subtitles) {
                    const sub = window.subtitles.find(s => s.id === subDragData.id);
                    if (sub) {
                        sub.posX = Math.min(1, Math.max(0, subDragData.startPx + dx));
                        sub.posY = Math.min(1, Math.max(0, subDragData.startPy + dy));
                        // Update UI
                        document.getElementById('sty_posX').value = Math.round((sub.posX - 0.5) * 1920);
                        document.getElementById('sty_posY').value = Math.round((sub.posY - 0.5) * 1080);
                    }
                }
                subDragData.startX = e.clientX;
                subDragData.startY = e.clientY;
                if (true) {
                    subDragData.startPx = subDragData.startPx + dx;
                    subDragData.startPy = subDragData.startPy + dy;
                }
                window.renderCanvasOverlay();
            }
        });

        window.addEventListener('mouseup', () => {
            if (subDragData) {
                subDragData = null;
                if (overlayContainer) { overlayContainer.querySelectorAll('.draggable-sub').forEach(el => el.classList.remove('dragging')); }
            }
        });

                // Split (Shift+Enter)
        editText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                if (window.selectedSubtitleIds && window.selectedSubtitleIds.size === 1) {
                    const subId = Array.from(window.selectedSubtitleIds)[0];
                    const subIndex = window.subtitles.findIndex(s => s.id === subId);
                    const sub = window.subtitles[subIndex];
                    
                    const cursorPos = document.getElementById("editText").selectionStart;
                    const text1 = sub.text.substring(0, cursorPos).trim();
                    const text2 = sub.text.substring(cursorPos).trim();
                    
                    if (!text1 || !text2) return;
                    
                    const ratio = text1.length / (text1.length + text2.length);
                    const dur = sub.end - sub.start;
                    const midTime = sub.start + dur * ratio;
                    
                    sub.text = text1;
                    sub.end = midTime;
                    
                    const newSub = {
                        ...JSON.parse(JSON.stringify(sub)),
                        id: Date.now(),
                        start: midTime,
                        end: sub.start + dur,
                        text: text2
                    };
                    
                    window.subtitles.splice(subIndex + 1, 0, newSub);
                    window.selectedSubtitleIds.clear();
                    window.selectedSubtitleIds.add(newSub.id);
                    if(typeof lastSelectedId !== 'undefined') lastSelectedId = newSub.id;
                    
                    if(typeof resolveOverlaps !== 'undefined') resolveOverlaps();
                    if(typeof saveState !== 'undefined') saveState();
                    if(typeof renderSubtitles !== 'undefined') renderSubtitles();
                    if(typeof updateEditor !== 'undefined') updateEditor();
                }
            }
        });

        // Merge (Alt+M)
        window.addEventListener('keydown', (e) => {
            if (e.altKey && e.key.toLowerCase() === 'm') {
                e.preventDefault();
                if (window.selectedSubtitleIds && window.selectedSubtitleIds.size === 1) {
                    const subId = Array.from(window.selectedSubtitleIds)[0];
                    const subIndex = window.subtitles.findIndex(s => s.id === subId);
                    if (subIndex === -1 || subIndex === window.subtitles.length - 1) return;
                    
                    const sub = window.subtitles[subIndex];
                    const nextSub = window.subtitles[subIndex + 1];
                    
                    sub.text = sub.text + ' ' + nextSub.text;
                    sub.end = Math.max(sub.end, nextSub.end);
                    
                    window.subtitles.splice(subIndex + 1, 1);
                    
                    if(typeof saveState !== 'undefined') saveState();
                    if(typeof renderSubtitles !== 'undefined') renderSubtitles();
                    if(typeof updateEditor !== 'undefined') updateEditor();
                }
            }
        });

        // Safe Zone Select
        document.getElementById('safeZoneSelect').addEventListener('change', (e) => {
            const val = e.target.value;
            const overlay = document.getElementById('safeZoneOverlay');
            overlay.className = 'absolute inset-0 pointer-events-none z-30 ' + (val === 'none' ? 'hidden' : 'safe-zone-' + val);
        });

        // Load Local Fonts
        async function loadLocalFonts() {
            try {
                if ('queryLocalFonts' in window) {
                    const fonts = await window.queryLocalFonts();
                    const fontSelect = document.getElementById('sty_fontFamily');
                    const fontMap = new Set();
                    fonts.forEach(f => {
                        if (!fontMap.has(f.family)) {
                            fontMap.add(f.family);
                            const opt = document.createElement('option');
                            opt.value = f.family;
                            opt.innerText = f.family;
                            fontSelect.appendChild(opt);
                        }
                    });
                }
            } catch (e) {
                console.log('Local fonts not available:', e);
            }
        }
        loadLocalFonts();

        // AI Whisper Worker
        // AI Whisper Modal and Worker
        const aiModal = document.getElementById('aiModal');
        const closeAiModalBtn = document.getElementById('closeAiModalBtn');
        const aiCancelBtn = document.getElementById('aiCancelBtn');
        const aiApplyBtn = document.getElementById('aiApplyBtn');
        const aiStatusText = document.getElementById('aiStatusText');
        const aiProgressText = document.getElementById('aiProgressText');
        const aiProgressBar = document.getElementById('aiProgressBar');
        const aiWaveformCanvas = document.getElementById('aiWaveformCanvas');
        const aiWaveformOverlay = document.getElementById('aiWaveformOverlay');
        const aiSubtitlesList = document.getElementById('aiSubtitlesList');
        
        let aiPendingSubtitles = [];

        function closeAiModal() { aiModal.classList.add('hidden'); }
        closeAiModalBtn.addEventListener('click', closeAiModal);
        aiCancelBtn.addEventListener('click', closeAiModal);

        // Render Waveform
        function drawWaveform(audioBuffer) {
            const ctx = aiWaveformCanvas.getContext('2d');
            const width = aiWaveformCanvas.width = aiWaveformCanvas.offsetWidth;
            const height = aiWaveformCanvas.height = aiWaveformCanvas.offsetHeight;
            
            const rawData = audioBuffer.getChannelData(0);
            const step = Math.ceil(rawData.length / width);
            const amp = height / 2;
            
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, width, height);
            
            ctx.fillStyle = '#9333ea';
            for(let i=0; i<width; i++){
                let min = 1.0;
                let max = -1.0;
                for (let j=0; j<step; j++) {
                    const datum = rawData[(i*step)+j]; 
                    if (datum < min) min = datum;
                    if (datum > max) max = datum;
                }
                ctx.fillRect(i, (1+min)*amp, 1, Math.max(1, (max-min)*amp));
            }
        }

        // Render editable subtitle list
        function renderAiSubtitlesList() {
            aiSubtitlesList.innerHTML = '';
            aiPendingSubtitles.forEach((sub, i) => {
                const el = document.createElement('div');
                el.className = 'flex gap-2 items-start bg-slate-800 p-2 rounded border border-slate-700';
                el.innerHTML = `
                    <div class="flex flex-col gap-1 w-24 shrink-0">
                        <input type="number" step="0.001" class="w-full bg-slate-900 border border-slate-600 rounded px-1 text-xs text-slate-300" value="${sub.start.toFixed(3)}" data-idx="${i}" data-field="start">
                        <input type="number" step="0.001" class="w-full bg-slate-900 border border-slate-600 rounded px-1 text-xs text-slate-300" value="${sub.end.toFixed(3)}" data-idx="${i}" data-field="end">
                    </div>
                    <textarea class="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-white resize-none" rows="2" data-idx="${i}">${sub.text}</textarea>
                    <button class="text-red-400 hover:text-red-300 p-1" data-idx="${i}" title="刪除">✖</button>
                `;
                aiSubtitlesList.appendChild(el);
            });

            // Event listeners
            aiSubtitlesList.querySelectorAll('input').forEach(inp => {
                inp.addEventListener('change', (e) => {
                    const idx = e.target.getAttribute('data-idx');
                    const field = e.target.getAttribute('data-field');
                    aiPendingSubtitles[idx][field] = parseFloat(e.target.value);
                });
            });
            aiSubtitlesList.querySelectorAll('textarea').forEach(ta => {
                ta.addEventListener('change', (e) => {
                    const idx = e.target.getAttribute('data-idx');
                    aiPendingSubtitles[idx].text = e.target.value;
                });
            });
            aiSubtitlesList.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = e.target.getAttribute('data-idx');
                    aiPendingSubtitles.splice(idx, 1);
                    renderAiSubtitlesList();
                });
            });
        }

        aiApplyBtn.addEventListener('click', () => {
            if(aiPendingSubtitles.length > 0) {
                // Apply to main timeline
                const startId = Date.now();
                const mapped = aiPendingSubtitles.map((sub, i) => ({
                    id: startId + i,
                    start: sub.start,
                    end: sub.end,
                    text: sub.text,
                    ...JSON.parse(JSON.stringify(window.defaultSubtitleStyle))
                }));
                window.subtitles = window.subtitles.concat(mapped);
                if(typeof resolveOverlaps !== 'undefined') resolveOverlaps();
                if(typeof saveState !== 'undefined') saveState();
                if(typeof renderSubtitles !== 'undefined') renderSubtitles();
                if(typeof updateEditor !== 'undefined') updateEditor();
                closeAiModal();
            }
        });

        // Worker Code
        const whisperWorkerCode = `
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
env.allowLocalModels = false;
let transcriber = null;

self.onmessage = async (e) => {
    const { audioData, type } = e.data;
    if (type === 'init') {
        self.postMessage({ status: 'loading', msg: '初始化 AI 語音辨識模型...' });
        try {
            transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
                progress_callback: x => {
                    if (x.status === 'progress' || x.status === 'downloading') {
                        self.postMessage({ status: 'download_progress', file: x.file, progress: x.progress || 0 });
                    }
                }
            });
            self.postMessage({ status: 'ready', msg: '模型載入完成，準備辨識' });
        } catch (err) {
            self.postMessage({ status: 'error', error: err.message });
        }
    } else if (type === 'transcribe') {
        if (!transcriber) return;
        self.postMessage({ status: 'processing', msg: '正在離線辨識語音中 (需時數分鐘，請耐心等候)...' });
        try {
            const result = await transcriber(audioData, {
                chunk_length_s: 30,
                stride_length_s: 5,
                return_timestamps: true,
                language: 'chinese',
                task: 'transcribe',
                callback_function: x => {
                    self.postMessage({ status: 'transcribe_progress', data: x });
                }
            });
            self.postMessage({ status: 'done', chunks: result.chunks });
        } catch(err) {
            self.postMessage({ status: 'error', error: err.message });
        }
    }
};
`;
        let aiWorker = null;

        document.getElementById('aiTranscribeBtn').addEventListener('click', async () => {
            if (!window.mediaFile || (!window.mediaFile.blob && !window.mediaFile.url)) {
                if(typeof showToast !== 'undefined') showToast('請先載入媒體檔案', true);
                return;
            }
            
            aiModal.classList.remove('hidden');
            aiStatusText.innerText = '提取音訊中...';
            aiProgressText.innerText = '0%';
            aiProgressBar.style.width = '0%';
            aiSubtitlesList.innerHTML = '';
            aiPendingSubtitles = [];
            aiApplyBtn.disabled = true;
            aiWaveformOverlay.querySelector('span').innerText = 'EXTRACTING AUDIO...';
            aiWaveformOverlay.classList.remove('hidden');

            let audioBuffer = null;
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
                let arrayBuffer;
                if (window.mediaFile.blob) {
                    arrayBuffer = await window.mediaFile.blob.arrayBuffer();
                } else if (window.mediaFile.url) {
                    const resp = await fetch(window.mediaFile.url);
                    arrayBuffer = await resp.arrayBuffer();
                }
                audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                
                aiWaveformOverlay.classList.add('hidden');
                drawWaveform(audioBuffer);
            } catch (e) {
                aiStatusText.innerText = '音訊提取失敗: ' + e.message;
                return;
            }

            if (!aiWorker) {
                const blob = new Blob([whisperWorkerCode], { type: 'application/javascript' });
                aiWorker = new Worker(URL.createObjectURL(blob), { type: 'module' });
                
                aiWorker.onmessage = (e) => {
                    const data = e.data;
                    if (data.status === 'loading' || data.status === 'ready') {
                        aiStatusText.innerText = data.msg;
                    } else if (data.status === 'download_progress') {
                        aiStatusText.innerText = '下載模型中: ' + data.file;
                        let pct = Math.round(data.progress);
                        aiProgressText.innerText = pct + '%';
                        aiProgressBar.style.width = pct + '%';
                    } else if (data.status === 'processing') {
                        aiStatusText.innerText = data.msg;
                        aiProgressBar.style.width = '100%';
                        aiProgressText.innerText = '處理中';
                        aiProgressBar.classList.add('animate-pulse');
                    } else if (data.status === 'transcribe_progress') {
                        // We could show partial text if we want, but let's just keep it pulsating
                    } else if (data.status === 'done') {
                        aiStatusText.innerText = 'AI 辨識完成！請在下方確認或修改結果。';
                        aiProgressBar.classList.remove('animate-pulse');
                        aiProgressBar.style.width = '100%';
                        aiProgressText.innerText = '100%';
                        
                        aiPendingSubtitles = [];
                        data.chunks.forEach((chunk) => {
                            if (chunk.timestamp && chunk.timestamp[0] !== null && chunk.timestamp[1] !== null) {
                                aiPendingSubtitles.push({
                                    start: chunk.timestamp[0],
                                    end: chunk.timestamp[1],
                                    text: chunk.text.trim()
                                });
                            }
                        });
                        renderAiSubtitlesList();
                        if (aiPendingSubtitles.length > 0) {
                            aiApplyBtn.disabled = false;
                        }
                    } else if (data.status === 'error') {
                        aiStatusText.innerText = 'AI 辨識錯誤: ' + data.error;
                        aiProgressBar.classList.remove('animate-pulse');
                        aiProgressBar.style.width = '0%';
                    }
                };
                aiWorker.postMessage({ type: 'init' });
            }
            
            // Wait a bit for init, then send transcribe
            setTimeout(() => {
                const float32Array = audioBuffer.getChannelData(0);
                aiWorker.postMessage({ type: 'transcribe', audioData: float32Array });
            }, 1000);
        });

        // --- Export Video using FFmpeg ---
        const exportVideoBtn = document.getElementById('exportVideoBtn');
        let ffmpeg = null;
        
        exportVideoBtn.addEventListener('click', async () => {
            document.dispatchEvent(new CustomEvent('START_EXPORT'));
        });
    