import sys
content = open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8').read().split('\n')
for i, line in enumerate(content[641:825]):
    stripped = line.strip()
    if stripped.startswith('<div') or stripped.startswith('</div'):
        print(f'{i+642}: {stripped[:50]}')