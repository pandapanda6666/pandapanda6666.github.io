import zipfile
import sys
import os

path = r'L:\我的雲端硬碟\硬體及自製軟體\scratch\Rabboni\v2.5 PandaPanda太空大戰 (Rabboni版)\panda_project\v2.5 PandaPanda太空大戰 (Rabboni版).sb3'
if not os.path.exists(path):
    print("FILE NOT FOUND:", path)
    sys.exit(0)

try:
    with zipfile.ZipFile(path, 'r') as z:
        print("ZIP file opened successfully.")
        files = z.namelist()
        print("Total files in zip:", len(files))
        
        # Check for our panda structure
        panda_files = [f for f in files if "panda_project" in f]
        print("Files with 'panda_project':", panda_files)
        
        # Check for project.json
        if "project.json" in files:
            print("Contains project.json at root.")
        
        if "panda_project/panda.json" in files:
            print("Contains panda_project/panda.json")
            
        print("\nFirst 20 files in zip:")
        for f in files[:20]:
            print(" -", f)
except Exception as e:
    print("Error opening zip:", e)
