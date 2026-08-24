import os
import subprocess

ass_path = os.path.abspath("test.ass")
# Try different escaping formats for FFmpeg filter paths on Windows
formats = [
    f"ass='{ass_path.replace('\\', '/').replace(':', '\\\\:')}'",
    f"ass='{ass_path.replace('\\', '/').replace(':', '\\:')}'",
    f"ass=f='{ass_path.replace('\\', '/').replace(':', '\\\\:')}'",
    f"ass='{ass_path.replace('\\', '/')}'",
]

for fmt in formats:
    cmd = ["ffmpeg.exe", "-y", "-i", "dummy.mp4", "-vf", f"scale=-2:1080,{fmt}", "out.mp4"]
    print("Testing:", fmt)
    p = subprocess.Popen(cmd, stderr=subprocess.PIPE, text=True, encoding='utf-8', errors='ignore')
    _, err = p.communicate()
    if "Error" not in err[-500:]:
        print("SUCCESS!")
        break
    else:
        print("FAILED")