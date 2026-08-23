import re

with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_btn = """                <a href="https://raw.githubusercontent.com/pandapanda6666/pandapanda6666.github.io/main/PandaPanda%E7%9A%84AI%E6%97%A5%E5%B8%B8___%E5%AD%97%E5%B9%95%E7%B7%A8%E8%BC%AF%E5%B7%A5%E5%85%B7.exe" download id="downloadDesktopBtn" class="ml-4 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-emerald-900/20 font-medium">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    下載本機極速版 (Windows)
                </a>"""

new_btns = """                <div id="downloadDesktopBtns" class="ml-4 flex items-center gap-3">
                    <a href="https://raw.githubusercontent.com/pandapanda6666/pandapanda6666.github.io/main/PandaPanda%E7%9A%84AI%E6%97%A5%E5%B8%B8___%E5%AD%97%E5%B9%95%E7%B7%A8%E8%BC%AF%E5%B7%A5%E5%85%B7_%E5%AE%89%E8%A3%9D%E7%89%88.exe" download class="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-blue-900/20 font-medium">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        下載安裝版 (含捷徑)
                    </a>
                    <a href="https://raw.githubusercontent.com/pandapanda6666/pandapanda6666.github.io/main/PandaPanda%E7%9A%84AI%E6%97%A5%E5%B8%B8___%E5%AD%97%E5%B9%95%E7%B7%A8%E8%BC%AF%E5%B7%A5%E5%85%B7.exe" download class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-emerald-900/20 font-medium">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        下載免安裝版 (單檔)
                    </a>
                </div>"""

html = html.replace(old_btn, new_btns)

# Also need to fix the javascript that hides the button on desktop!
old_js = """            const downloadBtn = document.getElementById('downloadDesktopBtn');
            if (downloadBtn) downloadBtn.style.display = 'none';"""

new_js = """            const downloadBtns = document.getElementById('downloadDesktopBtns');
            if (downloadBtns) downloadBtns.style.display = 'none';"""

html = html.replace(old_js, new_js)

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)