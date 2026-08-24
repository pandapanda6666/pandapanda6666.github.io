import re
with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix window.if(...)
text = text.replace('window.if(window.showLoading) window.showLoading', 'if (window.showLoading) window.showLoading')
text = text.replace('window.if(window.hideLoading) window.hideLoading', 'if (window.hideLoading) window.hideLoading')

# Just to be safe, any other occurrences of window.if(
text = re.sub(r'window\.if\(.*?\)', 'if', text)

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("Cleaned up window.if")