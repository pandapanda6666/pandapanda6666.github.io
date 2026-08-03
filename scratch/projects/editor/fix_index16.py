import os

filepath = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "if (langMenu && !document.getElementById('custom-settings-menu')) {" in line:
        skip = True
    
    if skip:
        # Check for the end of the Settings block
        # The block ended right before if (bearEnabled) document.body.classList.add('bear-style');
        if "if (bearEnabled) document.body.classList.add('bear-style');" in line:
            skip = False
            new_lines.append(line)
        continue
        
    new_lines.append(line)

content = "".join(new_lines)
# Remove the old SVG injection logic entirely
import re
pattern_inject = re.compile(r"// Inject icons into File, Edit, and Tutorials\n\s*setTimeout\(\(\) => \{.*?\n\s*\}\);\n\s*\}, 500\);", re.DOTALL)
content = re.sub(pattern_inject, "", content)

# Remove the .panda-hidden-lang class logic
content = content.replace("langMenu.classList.add('panda-hidden-lang');", "")
content = content.replace("!langMenu.classList.contains('panda-hidden-lang') &&", "")
content = content.replace("langMenu.classList.remove('panda-hidden-lang');", "")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
