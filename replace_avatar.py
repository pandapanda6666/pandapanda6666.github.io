import os
import codecs
import time
import re

search_dir = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io'
old_str = b"https://cdn.discordapp.com/embed/avatars/0.png"
new_str = b"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>"

changed_files = []

for root, dirs, files in os.walk(search_dir):
    if '.git' in root or '備份' in root:
        continue
    for file in files:
        if file.endswith(('.html', '.js')):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'rb') as f:
                    content = f.read()
                if old_str in content:
                    content = content.replace(old_str, new_str)
                    
                    if file == 'index.html':
                        try:
                            # Update JS version
                            content_str = content.decode('utf-8')
                            content_str = re.sub(r'panda_sso\.js\?v=\d+', f'panda_sso.js?v={int(time.time())}', content_str)
                            content = content_str.encode('utf-8')
                        except:
                            pass
                    
                    with open(file_path, 'wb') as f:
                        f.write(content)
                    changed_files.append(file_path)
            except Exception as e:
                pass

print(f"Changed {len(changed_files)} files: {changed_files}")
