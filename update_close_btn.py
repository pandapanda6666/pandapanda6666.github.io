with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add a close button to the top navigation
old_nav = """        <div class="flex items-center gap-6">
            <div class="text-sm font-medium text-gray-400" id="statusIndicator">系統狀態: 準備就緒</div>"""
            
new_nav = """        <div class="flex items-center gap-4">
            <button onclick="if(confirm('確定要關閉程式嗎？')) { fetch('/api/shutdown').then(() => window.close()); setTimeout(()=>window.close(), 500); }" class="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded text-sm transition font-medium flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                關閉程式
            </button>
            <div class="text-sm font-medium text-gray-400 ml-2" id="statusIndicator">系統狀態: 準備就緒</div>"""

html = html.replace(old_nav, new_nav)
with open('Edit/Video/Add subtitles/index.html', 'w', encoding='utf-8') as f:
    f.write(html)