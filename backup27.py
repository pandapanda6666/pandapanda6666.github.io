import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本34_v1.3.30_替換Rabboni圖示與更改顏色"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js', os.path.join(files_dir, 'lib.min.js'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\static\assets\rabboni2.png', os.path.join(files_dir, 'rabboni2.png'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.rabboni logo在...
3.
4.已經將您提供的 rabboni2.png 複製到靜態資源資料夾，並修改了 lib.min.js，將「擴充功能圖書館」與「積木分類選單」的圖示全部替換為新 Logo。同時，我也將分類名稱更名為 Rabboni2，並將該分類積木的主題顏色修改為與 Logo 搭配的質感灰色。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\nrabboni logo在L:\\我的雲端硬碟\\硬體及自製軟體\\rabboni\\測試\\rabboni2.png 請直接上傳並取代原本的Rabboni字樣 另外 顏色請改成灰色(Rabboni2)\n")
    f.write("\n**AI:** 收到！我已經將您設計的 abboni2.png Logo 上傳，並進行了修改\n")

print("SUCCESS")
