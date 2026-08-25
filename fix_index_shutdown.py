with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('fetch("/api/shutdown", { method: "POST", keepalive: true }).catch(e=>console.error(e));',
                    'navigator.sendBeacon("/api/shutdown");')

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("index.html sendBeacon restored.")