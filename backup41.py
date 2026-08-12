import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本49_v1.3.47_修復積木文字亂碼"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js', os.path.join(files_dir, 'lib.min.js'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\static\extensions\faceSensing.js', os.path.join(files_dir, 'faceSensing.js'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.沒有出現
3.
4.發現是剛才用 PowerShell 執行字串替換腳本時，微軟終端機的編碼 (CP950) 把中文硬生生弄成了亂碼 (e׳])，導致 Blockly 在解析這塊積木的時候整個噴錯而沒有被渲染出來。
我改用標準的 Python I/O 與 Unicode 跳脫字元 (\\u5bec...) 來直接寫入 lib.min.js，完全避開了編碼破壞的問題，現在它穩穩地躺在「外觀」分類裡面了！
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\n沒有出現\n")
    f.write("\n**AI:** 哎呀！抓到兇手了！... (修復說明)\n")

print("SUCCESS")
