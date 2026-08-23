with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_fetch = """        try {
            let res = await fetch('/api/is_desktop');
            if (!res.ok) return;
            window.isDesktop = true;"""

new_fetch = """        try {
            if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
                let res = await fetch('/api/is_desktop');
                if (res.ok) window.isDesktop = true;
            }
            if (!window.isDesktop) return;"""

html = html.replace(old_fetch, new_fetch)

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)