import codecs

path = r'C:\Users\User\Desktop\伺服器\登入\run.py'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

import re
# Remove the tab_scratch creation
content = re.sub(r'[ \t]*tab_scratch = tk\.Frame\(tab_control, bg="#0f172a"\)\r?\n', '', content)

# Find where we injected the UI. The UI started with adding to tab_control and then a comment.
match = re.search(r'([ \t]+)tab_control\.add\(tab_scratch, text=\' 🐱 Scratch 專案管理\'\)\r?\n', content)
if match:
    indent = match.group(1)
    
    # We added from 	ab_control.add(tab_scratch... down to the end of 	ext_notes.grid...
    # Let's just find that entire block by matching the start and the end.
    
    block_start = content.find(match.group(0))
    # Find the end of the block we injected
    end_marker = 'text_notes.grid(row=4, column=1, sticky="w", pady=5)'
    block_end = content.find(end_marker, block_start)
    if block_end != -1:
        # include the end marker and following newline
        # actually there might be \r\n after it
        end_idx = block_end + len(end_marker)
        if content[end_idx:end_idx+2] == '\r\n':
            end_idx += 2
        elif content[end_idx:end_idx+1] == '\n':
            end_idx += 1
            
        content = content[:block_start] + content[end_idx:]

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("SUCCESS")
