import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本55_v1.3.54_修復拉伸UI的載入順序錯誤"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\static\extensions\stretchUI.js', os.path.join(files_dir, 'stretchUI.js'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.PandaGuard: Initializing universal download interceptor with Blob caching...
stretchUI.js?v=136:92 Uncaught TypeError: Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'.
3.
4.1. 修正了 stretchUI.js 因為載入時間過早（在 HTML 的 ody 標籤出現之前執行），導致無法找到 document.body 進行監聽的錯誤。已加入等待 DOMContentLoaded 或是檢查 ody 是否存在後再執行的邏輯。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\nstretchUI.js?v=136:92 Uncaught TypeError: Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'.\n")
    f.write("\n**AI:** 已經為您修正！...\n")

print("SUCCESS")
