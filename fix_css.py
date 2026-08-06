import codecs

path = 'scratch/projects/editor/index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = '''  /* 音效編輯區與錄音介面主題色 - 精確覆蓋所有紫色元件 */
  div[class*="sound-editor_waveform-container_"],
  div[class*="library-item_play-button_"],
  div[class*="record-modal_meter-container_"] {
      filter: hue-rotate(-140deg) saturate(1.2) brightness(1.1);
  }'''

replacement = '''  /* 徹底消除所有殘留的紫色與藍色元素 (轉換為綠色) */
  /* 音效波形與錄音音量 */
  div[class*="sound-editor_waveform-container_"],
  div[class*="record-modal_meter-container_"],
  /* 音效編輯器與造型編輯器內的所有圖示按鈕 (播放、停止、效果、工具列等) */
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
  /* 音效庫的所有預覽播放圖示與按鈕 */
  div[class*="library-item_library-item-play-button_"],
  div[class*="library-item_play-button_"],
  [class*="play-button_"],
  [class*="stop-button_"],
  /* 教程標題列等藍色背景 */
  div[class*="card_card-header_"],
  div[class*="cards_card-header_"] {
      filter: hue-rotate(-140deg) saturate(1.2) brightness(1.1) !important;
  }
  
  /* 選取的外框與背景 (角色、背景) 轉為綠色系，不使用 filter 以免影響縮圖 */
  div[class*="sprite-selector-item_is-selected_"],
  div[class*="backdrop-selector-item_is-selected_"] {
      border: 2px solid #81C784 !important;
      background-color: rgba(129, 199, 132, 0.2) !important;
      box-shadow: 0 0 0 2px rgba(129, 199, 132, 0.3) !important;
  }
  
  /* 庫項目的 hover 邊框 (包含擴充功能) */
  div[class*="library-item_library-item_"]:hover {
      border-color: #81C784 !important;
  }
  
  /* 切換大小按鈕的選取背景 */
  div[class*="stage-header_stage-button_is-active_"] {
      background-color: rgba(129, 199, 132, 0.2) !important;
  }'''

content = content.replace(target, replacement)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
