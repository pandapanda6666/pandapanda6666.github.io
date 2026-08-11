import codecs

path = r'C:\Users\User\Desktop\伺服器\登入\run.py'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'tab_app_deploy' in line:
        start = max(0, i - 5)
        end = min(len(lines), i + 60)
        for j in range(start, end):
            print(f"{j+1}: {lines[j].strip().encode('cp950', errors='ignore').decode('cp950')}")
        break
