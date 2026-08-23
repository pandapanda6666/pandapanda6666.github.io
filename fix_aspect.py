import re

with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the video container class again
html = re.sub(
    r'<div id="videoContainer"[^>]*>',
    '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"><div id="videoContainer" class="bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center relative shadow-lg" style="aspect-ratio: 16/9; max-width: 100%; max-height: 100%; width: 100%; height: auto;">',
    html
)

# And we need to close that wrapper div where videoContainer closes
# Let's find </video>
# Wait, videoContainer closes after safeZoneOverlay
# Let's just find the closing tag for videoContainer
html = html.replace(
    '<div id="safeZoneOverlay" class="absolute inset-0 pointer-events-none hidden z-30"></div>\n                </div>',
    '<div id="safeZoneOverlay" class="absolute inset-0 pointer-events-none hidden z-30"></div>\n                </div>\n                </div>'
)

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)