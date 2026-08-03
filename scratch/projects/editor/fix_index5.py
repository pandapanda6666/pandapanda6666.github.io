import os, re
filepath = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove explicitly defined fonts to inherit from Scratch
content = re.sub(r'font-size:\s*0\.85rem;\s*\n\s*font-weight:\s*bold;\s*\n', '', content)
content = re.sub(r'font-size:\s*0\.85rem;\s*\n\s*font-weight:\s*normal;\s*\n', '', content)

# Define precise Scratch menu fonts
css_fix = '''
.panda-dropdown {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important;
    font-size: 0.8125rem !important;
    font-weight: bold !important;
    color: white !important;
}
.panda-dropdown li {
    padding: 0.5rem 1rem !important;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important;
    font-weight: normal !important;
}
'''
if 'font-family: "Helvetica Neue"' not in content:
    content = content.replace('.panda-dropdown li {', css_fix + '\n.panda-dropdown li {')

content = content.replace('v=74', 'v=75')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
