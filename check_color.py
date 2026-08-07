import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

idx = content.find('Scratch.sippRabboni')
start = max(0, idx - 800)
end = min(len(content), idx + 800)
print(content[start:end])
