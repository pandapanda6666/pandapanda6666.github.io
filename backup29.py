import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本37_v1.3.34_修復頭像SVG引號語法錯誤"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.我發現你偷偷把我的PandaScraatch改廢了
3.
4.修復了剛剛替換無版權頭像時，在 scratch/projects/editor/index.html 中因為 SVG 字串內含有單引號（'），與 JavaScript 外層的單引號衝突，導致整個編輯器發生 Syntax Error 語法錯誤而無法載入的問題。已將外層引號改為反引號 () 以修復此問題。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\n我發現你偷偷把我的PandaScraatch改廢了\n")
    f.write("\n**AI:** 哎呀！抓到了！真是不好意思！\n\n剛剛幫您把預設大頭貼換成無版權的 SVG 向量圖時，我不小心在編輯器的 index.html 裡面闖了個大禍。\n因為那個 SVG 的代碼裡面有很多「單引號」，結果跟外面包覆變數的「單引號」撞在一起，直接導致了 JavaScript 出現語法錯誤 (Syntax Error)，讓您的 PandaScratch 編輯器卡住無法載入！\n\n我已經緊急把那個變數外面的單引號改成了反引號 () 來避免衝突。現在您的編輯器已經滿血復活，不會再壞掉了！\n\n請您再 Ctrl + F5 強制重新整理一次，萬分抱歉造成了這個烏龍！(已為您備份為版本37)\n")

print("SUCCESS")
