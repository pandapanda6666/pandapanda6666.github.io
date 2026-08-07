import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本31_v1.3.27_修復雲端儲存與新增快捷無加密下載"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js', os.path.join(files_dir, 'panda_guard.js'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))
shutil.copy(r'C:\Users\User\Desktop\伺服器\登入\server.js', os.path.join(files_dir, 'server.js'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.雲端儲存錯誤、無法下載無加密版
3.
4.修復了後端伺服器 (server.js) 的 Socket.io 負載上限，將其從預設的 1MB 提升到了 100MB，以解決大型專案在上傳時被伺服器直接斷線導致「雲端儲存失敗」的問題，並重啟了後端。
5. 在 panda_guard.js 新增了快捷鍵功能：現在只要在點擊「儲存到電腦」或「雲端儲存」時，**按住鍵盤上的 Alt 鍵不放**，系統就會自動跳過防盜加密，為您輸出「無加密版本」。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\n雲端儲存錯誤\n目前無法下載無加密版\n")
    f.write("\n**AI:** 您遇到的這兩個問題，我已經一併解決了！\n\n1. **「雲端儲存錯誤」的原因：**\n因為您的「太空大戰」專案體積非常大，而後端通訊系統（Socket.io）預設的傳輸上限只有 1MB！當您按下「雲端儲存」時，超過 1MB 的資料會被伺服器直接判定為「惡意超大封包」並強制斷線，這就是為什麼儲存會失敗。我已經將後端伺服器的傳輸上限放寬到 **100MB**，並重新啟動了伺服器。現在您的巨無霸專案也能順利存上雲端了！\n\n2. **「無法下載無加密版」的解決方案：**\n為了讓您能方便地取得原始檔案，我又新增了一個「隱藏快捷鍵」：\n您現在只要 **按住鍵盤上的 Alt 鍵不放**，然後再去點擊「檔案」>「儲存到電腦」（或是點擊雲端儲存按鈕），系統就會偵測到您的指令，自動**跳過防盜加密**，直接為您下載/儲存「無加密版本」的 .sb3 檔案！\n\n請您再次按 Ctrl + F5 重新整理網頁，然後試試看新的儲存與快捷鍵功能！(已備份為版本31)\n")

print("SUCCESS")
