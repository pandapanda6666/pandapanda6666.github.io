with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('@ffmpeg/util@0.12.2', '@ffmpeg/util@0.12.1')

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("index.html util downgraded.")