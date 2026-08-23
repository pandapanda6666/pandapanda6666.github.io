import sys
content = open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8').read().split('\n')
for i, line in enumerate(content[640:660]):
    print(f"{i+641}: {line}")