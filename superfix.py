import re

# 1. Fix run.pyw
with open('run.pyw', 'r', encoding='utf-8') as f:
    run = f.read()

# Fix ffmpeg.exe to get_ffmpeg_path()
run = run.replace('cmd = ["ffmpeg.exe"', 'cmd = [get_ffmpeg_path()')
run = run.replace('dur_cmd = ["ffmpeg.exe"', 'dur_cmd = [get_ffmpeg_path()')

# Fix escaping
run = run.replace("safe_ass.replace(':', '\\\\\\\\:')", "safe_ass.replace(':', '\\\\:')")

with open('run.pyw', 'w', encoding='utf-8') as f:
    f.write(run)

# 2. Fix index.html
with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Revert Fontname back to Arial
html = html.replace('Style: Default,Noto Sans CJK TC,32', 'Style: Default,Arial,32')
html = html.replace("let fontName = sub.fontFamily || 'Noto Sans CJK TC';", "let fontName = sub.fontFamily || 'Arial';")

# Change font download logic
old_font_logic = '''                const fontUrl = "https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/TraditionalChinese/NotoSansCJKtc-Regular.otf";
                await ffmpeg.writeFile('/fonts/NotoSansCJKtc-Regular.otf', await fetchFile(fontUrl));
                showLoading("正在合成影片與字幕，請耐心等候...", true);
                window.ffmpegExportStartTime = Date.now();
                
                const scaleFilter = scale=-2:;
                // Pass fontsdir=/fonts to the ass filter so it finds the font
                await ffmpeg.exec(['-i', vidName, '-vf', ${scaleFilter},ass=subs.ass:fontsdir=/fonts, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28', '-c:a', 'copy', 'output.mp4']);'''

new_font_logic = '''                // download font as arial.ttf into root to trigger ffmpeg.wasm fallback
                const fontUrl = "https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/TraditionalChinese/NotoSansCJKtc-Regular.otf";
                await ffmpeg.writeFile('arial.ttf', await fetchFile(fontUrl));
                
                // fallback to arial.ttf if OTF fails
                // Or maybe fetch a TTF version just in case?
                // The WASM libass can handle OTF if loaded directly.
                
                showLoading("正在合成影片與字幕，請耐心等候...", true);
                window.ffmpegExportStartTime = Date.now();
                
                const scaleFilter = scale=-2:;
                // pass without fontsdir, rely on arial.ttf fallback
                await ffmpeg.exec(['-i', vidName, '-vf', ${scaleFilter},ass=subs.ass, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28', '-c:a', 'copy', 'output.mp4']);'''

if old_font_logic in html:
    html = html.replace(old_font_logic, new_font_logic)
else:
    print("WARNING: Could not find old_font_logic")

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)