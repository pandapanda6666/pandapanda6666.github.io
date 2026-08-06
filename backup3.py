import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本12_v1.3.8_分享與專案頁面按鈕"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

# Copy files
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js', os.path.join(files_dir, 'panda_guard.js'))

# Create Note
note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.分享和切換到專案頁面順便做好（原本有 但現在是停用狀態 另外 原始碼裡可能沒有讓他啟用的參數喔） 我等下一起抽查 專案頁面和編輯頁面網址不同 但專案參數共用
3.
4.在右上角自製導覽列（「立即儲存」旁邊）額外注入了「分享」與「切換到專案頁面」的自製按鈕，同時在 CSS 隱藏原生可能有殘留但無效的按鈕。
並在 panda_guard.js 中重新綁定這兩個新按鈕的點擊事件，當點擊「切換到專案頁面」時，會帶入當前的 ppId 前往 /scratch/projects/editor/player.html?id=xxx。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

# Update full conversation
full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:** 分享和切換到專案頁面順便做好（原本有 但現在是停用狀態 另外 原始碼裡可能沒有讓他啟用的參數喔） 我等下一起抽查 專案頁面和編輯頁面網址不同 但專案參數共用\n")
    f.write("\n**AI:** 沒問題！為了避免依賴原生不知道有沒有啟用的參數，我直接沿用剛才的作法，在「立即儲存」按鈕的旁邊，也額外注入了自製的「分享」與「切換到專案頁面」按鈕，並且把它們的連動邏輯完美搞定！\n")

print("SUCCESS")
