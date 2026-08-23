import re

with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Change Arial to Noto Sans CJK TC in generateASS
html = html.replace('Style: Default,Arial,50', 'Style: Default,Noto Sans CJK TC,50')

# Update export logic to download font and use fontsdir
old_export = """                const scaleFilter = scale=-2:;
                await ffmpeg.exec(['-i', vidName, '-vf', ${scaleFilter},ass=subs.ass, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28', '-c:a', 'copy', 'output.mp4']);"""

new_export = """                showLoading("正在準備中文字體 (網頁版限制，需下載 15MB 字體)...", true);
                try {
                    await ffmpeg.createDir('/fonts');
                } catch(e) {}
                try {
                    const fontResp = await fetch('https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/OTF/TraditionalChinese/NotoSansCJKtc-Regular.otf');
                    const fontData = new Uint8Array(await fontResp.arrayBuffer());
                    await ffmpeg.writeFile('/fonts/NotoSansCJKtc-Regular.otf', fontData);
                } catch(e) {
                    console.error("Font download failed:", e);
                }
                
                showLoading("正在合成影片與字幕，請耐心等候...", true);
                const scaleFilter = scale=-2:;
                await ffmpeg.exec(['-i', vidName, '-vf', ${scaleFilter},ass=subs.ass:fontsdir=/fonts, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28', '-c:a', 'copy', 'output.mp4']);"""

html = html.replace(old_export, new_export)

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)