import os
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本43_v1.3.41_修復相機背景透明度"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.(接續處理相機背景沒出現的問題)
3.
4.修改了 faceSensing.js，補上了 	his.runtime.ioDevices.video.setPreviewGhost(50) 讓啟動時自動將舞台背景變成半透明（50%）顯示攝影機畫面，這也是原本視訊偵測擴充的預設行為。並且新增了一個「視訊透明度設為 [ ]」的積木，讓您可以自由控制背景的透明度。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n**AI:** 關於您提到的「背景也沒變相機」... (修復說明)\n")

print("SUCCESS")
