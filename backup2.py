import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本11_v1.3.7_自訂雲端儲存按鈕"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

# Copy files
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js', os.path.join(files_dir, 'panda_guard.js'))

# Create Note
note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.請問你幹嘛攔截儲存按鈕 而且原本這個版本好像沒有立即儲存按鈕
3.
4.發現使用者的 Scratch GUI 本身沒有立即儲存按鈕，因此直接在右上角 SSO 導覽列（「我的東西」旁邊）手動注入一個自製的「立即儲存」按鈕，並修改 panda_guard.js，將攔截目標改為這個自訂按鈕，以便順利觸發雲端存檔。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

# Update full conversation
full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:** 請問你幹嘛攔截儲存按鈕 而且原本這個版本好像沒有立即儲存按鈕\n")
    f.write("\n**AI:** 哎呀！原來您的版本沒有內建的「立即儲存」按鈕！我剛才還傻傻地以為有，所以寫了去攔截那個按鈕的程式碼... 我已經直接在右上角的導覽列手動加了一個「立即儲存」按鈕給您，現在點擊它就能完美存檔到雲端了！\n")

print("SUCCESS")
