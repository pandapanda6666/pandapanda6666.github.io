import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = "window.socket.emit('saveAppData', { \n                                    appId: window.appId, \n                                    data: { projectBase64: base64data } \n                                }, (response) => {"
replacement = '''const projectNameInput = document.querySelector('input[class*="project-title-input_title-field_"]');
                                const projectName = projectNameInput ? projectNameInput.value : '未命名專案';
                                window.socket.emit('saveAppData', { 
                                    appId: window.appId, 
                                    projectName: projectName,
                                    data: { projectBase64: base64data } 
                                }, (response) => {'''

if target in content:
    content = content.replace(target, replacement)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND")
