import re
with open(r'scratch\projects\editor\lib.min.js', 'rb') as f:
    text = f.read().decode('utf-8', 'ignore')

# 尋找與分享、登入相關的 CSS class，或者 "See inside" 按鈕
matches = re.findall(r'menu-bar_[a-zA-Z0-9_-]+', text)
print("menu-bar classes:", list(set(matches))[:30])

# 尋找 "Share" / "See inside" 等字串附近
idx = text.find('Share')
if idx != -1:
    print("Found Share:", text[max(0, idx-100):idx+100])

idx = text.find('See inside')
if idx != -1:
    print("Found See inside:", text[max(0, idx-100):idx+100])

idx = text.find('登入')
if idx != -1:
    print("Found 登入:", text[max(0, idx-100):idx+100])
