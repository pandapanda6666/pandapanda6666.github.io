import os
filepath = r"C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

new_css = """
/* 確保檔案和編輯的下拉選單背景為綠色 */
ul[class*="menu_menu_"],
ul[class*="menu-bar_menu-bar-menu_"] {
    background-color: var(--panda-green) !important;
}
"""
if "/* 確保檔案和編輯的下拉選單背景為綠色 */" not in content:
    content = content.replace("/* 確保下拉選單 (檔案/編輯) hover 時也變綠色 */", new_css + "\n/* 確保下拉選單 (檔案/編輯) hover 時也變綠色 */")

content = content.replace("v=71", "v=72")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

