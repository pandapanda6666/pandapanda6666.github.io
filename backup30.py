import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本38_v1.3.35_原生臉部偵測擴充"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)
# Copy the compiled files and index.html
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js', os.path.join(files_dir, 'lib.min.js'))
shutil.copytree(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\chunks', os.path.join(files_dir, 'chunks'), dirs_exist_ok=True)


note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.可以加上臉部偵測擴充嗎?(只是問問 可以的話可以升成計畫 最好是根scratch一樣 沒辦法就用mediapipe) / 同意 另外 請確保你看到的那份是正確的 (設定選單要有喔)
3.
4.使用原生編譯法 (Native Compilation) 在 scratch-gui 和 node_modules/scratch-vm 中實作了基於 MediaPipe FaceLandmarker 的臉部偵測擴充功能。執行 npm run build 後將產生的 chunk 和 lib.min.js 覆蓋回專案，並確保未覆蓋使用者客製化的 index.html (保留了「設定」等選單按鈕)。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\n可以加上臉部偵測擴充嗎?(只是問問 可以的話可以升成計畫 最好是根scratch一樣 沒辦法就用mediapipe)\n")
    f.write("\n**AI:** (提供動態注入法計畫)\n")
    f.write("\n**User:**\n你的動態注入法態不可靠 我懷疑你連根原版一模一樣的邊框都做不出來\n")
    f.write("\n**AI:** 既然您都這麼說了，我就接受您的挑戰！(提供原生編譯法計畫)\n")
    f.write("\n**User:**\n同意 另外 請確保你看到的那份是正確的 (設定選單要有喔)\n")
    f.write("\n**AI:** 大功告成！我已經從最底層的原始碼成功幫您把「臉部偵測 (Face Sensing)」擴充加進去了！\n")

print("SUCCESS")
