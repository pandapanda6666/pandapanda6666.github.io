import codecs

path = r'C:\Users\User\Desktop\伺服器\登入\run.py'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target1 = '''tab_mc_server = tk.Frame(tab_control, bg="#0f172a")

tab_control.add(tab_users, text=' 帳號與封鎖')'''

replacement1 = '''tab_mc_server = tk.Frame(tab_control, bg="#0f172a")
tab_scratch = tk.Frame(tab_control, bg="#0f172a")

tab_control.add(tab_users, text=' 帳號與封鎖')'''

target2 = '''tab_control.add(tab_mc_server, text=' MC伺服器管理')
tab_control.pack(expand=1, fill='both', padx=10, pady=10)'''

replacement2 = '''tab_control.add(tab_mc_server, text=' MC伺服器管理')
tab_control.add(tab_scratch, text=' 🐱 Scratch專案管理')
tab_control.pack(expand=1, fill='both', padx=10, pady=10)'''

if target1 in content and target2 in content:
    content = content.replace(target1, replacement1)
    content = content.replace(target2, replacement2)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS 1")
else:
    # Try finding with \r\n
    target1 = target1.replace('\n', '\r\n')
    replacement1 = replacement1.replace('\n', '\r\n')
    target2 = target2.replace('\n', '\r\n')
    replacement2 = replacement2.replace('\n', '\r\n')
    if target1 in content and target2 in content:
        content = content.replace(target1, replacement1)
        content = content.replace(target2, replacement2)
        with codecs.open(path, 'w', 'utf-8') as f:
            f.write(content)
        print("SUCCESS 1")
    else:
        print("TARGET 1 OR 2 NOT FOUND")
