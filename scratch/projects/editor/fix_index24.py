import os
import re

filepath = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

idx1 = content.find('const langMenu = document.querySelector(\'div[class*="menu-bar_language-menu_"]\');')
if idx1 == -1:
    idx1 = content.find('const langMenu = document.querySelector("div[class*=\\"menu-bar_language-menu_\\"]");')

idx2 = content.find("if (menuBar && !document.getElementById('custom-sso-nav-wrapper')) {", idx1 + 10) if idx1 != -1 else -1

print("Found idx1:", idx1)
print("Found idx2:", idx2)

js_injection = """
          const langMenu = document.querySelector('div[class*="menu-bar_language-menu_"]');
          if (langMenu && !langMenu.dataset.active) {
              langMenu.classList.add('panda-hidden-lang');
          }
          
          if (langMenu && !document.getElementById('custom-settings-menu')) {
              const settingsDiv = document.createElement('div');
              settingsDiv.id = 'custom-settings-menu';
              settingsDiv.className = 'panda-settings-btn';
              
              let bearEnabled = localStorage.getItem('panda-bear-style') === 'true';
              let highContrast = localStorage.getItem('panda-high-contrast') === 'true';
              
              settingsDiv.innerHTML = `
                  <span id="btn-settings-toggle" style="display:flex;align-items:center;height:100%;width:100%;">
                      <span style="display:flex;align-items:center;"><svg class="panda-icon" viewBox="0 0 512 512" width="14" height="14" fill="currentColor" style="margin-right:6px;"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6 11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>設定</span>
                      <svg class="panda-icon" viewBox="0 0 320 512" width="10" height="10" fill="currentColor" style="margin-left:6px;"><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/></svg>
                  </span>
                  <ul class="panda-dropdown left">
                      <li onmousedown="event.stopPropagation()">
                          <span><svg class="panda-icon" viewBox="0 0 496 512" width="16" height="16" fill="currentColor" style="margin-right:8px;"><path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm160.3 144.1H324c-7.3-39.7-19-75-34.1-105 53.6 16.3 98.7 51.5 118.4 105zM248 48.7c18.3 32.7 32.4 72.8 40.5 115.4H207.5c8.1-42.6 22.2-82.7 40.5-115.4zm-70.1 5.3c-15.1 30-26.8 65.3-34.1 105H59.7C79.4 105.5 124.5 70.3 177.9 54zM48 256c0-18.4 2.4-36.2 6.8-53.1h136.2c-1.8 17.1-2.9 34.7-2.9 53.1s1.1 36 2.9 53.1H54.8C50.4 292.2 48 274.4 48 256zm28.3 90.9h83.9c7.3 39.7 19 75 34.1 105-53.5-16.3-98.6-51.5-118-105zM248 463.3c-18.3-32.7-32.4-72.8-40.5-115.4h81.1c-8.1 42.6-22.2 82.7-40.6 115.4zm70.1-5.3c15.1-30 26.8-65.3 34.1-105h83.9c-19.4 53.5-64.5 88.7-118 105zm42.7-148.9H224.5c1.8-17.1 2.9-34.7 2.9-53.1s-1.1-36-2.9-53.1h136.2c1.8 17.1 2.9 34.7 2.9 53.1s-1.1 36-2.9 53.1zm28.9-106.2c4.4 16.9 6.8 34.7 6.8 53.1s-2.4 36.2-6.8 53.1H310.8c1.8-17.1 2.9-34.7 2.9-53.1s-1.1-36-2.9-53.1h105.1z"/></svg>語言 (Language)</span>
                          <svg class="panda-icon" viewBox="0 0 256 512" width="10" height="10" fill="currentColor"><path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"/></svg>
                          <ul class="panda-submenu" style="min-width: 200px;">
                              <li id="btn-open-lang" onclick="event.stopPropagation();">開啟原生語言選單...</li>
                          </ul>
                      </li>
                      <li onmousedown="event.stopPropagation()">
                          <span><svg class="panda-icon" viewBox="0 0 512 512" width="16" height="16" fill="currentColor" style="margin-right:8px;"><path d="M256 512C114.6 512 0 397.4 0 256S114.6 0 256 0S512 114.6 512 256c0 41.8-33.6 75.8-75.3 76.5c-23.7 .4-47 16.6-56.1 40.5c-6.3 16.5-2.2 35.1 10.6 47.9c12.2 12.3 22 26.6 22 41.7c0 27.6-22.4 50-50 50h-7.2zM152 240a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm104-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm152 48a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm-48 104a48 48 0 1 0 -96 0 48 48 0 1 0 96 0z"/></svg>Theme</span>
                          <svg class="panda-icon" viewBox="0 0 256 512" width="10" height="10" fill="currentColor"><path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"/></svg>
                          <ul class="panda-submenu">
                              <li id="btn-theme-default" onclick="event.stopPropagation();">Default <span class="panda-check ${!bearEnabled ? 'active' : ''}">✔</span></li>
                              <li id="btn-theme-bear" onclick="event.stopPropagation();">Cat Blocks (熊積木) <span class="panda-check ${bearEnabled ? 'active' : ''}">✔</span></li>
                          </ul>
                      </li>
                      <li onmousedown="event.stopPropagation()">
                          <span><svg class="panda-icon" viewBox="0 0 512 512" width="16" height="16" fill="currentColor" style="margin-right:8px;"><path d="M256 512C114.6 512 0 397.4 0 256S114.6 0 256 0S512 114.6 512 256c0 41.8-33.6 75.8-75.3 76.5c-23.7 .4-47 16.6-56.1 40.5c-6.3 16.5-2.2 35.1 10.6 47.9c12.2 12.3 22 26.6 22 41.7c0 27.6-22.4 50-50 50h-7.2zM152 240a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm104-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm152 48a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm-48 104a48 48 0 1 0 -96 0 48 48 0 1 0 96 0z"/></svg>Color Mode</span>
                          <svg class="panda-icon" viewBox="0 0 256 512" width="10" height="10" fill="currentColor"><path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"/></svg>
                          <ul class="panda-submenu">
                              <li id="btn-contrast-original" onclick="event.stopPropagation();">原始 <span class="panda-check ${!highContrast ? 'active' : ''}">✔</span></li>
                              <li id="btn-contrast-high" onclick="event.stopPropagation();">高對比 <span class="panda-check ${highContrast ? 'active' : ''}">✔</span></li>
                          </ul>
                      </li>
                  </ul>`;
              
              langMenu.parentNode.insertBefore(settingsDiv, langMenu.nextSibling);
              
              document.getElementById('btn-settings-toggle').addEventListener('click', (e) => {
                  e.stopPropagation();
                  const isActive = settingsDiv.classList.contains('active');
                  if (isActive) {
                      settingsDiv.classList.remove('active');
                  } else {
                      settingsDiv.classList.add('active');
                      const hideSettings = (event) => {
                          if (!settingsDiv.contains(event.target)) {
                              settingsDiv.classList.remove('active');
                              document.removeEventListener('click', hideSettings);
                          }
                      };
                      document.addEventListener('click', hideSettings);
                  }
              });
              
              // Event Listeners for nested items
              document.getElementById('btn-open-lang').addEventListener('click', (e) => {
                  e.stopPropagation();
                  settingsDiv.classList.remove('active');
                  langMenu.dataset.active = 'true';
                  langMenu.classList.remove('panda-hidden-lang');
                  langMenu.style.position = 'absolute';
                  langMenu.style.top = '48px';
                  langMenu.style.left = '10px';
                  langMenu.style.zIndex = '9999';
                  langMenu.style.display = 'block';
                  langMenu.click();
                  const hideLang = () => {
                      setTimeout(() => {
                          langMenu.dataset.active = "";
                          langMenu.classList.add('panda-hidden-lang');
                          document.removeEventListener('click', hideLang);
                      }, 200);
                  };
                  document.addEventListener('click', hideLang);
              });
              
              document.getElementById('btn-theme-default').addEventListener('click', (e) => {
                  e.stopPropagation();
                  localStorage.setItem('panda-bear-style', 'false');
                  document.body.classList.remove('bear-style');
                  document.querySelector('#btn-theme-default .panda-check').classList.add('active');
                  document.querySelector('#btn-theme-bear .panda-check').classList.remove('active');
              });
              
              document.getElementById('btn-theme-bear').addEventListener('click', (e) => {
                  e.stopPropagation();
                  localStorage.setItem('panda-bear-style', 'true');
                  document.body.classList.add('bear-style');
                  document.querySelector('#btn-theme-bear .panda-check').classList.add('active');
                  document.querySelector('#btn-theme-default .panda-check').classList.remove('active');
              });
              
              document.getElementById('btn-contrast-original').addEventListener('click', (e) => {
                  e.stopPropagation();
                  localStorage.setItem('panda-high-contrast', 'false');
                  document.body.classList.remove('high-contrast');
                  document.querySelector('#btn-contrast-original .panda-check').classList.add('active');
                  document.querySelector('#btn-contrast-high .panda-check').classList.remove('active');
              });
              
              document.getElementById('btn-contrast-high').addEventListener('click', (e) => {
                  e.stopPropagation();
                  localStorage.setItem('panda-high-contrast', 'true');
                  document.body.classList.add('high-contrast');
                  document.querySelector('#btn-contrast-high .panda-check').classList.add('active');
                  document.querySelector('#btn-contrast-original .panda-check').classList.remove('active');
              });
              
              if (bearEnabled) document.body.classList.add('bear-style');
              if (highContrast) document.body.classList.add('high-contrast');
          }
"""

if idx1 != -1 and idx2 != -1:
    content = content[:idx1] + js_injection.strip() + "\n\n        " + content[idx2:]
else:
    print("FAILED TO FIND INDICES")

content = content.replace('v=87', 'v=88')
content = content.replace('v=86', 'v=88')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
