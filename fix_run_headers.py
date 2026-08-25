with open('run.pyw', 'r', encoding='utf-8') as f:
    text = f.read()

import re
# Remove all COEP/COOP/CORP headers from run.pyw
text = re.sub(r'\s*self\.send_header\("Cross-Origin-Opener-Policy".*?\n', '\n', text)
text = re.sub(r'\s*self\.send_header\("Cross-Origin-Embedder-Policy".*?\n', '\n', text)
text = re.sub(r'\s*self\.send_header\("Cross-Origin-Resource-Policy".*?\n', '\n', text)

with open('run.pyw', 'w', encoding='utf-8') as f:
    f.write(text)
print("run.pyw headers cleaned.")