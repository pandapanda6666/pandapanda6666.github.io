import sys
content = open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8').read().split('\n')
for i, line in enumerate(content):
    if '確認刪除' in line:
        print('\n'.join(content[i-5:i+15]))
        break