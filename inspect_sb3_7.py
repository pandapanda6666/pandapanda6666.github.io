import zipfile
import json
import traceback

path = r'L:\我的雲端硬碟\硬體及自製軟體\scratch\Rabboni\v2.5 PandaPanda太空大戰 (Rabboni版)\v2.5 PandaPanda太空大戰 (Rabboni版).sb3'
out_path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\zip_out_7.txt'

with open(out_path, 'w', encoding='utf-8') as f:
    try:
        with zipfile.ZipFile(path, 'r') as z:
            # Let's see what's actually in it
            files = z.namelist()
            f.write(f"Total files: {len(files)}\n")
            panda_json = None
            for fname in files:
                if 'panda_project' in fname and 'panda.json' in fname:
                    panda_json = fname
                    break
                    
            if panda_json:
                f.write(f"Found {panda_json}\n")
                try:
                    data = z.read(panda_json).decode('utf-8')
                    parsed = json.loads(data)
                    targets = parsed.get("targets", [])
                    f.write(f"Parsed inner panda.json! Targets: {len(targets)}\n")
                    for t in targets[:5]:
                        f.write(f" - {t.get('name')}\n")
                except Exception as ex:
                    f.write(f"FAILED TO PARSE INNER panda.json: {ex}\n")
            else:
                f.write("No panda.json found in the zip!\n")
                if 'project.json' in files:
                    try:
                        data = z.read('project.json').decode('utf-8')
                        parsed = json.loads(data)
                        targets = parsed.get("targets", [])
                        f.write(f"Parsed root project.json! Targets: {len(targets)}\n")
                    except Exception as ex:
                        f.write(f"FAILED TO PARSE ROOT project.json: {ex}\n")
    except Exception as e:
        f.write(f"Error opening zip: {e}\n")
        f.write(traceback.format_exc())
