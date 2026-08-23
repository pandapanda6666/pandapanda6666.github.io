import re

with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add fallback for tailwindcss
fallback_script = """<script src="https://cdn.tailwindcss.com"></script>
    <script>
        if (typeof tailwind === 'undefined') {
            console.warn('Tailwind CDN failed, loading local fallback');
            document.write('<script src="tailwindcss.js"><\\/script>');
        }
    </script>"""

html = html.replace('<script src="https://cdn.tailwindcss.com"></script>', fallback_script)

with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)