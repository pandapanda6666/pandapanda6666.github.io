import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\chunks\gui.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

import re
share_match = re.search(r'share-button_share-button_[a-zA-Z0-9_-]*', content)
if share_match:
    print(f"Share button class: {share_match.group(0)}")
else:
    print("Share button class not found")

community_match = re.search(r'community-button_community-button_[a-zA-Z0-9_-]*', content)
if community_match:
    print(f"Community button class: {community_match.group(0)}")
else:
    print("Community button class not found")
