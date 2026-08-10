import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本35_v1.3.32_修復斷線自動重新載入遺失專案問題"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\panda_sso.js', os.path.join(files_dir, 'panda_sso.js'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.你現在時不時會自動重新載入欸 好像跳出下面這個錯誤就會 (SSO Connection Error)
3.
4.修復了 Socket.io 因為網路不穩或 Cloudflare 隧道自動中斷而觸發 connect_error 時，錯誤地直接執行 window.location.reload() 導致網頁重新載入、使用者專案進度遺失的問題。現在改為：如果只是暫時斷線，會讓 Socket.io 自動在背景重試（不干擾使用者）；只有在完全斷線超過 5 秒後，才會彈出提示視窗通知使用者已自動登出，並請使用者手動備份，而「絕對不會」再強制重新載入網頁。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\n你現在時不時會自動重新載入欸 好像跳出下面這個錯誤就會... SSO Connection Error\n")
    f.write("\n**AI:** 哎呀！這真的是我的疏忽！\n\n之前您提到「如果連不上伺服器請自動登出」，所以我寫了一個判斷：一旦連線發生錯誤就清除登入狀態，並且為了確實登出而使用了 window.location.reload() (重新載入網頁)。\n\n但是 Cloudflare 的免費隧道有時候會出現暫時性的瞬斷 (WebSocket Error)，這時候 Socket.io 其實會自動在背景嘗試重新連線。可是因為我原本的寫法一偵測到錯誤就直接「重新載入」整個網頁，這不僅干擾了您的使用，最嚴重的是會導致您還沒存檔的 Scratch 專案進度全部遺失！\n\n我已經緊急修正了這個問題：\n1. **不再隨便重新載入**：遇到網路瞬斷時，會讓連線程式自己在背景默默重連，不會干擾您的畫面。\n2. **真正的自動登出**：如果真的斷線超過 5 秒無法恢復，系統才會將您切換回訪客狀態，並且會彈出一個提示視窗跟您說「伺服器連線中斷，已為您自動登出。建議您先將專案儲存到電腦」，**絕對不會再強制重整網頁了**！\n\n請您再次 Ctrl + F5 重新整理，載入最新的連線保護機制！(已為您備份為版本35)\n")

print("SUCCESS")
