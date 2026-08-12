import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本46_v1.3.44_修復MediaPipe載入錯誤"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\static\extensions\faceSensing.js', os.path.join(files_dir, 'faceSensing.js'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.Unexpected token 'export' 和 Cannot read properties of undefined (reading 'forVisionTasks')
3.
4.這是因為 MediaPipe 官方提供的 vision_bundle.js 是一個原生的 ES Module (包含了 export 語法)，不能單純用傳統的 <script src="..."> 來掛載。我已經改用現代瀏覽器原生的 dynamic import() 語法直接動態載入模組，不只解決了語法錯誤，程式碼也變得更乾淨、載入更可靠！
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\nUnexpected token 'export' 和 Cannot read properties of undefined (reading 'forVisionTasks')...\n")
    f.write("\n**AI:** 啊！這是因為 MediaPipe 的官方 CDN 提供的程式碼是 ES Module 格式... (修復說明)\n")

print("SUCCESS")
