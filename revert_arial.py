import re

with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Revert to Arial
html = html.replace('Style: Default,Noto Sans CJK TC,50', 'Style: Default,Arial,50')

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)