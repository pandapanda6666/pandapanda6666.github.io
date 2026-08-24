import re

with open('run.pyw', 'r', encoding='utf-8') as f:
    text = f.read()

replacement = """
        if path == "/api/save_file":
            try:
                data = json.loads(body)
                filename = data.get("filename")
                content = data.get("content")

                root = tk.Tk()
                root.withdraw()
                root.attributes('-topmost', True)
                ext = os.path.splitext(filename)[1] if filename else ''
                save_path = filedialog.asksaveasfilename(title="儲存檔案", initialfile=filename, defaultextension=ext)
                root.destroy()
                
                if save_path:
                    if data.get("type") == "text":
                        with open(save_path, 'w', encoding='utf-8') as f:
                            f.write(content)
                    else:
                        import base64
                        with open(save_path, 'wb') as f:
                            f.write(base64.b64decode(content))
                    self.send_json({"status": "ok"})
                else:
                    self.send_json({"status": "cancelled"})
            except Exception as e:
                self.send_json({"status": "error", "error": str(e)})
            return
"""

text = re.sub(r'if path == "/api/save_file":.*?return\n', replacement.strip() + '\n', text, flags=re.DOTALL)

with open('run.pyw', 'w', encoding='utf-8') as f:
    f.write(text)
print("run.pyw patched")