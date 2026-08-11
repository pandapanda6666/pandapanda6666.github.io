import zipfile
import json
import io
import os

path2 = r'L:\我的雲端硬碟\硬體及自製軟體\scratch\Rabboni\v2.5 PandaPanda太空大戰 (Rabboni版)\v2.5 PandaPanda太空大戰 (Rabboni版).sb3'
out_path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\zip_out_6.txt'

with open(out_path, 'w', encoding='utf-8') as f:
    try:
        with zipfile.ZipFile(path2, 'r') as z:
            # Let's mock the encryption and decryption
            # Encryption: move everything to panda_project/
            mock_enc_zip_io = io.BytesIO()
            with zipfile.ZipFile(mock_enc_zip_io, 'w') as ez:
                for item in z.infolist():
                    if not item.is_dir():
                        data = z.read(item.filename)
                        new_name = 'panda_project/' + ('panda.json' if item.filename == 'project.json' else item.filename)
                        ez.writestr(new_name, data)
                        
            # Decryption: move everything out of panda_project/
            mock_dec_zip_io = io.BytesIO()
            with zipfile.ZipFile(mock_enc_zip_io, 'r') as ez:
                with zipfile.ZipFile(mock_dec_zip_io, 'w') as dz:
                    for item in ez.infolist():
                        if not item.is_dir() and item.filename.startswith('panda_project/'):
                            data = ez.read(item.filename)
                            new_name = item.filename[14:]
                            if new_name == 'panda.json':
                                new_name = 'project.json'
                            dz.writestr(new_name, data)
                            
            # Check the decrypted zip
            with zipfile.ZipFile(mock_dec_zip_io, 'r') as dz:
                f.write(f"Decrypted zip files: {len(dz.namelist())}\n")
                if 'project.json' in dz.namelist():
                    data = dz.read('project.json').decode('utf-8')
                    parsed = json.loads(data)
                    f.write(f"Parsed project.json, targets: {len(parsed.get('targets', []))}\n")
                else:
                    f.write("ERROR: project.json missing in decrypted zip!\n")
    except Exception as e:
        f.write(f"Error: {e}\n")
