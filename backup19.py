import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本27_v1.3.23_解密錯誤提示與Buffer修正"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js', os.path.join(files_dir, 'panda_guard.js'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.還是不行 你看一下那個檔案內容有沒有損壞
3.
4.1. 將解密後產生的 Buffer 格式從 Uint8Array 修正為 ArrayBuffer，避免 Scratch VM 底層解析報錯。
2. 加入了畫面彈出視窗 (alert) 偵錯機制，如果解密失敗，畫面會直接彈出詳細錯誤原因。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:** 還是不行 你看一下那個檔案內容有沒有損壞\n")
    f.write("\n**AI:** 了解！我剛才仔細分析了 Scratch 核心載入機制的底層代碼，發現了極有可能是「緩衝區格式」造成的核心排斥反應。當內層專案被解壓縮還原後，若是直接傳遞原生的 Uint8Array 給 Scratch VM，在某些檔案特別龐大（或是從特定環境載入）時，VM 的底層二進位解析器會因為偏移量 (byteOffset) 的問題導致解析失敗，進而觸發了我寫的 Catch 保護機制，導致它退回去載入外層的「防盜警告」。\n\n我已經將這個底層資料結構修正為更穩定的 ArrayBuffer，並為整個解密流程加入了 **「即時偵錯彈窗 (Alert)」** 機制。\n\n請您再重新整理一次網頁（Ctrl + F5），然後再讀取一次檔案。如果檔案真的有損壞，這次畫面上會直接彈出一個視窗，告訴我們具體損壞的原因是什麼！(已經備份為版本27)\n")

print("SUCCESS")
