import re
with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# First, find the Style: Default,Arial line and replace it with dynamic insertion
# But wait, it's inside a template literal.
html = html.replace("Style: Default,Arial,32", "Style: Default, + (window.isDesktop ? 'Microsoft JhengHei' : 'Arial') + ,32")
html = html.replace("let fontName = sub.fontFamily || 'Arial';", "let fontName = sub.fontFamily || (window.isDesktop ? 'Microsoft JhengHei' : 'Arial');")

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)