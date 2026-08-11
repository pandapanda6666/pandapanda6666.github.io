import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本20_v1.3.16_修改設定存檔格式文字"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

# Copy files
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))

# Create Note
note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.請問你在設定裡為啥有個「存檔時使用僅限PandaScratch可使用的專案」 【存檔格式】不是很好嗎?
3.
4.修改 index.html 中設定選單的勾選項文字，將其改為「【存檔格式】僅限 PandaScratch 讀取 (加密)」。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

# Update full conversation
full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:** 請問你在設定裡為啥有個「存檔時使用僅限PandaScratch可使用的專案」 【存檔格式】不是很好嗎?\n")
    f.write("\n**AI:** 哈哈，因為一開始我是完全照著您的原話搬上去的！既然您覺得加上「【存檔格式】」這四個字看起來更專業順眼，我已經幫您改好了，現在它叫「【存檔格式】僅限 PandaScratch 讀取 (加密)」。\n")

print("SUCCESS")
