import re
with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Change the default font in the header
text = text.replace('Style: Default,Arial,32', 'Style: Default,Noto Sans CJK TC,32')

# Change the fallback font in the dialogue tags
text = text.replace("let fontName = sub.fontFamily || 'Arial';", "let fontName = sub.fontFamily || 'Noto Sans CJK TC';")

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(text)