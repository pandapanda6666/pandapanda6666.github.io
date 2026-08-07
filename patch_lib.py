import codecs
import re

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# Replace the webpack image path for rabboni_scartch3.png
pattern = r'/***/ "\./src/lib/libraries/extensions/sipp-rabboni/rabboni_scartch3\.png":\s*/*!\*{72}!\*\\\s*!\*\*\* \./src/lib/libraries/extensions/sipp-rabboni/rabboni_scartch3\.png \*\*\*!\s*\\\*{70}/\s*/*! no static exports found \*/\s*/***/ \(function\(module, exports, __webpack_require__\) \{\s*module\.exports = __webpack_require__\.p \+ "static/assets/[a-f0-9]+\.png";\s*/***/ \}\),'

match = re.search(pattern, content)
if match:
    # We don't need to replace the whole webpack chunk, we can just replace the string inside it!
    pass

# A simpler way is to just find module.exports = __webpack_require__.p + "static/assets/7679e8aa3b5a6b745823e00a7b950065.png"; inside that chunk.
# Let's just find the exact chunk and replace it.
chunk_start = content.find('./src/lib/libraries/extensions/sipp-rabboni/rabboni_scartch3.png":')
if chunk_start != -1:
    chunk_end = content.find('/***/ }),', chunk_start) + 9
    old_chunk = content[chunk_start:chunk_end]
    new_chunk = old_chunk.replace('.png";', '.png";\nmodule.exports = "static/assets/rabboni2.png";')
    content = content.replace(old_chunk, new_chunk)
    print("Replaced image export")
    
# Change the color and name in getInfo
# id: 'sippRabboni',
# color1: '#4B4A60',
# color2: '#383748',
# name: formatMessage({
# id: 'sippRabboni.categoryName',
# default: 'Sipp Rabboni',

# Let's use regex to replace color1 and color2 near 'sippRabboni'
content = content.replace("color1: '#4B4A60',", "color1: '#808080',")
content = content.replace("color2: '#383748',", "color2: '#606060',")

content = content.replace("default: 'Sipp Rabboni',", "default: 'Rabboni2',")
content = content.replace("name: 'Sipp Rabboni',", "name: 'Rabboni2',")

# If they want the image to replace the TEXT in the block category, we need to add blockIconURI!
# In getInfo, there's // menuIconURI: menuIconURI, and // blockIconURI: blockIconURI,
# We can uncomment them and set them to "static/assets/rabboni2.png"

block_icon_patch = '''
        menuIconURI: "static/assets/rabboni2.png",
        blockIconURI: "static/assets/rabboni2.png",
'''
content = content.replace('// menuIconURI: menuIconURI,', block_icon_patch)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("SUCCESS")
