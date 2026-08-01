import os, shutil, time

base_dir = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io'
# Use correct encoding for the paths to avoid cp950 issues in the script itself
backup_base = r'C:\Users\User\Desktop\伺服器\登入\備份'
backup_dir = os.path.join(backup_base, '版本33')
files_dir = os.path.join(backup_dir, '檔案')
os.makedirs(files_dir, exist_ok=True)

# Copy modified files
mf = 'scratch/projects/editor/index.html'
src = os.path.join(base_dir, mf.replace('/', os.sep))
dst = os.path.join(files_dir, mf.replace('/', os.sep))
if os.path.exists(src):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(src, dst)

now_str = time.strftime('%Y/%m/%d %H:%M:%S', time.localtime())
note_content = f"""1.{now_str}
2.不是 版本32跟現在的版本實在差太多了 現在感覺像是版本10一樣(或是更早以前)
3.非常抱歉！我發現剛才從備份資料夾還原出來的 index.html 檔案，裡面的中文字元編碼損壞了（變成了亂碼），導致整個頁面的腳本在載入時發生了 SyntaxError！這也是為什麼您現在看到的介面是純藍色、沒有頭像、完全像原始 Scratch 一樣（因為我的綠色樣式跟頭像腳本全部因為亂碼而崩潰失效了）。我現在已經用完全乾淨的 UTF-8 編碼重新寫入了正確的介面優化腳本與樣式！
4.修復了 index.html 的亂碼問題，確保 UTF-8 正確讀寫，並將 CSS 與頭像腳本正確掛載，恢復熊積木的綠色介面與頭像。
"""

note_path = os.path.join(backup_dir, '備註.txt')
with open(note_path, 'w', encoding='utf-8') as f:
    f.write(note_content)

print("Created Backup 33")
