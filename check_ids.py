with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    text = f.read()
for i in ['customDialogTitle', 'customDialogMessage', 'customDialogInput', 'customDialogCancelBtn', 'customDialogConfirmBtn', 'customDialogModal', 'customDialogReportBtn']:
    print(i, text.count('id="' + i + '"'))