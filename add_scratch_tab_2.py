import codecs

path = r'C:\Users\User\Desktop\伺服器\登入\run.py'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

import re
# Find where tab_mc_server is created
match = re.search(r'([ \t]+)tab_mc_server = tk\.Frame\(tab_control, bg="#0f172a"\)', content)
if match:
    indent = match.group(1)
    target1 = f'{indent}tab_mc_server = tk.Frame(tab_control, bg="#0f172a")'
    replacement1 = f'{indent}tab_mc_server = tk.Frame(tab_control, bg="#0f172a")\n{indent}tab_scratch = tk.Frame(tab_control, bg="#0f172a")'
    content = content.replace(target1, replacement1)

# Find where tab_mc_server is added
match2 = re.search(r'([ \t]+)tab_control\.add\(tab_mc_server, text=\' [^\']+\'\)', content)
if match2:
    indent = match2.group(1)
    target2 = match2.group(0)
    
    # The code to inject
    scratch_code = f'''
{indent}tab_control.add(tab_scratch, text=' 🐱 Scratch 專案管理')

{indent}# === Scratch Project Management UI ===
{indent}scratch_title = tk.Label(tab_scratch, text="✨ PandaScratch 專案查詢面板 ✨", font=("Helvetica", 16, "bold"), fg="#4CAF50", bg="#0f172a")
{indent}scratch_title.pack(pady=10)
{indent}
{indent}search_frame = tk.LabelFrame(tab_scratch, text="查詢玩家專案", padx=10, pady=10, bg="#1e293b", fg="white")
{indent}search_frame.pack(fill="x", padx=20, pady=5)
{indent}
{indent}tk.Label(search_frame, text="輸入專案 ID:", bg="#1e293b", fg="white").grid(row=0, column=0, sticky="e")
{indent}entry_proj_id = tk.Entry(search_frame, width=30)
{indent}entry_proj_id.grid(row=0, column=1, padx=10)
{indent}
{indent}def fetch_scratch_project():
{indent}    pid = entry_proj_id.get().strip()
{indent}    if not pid:
{indent}        messagebox.showwarning("警告", "請輸入專案 ID！")
{indent}        return
{indent}    try:
{indent}        res = requests.get(f"{{LOCAL_API}}/apps")
{indent}        apps = res.json().get('apps', {{}})
{indent}        app_data = apps.get("scratch/projects", {{}}).get('data', {{}})
{indent}        
{indent}        proj = app_data.get(pid) 
{indent}        if not proj:
{indent}            messagebox.showerror("錯誤", f"找不到專案 ID: {{pid}}")
{indent}            return
{indent}            
{indent}        lbl_title.config(text=proj.get('projectName', '未命名'))
{indent}        lbl_owner.config(text=proj.get('owner', '未知作者'))
{indent}        lbl_shared.config(text="是" if proj.get('is_shared') else "否", fg="green" if proj.get('is_shared') else "red")
{indent}        
{indent}        text_inst.config(state=tk.NORMAL)
{indent}        text_inst.delete("1.0", tk.END)
{indent}        text_inst.insert("1.0", proj.get('instructions', '無說明'))
{indent}        text_inst.config(state=tk.DISABLED)
{indent}        
{indent}        text_notes.config(state=tk.NORMAL)
{indent}        text_notes.delete("1.0", tk.END)
{indent}        text_notes.insert("1.0", proj.get('notes', '無備註'))
{indent}        text_notes.config(state=tk.DISABLED)
{indent}        
{indent}    except Exception as e:
{indent}        messagebox.showerror("連線錯誤", str(e))
{indent}
{indent}tk.Button(search_frame, text="查詢資料", command=fetch_scratch_project, bg="#4CAF50", fg="white", relief=tk.FLAT).grid(row=0, column=2, padx=10)
{indent}
{indent}info_frame = tk.LabelFrame(tab_scratch, text="專案詳細資訊", padx=10, pady=10, bg="#1e293b", fg="white")
{indent}info_frame.pack(fill="both", expand=True, padx=20, pady=5)
{indent}
{indent}tk.Label(info_frame, text="擁有者:", bg="#1e293b", fg="white").grid(row=0, column=0, sticky="e", pady=5)
{indent}lbl_owner = tk.Label(info_frame, text="-", font=("Helvetica", 10, "bold"), bg="#1e293b", fg="#e2e8f0")
{indent}lbl_owner.grid(row=0, column=1, sticky="w", pady=5)
{indent}
{indent}tk.Label(info_frame, text="專案標題:", bg="#1e293b", fg="white").grid(row=1, column=0, sticky="e", pady=5)
{indent}lbl_title = tk.Label(info_frame, text="-", bg="#1e293b", fg="#e2e8f0")
{indent}lbl_title.grid(row=1, column=1, sticky="w", pady=5)
{indent}
{indent}tk.Label(info_frame, text="是否公開分享:", bg="#1e293b", fg="white").grid(row=2, column=0, sticky="e", pady=5)
{indent}lbl_shared = tk.Label(info_frame, text="-", bg="#1e293b", fg="#e2e8f0")
{indent}lbl_shared.grid(row=2, column=1, sticky="w", pady=5)
{indent}
{indent}tk.Label(info_frame, text="操作說明:", bg="#1e293b", fg="white").grid(row=3, column=0, sticky="ne", pady=5)
{indent}text_inst = tk.Text(info_frame, width=50, height=4, state=tk.DISABLED, bg="#0f172a", fg="#e2e8f0", relief=tk.FLAT)
{indent}text_inst.grid(row=3, column=1, sticky="w", pady=5)
{indent}
{indent}tk.Label(info_frame, text="備註與謝誌:", bg="#1e293b", fg="white").grid(row=4, column=0, sticky="ne", pady=5)
{indent}text_notes = tk.Text(info_frame, width=50, height=4, state=tk.DISABLED, bg="#0f172a", fg="#e2e8f0", relief=tk.FLAT)
{indent}text_notes.grid(row=4, column=1, sticky="w", pady=5)
{indent}'''
    replacement2 = target2 + '\n' + scratch_code
    content = content.replace(target2, replacement2)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("SUCCESS")
