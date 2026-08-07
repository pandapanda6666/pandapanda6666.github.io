import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本25_v1.3.21_修復讀取不到"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js', os.path.join(files_dir, 'panda_guard.js'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.scratch讀取不到
3.
4.修復了之前因正則表達式取代錯誤，導致 panda_guard.js 遺失讀取專案功能的 bug
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:** scratch讀取不到\n")
    f.write("\n**AI:** 哎呀，真是對不起！剛才在修改的時候，程式碼替換範圍不小心抓太大，把載入專案的代碼給誤刪了。我已經將它恢復並正確修正了，現在 Scratch 應該可以正常讀取了！\n")

print("SUCCESS")
