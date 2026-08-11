import codecs
path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\panda_guard.js'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = '''                } catch (e) {
                    console.error("PandaGuard Load Error:", e);
                    return originalLoad(fileBuffer, ...args);
                }'''
replacement = '''                } catch (e) {
                    // Ignore non-zip errors (e.g. MIT 404 responses from native fetch)
                    return originalLoad(fileBuffer, ...args);
                }'''

if target in content:
    content = content.replace(target, replacement)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND")
