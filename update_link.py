with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('https://raw.githubusercontent.com/pandapanda6666/pandapanda6666.github.io/main/install.bat', 'https://raw.githubusercontent.com/pandapanda6666/pandapanda6666.github.io/main/PandaPanda%E7%9A%84AI%E6%97%A5%E5%B8%B8___%E5%AD%97%E5%B9%95%E7%B7%A8%E8%BC%AF%E5%B7%A5%E5%85%B7.exe')

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)