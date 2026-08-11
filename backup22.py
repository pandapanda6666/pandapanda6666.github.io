import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本30_v1.3.26_修復進入網頁即跳出錯誤視窗的問題"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js', os.path.join(files_dir, 'panda_guard.js'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.我這是一進去就這樣
3.
4.移除了不必要的彈窗警告。因為 Scratch 剛進入網頁時會嘗試載入一個「預設的空白專案（字串格式）」，結果被我的防盜系統誤判為「損毀的壓縮檔」而跳出剛剛新增的警告彈窗。現在已經針對字串格式直接放行，不會再有惱人的彈窗了。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\n我這是一進去就這樣\n")
    f.write("\n**AI:** 收到！這是一個「甜蜜的誤會」！\n因為 Scratch 編輯器**剛打開時（一進去時）**，系統預設會丟一個「預設的空白小貓咪專案（字串格式）」給核心載入，結果我的防盜系統攔截到它，發現它根本不是正常的 ZIP 壓縮檔，於是就觸發了我剛剛特別為您加上的「解密失敗警告彈窗」！\n\n這導致您一進去網頁就被這個彈窗糊臉，根本還沒機會手動載入您的檔案 😅\n\n我已經把這個「針對非壓縮檔的錯誤彈窗」拿掉了，並讓系統自動放行預設專案。請您：\n1. 再次 **Ctrl + F5 重新整理網頁**。\n2. 這次進去網頁應該就不會再跳出錯誤了。\n3. 請您用「從電腦中挑選」載入您剛剛新下載的完整 .sb3 檔案。\n\n(已為您備份為版本30，這次保證一路暢通！)\n")

print("SUCCESS")
