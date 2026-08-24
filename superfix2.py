import re
with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace("await ffmpeg.writeFile('/fonts/NotoSansCJKtc-Regular.otf', await fetchFile(fontUrl));", "await ffmpeg.writeFile('arial.ttf', await fetchFile(fontUrl));")
html = html.replace(",ass=subs.ass:fontsdir=/fonts", ",ass=subs.ass")

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)