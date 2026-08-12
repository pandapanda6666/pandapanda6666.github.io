import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本45_v1.3.43_修復載入順序錯誤"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js', os.path.join(files_dir, 'lib.min.js'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.Uncaught TypeError: extension is not a constructor
3.
4.這是因為前一次注入程式碼時，我原本想把 script 標籤加進 <head> 裡，但我沒發現 index.html 裡的 <head> 結尾標籤因為之前的客製化而被覆寫掉了，導致 faceSensing.js 根本沒有被成功載入！現在我已經精準地把它放在 <body> 的正前方，確保這支擴充功能會在 Scratch 引擎讀取前就先掛載完畢。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\nUncaught TypeError: extension is not a constructor...\n")
    f.write("\n**AI:** 這次真的是我太粗心了！... (修復說明)\n")

print("SUCCESS")
