with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('navigator.sendBeacon("/api/shutdown");', 'fetch("/api/shutdown", { method: "POST", keepalive: true }).catch(e=>console.error(e));')

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("shutdown fixed")