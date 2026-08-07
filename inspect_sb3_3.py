import os
import zipfile

path1 = r'L:\我的雲端硬碟\硬體及自製軟體\scratch\Rabboni\v2.5 PandaPanda太空大戰 (Rabboni版)\panda_project\v2.5 PandaPanda太空大戰 (Rabboni版).sb3'
path2 = r'L:\我的雲端硬碟\硬體及自製軟體\scratch\Rabboni\v2.5 PandaPanda太空大戰 (Rabboni版)\v2.5 PandaPanda太空大戰 (Rabboni版).sb3'

out_path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\zip_out_2.txt'

with open(out_path, 'w', encoding='utf-8') as f:
    f.write(f"Path1 exists: {os.path.exists(path1)}\n")
    f.write(f"Path2 exists: {os.path.exists(path2)}\n")
    
    if os.path.exists(path2):
        try:
            with zipfile.ZipFile(path2, 'r') as z:
                files = z.namelist()
                f.write(f"\nFiles in path2 (total {len(files)}):\n")
                panda_files = [x for x in files if "panda_project" in x]
                f.write(f"Contains 'panda_project': {len(panda_files)} files\n")
                for pf in panda_files[:10]:
                    f.write(f" - {pf}\n")
        except Exception as e:
            f.write(f"Error opening zip: {e}\n")
