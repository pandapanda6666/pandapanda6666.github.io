import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本44_v1.3.42_修復ioDevices_undefined錯誤"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\static\extensions\faceSensing.js', os.path.join(files_dir, 'faceSensing.js'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js', os.path.join(files_dir, 'lib.min.js'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.Cannot read properties of undefined (reading 'ioDevices')
3.
4.這是因為第三方 Scratch 擴充套件預設會在「Web Worker (沙盒)」環境下執行，但 Web Worker 是無法存取瀏覽器相機資源 (ioDevices) 的！我剛剛修改了核心的 lib.min.js，並透過 index.html 將 faceSensing 提早注入為主線程 (Main Thread) 的內建 (builtin) 擴充。這樣它就能完全融入 Scratch 原生的視訊引擎，直接獲取 ioDevices 的存取權限。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\nCannot read properties of undefined (reading 'ioDevices')...\n")
    f.write("\n**AI:** 哎呀，這個錯誤訊息真的是一語點醒夢中人！... (修復說明)\n")

print("SUCCESS")
