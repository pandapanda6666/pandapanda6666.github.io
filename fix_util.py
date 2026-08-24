with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

addition = """                    let s1util = document.createElement('script');
                    s1util.src = 'https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.2/dist/umd/index.js';
                    s1util.onload = () => { console.log("FFmpegUtil loaded!"); window.FFmpegUtil = FFmpegUtil; };
                    document.head.appendChild(s1util);"""

text = text.replace("document.head.appendChild(s1);", "document.head.appendChild(s1);\n" + addition)

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print('FFmpegUtil added!')