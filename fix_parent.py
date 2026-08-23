import re

with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Make the left panel flex shrinkable
html = html.replace(
    '<div class="flex-1 flex flex-col p-4 bg-black relative rounded-lg border border-slate-700 items-center justify-center min-w-0">',
    '<div class="flex-1 flex flex-col p-4 bg-black relative rounded-lg border border-slate-700 items-center justify-center min-w-0 min-h-0">'
)

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)