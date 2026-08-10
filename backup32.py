import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本40_v1.3.37_修復快取鎖死"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.這總不能算快取了吧
3.
4.發現 index.html 裡面被寫死了 ?v=117 這個版本鎖定參數。因為之前我刻意避開覆蓋 index.html 以免洗掉使用者的「設定」選單，導致 ?v=117 一直被保留，進而讓瀏覽器的 Service Worker 永遠只去抓舊的檔案。現在我已經透過程式把 index.html 裡面的參數升級為 ?v=118 強制破除快取鎖死。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\n這總不能算快取了吧\n")
    f.write("\n**AI:** 您是對的！這真的不能怪您，這確確實實是我剛才的疏忽！... (修復說明)\n")

print("SUCCESS")
