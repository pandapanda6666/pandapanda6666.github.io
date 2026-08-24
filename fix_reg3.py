with open('installer.py', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('r"Software\\\\Microsoft', 'r"Software\\Microsoft')
text = text.replace('r"Software\\\\', 'r"Software\\')
text = text.replace('\\\\Microsoft', '\\Microsoft')
text = text.replace('\\\\Windows', '\\Windows')
text = text.replace('\\\\CurrentVersion', '\\CurrentVersion')
text = text.replace('\\\\Uninstall', '\\Uninstall')
text = text.replace('\\\\PandaSubtitleEditor', '\\PandaSubtitleEditor')
text = text.replace('PandaEnv\\\\PandaPythonw.exe', 'PandaEnv\\PandaPythonw.exe')
with open('installer.py', 'w', encoding='utf-8') as f:
    f.write(text)