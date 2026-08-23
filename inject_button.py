import re

with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add download button to homeView
header = '<h1 class="text-4xl font-bold text-blue-400 flex items-center gap-4">'
download_btn = '''
                <a href="https://raw.githubusercontent.com/pandapanda6666/pandapanda6666.github.io/main/install.bat" download class="ml-auto flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-emerald-900/20 font-medium">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    下載本機極速版 (Windows)
                </a>
'''

# Find the flex container of the header to append the button
# Currently it's just an <h1>, but wait, the button should be inside a flex wrapper or next to it.
# Let's wrap the h1 in a flex container if it's not already.

old_header_block = """            <div class="mb-12">
                <h1 class="text-4xl font-bold text-blue-400 flex items-center gap-4">
                    <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    線上字幕編輯器
                </h1>"""

new_header_block = """            <div class="mb-12">
                <div class="flex items-center justify-between w-full">
                    <h1 class="text-4xl font-bold text-blue-400 flex items-center gap-4">
                        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        線上字幕編輯器
                    </h1>
                    <a href="https://raw.githubusercontent.com/pandapanda6666/pandapanda6666.github.io/main/install.bat" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-emerald-900/20 font-medium">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        下載本機極速版 (Windows)
                    </a>
                </div>"""

html = html.replace(old_header_block, new_header_block)

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)