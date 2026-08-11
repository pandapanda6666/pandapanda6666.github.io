import codecs

path = r'C:\Users\User\Desktop\伺服器\登入\run.py'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

import re
# Find the exact indentation
match = re.search(r'([ \t]+)list_scroll_frame = tk\.Frame\(app_list_frame\)', content)
if match:
    indent = match.group(1)
    target = f'''{indent}list_scroll_frame = tk.Frame(app_list_frame)
{indent}list_scroll_frame.pack(fill=tk.BOTH, expand=True)
{indent}self.apps_listbox = tk.Listbox(list_scroll_frame, bg="#1e293b", fg="#e2e8f0", font=("Consolas", 11), selectbackground="#3b82f6", relief=tk.FLAT, borderwidth=0)
{indent}self.apps_listbox.grid(row=0, column=0, sticky='nsew')'''

    replacement = f'''{indent}list_scroll_frame = tk.Frame(app_list_frame)
{indent}list_scroll_frame.pack(fill=tk.BOTH, expand=True)

{indent}v_scroll = tk.Scrollbar(list_scroll_frame, orient="vertical")
{indent}v_scroll.pack(side=tk.RIGHT, fill=tk.Y)
{indent}h_scroll = tk.Scrollbar(list_scroll_frame, orient="horizontal")
{indent}h_scroll.pack(side=tk.BOTTOM, fill=tk.X)

{indent}self.apps_listbox = tk.Listbox(list_scroll_frame, bg="#1e293b", fg="#e2e8f0", font=("Consolas", 11), selectbackground="#3b82f6", relief=tk.FLAT, borderwidth=0, yscrollcommand=v_scroll.set, xscrollcommand=h_scroll.set)
{indent}self.apps_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

{indent}v_scroll.config(command=self.apps_listbox.yview)
{indent}h_scroll.config(command=self.apps_listbox.xview)'''

    if target in content:
        content = content.replace(target, replacement)
        with codecs.open(path, 'w', 'utf-8') as f:
            f.write(content)
        print("SUCCESS")
    else:
        print("TARGET NOT FOUND. Found indent, but block mismatch.")
else:
    print("NOT FOUND INDENT")
