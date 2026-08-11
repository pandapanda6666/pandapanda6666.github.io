import os
import re

filepath = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix duplicated observer
content = content.replace("    observer.observe(document.body, { childList: true, subtree: true });\n    observer.observe(document.body, { childList: true, subtree: true });\n});", "    observer.observe(document.body, { childList: true, subtree: true });\n});")

# Add the Account click listener right before the end of the observer function
account_listener = """
          // Also attach click listener to Account avatar to open on touch/click
          const accountBtn = document.querySelector('.panda-sso-nav:last-child');
          if (accountBtn && !accountBtn.dataset.clickBound) {
              accountBtn.dataset.clickBound = 'true';
              accountBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  accountBtn.classList.toggle('active');
                  const hideAccount = (event) => {
                      if (!accountBtn.contains(event.target)) {
                          accountBtn.classList.remove('active');
                          document.removeEventListener('click', hideAccount);
                      }
                  };
                  document.addEventListener('click', hideAccount);
              });
          }
        }
    });
"""

# Replace the closing block
content = content.replace("            menuBar.appendChild(authWrapper);\n        }\n    });", "            menuBar.appendChild(authWrapper);\n" + account_listener)

# Bump version
content = content.replace('v=88', 'v=89')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
