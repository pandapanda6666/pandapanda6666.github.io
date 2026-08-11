import re

file_path = r"scratch\projects\editor\index.html"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# Fix language parameter bug that was in 27816cd (English -> en, etc)
text = text.replace("pandaSetLanguage('English')", "pandaSetLanguage('en')")
text = text.replace("pandaSetLanguage('繁體中文')", "pandaSetLanguage('zh-tw')")
text = text.replace("pandaSetLanguage('简体中文')", "pandaSetLanguage('zh-cn')")
text = text.replace("pandaSetLanguage('日本語')", "pandaSetLanguage('ja')")
text = text.replace("pandaSetLanguage('한국어')", "pandaSetLanguage('ko')")
text = text.replace("pandaSetLanguage('Español')", "pandaSetLanguage('es')")
text = text.replace("pandaSetLanguage('Français')", "pandaSetLanguage('fr')")
text = text.replace("pandaSetLanguage('Deutsch')", "pandaSetLanguage('de')")

text = text.replace('lib.min.js?v=95', 'lib.min.js?v=105')
text = text.replace('chunks/gui.js?v=95', 'chunks/gui.js?v=105')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)
