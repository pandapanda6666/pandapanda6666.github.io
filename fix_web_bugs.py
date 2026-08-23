import re

with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_bilingual = """                        } else {
                            // Bilingual mode
                            subtitles.forEach(s => s.posY = 0.82);
                            data.subtitles.forEach(s => subtitles.push(s));
                        }"""

new_bilingual = """                        } else {
                            // Bilingual mode
                            subtitles.forEach(s => s.posY = 0.82);
                            data.subtitles.forEach(s => subtitles.push(s));
                            subtitles.sort((a, b) => a.start - b.start);
                        }"""

html = html.replace(old_bilingual, new_bilingual)

# And fix the Fontname in ASS generation ONLY for web export:
old_export = """                const scaleFilter = scale=-2:;
                await ffmpeg.exec(['-i', vidName, '-vf', ${scaleFilter},ass=subs.ass:fontsdir=/fonts, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28', '-c:a', 'copy', 'output.mp4']);"""

# We need to rewrite subs.ass to use Noto Sans CJK TC right before ffmpeg.exec if we are in web mode.
# Actually, why not just change the generation of ass in the web block?
# The ssContent is already generated above: let assContent = generateASS();
# We can do: ssContent = assContent.replace("Arial", "Noto Sans CJK TC");
new_export = """                const scaleFilter = scale=-2:;
                
                // 為了讓網頁版 FFmpeg WASM 能夠正確使用剛下載的中文字體，必須把 Arial 置換成 Noto Sans CJK TC
                assContent = assContent.replace(/Arial/g, "Noto Sans CJK TC");
                await ffmpeg.writeFile('subs.ass', new TextEncoder().encode(assContent));
                
                await ffmpeg.exec(['-i', vidName, '-vf', ${scaleFilter},ass=subs.ass:fontsdir=/fonts, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28', '-c:a', 'copy', 'output.mp4']);"""

html = html.replace(old_export, new_export)

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)