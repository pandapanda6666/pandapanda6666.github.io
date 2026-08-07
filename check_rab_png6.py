import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

idx = content.find('./src/lib/libraries/extensions/sipp-rabboni/rabboni_scartch3.png":')
print(f"Len: {len(content)}, Idx: {idx}")
