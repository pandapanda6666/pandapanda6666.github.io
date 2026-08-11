import zipfile
import json
import sys

path = r'L:\我的雲端硬碟\硬體及自製軟體\scratch\Rabboni\v2.5 PandaPanda太空大戰 (Rabboni版)\v2.5 PandaPanda太空大戰 (Rabboni版).sb3'

out_path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\zip_out_8.txt'

with open(out_path, 'w', encoding='utf-8') as f:
    try:
        with zipfile.ZipFile(path, 'r') as z:
            files = z.namelist()
            if 'project.json' not in files:
                f.write("No project.json\n")
                sys.exit(0)
                
            data = z.read('project.json').decode('utf-8')
            parsed = json.loads(data)
            
            missing = []
            for target in parsed.get("targets", []):
                for asset in target.get("costumes", []) + target.get("sounds", []):
                    md5 = asset.get("md5ext")
                    if md5 and md5 not in files:
                        missing.append(md5)
            
            if missing:
                f.write(f"Missing assets: {len(missing)}\n")
                for m in missing[:10]:
                    f.write(f" - {m}\n")
            else:
                f.write("All assets exist.\n")
                
            # Are there any weird files?
            weird = [x for x in files if x != 'project.json' and '/' in x]
            if weird:
                f.write(f"Weird files with slashes: {weird[:5]}\n")
                
    except Exception as e:
        f.write(f"Error: {e}\n")
