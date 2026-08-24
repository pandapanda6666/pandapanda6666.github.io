with open('run.pyw', 'r', encoding='utf-8') as f:
    text = f.read()

# We want to wrap:
# if path == "/api/export_video":
#     data = json.loads(body)
#     ...
#     self.send_json({"task_id": task_id})
#     return

import re
match = re.search(r'if path == "/api/export_video":\s*data = json.loads\(body\).*?self\.send_json\(\{"task_id": task_id\}\)\s*return', text, re.DOTALL)
if match:
    old_block = match.group(0)
    lines = old_block.split('\n')
    new_block = 'if path == "/api/export_video":\n            try:\n'
    for line in lines[1:-1]:
        if line.strip():
            new_block += '    ' + line + '\n'
        else:
            new_block += '\n'
    new_block += '            except Exception as e:\n                self.send_json({"status": "error", "error": str(e)})\n            return'
    text = text.replace(old_block, new_block)
    with open('run.pyw', 'w', encoding='utf-8') as f:
        f.write(text)
    print("run.pyw patched")
else:
    print("Could not find /api/export_video block")