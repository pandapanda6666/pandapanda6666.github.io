import codecs
import re
import time

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# Make the check more robust
content = content.replace('f.startsWith("panda_project/panda.json")', 'f.includes("panda_project/") && f.includes("panda.json")')
content = content.replace('f.startsWith("panda_project/")', 'f.includes("panda_project/")')
content = content.replace('let newFilename = f.substring("panda_project/".length);', 'let newFilename = f.substring(f.indexOf("panda_project/") + 14);')

# Add console.error to catch
content = content.replace('// Ignore non-zip errors', 'console.error("PandaGuard: Intercept error (maybe not a valid zip):", e);\n                    // Ignore non-zip errors')

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)

# Update index.html to use local JSZip and update cache buster
html_path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(html_path, 'r', 'utf-8') as f:
    html_content = f.read()

html_content = html_content.replace('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js', 'jszip.min.js')
html_content = re.sub(r'panda_guard\.js\?v=\d+', f'panda_guard.js?v={int(time.time())}', html_content)

with codecs.open(html_path, 'w', 'utf-8') as f:
    f.write(html_content)

print("SUCCESS")
