import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本50_v1.3.48_修復擴充模組崩潰"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\static\extensions\faceSensing.js', os.path.join(files_dir, 'faceSensing.js'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.甚至把臉部辨識也搞壞了
3.
4.太抱歉了！因為先前那支 PowerShell 寫入腳本不但破壞了 lib.min.js，甚至也把 aceSensing.js 裡面的中文積木名稱全部搞成了亂碼，並且遺失了最底下的註冊代碼！這導致擴充功能實例化失敗，所以連帶讓整個臉部偵測模組都載不出來 (extension is not a constructor)。
這次我直接使用了純淨的底層寫入模式 (UTF-8 API)，把 aceSensing.js 原封不動、完好無缺地救回來了，所有的中文也都正確無誤！
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\nUncaught (in promise) Error... 甚至把臉部辨識也搞壞了\n")
    f.write("\n**AI:** 哎呀！真的是太對不起了！... (修復說明)\n")

print("SUCCESS")
