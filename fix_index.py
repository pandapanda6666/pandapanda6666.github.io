with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Native Window Close Event -> /api/shutdown
old_desktop = """    window.isDesktop = false;
    try {
        let res = await fetch('/api/is_desktop');
        if (res.ok) {
            window.isDesktop = true;
            console.log("Desktop mode enabled!");
        }"""
new_desktop = """    window.isDesktop = false;
    try {
        let res = await fetch('/api/is_desktop');
        if (res.ok) {
            window.isDesktop = true;
            console.log("Desktop mode enabled!");
            window.addEventListener("beforeunload", () => { navigator.sendBeacon("/api/shutdown"); });
        }"""
html = html.replace(old_desktop, new_desktop)

# 2. Font download and ASS generation fix
old_ffmpeg_load = """            try {
                showLoading("FFmpeg 引擎正在載入，請稍候... (免 SharedArrayBuffer 版)", false);"""
new_ffmpeg_load = """            try {
                showLoading("FFmpeg 引擎與中文字型載入中，請稍候...", false);"""
html = html.replace(old_ffmpeg_load, new_ffmpeg_load)

# Find the ASS Content generation loop and replace Arial with Noto Sans CJK TC
html = html.replace("let fontName = 'Arial';", "let fontName = 'Noto Sans CJK TC';")

# Find the ffmpeg export logic and add the font fetch
old_ffmpeg_export = """                const vidName = 'input_video.mp4';
                await ffmpeg.writeFile(vidName, new Uint8Array(await mediaFile.blob.arrayBuffer()));
                await ffmpeg.writeFile('subs.ass', new TextEncoder().encode(assContent));
                
                showLoading("正在合成影片與字幕，請耐心等候...", true);
                window.ffmpegExportStartTime = Date.now();
                
                const scaleFilter = scale=-2:;
                await ffmpeg.exec(['-i', vidName, '-vf', ${scaleFilter},ass=subs.ass, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28', '-c:a', 'copy', 'output.mp4']);"""
new_ffmpeg_export = """                const vidName = 'input_video.mp4';
                await ffmpeg.writeFile(vidName, new Uint8Array(await mediaFile.blob.arrayBuffer()));
                await ffmpeg.writeFile('subs.ass', new TextEncoder().encode(assContent));
                
                showLoading("正在下載/準備中文字型...", false);
                try {
                    await ffmpeg.createDir('/fonts');
                } catch(e) {}
                
                // Fetch Noto Sans CJK TC font
                const { fetchFile } = FFmpegUtil;
                const fontUrl = "https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/TraditionalChinese/NotoSansCJKtc-Regular.otf";
                await ffmpeg.writeFile('/fonts/NotoSansCJKtc-Regular.otf', await fetchFile(fontUrl));
                
                showLoading("正在合成影片與字幕，請耐心等候...", true);
                window.ffmpegExportStartTime = Date.now();
                
                const scaleFilter = scale=-2:;
                // Pass fontsdir=/fonts to the ass filter so it finds the font
                await ffmpeg.exec(['-i', vidName, '-vf', ${scaleFilter},ass=subs.ass:fontsdir=/fonts, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28', '-c:a', 'copy', 'output.mp4']);"""
html = html.replace(old_ffmpeg_export, new_ffmpeg_export)

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)