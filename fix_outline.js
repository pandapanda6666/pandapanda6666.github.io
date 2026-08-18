const fs = require('fs');

function fix() {
    let path = 'Edit/Video/Add subtitles/index.html';
    let html = fs.readFileSync(path, 'utf-8');

    // 1. Add CSS for sub-text-span
    const cssToAdd = 
        .sub-text-span {
            position: relative;
            z-index: 1;
        }
        .sub-text-span::before {
            content: attr(data-text);
            position: absolute;
            left: 0;
            top: 0;
            z-index: -1;
            -webkit-text-stroke: var(--outline-width, 0px) var(--outline-color, transparent);
        };
    html = html.replace('.draggable-sub:hover, .draggable-sub.dragging {', cssToAdd + '\n        .draggable-sub:hover, .draggable-sub.dragging {');

    // 2. Modify rendering logic in renderCanvasOverlay
    const oldRenderLogic = /div\.innerText = sub\.text;[\s\S]*?if \(sub\.outlineWidth > 0\) \{[\s\S]*?div\.style\.webkitTextStroke = \\\\$\\{sub\.outlineWidth\\}px \\\$\\{oc\\}\;\s*\}/;
    
    const newRenderLogic = 
                // create inner text span
                const textSpan = document.createElement('span');
                textSpan.innerText = sub.text;
                textSpan.dataset.text = sub.text;
                textSpan.className = 'sub-text-span';
                div.appendChild(textSpan);
                
                // Position (0-1 range, default 0.5, 0.9)
                let px = sub.posX !== undefined ? sub.posX : 0.5;
                let py = sub.posY !== undefined ? sub.posY : 0.9;
                
                div.style.left = \\%\;
                div.style.top = \\%\;
                
                // Styles
                div.style.fontSize = \\px\;
                div.style.fontWeight = sub.bold ? 'bold' : 'normal';
                
                textSpan.style.color = hexToRgba(sub.color1 || '#ffffff', sub.textAlpha !== undefined ? sub.textAlpha : 1);
                
                if (sub.outlineWidth > 0) {
                    let oc = hexToRgba(sub.outlineColor || '#000000', sub.outlineAlpha !== undefined ? sub.outlineAlpha : 1);
                    textSpan.style.setProperty('--outline-width', \\px\);
                    textSpan.style.setProperty('--outline-color', oc);
                };
    
    // We need to match precisely. Let's use string replace instead of regex for safety, or targeted regex.
    html = html.replace(/div\.innerText = sub\.text;[\s\S]*?div\.style\.webkitTextStroke = \\$\{sub\.outlineWidth\}px \$\{oc\}\;\s*\}/, newRenderLogic);

    // Also replace div.style.color since we moved it to textSpan.style.color
    html = html.replace(/div\.style\.color = hexToRgba\(sub\.color1 \|\| '#ffffff', sub\.textAlpha !== undefined \? sub\.textAlpha : 1\);/, '');

    fs.writeFileSync(path, html, 'utf-8');
}

fix();