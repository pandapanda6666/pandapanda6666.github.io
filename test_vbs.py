import os

target_dir = os.getcwd()
bat_path = os.path.join(target_dir, "test.bat")

vbs_content = f\"\"\"
Set oWS = WScript.CreateObject("WScript.Shell")
strDesktop = oWS.SpecialFolders("Desktop")
Set oLink = oWS.CreateShortcut(strDesktop & "\\字幕編輯工具.lnk")
oLink.TargetPath = "{bat_path}"
oLink.WorkingDirectory = "{target_dir}"
oLink.IconLocation = "shell32.dll, 116"
oLink.Save
\"\"\"
vbs_path = os.path.join(target_dir, "create_shortcut.vbs")
with open(vbs_path, "w", encoding="utf-16") as f:
    f.write(vbs_content)

os.system(f'cscript //nologo "{vbs_path}"')