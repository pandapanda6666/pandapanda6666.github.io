import re

with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the video container class to be more responsive
# Old: <div id="videoContainer" class="w-full max-w-3xl aspect-video bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center relative">
# New: <div id="videoContainer" class="w-full h-full max-h-full aspect-video bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center relative" style="max-width: 100%; object-fit: contain;">

html = re.sub(
    r'<div id="videoContainer" class="[^"]+">',
    '<div id="videoContainer" class="w-full h-full aspect-video bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center relative" style="max-height: 100%; object-fit: contain;">',
    html
)

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)