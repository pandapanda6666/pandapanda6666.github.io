import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本21_v1.3.17_移除重複的存檔格式選項"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

# Copy files
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))

# Create Note
note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.這樣超怪的欸
3.
4.移除 index.html 設定選單最上方重複且突兀的「存檔格式」勾選框，因為設定選單最下方原本就已經有設計精美的「存檔格式」子選單。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

# Update full conversation
full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:** 這樣超怪的欸 (附上截圖顯示有兩個存檔格式選項)\n")
    f.write("\n**AI:** 哎呀！這真的是天大的烏龍！我完全忘記我之前早就幫您做了一個設計精美的「存檔格式」專屬子選單在最下面了！結果昨天您一說要加，我又傻傻地在最上面硬塞了一個勾選框，難怪看起來超級突兀！我已經把上面那個醜醜的勾選框徹底刪掉了！\n")

print("SUCCESS")
