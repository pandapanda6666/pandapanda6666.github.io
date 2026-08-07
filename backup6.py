import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本15_v1.3.11_專案分享網址複製與播放器讀取"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

# Copy files
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js', os.path.join(files_dir, 'panda_guard.js'))
os.makedirs(os.path.join(files_dir, 'player'), exist_ok=True)
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\player\index.html', os.path.join(files_dir, 'player', 'index.html'))

# Create Note
note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.那分享和切換到專案頁面那部分你沒裡我欸
3.
4.修改 player/index.html，為其補上 Socket.IO 與 panda_guard.js 的依賴，讓專案頁面（Player）也能擁有讀取伺服器專案的能力。
修改 panda_guard.js，當點擊「分享」按鈕時，不再只顯示「已分享」，而是彈出 prompt 視窗顯示專案網址供使用者複製。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

# Update full conversation
full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:** 那分享和切換到專案頁面那部分你沒裡我欸\n")
    f.write("\n**AI:** 哎呀！真的是漏掉了，抱歉抱歉！我立刻補上分享按鈕的網址複製功能，並且讓獨立的專案頁面也能成功載入雲端專案！\n")

print("SUCCESS")
