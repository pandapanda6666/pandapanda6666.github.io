import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if 'saveNowBtn.innerHTML = \'<span style="color:white;font-weight:bold;">' in line:
        start = max(0, i - 2)
        end = min(len(lines), i + 35)
        for j in range(start, end):
            # Print safely without cp950 error
            print(f"{j+1}: {lines[j].encode('ascii', errors='replace').decode('ascii').rstrip('\n')}")
        break
