import codecs
import json
import os

path = r'C:\Users\User\Desktop\伺服器\登入\系統紀錄.txt'
if os.path.exists(path):
    with codecs.open(path, 'r', 'utf-8') as f:
        data = f.read()
    if data.strip():
        db = json.loads(data)
        if 'allowedOrigins' not in db:
            db['allowedOrigins'] = ["*"]
        
        # Add the blocked URL
        if 'https://pandapandaai.web.app' not in db['allowedOrigins']:
            db['allowedOrigins'].append('https://pandapandaai.web.app')
            with codecs.open(path, 'w', 'utf-8') as f:
                json.dump(db, f, ensure_ascii=False)
            print("ADDED TO DB")
        else:
            print("ALREADY IN DB")
else:
    print("FILE NOT FOUND")
