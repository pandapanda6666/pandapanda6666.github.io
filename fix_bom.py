with open('run.pyw', 'r', encoding='utf-8') as f:
    run = f.read()

run = run.replace("with open(ass_path, 'w', encoding='utf-8-sig') as f:", "with open(ass_path, 'w', encoding='utf-8') as f:")

with open('run.pyw', 'w', encoding='utf-8') as f:
    f.write(run)