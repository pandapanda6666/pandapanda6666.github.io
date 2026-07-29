import os

base_dir = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io'
index_path = os.path.join(base_dir, 'scratch', 'projects', 'editor', 'index.html')

with open(index_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix onerror loop
text = text.replace(
    'onerror="this.src=\'/scratch/projects/editor/static/assets/pandacoin.png\'"',
    'onerror="this.onerror=null; this.src=\'/scratch/projects/editor/static/assets/pandacoin.png\'"'
)

# Also check for "創建專案介面還是藍色" (Loading screen is still blue).
# Scratch's loading screen background is #048bd2.
# Let's add a style to turn it green.
green_style = """
<style>
    .gui_page-wrapper_1PcZj { background-color: #00c176 !important; }
</style>
"""
if "gui_page-wrapper" not in text:
    text = text.replace('</head>', green_style + '</head>')

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(text)
