import os

with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.pyw', 'r', encoding='utf-8') as f:
    run_pyw = f.read()

# Replace directory fetching logic
old_chdir = """    import sys
    if getattr(sys, 'frozen', False):
        base_dir = os.path.dirname(sys.executable)
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)"""
    
new_chdir = """    import sys
    if getattr(sys, 'frozen', False):
        base_dir = sys._MEIPASS
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)"""

run_pyw = run_pyw.replace(old_chdir, new_chdir)

old_local_file = """import sys
        if getattr(sys, 'frozen', False):
            base_dir = os.path.dirname(sys.executable)
        else:
            base_dir = os.path.dirname(os.path.abspath(__file__))
        local_file = os.path.join(base_dir, path.lstrip('/'))"""

new_local_file = """import sys
        if getattr(sys, 'frozen', False):
            base_dir = sys._MEIPASS
        else:
            base_dir = os.path.dirname(os.path.abspath(__file__))
        local_file = os.path.join(base_dir, path.lstrip('/'))"""

run_pyw = run_pyw.replace(old_local_file, new_local_file)

with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.pyw', 'w', encoding='utf-8') as f:
    f.write(run_pyw)