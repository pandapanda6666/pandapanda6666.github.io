import os

with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.py', 'r', encoding='utf-8') as f:
    run_py = f.read()

run_py = run_py.replace("parsed_path.path", "path")

with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.py', 'w', encoding='utf-8') as f:
    f.write(run_py)