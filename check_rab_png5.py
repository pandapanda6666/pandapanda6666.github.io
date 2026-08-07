import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

idx = content.find('./src/lib/libraries/extensions/sipp-rabboni/rabboni_scartch3.png":')
start = max(0, idx - 10)
end = min(len(content), idx + 400)
with codecs.open('out.txt', 'w', 'utf-8') as f:
    f.write(content[start:end].encode('unicode_escape').decode('utf-8'))
