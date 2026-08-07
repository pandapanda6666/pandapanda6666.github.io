import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本32_v1.3.28_修復無加密下載選項失效問題"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js', os.path.join(files_dir, 'panda_guard.js'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.我解壓縮後發現他還是加密的(站存清過了)
3.
4.修復了「下載到電腦」功能完全無視使用者的「存檔格式」設定，導致永遠只會下載加密版的問題。現在已經正確串接了加密開關與 Alt 快捷鍵邏輯。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\n我解壓縮後發現他還是加密的(站存清過了)\n")
    f.write("\n**AI:** 收到！這又是我的問題，太對不起了！\n我剛剛去查了代碼，發現雖然我在上個版本增加了判斷邏輯，但**實際負責打包下載的那一段程式碼，居然完全沒有去讀取您的設定**，它只是盲目地把所有東西都加密塞進 panda_project 裡面！\n\n這導致您無論在選單選擇什麼，甚至按了 Alt，它最後輸出的永遠都是加密版本。\n\n我剛剛已經把這段「強制加密」的死代碼徹底拔除，讓它乖乖聽從您在 UI 上設定的「存檔格式」以及 Alt 快捷鍵了。\n\n請您再次 Ctrl + F5 重新整理網頁，這次您只要選單選在 Normal (.sb3)，按下去下載出來的絕對就是最原始、無資料夾嵌套的標準版檔案了！(已備份為版本32)\n")

print("SUCCESS")
