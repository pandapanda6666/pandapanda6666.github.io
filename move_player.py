import os
import shutil

base_dir = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor'
player_html = os.path.join(base_dir, 'player.html')
player_dir = os.path.join(base_dir, 'player')
player_index = os.path.join(player_dir, 'index.html')

if os.path.exists(player_html):
    os.makedirs(player_dir, exist_ok=True)
    shutil.move(player_html, player_index)
    print('Moved player.html to player/index.html')
elif os.path.exists(player_index):
    print('player/index.html already exists')
else:
    print('NOT FOUND')
