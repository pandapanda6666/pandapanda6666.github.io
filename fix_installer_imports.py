with open('installer.py', 'r', encoding='utf-8') as f:
    installer = f.read()

# Fix imports!
if 'import winreg' not in installer:
    installer = installer.replace('import tkinter as tk', 'import tkinter as tk\nimport winreg')

# Fix VBScript encoding from utf-8-sig to utf-16
installer = installer.replace('encoding="utf-8-sig"', 'encoding="utf-16"')

with open('installer.py', 'w', encoding='utf-8') as f:
    f.write(installer)

# Also let's check if start_install has any other missing imports.