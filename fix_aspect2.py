import re

with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the style of videoContainer
html = re.sub(
    r'<div id="videoContainer"[^>]*>',
    '<div id="videoContainer" class="bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center relative shadow-lg" style="aspect-ratio: 16/9; height: 100%; max-width: 100%;">',
    html
)

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)