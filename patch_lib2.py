import codecs

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\lib.min.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

chunk_start = content.find('./src/lib/libraries/extensions/sipp-rabboni/rabboni_scartch3.png":')
if chunk_start != -1:
    chunk_end = content.find('/***/ }),', chunk_start) + 9
    old_chunk = content[chunk_start:chunk_end]
    # In webpack, module.exports = __webpack_require__.p + "static/assets/xxx.png";
    # Let's replace the whole assignment
    idx_eq = old_chunk.find('module.exports =')
    if idx_eq != -1:
        new_chunk = old_chunk[:idx_eq] + 'module.exports = "static/assets/rabboni2.png";\n/***/ }),'
        content = content.replace(old_chunk, new_chunk)
        print("Replaced image export")
    else:
        print("Could not find module.exports in chunk")
else:
    print("Could not find chunk start")
    
# Change the color and name in getInfo
content = content.replace("color1: '#4B4A60',", "color1: '#808080',")
content = content.replace("color2: '#383748',", "color2: '#606060',")

content = content.replace("default: 'Sipp Rabboni',", "default: 'Rabboni2',")
content = content.replace("name: 'Sipp Rabboni',", "name: 'Rabboni2',")

# If they want the image to replace the TEXT in the block category, we need to add blockIconURI!
block_icon_patch = '''
        menuIconURI: "static/assets/rabboni2.png",
        blockIconURI: "static/assets/rabboni2.png",
'''
content = content.replace('// menuIconURI: menuIconURI,', block_icon_patch)

# Wait! The user says "取代原本的Rabboni字樣" (replace the original Rabboni text)
# If they want NO text, they want 
ame: ""?
# But they also said "顏色請改成灰色(Rabboni2)" (Also change color to gray (Rabboni2))
# If I change it to "Rabboni2", it replaces "Sipp Rabboni" with "Rabboni2".
# Let's also hide the text if the blockIconURI is present, or just leave "Rabboni2".
# Scratch 3 will show BOTH the icon and the text.
# Let's also set name to '' in the extension library if they want? No, they probably just mean "rename to Rabboni2" by saying "Rabboni2" in parentheses!

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("SUCCESS")
