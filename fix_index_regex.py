import re

with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Native Window Close Event -> /api/shutdown
# Look for: window.isDesktop = true; \s* console.log("Desktop mode enabled!");
html = re.sub(
    r'(window\.isDesktop = true;\s*console\.log\("Desktop mode enabled!"\);)',
    r'\1\n            window.addEventListener("beforeunload", () => { navigator.sendBeacon("/api/shutdown"); });',
    html
)

# 2. Arial -> Noto Sans CJK TC
html = html.replace("let fontName = 'Arial';", "let fontName = 'Noto Sans CJK TC';")

# 3. Add font download before ffmpeg.exec
font_logic = """
                showLoading("正在下載/準備中文字型...", false);
                try { await ffmpeg.createDir('/fonts'); } catch(e) {}
                const { fetchFile } = FFmpegUtil;
                const fontUrl = "https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/TraditionalChinese/NotoSansCJKtc-Regular.otf";
                await ffmpeg.writeFile('/fonts/NotoSansCJKtc-Regular.otf', await fetchFile(fontUrl));
                showLoading("正在合成影片與字幕，請耐心等候...", true);
"""

html = re.sub(
    r'(showLoading\("[^"]+", true\);\s*window\.ffmpegExportStartTime = Date\.now\(\);)',
    font_logic + r'\1',
    html
)

# 4. Add fontsdir=/fonts
html = html.replace('${scaleFilter},ass=subs.ass', '${scaleFilter},ass=subs.ass:fontsdir=/fonts')

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)