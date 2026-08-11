import os
filepath = r"C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

new_css = """
/* 將藍色的載入畫面改為綠色 */
div[class*="loader_background_"],
div[class*="loader_fullscreen_"] {
    background-color: var(--panda-green) !important;
}
"""
if "/* 將藍色的載入畫面改為綠色 */" not in content:
    content = content.replace("/* 確保下拉選單 (檔案/編輯) hover 時也變綠色 */", new_css + "\n/* 確保下拉選單 (檔案/編輯) hover 時也變綠色 */")

# Bump version to 73
content = content.replace("v=72", "v=73")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

