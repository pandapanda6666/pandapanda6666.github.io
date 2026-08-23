lines = open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8').read().split('\n')
del lines[809]
open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8').write('\n'.join(lines))