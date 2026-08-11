import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本28_v1.3.24_修復語法錯誤導致載入失敗"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js', os.path.join(files_dir, 'panda_guard.js'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.Uncaught SyntaxError: Unexpected token ')'
3.
4.修復了在版本 27 替換程式碼時，不小心刪除的一個結尾括號，導致整個腳本發生語法錯誤 (Syntax Error)，使防盜系統無法正常啟動，所以才會讀到外層。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\nUncaught SyntaxError: Unexpected token ')'\ncheckPropTypes.js:20 Warning: Failed prop type...\n有個是擴充錯誤 那個不用管\n")
    f.write("\n**AI:** 啊！破案了！！\n這完全是我的失誤，剛剛在為您加入「偵錯彈窗」的過程中，我在修改代碼時不小心漏掉了一個 };，導致整個腳本出現了語法錯誤 (SyntaxError)。\n因為腳本發生語法錯誤而崩潰了，所以防盜腳本根本沒有在運作，Scratch 自然就會把它當作普通的檔案，並讀取最外層的警告專案！\n\n我剛剛已經光速修復了這個語法錯誤，並把更新推上去了。請您再次重新整理網頁（Ctrl + F5），然後再載入一次**原本**那個（尚未被您手動刪除外層的）加密 .sb3 檔案。\n\n非常抱歉讓您繞了一大圈，這次一定能正確看到偵錯視窗或直接載入成功了！(已備份為版本28)\n")

print("SUCCESS")
