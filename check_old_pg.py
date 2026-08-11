import codecs
path = r'C:\Users\User\Desktop\伺服器\登入\備份\版本22_v1.3.18_修復另存新檔白屏\檔案\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if 'generateAsync' in line:
        print(f"Line {i+1}: {line.strip()}")
