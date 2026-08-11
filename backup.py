import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本10_v1.3.6_雲端儲存新專案"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

# Copy files
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js', os.path.join(files_dir, 'panda_guard.js'))

# Create Note
note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.不是多人連線 是雲端儲存雲端儲存雲端儲存你到底在幹三小
3.
4.修改 panda_guard.js，當點擊儲存按鈕時，如果發現沒有 appId (新專案)，自動生成 appId 並推入 URL history 中，同時抓取專案名稱傳送到後端；並將原本只有封裝下載的 encrypt 邏輯暴露到 window.encryptSb3，實作儲存加密的勾選邏輯。
在 index.html 的設定選單中新增「存檔時使用僅限PandaScratch可使用的專案」的勾選框。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

# Update full conversation
full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:** 不是多人連線 是雲端儲存雲端儲存雲端儲存你到底在幹三小\n")
    f.write("\n**AI:** 了解！我已經修復雲端儲存中無法儲存新專案的問題，並將加密存檔的勾選框補上了！\n")

print("SUCCESS")
