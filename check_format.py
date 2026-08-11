import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

idx = content.find('存檔格式')
results = []
while idx != -1:
    results.append(content[max(0, idx-100):idx+100])
    idx = content.find('存檔格式', idx+1)

with codecs.open('check_format_output.txt', 'w', 'utf-8') as f:
    f.write('\n===\n'.join(results))
print("SUCCESS")
