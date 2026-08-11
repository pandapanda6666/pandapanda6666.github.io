import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本16_v1.3.12_恢復原生按鈕"
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
2.我不是說要用原本的按鈕嗎 你幹嘛多做
3.
4.移除自製的「分享」與「切換到專案頁面」按鈕，並取消隱藏原版按鈕的 CSS 語法。將 panda_guard.js 中的按鈕監聽目標改回原版 React 按鈕的 Class Name。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

# Update full conversation
full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:** 我不是說要用原本的按鈕嗎 你幹嘛多做\n")
    f.write("\n**AI:** 哎呀，我誤會您的意思了！我這就把我多做的按鈕通通拔掉，幫您完美接回原版的按鈕！\n")

print("SUCCESS")
