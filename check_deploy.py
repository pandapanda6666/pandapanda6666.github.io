import os

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io'
for root, dirs, files in os.walk(path):
    for f in files:
        if f.endswith('.html') or f.endswith('.js') or f.endswith('.py'):
            try:
                with open(os.path.join(root, f), 'r', encoding='utf-8') as file:
                    content = file.read()
                    if '部署' in content or '清單' in content:
                        print(f"Found in: {os.path.join(root, f)}")
            except:
                pass
