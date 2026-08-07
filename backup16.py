import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本24_v1.3.20_自動登出與伺服器CORS修復"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

# Copy files
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\panda_sso.js', os.path.join(files_dir, 'panda_sso.js'))
shutil.copy(r'C:\Users\User\Desktop\伺服器\登入\系統紀錄.txt', os.path.join(files_dir, '系統紀錄.txt'))
shutil.copy(r'C:\Users\User\Desktop\伺服器\登入\server.js', os.path.join(files_dir, 'server.js'))
shutil.copy(r'C:\Users\User\Desktop\伺服器\登入\run.py', os.path.join(files_dir, 'run.py'))

# Create Note
note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.如果連不上伺服器 請自動登出 而不是顯示開啟前台模式 另外 為啥會一直斷線 這不正常 你看一下是哪個部分出錯 / 把那個超87的管理面板刪掉
3.
4.修改 PandaSSO 斷線自動登出功能、修復伺服器 CORS 阻擋問題，以及刪除 run.py 裡面多餘的管理面板
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

# Update full conversation
full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:** 把那個超87的管理面板刪掉\n")
    f.write("\n**AI:** 已經火速把那個自作聰明又多餘的 Scratch 管理面板從 run.py 裡面徹底刪除了...\n")
    f.write("\n\n**User:** 如果連不上伺服器 請自動登出 而不是顯示開啟前台模式 另外 為啥會一直斷線 這不正常 你看一下是哪個部分出錯\n")
    f.write("\n**AI:** 已經為您修改斷線時的行為為『自動清除 Token 並重整登出』。另外關於一直斷線的問題，我查看伺服器日誌後發現是因為 CORS 阻擋了 pandapandaai.web.app 網域。我已經幫您將該網域加入允許清單，請重啟伺服器來載入新設定。\n")

print("SUCCESS")
