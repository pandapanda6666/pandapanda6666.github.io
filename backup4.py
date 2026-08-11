import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本13_v1.3.9_專案頁面網址清理"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

# Copy files
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js', os.path.join(files_dir, 'panda_guard.js'))
os.makedirs(os.path.join(files_dir, 'player'), exist_ok=True)
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\player\index.html', os.path.join(files_dir, 'player', 'index.html'))

# Create Note
note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.請不要讓網址裡面有檔案名稱 一率使用index.html 例如原本的pandapanda6666.github.io/scratch/projects/editor/player.html 只要改成pandapanda6666.github.io/scratch/projects/editor/player/index.html就可以透過pandapanda6666.github.io/scratch/projects/editor/player來前往 不用加檔案名稱
3.
4.將原本的 player.html 移動到 player/index.html，並同步更新 panda_guard.js 與 index.html 中「切換到專案頁面」按鈕的網址連結，移除結尾的 .html，使網址更加乾淨（/player/?id=xxx）。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

# Update full conversation
full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:** 請不要讓網址裡面有檔案名稱 一率使用index.html 例如原本的pandapanda6666.github.io/scratch/projects/editor/player.html 只要改成pandapanda6666.github.io/scratch/projects/editor/player/index.html就可以透過pandapanda6666.github.io/scratch/projects/editor/player來前往 不用加檔案名稱\n")
    f.write("\n**AI:** 沒問題！我已經將 player.html 重新命名為 player/index.html，並且同步修改了按鈕裡的網址連結！\n")

print("SUCCESS")
