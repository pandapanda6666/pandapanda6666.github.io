import zipfile
import sys
import os

path = r'L:\我的雲端硬碟\硬體及自製軟體\scratch\Rabboni\v2.5 PandaPanda太空大戰 (Rabboni版)\panda_project\v2.5 PandaPanda太空大戰 (Rabboni版).sb3'
out_path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\zip_out.txt'

with open(out_path, 'w', encoding='utf-8') as f:
    if not os.path.exists(path):
        f.write(f"FILE NOT FOUND: {path}")
    else:
        try:
            with zipfile.ZipFile(path, 'r') as z:
                f.write("ZIP file opened successfully.\n")
                files = z.namelist()
                f.write(f"Total files in zip: {len(files)}\n")
                
                panda_files = [x for x in files if "panda_project" in x]
                f.write(f"Files with 'panda_project': {panda_files}\n")
                
                if "project.json" in files:
                    f.write("Contains project.json at root.\n")
                
                if "panda_project/panda.json" in files:
                    f.write("Contains panda_project/panda.json\n")
                    
                f.write("\nFirst 20 files in zip:\n")
                for x in files[:20]:
                    f.write(f" - {x}\n")
        except Exception as e:
            f.write(f"Error opening zip: {e}")
