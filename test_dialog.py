import tkinter as tk
from tkinter import filedialog
import os

root = tk.Tk()
root.withdraw()
root.attributes('-topmost', True)

try:
    save_path = filedialog.asksaveasfilename(title="儲存檔案", initialfile="test.json", defaultextension=".json")
    print("SAVED:", save_path)
except Exception as e:
    print("ERROR:", e)