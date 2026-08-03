import os
filepath = r"C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("background: var(--panda-green); color: #81C784;", "background: white; color: #81C784;")
content = content.replace("var(--panda-dark-green) !important;", "var(--panda-green) !important;")

hover_target = """[class*="menu-item_menu-item_"]:hover,
[class*="menu-item_hoverable_"]:hover,
[class*="menu_menu_"] li:hover,
[class*="context-menu_menu-item_"]:hover {
    background-color: var(--panda-green) !important;"""
hover_replace = hover_target.replace("var(--panda-green)", "var(--panda-dark-green)")
content = content.replace(hover_target, hover_replace)

panda_hover_target = """.panda-dropdown li:hover {
    background-color: var(--panda-green) !important;"""
panda_hover_replace = panda_hover_target.replace("var(--panda-green)", "var(--panda-dark-green)")
content = content.replace(panda_hover_target, panda_hover_replace)

content = content.replace("v=70", "v=71").replace("v=69", "v=71")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

