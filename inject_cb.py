import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = '<ul class="panda-dropdown left">'
replacement = '''<ul class="panda-dropdown left">
                    <li style="display: flex; align-items: center;" onclick="event.stopPropagation();">
                        <input type="checkbox" id="panda-encrypt-save-cb" onchange="localStorage.setItem('panda-encrypt-save', this.checked);" style="margin-right: 8px; cursor: pointer;">
                        <label for="panda-encrypt-save-cb" style="margin: 0; cursor: pointer; color: white;">存檔時使用僅限PandaScratch可使用的專案</label>
                    </li>'''

if target in content:
    content = content.replace(target, replacement)
    
    script_target = '    <!-- Panda Cat Blocks Injection (Safe Interval Method) -->'
    script_replacement = '''    <script>
        setTimeout(() => {
            const cb = document.getElementById('panda-encrypt-save-cb');
            if (cb) {
                cb.checked = localStorage.getItem('panda-encrypt-save') !== 'false';
            }
        }, 1000);
    </script>
    
    <!-- Panda Cat Blocks Injection (Safe Interval Method) -->'''
    
    content = content.replace(script_target, script_replacement)
    
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND")
