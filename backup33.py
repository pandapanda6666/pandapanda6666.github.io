import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本41_v1.3.39_修復相機與背景"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\static\extensions\faceSensing.js', os.path.join(files_dir, 'faceSensing.js'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js', os.path.join(files_dir, 'lib.min.js'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.沒存取相機 背景也沒變相機阿
3.
4.修改了 faceSensing.js，不再自己產生一個隱形的影片標籤，而是改呼叫 Scratch 底層內建的 	his.runtime.ioDevices.video.enableVideo()。這樣不僅會正常跳出相機授權提示，也能完美地把攝影機畫面顯示在 Scratch 的舞台背景上（如同原版視訊偵測一樣）。並且把 index.html 的快取戳記推到 v=120 以強制更新。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\n沒存取相機 背景也沒變相機阿\n")
    f.write("\n**AI:** 收到！這也是可以完美解決的... (修復說明)\n")

print("SUCCESS")
