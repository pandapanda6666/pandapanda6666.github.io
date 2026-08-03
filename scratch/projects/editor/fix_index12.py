import os

filepath = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add color and font to panda-settings-btn
old_css = '''  .panda-settings-btn {
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0 0.75rem; /* 12px */
      height: 100%;
      user-select: none;
      font-weight: bold;
      font-size: 0.85rem;
  }'''
new_css = '''  .panda-settings-btn {
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0 0.75rem; /* 12px */
      height: 100%;
      user-select: none;
      font-weight: bold;
      font-size: 0.85rem;
      color: white !important;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  }'''
content = content.replace(old_css, new_css)

# 2. Replace FontAwesome <i> tags with inline SVGs
svg_gear = '<svg viewBox="0 0 512 512" width="14" height="14" fill="currentColor" style="margin-right:6px;"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>'
svg_file = '<svg viewBox="0 0 384 512" width="14" height="14" fill="currentColor" style="margin-right:6px;"><path d="M0 64C0 28.7 28.7 0 64 0H229.5c17 0 33.3 6.7 45.3 18.7l90.5 90.5c12 12 18.7 28.3 18.7 45.3V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z"/></svg>'
svg_pen = '<svg viewBox="0 0 512 512" width="14" height="14" fill="currentColor" style="margin-right:6px;"><path d="M410.3 23.1C398.4 11.3 381.5 5 364.7 5s-33.8 6.3-45.7 18.1l-289 289c-9.4 9.4-15.2 21.6-16.9 34.5L2.1 484.5c-2.3 17.5 12.1 31.9 29.6 29.6l137.9-11.1c12.9-1.7 25.1-7.5 34.5-16.9l289-289c25.1-25.1 25.1-66 0-91.1l-82.8-82.9zM364.7 50.7l82.8 82.9-41.4 41.4-82.8-82.8 41.4-41.5zM283.3 133.5l82.8 82.8-212 212-82.8-82.8 212-212z"/></svg>'
svg_bulb = '<svg viewBox="0 0 384 512" width="14" height="14" fill="currentColor" style="margin-right:6px;"><path d="M112.1 454.3c0 6.4 5.2 11.6 11.6 11.6h136.6c6.4 0 11.6-5.2 11.6-11.6v-27.5c0-6.4-5.2-11.6-11.6-11.6H123.7c-6.4 0-11.6 5.2-11.6 11.6v27.5zM192 0C86 0 0 86 0 192c0 47.9 17.4 92 46.1 126.3 3 3.6 4.7 8.2 4.7 12.9v10.5c0 17.7 14.3 32 32 32h218.4c17.7 0 32-14.3 32-32v-10.5c0-4.7 1.7-9.3 4.7-12.9C366.6 284 384 239.9 384 192 384 86 298 0 192 0z"/></svg>'
svg_globe = '<svg viewBox="0 0 496 512" width="16" height="16" fill="currentColor" style="margin-right:8px;"><path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm160.3 144.1H324c-7.3-39.7-19-75-34.1-105 53.6 16.3 98.7 51.5 118.4 105zM248 48.7c18.3 32.7 32.4 72.8 40.5 115.4H207.5c8.1-42.6 22.2-82.7 40.5-115.4zm-70.1 5.3c-15.1 30-26.8 65.3-34.1 105H59.7C79.4 105.5 124.5 70.3 177.9 54zM48 256c0-18.4 2.4-36.2 6.8-53.1h136.2c-1.8 17.1-2.9 34.7-2.9 53.1s1.1 36 2.9 53.1H54.8C50.4 292.2 48 274.4 48 256zm28.3 90.9h83.9c7.3 39.7 19 75 34.1 105-53.5-16.3-98.6-51.5-118-105zM248 463.3c-18.3-32.7-32.4-72.8-40.5-115.4h81.1c-8.1 42.6-22.2 82.7-40.6 115.4zm70.1-5.3c15.1-30 26.8-65.3 34.1-105h83.9c-19.4 53.5-64.5 88.7-118 105zm42.7-148.9H224.5c1.8-17.1 2.9-34.7 2.9-53.1s-1.1-36-2.9-53.1h136.2c1.8 17.1 2.9 34.7 2.9 53.1s-1.1 36-2.9 53.1zm28.9-106.2c4.4 16.9 6.8 34.7 6.8 53.1s-2.4 36.2-6.8 53.1H310.8c1.8-17.1 2.9-34.7 2.9-53.1s-1.1-36-2.9-53.1h105.1z"/></svg>'
svg_palette = '<svg viewBox="0 0 512 512" width="16" height="16" fill="currentColor" style="margin-right:8px;"><path d="M256 512C114.6 512 0 397.4 0 256S114.6 0 256 0S512 114.6 512 256c0 41.8-33.6 75.8-75.3 76.5c-23.7 .4-47 16.6-56.1 40.5c-6.3 16.5-2.2 35.1 10.6 47.9c12.2 12.3 22 26.6 22 41.7c0 27.6-22.4 50-50 50h-7.2zM152 240a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm104-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm152 48a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm-48 104a48 48 0 1 0 -96 0 48 48 0 1 0 96 0z"/></svg>'
svg_caret_down = '<svg viewBox="0 0 320 512" width="10" height="10" fill="currentColor" style="margin-left:6px;"><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/></svg>'
svg_caret_right = '<svg viewBox="0 0 256 512" width="10" height="10" fill="currentColor"><path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"/></svg>'

content = content.replace('<i class="fa-solid fa-gear" style="margin-right:6px;font-size:0.9em;"></i>', svg_gear)
content = content.replace('<i class="fa-solid fa-file" style="margin-right:6px;font-size:0.9em;"></i>', svg_file)
content = content.replace('<i class="fa-solid fa-pen" style="margin-right:6px;font-size:0.9em;"></i>', svg_pen)
content = content.replace('<i class="fa-regular fa-lightbulb" style="margin-right:6px;font-size:1.1em;"></i>', svg_bulb)
content = content.replace('<i class="fa-solid fa-globe" style="margin-right:8px;width:16px;text-align:center;"></i>', svg_globe)
content = content.replace('<i class="fa-solid fa-palette" style="margin-right:8px;width:16px;text-align:center;"></i>', svg_palette)
content = content.replace('<i class="fa-solid fa-caret-down" style="margin-left:6px;font-size:0.8em;"></i>', svg_caret_down)
content = content.replace('<i class="fa-solid fa-caret-right" style="font-size:0.8em;"></i>', svg_caret_right)

# Version bump
content = content.replace('v=80', 'v=81')
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
