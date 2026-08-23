with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('console.log("Desktop mode enabled!");', 'console.log("Desktop mode enabled!");\n            window.addEventListener("beforeunload", () => { navigator.sendBeacon("/api/shutdown"); });')

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)