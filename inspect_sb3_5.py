import zipfile
import json

path2 = r'L:\我的雲端硬碟\硬體及自製軟體\scratch\Rabboni\v2.5 PandaPanda太空大戰 (Rabboni版)\v2.5 PandaPanda太空大戰 (Rabboni版).sb3'
try:
    with zipfile.ZipFile(path2, 'r') as z:
        if 'project.json' in z.namelist():
            data = z.read('project.json').decode('utf-8')
            parsed = json.loads(data)
            
            # Check what sprites are in here
            targets = parsed.get("targets", [])
            print("Number of targets:", len(targets))
            for t in targets:
                print(" -", t.get("name", "Unknown"))
except Exception as e:
    print("Error:", e)
