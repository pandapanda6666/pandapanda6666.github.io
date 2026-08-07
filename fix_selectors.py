import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = '''div[class*="share-button_share-button_"],
div[class*="community-button_community-button_"] {'''
replacement = '''[class*="share-button_share-button_"],
[class*="community-button_community-button_"] {'''
content = content.replace(target, replacement)

target2 = '''div[class*="coming-soon_coming-soon_"],
div[class*="coming-soon_tooltip_"] {
    display: none !important;'''
replacement2 = '''[class*="coming-soon_coming-soon_"],
[class*="coming-soon_tooltip_"],
.__react_component_tooltip {
    display: none !important;'''
content = content.replace(target2, replacement2)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)

path_guard = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path_guard, 'r', 'utf-8') as f:
    content_guard = f.read()

content_guard = content_guard.replace("e.target.closest('div[class*=\"share-button_share-button_\"]')", "e.target.closest('[class*=\"share-button_share-button_\"]')")
content_guard = content_guard.replace("e.target.closest('div[class*=\"community-button_community-button_\"]')", "e.target.closest('[class*=\"community-button_community-button_\"]')")

with codecs.open(path_guard, 'w', 'utf-8') as f:
    f.write(content_guard)

print("SUCCESS")
