import codecs

path = r'C:\Users\User\.gemini\antigravity\brain\f7ba24ea-59c1-4c57-ae40-c0713f96922a\task.md'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

content = content.replace('- [ ] 建立專案展示頁面', '- [x] 建立專案展示頁面')
content = content.replace('- [ ] 實作未分享橘色橫幅', '- [x] 實作未分享橘色橫幅')
content = content.replace('- [ ] 實作 panda_sso.js', '- [x] 實作 panda_sso.js')
content = content.replace('- [ ] 嵌入 editor/player iframe', '- [x] 嵌入 editor/player iframe')
content = content.replace('- [ ] 修改 panda_guard.js', '- [x] 修改 panda_guard.js')
content = content.replace('- [ ] 撰寫專屬 Python Tkinter', '- [x] 撰寫專屬 Python Tkinter')

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
