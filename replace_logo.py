import codecs
import time
import re

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

replacement = '''
        const logoImgs = document.querySelectorAll('img[class*="menu-bar_scratch-logo_"]');
        logoImgs.forEach(logoImg => {
            if (!logoImg.dataset.injected) {
                logoImg.dataset.injected = 'true';
                logoImg.src = 'https://pandapanda6666.github.io/scratch/projects/editor/rabboni2.png';
                // Adjust size if necessary
                logoImg.style.height = '32px';
                logoImg.style.objectFit = 'contain';
'''

content = content.replace('''
        const logoImgs = document.querySelectorAll('img[class*="menu-bar_scratch-logo_"]');
        logoImgs.forEach(logoImg => {
            if (!logoImg.dataset.injected) {
                logoImg.dataset.injected = 'true';''', replacement.strip())

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)

html_path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(html_path, 'r', 'utf-8') as f:
    html_content = f.read()
html_content = re.sub(r'panda_guard\.js\?v=\d+', f'panda_guard.js?v={int(time.time())}', html_content)
with codecs.open(html_path, 'w', 'utf-8') as f:
    f.write(html_content)
