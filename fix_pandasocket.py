import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\panda_sso.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = "window.socket = socket;"
replacement = """window.socket = socket;
        
        window.pandaSocket = {
            emit: function(event, data) { if(window.socket && window.socket.connected) { window.socket.emit(event, data); } },
            on: function(event, cb) { if(window.socket) { window.socket.on(event, cb); } }
        };"""

if target in content:
    content = content.replace(target, replacement)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS pandasocket")
else:
    print("NOT FOUND pandasocket")
