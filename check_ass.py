import re

with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# We need to extract the assContent generation logic into window.generateASS

logic = '''                function toAssColor(hex, alpha) {
                    if(hex.startsWith('#')) hex = hex.substring(1);
                    if(hex.length === 3) hex = hex.split('').map(c => c+c).join('');
                    let r = hex.slice(1,3), g = hex.slice(3,5), b = hex.slice(5,7);
                    let a = Math.round((1 - alpha) * 255).toString(16).padStart(2, '0').toUpperCase();
                    return &H;
                }

                let assContent = [Script Info]\\nScriptType: v4.00+\\nPlayResX: 1920\\nPlayResY: 1080\\nWrapStyle: 0\\n\\n[V4+ Styles]\\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\\nStyle: Default,,32,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,3,2,0,2,10,10,10,1\\n\\n[Events]\\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\\n;
                
                const currentSubs = window.subtitles || [];
                currentSubs.forEach(sub => {
                    let start = formatSrtTime(sub.start).replace(',', '.');
                    let end = formatSrtTime(sub.end).replace(',', '.');
                    start = start.substring(1, start.length - 1); // ASS time format 0:00:00.00
                    end = end.substring(1, end.length - 1);
                    
                    let fs = sub.fontSize || 32;
                    let fontName = sub.fontFamily || (window.isDesktop ? 'Microsoft JhengHei' : 'Arial');
                    let bold = sub.bold ? 1 : 0;
                    
                    let c1 = toAssColor(sub.color1 || '#ffffff', sub.textAlpha !== undefined ? sub.textAlpha : 1);
                    
                    let bc = toAssColor(sub.bgColor || '#000000', sub.bgAlpha !== undefined ? sub.bgAlpha : 0.5);
                    
                    // position
                    let x = sub.x || 960;
                    let y = sub.y || 950;
                    
                    // Add outline layers if any
                    let outlines = sub.outlines || [];
                    if (outlines.length > 0) {
                        let totalWidth = outlines.reduce((sum, ol) => sum + parseInt(ol.width || 0), 0);
                        let currentWidth = totalWidth;
                        for (let i = 0; i < outlines.length; i++) {
                            let ol = outlines[i];
                            let oc = toAssColor(ol.color || '#000000', ol.alpha !== undefined ? ol.alpha : 1);
                            let tags = {\\\\pos(,)\\\\fs\\\\fn\\\\1c\\\\3c\\\\4c\\\\b\\\\bord\\\\BorderStyle3};
                            assContent += Dialogue: 0,,,Default,,0,0,0,,\\n;
                        }
                        currentWidth -= parseInt(ol.width || 0);
                    }
                    
                    let mainTags = {\\\\pos(,)\\\\fs\\\\fn\\\\1c\\\\3c\\\\4c\\\\b\\\\bord0\\\\BorderStyle3};
                    assContent += Dialogue: 0,,,Default,,0,0,0,,\\n;
    
                });'''

# Wait, 	ext is missing in ssContent += ... !
# I need to check the original logic for 	ext definition in exportVideo!