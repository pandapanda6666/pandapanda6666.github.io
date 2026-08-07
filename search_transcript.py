import os
import json

path = r'C:\Users\User\.gemini\antigravity\brain'
for root, dirs, files in os.walk(path):
    for f in files:
        if f == 'transcript.jsonl':
            full_path = os.path.join(root, f)
            try:
                with open(full_path, 'r', encoding='utf-8') as file:
                    for line in file:
                        if '部署清單' in line:
                            data = json.loads(line)
                            if 'content' in data:
                                print(f"Found in {f}: {data['content'][:500]}")
            except:
                pass
