import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

idx = content.find('name: \'Sipp Rabboni\'')
if idx != -1:
    start = max(0, idx - 500)
    end = min(len(content), idx + 1000)
    print(content[start:end])
else:
    print("NOT FOUND")
