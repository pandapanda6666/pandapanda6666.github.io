with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('class="ml-4 flex items-center', 'id="downloadDesktopBtn" class="ml-4 flex items-center')

old_js = """            if (!window.isDesktop) return;
            console.log("Desktop mode enabled!");"""

new_js = """            if (!window.isDesktop) return;
            console.log("Desktop mode enabled!");
            const downloadBtn = document.getElementById('downloadDesktopBtn');
            if (downloadBtn) downloadBtn.style.display = 'none';"""

html = html.replace(old_js, new_js)

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)