import os

filepath = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add Green CSS
green_css = '''
    <!-- PANDASCRATCH CSS INJECT -->
    <style>
        .gui_page-wrapper_1PcZj { background-color: #00c176 !important; }
        .menu-bar_main-menu_3wqJe { background-color: #00c176 !important; }
        .menu-bar_menu-bar-item_264qQ.menu-bar_active_20N_I { background-color: rgba(0, 0, 0, 0.15) !important; }
        .menu-bar_menu-bar-item_264qQ:hover { background-color: rgba(0, 0, 0, 0.1) !important; }
        .button_outlined-primary_2t21B { background: #00c176 !important; border-color: #00c176 !important; }
        #splash { background-color: #00c176 !important; }
    </style>
    '''
if 'PANDASCRATCH CSS INJECT' not in html:
    html = html.replace('</head>', green_css + '</head>')

# 2. Fix the SSO logic for username
old_username = "const username = localStorage.getItem('panda_session_user') || localStorage.getItem('sso_user') || '使用者';"
new_username = "const username = localStorage.getItem('panda_nickname') || localStorage.getItem('sso_nickname') || localStorage.getItem('panda_session_user') || '使用者';"
if old_username in html:
    html = html.replace(old_username, new_username)
else:
    print("WARNING: Could not find old username logic")

# 3. Fix the SSO logic for avatar
old_avatar = "const avatar = localStorage.getItem('panda_avatar') || 'https://cdn.discordapp.com/embed/avatars/0.png';"
new_avatar = '''let avatar = localStorage.getItem('panda_avatar');
            if (!avatar || avatar === 'undefined' || avatar === 'null') avatar = 'https://cdn.discordapp.com/embed/avatars/0.png';'''
if old_avatar in html:
    html = html.replace(old_avatar, new_avatar)
else:
    print("WARNING: Could not find old avatar logic")

# 4. Fix the onerror loop
old_onerror = "onerror=\"this.src='/scratch/projects/editor/static/assets/pandacoin.png'\""
new_onerror = "onerror=\"this.onerror=null; this.src='/scratch/projects/editor/static/assets/pandacoin.png'\""
if old_onerror in html:
    html = html.replace(old_onerror, new_onerror)
else:
    print("WARNING: Could not find old onerror")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(html)
print("index.html successfully patched!")
