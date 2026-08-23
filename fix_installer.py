with open('installer.py', 'r', encoding='utf-8') as f:
    installer = f.read()

old_vbs = """    desktop = os.path.join(os.environ.get('USERPROFILE', ''), 'Desktop')
    shortcut_path = os.path.join(desktop, '字幕編輯工具.lnk')
    
    vbs_content = f\"\"\"
Set oWS = WScript.CreateObject("WScript.Shell")
Set oLink = oWS.CreateShortcut("{shortcut_path}")
oLink.TargetPath = "{bat_path}"
oLink.WorkingDirectory = "{target_dir}"
oLink.IconLocation = "shell32.dll, 116"
oLink.Save
\"\"\""""

new_vbs = """    vbs_content = f\"\"\"
Set oWS = WScript.CreateObject("WScript.Shell")
strDesktop = oWS.SpecialFolders("Desktop")
Set oLink = oWS.CreateShortcut(strDesktop & "\\字幕編輯工具.lnk")
oLink.TargetPath = "{bat_path}"
oLink.WorkingDirectory = "{target_dir}"
oLink.IconLocation = "shell32.dll, 116"
oLink.Save
\"\"\""""

installer = installer.replace(old_vbs, new_vbs)
with open('installer.py', 'w', encoding='utf-8') as f:
    f.write(installer)