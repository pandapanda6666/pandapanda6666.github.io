import zipfile

path2 = r'L:\我的雲端硬碟\硬體及自製軟體\scratch\Rabboni\v2.5 PandaPanda太空大戰 (Rabboni版)\v2.5 PandaPanda太空大戰 (Rabboni版).sb3'
try:
    with zipfile.ZipFile(path2, 'r') as z:
        files = z.namelist()
        print("First 20 files:")
        for f in files[:20]:
            print(f)
except Exception as e:
    print("Error:", e)
