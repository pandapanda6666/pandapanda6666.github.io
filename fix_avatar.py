import os

base_dir = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io'
index_path = os.path.join(base_dir, 'scratch', 'projects', 'editor', 'index.html')
with open(index_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "const username = localStorage.getItem('panda_username')" in line:
        skip = True
        new_lines.append(
'''            const username = localStorage.getItem('panda_session_user') || localStorage.getItem('sso_user') || '使用者';
            const avatar = localStorage.getItem('panda_avatar') || 'https://cdn.discordapp.com/embed/avatars/0.png';
            const balance = localStorage.getItem('panda_balance') || 0;
            
            authContainer.innerHTML = `
                <div class="avatar-container menu-bar_menu-bar-item_264qQ menu-bar_hoverable_2sbwj" style="display: flex; align-items: center; cursor: pointer; height: 100%; position: relative; padding: 0 15px;">
                    <img src="${avatar}" class="avatar" style="width:32px; height:32px; border-radius:50%; margin-right:8px; border:1px solid rgba(255,255,255,0.4); background:#fff; object-fit: cover;">
                    <span class="username" style="color: white; font-size: 0.85rem; font-weight: bold; display: flex; align-items: center;">
                        ${username}
                        <span style="margin-left: 10px; color: gold; font-weight: bold; display: flex; align-items: center;">
                            <img src="https://pandapanda6666.github.io/login-hub/pandacoin.png" style="width:16px;height:16px;margin-right:2px;" onerror="this.src='/scratch/projects/editor/static/assets/pandacoin.png'" />${balance}
                        </span>
                    </span>
'''
        )
    elif skip and '<ul class="dropdown-content' in line:
        skip = False
        new_lines.append(line)
    elif not skip:
        new_lines.append(line)

with open(index_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
