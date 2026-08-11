import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本26_v1.3.22_強化專案解密機制"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js', os.path.join(files_dir, 'panda_guard.js'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.他讀不到 L:\我的雲端硬碟\硬體及自製軟體\scratch\Rabboni\v2.5 PandaPanda太空大戰 (Rabboni版)\panda_project\v2.5 PandaPanda太空大戰 (Rabboni版).sb3 (讀到外層了)
3.
4.強化 panda_guard.js 對於解壓縮路徑的判斷，確保跨平台或包含斜線的資料夾也能正確解析。同時把 jszip 改為本機讀取，防止 CDN 被擋導致解密失敗。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:** 他讀不到 L:\我的雲端硬碟\硬體及自製軟體\scratch\Rabboni\v2.5 PandaPanda太空大戰 (Rabboni版)\panda_project\v2.5 PandaPanda太空大戰 (Rabboni版).sb3 (讀到外層了)\n")
    f.write("\n**AI:** 已經強化了解壓縮機制的判定方式並修正了防禦邏輯，同時將 JSZip 改為本機讀取，確保它不會因為網路問題或被擋廣告擴充阻擋而失效。現在無論是本機或雲端專案都能正確載入了！\n")

print("SUCCESS")
