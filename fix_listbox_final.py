import codecs

path = r'C:\Users\User\Desktop\伺服器\登入\run.py'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = '''        list_scroll_frame = tk.Frame(app_list_frame)
        list_scroll_frame.pack(fill=tk.BOTH, expand=True)
        self.apps_listbox = tk.Listbox(list_scroll_frame, bg="#1e293b", fg="#e2e8f0", font=("Consolas", 11), selectbackground="#3b82f6", relief=tk.FLAT, borderwidth=0)
        self.apps_listbox.grid(row=0, column=0, sticky='nsew')'''

replacement = '''        list_scroll_frame = tk.Frame(app_list_frame, bg="#0f172a")
        list_scroll_frame.pack(fill=tk.BOTH, expand=True)
        
        v_scroll = tk.Scrollbar(list_scroll_frame, orient="vertical")
        v_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        
        h_scroll = tk.Scrollbar(list_scroll_frame, orient="horizontal")
        h_scroll.pack(side=tk.BOTTOM, fill=tk.X)
        
        self.apps_listbox = tk.Listbox(list_scroll_frame, bg="#1e293b", fg="#e2e8f0", font=("Consolas", 11), selectbackground="#3b82f6", relief=tk.FLAT, borderwidth=0, yscrollcommand=v_scroll.set, xscrollcommand=h_scroll.set)
        self.apps_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        v_scroll.config(command=self.apps_listbox.yview)
        h_scroll.config(command=self.apps_listbox.xview)'''

# Also fix the line endings to match Windows style
target = target.replace('\n', '\r\n')
replacement = replacement.replace('\n', '\r\n')

if target in content:
    content = content.replace(target, replacement)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("TARGET NOT FOUND AGAIN")
