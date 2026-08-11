import codecs
import re
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'

# Let's search inside lib.min.js for what element type share-button_share-button is applied to.
# Actually, since it's React compiled, it's hard to read.
# But we can just remove div from the CSS selector and closest selector!
