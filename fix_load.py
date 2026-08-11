import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = '''                            const byteArray = new Uint8Array(byteNumbers);
                            originalLoad(byteArray).then(() => {
                                console.log("PandaGuard: Cloud project loaded successfully!");
                            });'''
replacement = '''                            const byteArray = new Uint8Array(byteNumbers);
                            vm.loadProject(byteArray).then(() => {
                                console.log("PandaGuard: Cloud project loaded successfully!");
                            });'''

if target in content:
    content = content.replace(target, replacement)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND")
