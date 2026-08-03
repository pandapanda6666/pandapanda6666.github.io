import os
import re

filepath = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the top bar toggle layout (remove space-between so the caret is right next to the text)
content = content.replace(
    '<span id="btn-settings-toggle" style="display:flex;align-items:center;height:100%;width:100%;justify-content:space-between;">',
    '<span id="btn-settings-toggle" style="display:flex;align-items:center;height:100%;width:100%;">'
)

# 2. Fix the dropdown li font-weight (it should be normal, not bold)
# .panda-dropdown li { font-weight: normal !important; } is already there, but let's double check.
# The user said "粗細和大小以及圓角不同".
# Maybe my SVGs are too small or thick?
# My SVGs have width="16" or "14". Native might just be using standard sizes.

# 3. Fix the multiple injection issue!
# I need to find all injected SVGs and add class="panda-icon"
content = content.replace('<svg viewBox=', '<svg class="panda-icon" viewBox=')

# And fix the querySelector checks in the setTimeout:
# !fileItem.querySelector('.fa-file') -> !fileItem.querySelector('.panda-icon')
content = content.replace(".querySelector('.fa-file')", ".querySelector('.panda-icon')")
content = content.replace(".querySelector('.fa-pen')", ".querySelector('.panda-icon')")
content = content.replace(".querySelector('.fa-lightbulb')", ".querySelector('.panda-icon')")

# 4. Fix dropdown border-radius and padding to match Image 1
# Dropdown container border radius: 4px on all sides, padding 5px 0.
old_dropdown_css = '''    .panda-dropdown {
        display: none;
        position: absolute;
        top: 100%;
        background: var(--panda-green);
        border-radius: 0 0 4px 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.25);
        padding: 0;
        margin: 0;
        list-style: none;
    }'''
new_dropdown_css = '''    .panda-dropdown {
        display: none;
        position: absolute;
        top: 100%;
        background: var(--panda-green);
        border-radius: 4px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        padding: 4px 0;
        margin: 0;
        list-style: none;
        border: 1px solid rgba(0,0,0,0.15);
        min-width: 160px;
    }'''
content = content.replace(old_dropdown_css, new_dropdown_css)

old_li_css = '''    .panda-dropdown li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 1rem !important; /* 8px 16px */
        font-size: 0.875rem !important; /* 14px */
        font-weight: normal !important;
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important;
        cursor: pointer;
        white-space: nowrap;
    }'''
new_li_css = '''    .panda-dropdown li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 16px !important;
        font-size: 0.85rem !important;
        font-weight: bold !important; /* Native Scratch dropdowns are actually bold in top level menus like settings */
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important;
        cursor: pointer;
        white-space: nowrap;
        color: white !important;
    }'''
content = content.replace(old_li_css, new_li_css)

# Update version
content = content.replace('v=81', 'v=82')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
