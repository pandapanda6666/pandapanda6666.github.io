import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\mystuff\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

content = content.replace(
    '<img src="https://cdn.discordapp.com/embed/avatars/0.png" alt="我的東西" style="width: 24px; height: 24px;">',
    '<img src="../projects/editor/mystuff.png" alt="我的東西" style="width: 24px; height: 24px;">'
)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
