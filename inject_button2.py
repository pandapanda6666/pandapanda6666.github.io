import re

with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_block = """                    線上字幕編輯器
                </h1>"""

new_block = """                    線上字幕編輯器
                </h1>
                <a href="https://raw.githubusercontent.com/pandapanda6666/pandapanda6666.github.io/main/install.bat" download class="ml-4 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-emerald-900/20 font-medium">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    下載本機極速版 (Windows)
                </a>"""

html = html.replace(old_block, new_block)

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)