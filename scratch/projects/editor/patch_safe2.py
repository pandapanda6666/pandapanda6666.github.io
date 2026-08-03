import os
import re

filepath = r"C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Protect Blockly Motion Color Definitions
block_protections = [
    (r'primary:"#4C97FF"', r'__BLOCK_PRIMARY__'),
    (r'tertiary:"#3373CC"', r'__BLOCK_TERTIARY__'),
    (r'colour="#4C97FF"', r'__BLOCK_COLOUR__'),
    (r'secondaryColour="#3373CC"', r'__BLOCK_SEC_COLOUR__'),
    (r'#4C97FF",secondary:"#4280D7"', r'__BLOCK_TUPLE__'),
    (r"motion: '#4C97FF'", r'__BLOCK_MOTION__'),
    (r'colour=\\"#4C97FF\\" secondaryColour=\\"#3373CC\\"', r'__BLOCK_ESC__')
]

for orig, placeholder in block_protections:
    content = re.sub(orig, placeholder, content, flags=re.IGNORECASE)

# 2. Perform the color replacements for UI
replacements = {
    '#4C97FF': '#81C784',
    '#4c97ff': '#81C784',
    '#3373CC': '#4CAF50',
    '#3373cc': '#4CAF50',
    'rgba(76, 151, 255': 'rgba(129, 199, 132',
    'rgba(76,151,255': 'rgba(129,199,132',
    'rgba(51, 115, 204': 'rgba(76, 175, 80',
    'rgba(51,115,204': 'rgba(76,175,80',
    'hsla(215, 100%, 65%, 0.20)': 'rgba(129, 199, 132, 0.20)',
    'hsla(215, 100%, 65%, 0.2)': 'rgba(129, 199, 132, 0.2)',
    'hsla(215, 100%, 65%, 1)': '#81C784',
    'hsla(215, 100%, 65%, 0.35)': 'rgba(129, 199, 132, 0.35)',
    'hsla(215, 60%, 50%, 1)': '#4CAF50',
    'hsla(215, 50%, 90%, 1)': '#E8F5E9',
    'hsla(215, 100%, 95%, 1)': '#F1F8E9',
    'hsla(215, 100%, 65%, 0.9)': 'rgba(129, 199, 132, 0.9)',
    'hsla(215, 100%, 65%, 0.15)': 'rgba(129, 199, 132, 0.15)',
    'hsla(215, 75%, 95%, 1)': '#F1F8E9'
}

for old, new in replacements.items():
    content = content.replace(old, new)

# 3. Restore the protected blocks
for orig, placeholder in block_protections:
    restore_val = orig.replace('\\\\', '\\')
    if placeholder == '__BLOCK_PRIMARY__': restore_val = 'primary:"#4C97FF"'
    if placeholder == '__BLOCK_TERTIARY__': restore_val = 'tertiary:"#3373CC"'
    if placeholder == '__BLOCK_COLOUR__': restore_val = 'colour="#4C97FF"'
    if placeholder == '__BLOCK_SEC_COLOUR__': restore_val = 'secondaryColour="#3373CC"'
    if placeholder == '__BLOCK_TUPLE__': restore_val = '#4C97FF",secondary:"#4280D7"'
    if placeholder == '__BLOCK_MOTION__': restore_val = "motion: '#4C97FF'"
    if placeholder == '__BLOCK_ESC__': restore_val = 'colour=\\"#4C97FF\\" secondaryColour=\\"#3373CC\\"'
    content = content.replace(placeholder, restore_val)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Safely patched lib.min.js with all HSLA colors")
