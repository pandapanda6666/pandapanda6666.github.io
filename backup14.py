import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本23_v1.3.19_全新專案展示頁面"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

# Copy files
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\index.html', os.path.join(files_dir, 'index.html'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'editor_index.html'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js', os.path.join(files_dir, 'panda_guard.js'))

# Create Note
note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.伺服器回傳功能：請幫我在目前的網頁程式碼中...
3.
4.建立全新的專案展示頁面 (scratch/projects/index.html)
- 完全還原 Scratch 官方風格的介面設計
- 實作「分享/已分享」切換與權限阻擋機制 (is_shared 驗證)
- 實作與後端 Socket.io 對接存取標題、說明、備註欄位
- 加入 CORS 提醒與 P 幣圖示規範
- 修改編輯器內「切換到專案頁面」按鈕的網址跳轉邏輯
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

# Update full conversation
full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:** 伺服器回傳功能：請幫我在目前的網頁程式碼中，修改與新增以下功能，加入「即時多人連線與雲端存檔功能」，並整合我專屬的「統一登入系統(SSO)」。(包含版權宣告、CORS提醒與 Python Tkinter 後台腳本)\n")
    f.write("\n**AI:** 已經為您建立全新的專案展示頁面！包含完整的介面還原、權限控管、P幣圖示規範與版權宣告，並在結尾附上了您專屬的 Python Tkinter 管理面板代碼。\n")

print("SUCCESS")
