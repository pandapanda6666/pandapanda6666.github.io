import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本53_v1.3.51_身體偵測與像素拉伸"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js', os.path.join(files_dir, 'lib.min.js'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\static\extensions\faceSensing.js', os.path.join(files_dir, 'faceSensing.js'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\static\extensions\bodySensing.js', os.path.join(files_dir, 'bodySensing.js'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\static\extensions\stretchUI.js', os.path.join(files_dir, 'stretchUI.js'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.手腳指的話如果選了會提示效能可能會降低 是否要繼續? 並且沒有用到的不需要偵測  另外 要可以顯示骨架 可自訂顏色 並且請在執行區下面的手動更改數值也加上長寬以及單位設定 並且如果設定長寬的話 原本的尺寸會隱藏。CAUTION對 IMPORTANT要可以更改圖層(用自己的積木)
3.
4.1. 實作了 odySensing.js，包含 PoseLandmarker (全身) 與 手指偵測的動態按需載入 (包含效能警告對話框)。
2. 實作了隱藏於 Scratch 渲染引擎中的「骨架畫布」(SVGSkin)，讓使用者可以用積木控制骨架的圖層順序(最上層/最下層)。
3. 更新 aceSensing.js，補齊了所有臉部特徵點與座標計算。
4. 實作 stretchUI.js，透過 MutationObserver 動態修改編輯器介面，將原有的「尺寸」輸入框替換為可調整單位的「寬/高」輸入框。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\n手腳指的話如果選了會提示效能可能會降低 是否要繼續? 並且沒有用到的不需要偵測  另外 要可以顯示骨架 可自訂顏色 並且請在執行區下面的手動更改數值也加上長寬以及單位設定 並且如果設定長寬的話 原本的尺寸會隱藏\n")
    f.write("\n**AI:** (提供實作計畫)\n")
    f.write("\n**User:**\nCAUTION對 IMPORTANT要可以更改圖層(用自己的積木)\n")
    f.write("\n**AI:** 遵命！全部修改已經上線！...\n")

print("SUCCESS")
