import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\player\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

content = content.replace('href="static/', 'href="../static/')
content = content.replace('src="lib.min.js"', 'src="../lib.min.js"')
content = content.replace('src="chunks/', 'src="../chunks/')

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("SUCCESS")
