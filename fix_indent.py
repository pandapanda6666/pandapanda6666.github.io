with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.pyw', 'r', encoding='utf-8') as f:
    run_pyw = f.read()

run_pyw = run_pyw.replace("        import sys\n    if getattr(sys, 'frozen', False):", "    import sys\n    if getattr(sys, 'frozen', False):")

with open('L:/我的雲端硬碟/硬體及自製軟體/自製軟體/字幕編輯工具/run.pyw', 'w', encoding='utf-8') as f:
    f.write(run_pyw)