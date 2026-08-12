(function() {
    let uiInjected = false;
    let sizeGroup = null;
    let stretchUI = null;
    let inpH = null, inpW = null, selU = null;
    
    function injectUI() {
        if (uiInjected) return;
        // Find row-primary
        const row = document.querySelector('div[class*="sprite-info_row-primary"]');
        if (!row) return;
        
        // Find Size group - usually the third group, contains an input with max length or value
        const groups = row.querySelectorAll('div[class*="sprite-info_group"]');
        if (groups.length < 3) return;
        sizeGroup = groups[2]; // X, Y, Size, Direction
        
        stretchUI = document.createElement('div');
        stretchUI.className = 'panda-stretch-ui sprite-info_group_-xfiq';
        stretchUI.style.display = 'flex';
        stretchUI.style.gap = '5px';
        stretchUI.style.alignItems = 'center';
        stretchUI.style.marginLeft = '10px';
        
        stretchUI.innerHTML = 
            <div style="display:flex; align-items:center; flex-direction:column;">
                <div style="font-size:10px; font-weight:bold; color:#575E75;">寬/高</div>
                <div style="display:flex; gap:2px;">
                    <input id="pandaStretchW" type="text" style="width: 35px; text-align:center; border-radius: 4px; border: 1px solid #d9d9d9; padding: 0.2rem;" placeholder="寬">
                    <input id="pandaStretchH" type="text" style="width: 35px; text-align:center; border-radius: 4px; border: 1px solid #d9d9d9; padding: 0.2rem;" placeholder="高">
                </div>
            </div>
            <div style="display:flex; align-items:center; flex-direction:column;">
                <div style="font-size:10px; font-weight:bold; color:#575E75;">單位</div>
                <select id="pandaStretchUnit" style="border-radius: 4px; border: 1px solid #d9d9d9; padding: 0.2rem; height: 26px;">
                    <option value="PERCENT">%</option>
                    <option value="PIXEL">px</option>
                </select>
            </div>
        ;
        
        // Insert after sizeGroup
        sizeGroup.parentNode.insertBefore(stretchUI, sizeGroup.nextSibling);
        uiInjected = true;
        
        inpW = document.getElementById('pandaStretchW');
        inpH = document.getElementById('pandaStretchH');
        selU = document.getElementById('pandaStretchUnit');
        
        const updateStretch = () => {
            if (!window.scratchVM || !window.scratchVM.editingTarget) return;
            const w = inpW.value;
            const h = inpH.value;
            const u = selU.value;
            
            if (w !== '' || h !== '') {
                sizeGroup.style.display = 'none';
                if (window.pandaSetStretch) {
                    window.pandaSetStretch({ WIDTH: w||100, HEIGHT: h||100, UNIT_W: u, UNIT_H: u }, { target: window.scratchVM.editingTarget });
                }
            } else {
                sizeGroup.style.display = 'flex';
                // Reset stretch
                window.scratchVM.editingTarget.stretchWidth = undefined;
                window.scratchVM.editingTarget.stretchHeight = undefined;
                window.scratchVM.editingTarget.setSize(window.scratchVM.editingTarget.size);
            }
        };
        
        inpW.addEventListener('change', updateStretch);
        inpH.addEventListener('change', updateStretch);
        selU.addEventListener('change', updateStretch);
        
        if (window.scratchVM) {
            window.scratchVM.on('TARGETS_UPDATE', () => {
                const target = window.scratchVM.editingTarget;
                if (!target || !target.stretchWidth) {
                    inpW.value = '';
                    inpH.value = '';
                    sizeGroup.style.display = 'flex';
                }
            });
        }
    }
    
    const obs = new MutationObserver(() => {
        if (!document.querySelector('.panda-stretch-ui')) {
            uiInjected = false;
            injectUI();
        }
    });
    obs.observe(document.body, { childList: true, subtree: true });

})();
