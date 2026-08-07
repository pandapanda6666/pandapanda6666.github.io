import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\player\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = "</head>"
injection = '''
    <!-- PANDASCRATCH INJECT -->
    <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
    <script src="../../../panda_sso.js?v=117"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="../warning_project_data.js"></script>
    <script src="../panda_guard.js"></script>
    <!-- PANDASCRATCH INJECT END -->
'''

if target in content and "PANDASCRATCH INJECT" not in content:
    content = content.replace(target, injection + target)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("ALREADY INJECTED OR NOT FOUND")
