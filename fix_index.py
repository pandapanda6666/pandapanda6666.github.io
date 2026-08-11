import codecs

path = 'scratch/projects/editor/index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# 1. Bear Layer Fix
target_bear = '''                            ears.appendChild(leftEar);
                            ears.appendChild(leftInnerEar);
                            ears.appendChild(rightEar);
                            ears.appendChild(rightInnerEar);
                            ears.appendChild(muzzle);
                            ears.appendChild(nose);
                            ears.appendChild(mouth);
                            ears.appendChild(leftEye);
                            ears.appendChild(rightEye);
                            path.parentNode.insertBefore(ears, path);
                        }'''

replacement_bear = '''                            const face = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                            face.classList.add('panda-cat-face');
                            ears.appendChild(leftEar);
                            ears.appendChild(leftInnerEar);
                            ears.appendChild(rightEar);
                            ears.appendChild(rightInnerEar);
                            face.appendChild(muzzle);
                            face.appendChild(nose);
                            face.appendChild(mouth);
                            face.appendChild(leftEye);
                            face.appendChild(rightEye);
                            path.parentNode.insertBefore(ears, path);
                            path.parentNode.insertBefore(face, path.nextSibling);
                        }'''
content = content.replace(target_bear, replacement_bear)

# 2. Cleanup Bear Face
target_cleanup = '''                  if (!document.body.classList.contains('bear-style')) {
                      document.querySelectorAll('.panda-cat-ears').forEach(e => e.remove());
                      return;
                  }'''

replacement_cleanup = '''                  if (!document.body.classList.contains('bear-style')) {
                      document.querySelectorAll('.panda-cat-ears').forEach(e => e.remove());
                      document.querySelectorAll('.panda-cat-face').forEach(e => e.remove());
                      return;
                  }'''
content = content.replace(target_cleanup, replacement_cleanup)

# 3. Settings Menu Injection
target_menu = '''                              <li id="btn-contrast-original" onclick="event.stopPropagation();"><span data-i18n="original">Original</span> <span class="panda-check ">✔</span></li>
                              <li id="btn-contrast-high" onclick="event.stopPropagation();"><span data-i18n="highcontrast">High Contrast</span> <span class="panda-check ">✔</span></li>
                          </ul>
                      </li>
                  </ul>;'''

replacement_menu = '''                              <li id="btn-contrast-original" onclick="event.stopPropagation();"><span data-i18n="original">Original</span> <span class="panda-check ">✔</span></li>
                              <li id="btn-contrast-high" onclick="event.stopPropagation();"><span data-i18n="highcontrast">High Contrast</span> <span class="panda-check ">✔</span></li>
                          </ul>
                      </li>
                      <li onmousedown="event.stopPropagation()">
                          <span><svg class="panda-icon" viewBox="0 0 512 512" width="16" height="16" fill="currentColor"><path d="M480 32C480 14.33 465.7 0 448 0H64C46.33 0 32 14.33 32 32V480C32 497.7 46.33 512 64 512H448C465.7 512 480 497.7 480 480V32zM333.3 227.3L221.3 339.3C215.1 345.6 206.5 348.1 198.1 348.1C189.5 348.1 180.9 345.6 174.6 339.3L114.6 279.3C102.1 266.8 102.1 246.5 114.6 234.1C127.1 221.6 147.4 221.6 159.9 234.1L198.1 272.3L287.9 182.5C300.4 170.1 320.7 170.1 333.3 182.5C345.8 195 345.8 215.3 333.3 227.3V227.3z"/></svg><span data-i18n="saveformat">Save Format</span></span>
                          <svg class="panda-icon" viewBox="0 0 256 512" width="10" height="10" fill="currentColor"><path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"/></svg>
                          <ul class="panda-submenu">
                              <li id="btn-save-encrypted" onclick="event.stopPropagation();"><span data-i18n="encrypted">PandaScratch</span> <span class="panda-check ">✔</span></li>
                              <li id="btn-save-normal" onclick="event.stopPropagation();"><span data-i18n="normal">Normal (.sb3)</span> <span class="panda-check ">✔</span></li>
                          </ul>
                      </li>
                  </ul>;'''
content = content.replace(target_menu, replacement_menu)

# 4. Settings Logic
target_logic = '''              document.getElementById('btn-contrast-high').addEventListener('click', (e) => {
                  e.stopPropagation();
                  localStorage.setItem('panda-high-contrast', 'true');
                  document.body.classList.add('high-contrast');
                  document.querySelector('#btn-contrast-high .panda-check').classList.add('active');
                  document.querySelector('#btn-contrast-original .panda-check').classList.remove('active');
              });'''

replacement_logic = '''              document.getElementById('btn-contrast-high').addEventListener('click', (e) => {
                  e.stopPropagation();
                  localStorage.setItem('panda-high-contrast', 'true');
                  document.body.classList.add('high-contrast');
                  document.querySelector('#btn-contrast-high .panda-check').classList.add('active');
                  document.querySelector('#btn-contrast-original .panda-check').classList.remove('active');
              });
              
              document.getElementById('btn-save-encrypted').addEventListener('click', (e) => {
                  e.stopPropagation();
                  localStorage.setItem('panda-encrypt-save', 'true');
                  document.querySelector('#btn-save-encrypted .panda-check').classList.add('active');
                  document.querySelector('#btn-save-normal .panda-check').classList.remove('active');
              });
              
              document.getElementById('btn-save-normal').addEventListener('click', (e) => {
                  e.stopPropagation();
                  localStorage.setItem('panda-encrypt-save', 'false');
                  document.querySelector('#btn-save-normal .panda-check').classList.add('active');
                  document.querySelector('#btn-save-encrypted .panda-check').classList.remove('active');
              });'''
content = content.replace(target_logic, replacement_logic)

# 5. Translation dictionary
target_trans = '''    'zh-tw': { settings: '設定', profile: '個人資料', mystuff: '我的東西', account: '帳號設定', logout: '登出', login: '登入', join: '加入', language: '語言', theme: '主題', colormode: '色彩模式', catblocks: '熊積木', original: '預設', highcontrast: '高對比' },
    'zh-cn': { settings: '设置', profile: '个人资料', mystuff: '我的东西', account: '账号设置', logout: '登出', login: '登录', join: '加入', language: '语言', theme: '主题', colormode: '色彩模式', catblocks: '熊积木', original: '默认', highcontrast: '高对比' }
};'''

replacement_trans = '''    'zh-tw': { settings: '設定', profile: '個人資料', mystuff: '我的東西', account: '帳號設定', logout: '登出', login: '登入', join: '加入', language: '語言', theme: '主題', colormode: '色彩模式', catblocks: '熊積木', original: '預設', highcontrast: '高對比', saveformat: '存檔格式', encrypted: 'Panda專屬(加密)', normal: '普通專案' },
    'zh-cn': { settings: '设置', profile: '个人资料', mystuff: '我的东西', account: '账号设置', logout: '登出', login: '登录', join: '加入', language: '语言', theme: '主题', colormode: '色彩模式', catblocks: '熊积木', original: '默认', highcontrast: '高对比', saveformat: '存档格式', encrypted: 'Panda专属(加密)', normal: '普通项目' }
};'''
content = content.replace(target_trans, replacement_trans)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
