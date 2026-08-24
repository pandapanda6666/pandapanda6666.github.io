with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f: html = f.read()
html = html.replace('Style: Default,,32', 'Style: Default,${window.isDesktop ? "Microsoft JhengHei" : "Arial"},32')
with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f: f.write(html)