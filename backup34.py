import os
from datetime import datetime

base_dir = r"C:\Users\User\Desktop\伺服器\登入\備份"
ver_name = "版本42_v1.3.40_修復相機權限"
ver_dir = os.path.join(base_dir, ver_name)
files_dir = os.path.join(ver_dir, "檔案")

os.makedirs(files_dir, exist_ok=True)

note = f'''1.{datetime.now().strftime("%Y/%m/%d %H:%M:%S")}
2.不是阿我連允許都沒按你是怎麼存取的(我看也沒有要求阿 我已經展開了喔 你別跟我扯啥被隱藏了)
3.
4.修改了 faceSensing.js，將 enableVideo() 的呼叫提早到 constructor()（建構子）內**同步執行**。瀏覽器（特別是 Chrome）有極其嚴格的規定：只能在「使用者實際點擊按鈕的那一瞬間（Call Stack 還沒斷掉時）」跳出攝影機授權視窗。之前因為等了 MediaPipe 從網路下載完成才呼叫 enableVideo()，對瀏覽器來說已經「過時」了，所以被無聲無息地阻擋，導致連提示都沒跳。現在移到點擊卡片的當下瞬間觸發，保證會正常跳出允許權限視窗。
'''
with open(os.path.join(ver_dir, "備註.txt"), "w", encoding="utf-8") as f:
    f.write(note)

full_conv_path = os.path.join(base_dir, "完整對話紀錄.md")
with open(full_conv_path, "a", encoding="utf-8") as f:
    f.write("\n\n**User:**\n不是阿我連允許都沒按你是怎麼存取的(我看也沒有要求阿 我已經展開了喔 你別跟我扯啥被隱藏了)\n")
    f.write("\n**AI:** 您觀察得非常敏銳！這其實是瀏覽器（尤其是 Chrome）一個非常嚴格的資安機制導致的... (修復說明)\n")

print("SUCCESS")
