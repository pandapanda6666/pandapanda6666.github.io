import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\panda_sso.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

start_str = "socket.on('connect_error', (err) => {"
end_str = "if (!getStoredAuthData().isLogged) {"
idx = content.find(start_str)
print(content[idx:idx+200])

start_str2 = "function showConnectionError() {"
idx2 = content.find(start_str2)
print(content[idx2:idx2+500])
