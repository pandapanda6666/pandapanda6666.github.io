import os
import codecs

path = r'C:\Users\User\Desktop\伺服器\登入'
for root, dirs, files in os.walk(path):
    for f in files:
        if f.endswith('.py') or f.endswith('.html') or f.endswith('.js'):
            try:
                with codecs.open(os.path.join(root, f), 'r', 'utf-8') as file:
                    content = file.read()
                    if '部署清單' in content:
                        print(f"Found in: {os.path.join(root, f)}")
            except:
                pass
