import codecs

path = r'C:\Users\User\Desktop\伺服器\登入\run.py'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

import re
# Remove the tab_scratch creation
content = re.sub(r'[ \t]*tab_scratch = tk\.Frame\(tab_control, bg="#0f172a"\)\r?\n', '', content)
# Remove the tab addition
content = re.sub(r'[ \t]*tab_control\.add\(tab_scratch, text=\' 🐱 Scratch 專案管理\'\)\r?\n', '', content)
# Remove the entire Scratch Project Management UI block
content = re.sub(r'[ \t]*# === Scratch Project Management UI ===.*?# === (End of Scratch Project Management UI ===)?', '', content, flags=re.DOTALL)
# Alternatively, I can just strip the code I added exactly
