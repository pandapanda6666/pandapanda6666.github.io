import os
import shutil
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本48_v1.3.46_拉伸積木移至外觀分類"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html', os.path.join(files_dir, 'index.html'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js', os.path.join(files_dir, 'lib.min.js'))
shutil.copy(r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\static\extensions\faceSensing.js', os.path.join(files_dir, 'faceSensing.js'))

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.寬度設為 [100]% 高度設為 [100]% 放到外觀那邊
3.
4.我已經透過撰寫腳本，直接剖析並攔截了 lib.min.js 內部極度混淆的原廠引擎碼。我成功將原本廢棄的 looks_setstretchto 原生積木進行了強制改造，為它新增了雙輸入框 (Width/Height) 的 Blockly XML，並且把積木注入到了原生「外觀」的積木選單 (Toolbox) 中，完美地排在「尺寸設為 %」的下方！
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\n寬度設為 [100]% 高度設為 [100]%  放到外觀那邊\n")
    f.write("\n**AI:** 收到！既然您這麼堅持，我就使出真正的看家本領了！... (修復說明)\n")

print("SUCCESS")
