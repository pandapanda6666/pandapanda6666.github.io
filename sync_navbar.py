import os, re
base_dir = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io'

# Read scratch/index.html to get the definitive navbar HTML and CSS
with open(os.path.join(base_dir, 'scratch', 'index.html'), 'r', encoding='utf-8') as f:
    idx_text = f.read()

# Extract navbar CSS
nav_css_match = re.search(r'/\* 導覽列 \*/.*?/\* 統一 SSO 導覽列與選單排版設定 \*/', idx_text, re.DOTALL)
sso_css_match = re.search(r'/\* 統一 SSO 導覽列與選單排版設定 \*/.*?(?=</style>)', idx_text, re.DOTALL)
nav_css = nav_css_match.group(0) if nav_css_match else ''
sso_css = sso_css_match.group(0) if sso_css_match else ''
full_nav_css = nav_css + '\n' + sso_css

# Make the navbar CSS take precedence by appending !important to background-color of .navbar if missing
full_nav_css = full_nav_css.replace('background-color: var(--nav-bg);', 'background-color: var(--nav-bg) !important;')
full_nav_css = full_nav_css.replace('display: flex;', 'display: flex !important;')
full_nav_css = full_nav_css.replace('height: 50px;', 'height: 50px !important;')

# Extract navbar HTML
nav_html_match = re.search(r'<nav class="navbar">.*?</nav>', idx_text, re.DOTALL)
nav_html = nav_html_match.group(0) if nav_html_match else ''

pages = [
    'scratch/about/index.html',
    'scratch/explore/projects/all/index.html',
    'scratch/ideas/index.html',
    'scratch/messages/index.html',
    'scratch/mystuff/index.html',
    'scratch/settings/index.html',
    'scratch/users/index.html'
]

for p in pages:
    fp = os.path.join(base_dir, p.replace('/', os.sep))
    if not os.path.exists(fp): continue
    
    with open(fp, 'rb') as f:
        raw = f.read()
    
    enc = 'utf-8'
    try: text = raw.decode('utf-8')
    except: text = raw.decode('big5'); enc = 'big5'
    
    # Replace HTML
    if nav_html:
        text = re.sub(r'<nav class="navbar">.*?</nav>', nav_html, text, flags=re.DOTALL)
    
    # Remove previous injections
    text = re.sub(r'/\* 補充的導覽列與圖示按鈕排版修復 \*/.*?(?=</style>)', '', text, flags=re.DOTALL)
    text = re.sub(r'/\* 強制同步 Navbar 主容器排版 \*/.*?(?=</style>)', '', text, flags=re.DOTALL)
    text = re.sub(r'/\* 統一 SSO 導覽列與選單排版設定 \*/.*?(?=</style>)', '', text, flags=re.DOTALL)
    
    # In explore, it has old navbar-search css which might conflict, but our new HTML uses search-container.
    # It's fine to just append the full_nav_css before </style>
    
    idx_style = text.rfind('</style>')
    if idx_style != -1:
        text = text[:idx_style] + '\n' + full_nav_css + '\n' + text[idx_style:]
        
    with open(fp, 'wb') as f:
        f.write(text.encode(enc, errors='replace'))
    print('Fixed', p)
