import os
import re

filepath = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the messy tail of the script with a clean one
start_marker = "            menuBar.appendChild(authWrapper);"

# Find where it starts
idx = content.find(start_marker)
if idx != -1:
    end_idx = content.find("});", idx)
    
    clean_tail = '''            menuBar.appendChild(authWrapper);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });'''
    
    content = content[:idx] + clean_tail + content[end_idx+3:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
