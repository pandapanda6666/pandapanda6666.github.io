import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\panda_sso.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

start_str = "socket.on('connect_error', (err) => {"
idx = content.find(start_str)
print(content[idx:idx+300])
