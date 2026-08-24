import os
import subprocess

# Let's generate a dummy ASS file exactly like the JS does
assContent = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Microsoft JhengHei,32,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,3,2,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:05.00,Default,,0,0,0,,{\\pos(960,950)}{\\c&HFFFFFF&}這是一個測試 Subtitles
"""

with open("temp_subs.ass", "w", encoding="utf-8") as f:
    f.write(assContent)

# Create dummy video
os.system("ffmpeg.exe -y -f lavfi -i color=c=red:s=1280x720:d=5 -c:v libx264 -crf 28 dummy_vid.mp4")

video_path = os.path.abspath("dummy_vid.mp4")
ass_path = os.path.abspath("temp_subs.ass")
out_path = os.path.abspath("exported_1080p.mp4")

safe_ass = ass_path.replace("\\", "/")
cmd = ["ffmpeg.exe", "-y", "-i", video_path, "-vf", "scale=-2:1080,ass='" + safe_ass.replace(":", "\\:") + "'", "-c:v", "libx264", "-preset", "fast", "-crf", "28", "-c:a", "copy", out_path]
print("CMD:", cmd)

p = subprocess.Popen(cmd, stderr=subprocess.PIPE, text=True, encoding='utf-8', errors='ignore')
for line in p.stderr:
    print(line, end='')
p.wait()