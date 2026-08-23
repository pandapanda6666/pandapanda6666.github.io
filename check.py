import subprocess
import re

out = subprocess.check_output(['git', 'log', '--oneline', '--', 'Edit/Video/Add subtitles/index.html']).decode('utf-8')
commits = [line.split()[0] for line in out.strip().split('\n')]

for c in commits:
    try:
        content = subprocess.check_output(['git', 'show', f'{c}:Edit/Video/Add subtitles/index.html']).decode('utf-8')
        if '導出全部字幕' in content:
            print(f'{c} is PERFECT! Has 導出全部字幕')
            break
    except Exception as e:
        pass