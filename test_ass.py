import os
import subprocess

with open("test.ass", "w", encoding="utf-8") as f:
    f.write("[Script Info]\r\nScriptType: v4.00+\r\nPlayResX: 1920\r\nPlayResY: 1080\r\n\r\n[V4+ Styles]\r\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\r\nStyle: Default,Arial,32,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,3,2,0,2,10,10,10,1\r\n\r\n[Events]\r\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\r\nDialogue: 0,0:00:00.00,0:00:05.00,Default,,0,0,0,,Test Subtitle\r\n")

# Create dummy video
os.system("ffmpeg.exe -y -f lavfi -i color=c=black:s=1280x720:d=5 -c:v libx264 -crf 28 dummy.mp4")

ass_path = os.path.abspath("test.ass")
safe_ass = ass_path.replace("\\", "/")
ass_arg = safe_ass.replace(":", "\\\\:")

cmd = ["ffmpeg.exe", "-y", "-i", "dummy.mp4", "-vf", f"scale=-2:1080,ass='{ass_arg}'", "out.mp4"]
print("CMD:", cmd)
p = subprocess.Popen(cmd, stderr=subprocess.PIPE, text=True, encoding='utf-8', errors='ignore')
_, err = p.communicate()
print("ERR:", err)