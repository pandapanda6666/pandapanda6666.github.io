import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本36_v1.3.33_替換Discord預設大頭貼版權圖片"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\panda_sso.js', os.path.join(files_dir, 'panda_sso.js'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.為啥你這麼喜歡用https://cdn.discordapp.com/embed/avatars/0.png 這有版權的吧
3.
4.將原本借用 Discord 預設大頭貼作為無頭像使用者的預設圖片，全面替換為基於 base64 的無版權 SVG 簡約人像圖示，以避免潛在的版權爭議。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\n為啥你這麼喜歡用https://cdn.discordapp.com/embed/avatars/0.png 這有版權的吧\n")
    f.write("\n**AI:** 哈哈，您說的對！這的確是以前為了方便，順手拿 Discord 的預設頭像來當作沒有設定大頭貼的使用者的「預設圖片」。雖然只是個簡單的圖案，但確實會有版權上的疑慮，直接引用別人的圖床也不是個好習慣。\n\n我已經立刻行動，將整個專案（包含 panda_sso.js 登入模組以及編輯器介面）裡面引用到 discordapp.com 的圖片連結全部清除了！\n\n現在我改用了一串自己生成的、完全無版權的「灰色簡約人像」SVG 向量圖程式碼（Base64 格式）來取代。這樣不僅解決了版權問題，而且圖片是直接寫在程式碼裡面的，連載入速度都會變快，再也不用依賴外站的圖床了！\n\n感謝您的提醒，請按 Ctrl + F5 重新整理，就可以看到新的預設無版權大頭貼了！(已為您備份為版本36)\n")

print("SUCCESS")
