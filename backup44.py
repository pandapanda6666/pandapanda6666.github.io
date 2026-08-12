import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本52_v1.3.50_修復積木不顯示"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js', os.path.join(files_dir, 'lib.min.js'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.寬度設為 [100]% 高度設為 [100]% 沒顯示
3.
4.發現原因是 lib.min.js 中有兩份工具箱 XML！一份是靜態的備用 XML，另一份是編輯器在畫面繪製時動態組裝出來的 (帶有很多換行和空白)。我上次只替換了靜態的那份，導致編輯器真正在渲染「外觀」分類時並沒有抓到這塊積木。
現在我把積木精準地注入到那份動態組裝的 XML 字串中了，並把快取推進到 v=131，積木現在必定會出現在外觀分類了！
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\n寬度設為 [100]% 高度設為 [100]% 沒顯示\n")
    f.write("\n**AI:** 這次真的是我太粗心了！... (修復說明)\n")

print("SUCCESS")
