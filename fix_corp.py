import re
with open('run.pyw', 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(r'self\.send_header\("Cross-Origin-Embedder-Policy", "require-corp"\)',
              r'self.send_header("Cross-Origin-Embedder-Policy", "require-corp")\n        self.send_header("Cross-Origin-Resource-Policy", "cross-origin")',
              text)

with open('run.pyw', 'w', encoding='utf-8') as f:
    f.write(text)
print("run.pyw CORP headers added.")