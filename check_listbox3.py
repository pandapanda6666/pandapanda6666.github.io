import codecs

path = r'C:\Users\User\Desktop\伺服器\登入\run.py'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'list_scroll_frame = tk.Frame(app_list_frame)' in line:
        for j in range(i, i+5):
            print(repr(lines[j]))
