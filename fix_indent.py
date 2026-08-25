with open('installer.py', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
for i, line in enumerate(lines):
    if line.startswith('    uninst_path') or line.startswith('    with open') or line.startswith('        f.write') or line.startswith('    winreg.SetValueEx(key, "UninstallString"'):
        lines[i] = '        ' + line.strip()

with open('installer.py', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print("Indentation fixed.")