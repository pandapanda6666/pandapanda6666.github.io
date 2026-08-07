import codecs

path = r'C:\Users\User\Desktop\伺服器\登入\run.py'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'tab_control.add' in line:
        print(f"{i+1}: {line.strip().encode('cp950', errors='ignore').decode('cp950')}")
