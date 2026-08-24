import re

with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace my broken generateASS with the fixed one
bad_start = html.find('window.generateASS = function()')
bad_end = html.find('};', bad_start) + 2

good_func = '''window.generateASS = function() {
            function toAssColor(hex, alpha) {
                if(!hex) hex = '#ffffff';
                if(hex.startsWith('#')) hex = hex.substring(1);
                if(hex.length === 3) hex = hex.split('').map(c => c+c).join('');
                let r = hex.slice(1,3), g = hex.slice(3,5), b = hex.slice(5,7);
                let a = Math.round((1 - (alpha !== undefined ? alpha : 1)) * 255).toString(16).padStart(2, '0').toUpperCase();
                return &H;
            }

            let fontName = window.isDesktop ? "Microsoft JhengHei" : "Arial";
            let assContent = [Script Info]\\nScriptType: v4.00+\\nPlayResX: 1920\\nPlayResY: 1080\\nWrapStyle: 0\\n\\n[V4+ Styles]\\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\\nStyle: Default,,32,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,3,2,0,2,10,10,10,1\\n\\n[Events]\\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\\n;
            
            const currentSubs = window.subtitles || [];
            currentSubs.forEach(sub => {
                if (sub.start === undefined || sub.end === undefined) return;
                
                let startStr = (typeof sub.start === 'number') ? window.formatSrtTime(sub.start) : sub.start;
                let endStr = (typeof sub.end === 'number') ? window.formatSrtTime(sub.end) : sub.end;
                
                let start = startStr.replace(',', '.');
                let end = endStr.replace(',', '.');
                
                // convert "00:00:00.000" to "0:00:00.00"
                if (start.length >= 12 && start.startsWith('0')) {
                     start = start.substring(1, start.length - 1);
                }
                if (end.length >= 12 && end.startsWith('0')) {
                     end = end.substring(1, end.length - 1);
                }
                
                let fs = sub.fontSize || 32;
                let fn = sub.fontFamily || fontName;
                let bold = sub.bold ? 1 : 0;
                
                let c1 = toAssColor(sub.color1 || '#ffffff', sub.textAlpha !== undefined ? sub.textAlpha : 1);
                let bc = toAssColor(sub.bgColor !== undefined ? sub.bgColor : '#000000', sub.bgAlpha !== undefined ? sub.bgAlpha : 0.5);
                
                let px = sub.posX !== undefined ? sub.posX : 0.5;
                let py = sub.posY !== undefined ? sub.posY : 0.9;
                let x = Math.round(px * 1920);
                let y = Math.round(py * 1080);
                
                let text = (sub.text || "").replace(/\\n/g, '\\\\N');
                
                const outlines = sub.outlines || [];
                let totalWidth = outlines.reduce((acc, ol) => acc + parseInt(ol.width || 0), 0);
                let currentWidth = totalWidth;
                
                for (let i = outlines.length - 1; i >= 0; i--) {
                    const ol = outlines[i];
                    if (currentWidth > 0) {
                        let oc = toAssColor(ol.color || '#000000', ol.alpha !== undefined ? ol.alpha : 1);
                        let tags = {\\\\pos(,)\\\\fs\\\\fn\\\\1c\\\\3c\\\\4c\\\\b\\\\bord\\\\BorderStyle3};
                        assContent += Dialogue: 0,,,Default,,0,0,0,,\\n;
                    }
                    currentWidth -= parseInt(ol.width || 0);
                }
                
                let mainTags = {\\\\pos(,)\\\\fs\\\\fn\\\\1c\\\\3c\\\\4c\\\\b\\\\bord0\\\\BorderStyle3};
                assContent += Dialogue: 0,,,Default,,0,0,0,,\\n;
            });
            return assContent;
        };'''

html = html[:bad_start] + good_func + html[bad_end:]

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)