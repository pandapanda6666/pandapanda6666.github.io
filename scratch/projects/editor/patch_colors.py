import os
import re

files_to_patch = [
    'lib.min.js',
    'chunks/gui.js',
    'chunks/blocksonly.js'
]

replacements = {
    '#4C97FF': '#81C784',
    '#4c97ff': '#81c784',
    '#3373CC': '#4CAF50',
    '#3373cc': '#4caf50',
    '#0fBD8C': '#81C784',
    '#0fbd8c': '#81c784',
    'rgba(76, 151, 255': 'rgba(129, 199, 132',
    'rgba(76,151,255': 'rgba(129,199,132',
    'rgba(51, 115, 204': 'rgba(76, 175, 80',
    'rgba(51,115,204': 'rgba(76,175,80',
    '#e9eef2': '#E8F5E9',
    '#edf1f5': '#F1F8E9'
}

for filepath in files_to_patch:
    if os.path.exists(filepath):
        print(f"Patching {filepath}...")
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        for old, new in replacements.items():
            content = content.replace(old, new)
            
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Successfully patched {filepath}")
        else:
            print(f"No replacements made in {filepath}")
    else:
        print(f"File {filepath} not found.")
