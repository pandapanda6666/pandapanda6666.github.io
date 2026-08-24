import re
with open('run.pyw', 'r', encoding='utf-8') as f:
    text = f.read()

# Wrap /api/export_video in try/except to prevent 500 errors
# Let's find it.
start = text.find('if path == "/api/export_video":')
end = text.find('return', start) + 6

old_block = text[start:end]

# We must be careful about indentation.
new_block = """if path == "/api/export_video":
            try:
"""
for line in old_block.split('\n')[1:-1]: # skip first and last lines
    new_block += "    " + line + "\n"
new_block += """            except Exception as e:
                self.send_json({"status": "error", "error": str(e)})
            return"""

text = text.replace(old_block, new_block)

with open('run.pyw', 'w', encoding='utf-8') as f:
    f.write(text)
print("run.pyw export_video try/except added.")