import subprocess

commits = subprocess.check_output(['git', 'log', '--oneline', '--', 'Edit/Video/Add subtitles/index.html']).decode('utf-8').strip().split('\n')
for line in commits:
    c = line.split()[0]
    try:
        content = subprocess.check_output(['git', 'show', f'{c}:Edit/Video/Add subtitles/index.html']).decode('utf-8').split('\n')
        main_start = next(i for i, l in enumerate(content) if '<main' in l)
        main_end = next(i for i, l in enumerate(content) if '</main>' in l)
        divs = sum(1 for l in content[main_start:main_end] if '<div' in l) - sum(1 for l in content[main_start:main_end] if '</div' in l)
        print(f'{c}: Unclosed divs: {divs}')
    except Exception as e:
        pass