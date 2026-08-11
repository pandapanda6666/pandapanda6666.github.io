import codecs
import re

path = r'C:\Users\User\.gemini\antigravity\scratch\pandapanda6666.github.io\scratch\projects\editor\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target_pattern = r'/\*\s*音效編輯器與錄音介面主題化.*?\}\s*'

replacement = '''  /* 徹底消除所有殘留的紫色與藍色元素 (轉換為綠色) */
  div[class*="sound-editor_waveform-container_"],
  div[class*="record-modal_meter-container_"],
  div[class*="sound-editor_button_"],
  div[class*="sound-editor_tool-button_"],
  div[class*="sound-editor_effect-button_"],
  div[class*="sound-editor_round-button_"],
  div[class*="audio-effect-action_action_"],
  div[class*="play-button_play-button_"],
  div[class*="stop-button_stop-button_"],
  div[class*="icon-button_container_"],
  div[class*="action-menu_button_"],
  div[class*="action-menu_main-button_"],
  div[class*="action-menu_more-buttons_"],
  div[class*="library-item_library-item-play-button_"],
  div[class*="library-item_play-button_"],
  [class*="play-button_"],
  [class*="stop-button_"],
  div[class*="card_card-header_"],
  div[class*="cards_card-header_"] {
      filter: hue-rotate(-140deg) saturate(1.2) brightness(1.1) !important;
  }
  
  div[class*="sprite-selector-item_is-selected_"],
  div[class*="backdrop-selector-item_is-selected_"] {
      border: 2px solid #81C784 !important;
      background-color: rgba(129, 199, 132, 0.2) !important;
      box-shadow: 0 0 0 2px rgba(129, 199, 132, 0.3) !important;
  }
  
  div[class*="library-item_library-item_"]:hover {
      border-color: #81C784 !important;
  }
  
  div[class*="stage-header_stage-button_is-active_"] {
      background-color: rgba(129, 199, 132, 0.2) !important;
  }
'''

if re.search(target_pattern, content, flags=re.DOTALL):
    content = re.sub(target_pattern, replacement, content, flags=re.DOTALL)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("MATCH FAILED")
