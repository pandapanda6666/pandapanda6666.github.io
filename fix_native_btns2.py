import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

css_inject = '''
/* Force native buttons to look active and hide Coming Soon */
div[class*="share-button_share-button_"],
div[class*="community-button_community-button_"] {
    opacity: 1 !important;
    cursor: pointer !important;
    pointer-events: auto !important;
}
div[class*="coming-soon_coming-soon_"],
div[class*="coming-soon_tooltip_"] {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
}
'''

target = "</style>"
if target in content and "Force native buttons" not in content:
    content = content.replace(target, css_inject + target)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND")
