import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本33_v1.3.29_修復選單粉紅色殘留"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.滑鼠選個背景和選個角色選個音樂跑出來的選單竟然變成粉紅色了
3.
4.修復了「選擇角色/背景/音樂」時彈出的懸浮小選單會變成粉紅色的問題。原因是之前的 CSS 濾鏡（色相旋轉 -140度，用來將藍色按鈕轉為綠色）不小心重複套用到了「選單外框」與「選單內的按鈕」兩層上。兩次旋轉疊加導致色相偏移到了粉紅色/紫色區域。我已經移除了外框的重複濾鏡，現在彈出選單內的圖示會正確顯示為綠色了。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\n滑鼠選個背景和選個角色選個音樂跑出來的選單竟然變成粉紅色了\n")
    f.write("\n**AI:** 哈哈，這其實是 CSS 濾鏡（Filter）互相疊加產生的一場美麗的化學反應！\n\n之前為了將官方藍色的按鈕全部換成 Panda 主題的「綠色」，我設定了 -140度 的色相旋轉。但剛剛在彈出選單那邊，我不小心把這個濾鏡同時套用到了「外層的選單框」與「內層的小按鈕」上！\n這導致裡面的按鈕被旋轉了兩次（-280度），結果在色相環上跑到了粉紅色/紫色的區域 🌸\n\n我已經修正了 CSS，把外框多餘的濾鏡移除了。現在彈出來的選單裡面，圖示會正確呈現漂亮的綠色了！\n\n請您再次 Ctrl + F5 重新整理網頁看看！(已備份為版本33)\n")

print("SUCCESS")
