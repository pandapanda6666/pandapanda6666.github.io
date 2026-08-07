import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    in_style = False
    for line in f:
        if '<style>' in line:
            in_style = True
        if in_style:
            print(line.strip())
        if '</style>' in line:
            in_style = False
