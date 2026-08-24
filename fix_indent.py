with open('run.pyw', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '"Cross-Origin-Embedder-Policy", "require-corp"' in line and '"Cross-Origin-Resource-Policy"' not in lines[i+1]:
        # get indentation
        indent = len(line) - len(line.lstrip())
        lines[i] = line + (" " * indent) + 'self.send_header("Cross-Origin-Resource-Policy", "cross-origin")\n'
    elif '"Cross-Origin-Resource-Policy"' in line:
        # fix existing bad indentation
        indent = len(lines[i-1]) - len(lines[i-1].lstrip())
        lines[i] = (" " * indent) + line.lstrip()

with open('run.pyw', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("run.pyw indentation fixed.")