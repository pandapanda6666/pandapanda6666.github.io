/**
 * 十兆分之一 (1 in 10 Trillion) - 主應用邏輯與遊戲控制器
 * 功能特色：
 * 1. 真實紙本書開本小說排版（段落首行縮排兩字、滿版欄位、非單行塌陷，支援直排與橫排對開）
 * 2. 篇名嚴格遵循規範：只能是「第一章」、「第二章」…不可有副標題
 * 3. 內容三大敘事模式：普通 (適時省略)、完整 (一字不漏)、精簡 (80億事件敘述)
 * 4. 參考作家選擇：預設艾琳·杭特、沈石溪，支援自訂新增作家
 * 5. 全面以圖示取代表情符號 (FontAwesome)，杜絕生硬符號
 * 6. 輪盤隨機抽選精確鎖定：最後顯示物種保證與出生登記證 100% 一致
 * 7. 多重與動態稱呼系統：未命名時名字為空白，記錄何時/誰的稱呼
 * 8. 抉擇支援「其他」自主行動輸入格，由 AI 判定連鎖後續
 * 9. 個體自主意志：打破刻板標籤（如棕熊不必然咬殺幼熊）
 * 10. 本地進度自動存檔 (localStorage)：隨時重載無縫復原
 */

(function () {
  "use strict";

  const SAVE_STORAGE_KEY = "10t_life_save";

  // 全域遊戲狀態
  const state = {
    selectedPool: "all",
    selectedAuthor: "erinhunter", // erinhunter, shenshixi, 或自訂物件 { name: "..." }
    contentMode: "normal",        // normal (普通), full (完整), compact (精簡)
    experienceMode: "story",      // story (故事模式/深層情感), realism (現實模式/客觀生態)
    era: "now",                  // now (現在), past (過去), future (未來), any (哪個世界都好)
    eraYear: 1990,               // 過去時代年份 (1950-2025)
    drawMode: "birth",           // birth (此刻出生的生靈), pop (現存群體)
    lifePace: "30",              // 30 (約30分鐘), 60 (約1小時), 90 (約1小時30分鐘)
    homeCountry: "TW",           // 使用者母國，預設台灣
    skipHeavy: false,            // 略過可怕/過於沉重的情節
    autoDecision: false,         // 自動抉擇開關 (不中斷小說流暢閱讀)
    pauseOnReflection: true,     // 里程碑沉思停頓 (5, 15, 30, 50, 70歲)
    musicVolume: 0.5,            // 背景音量
    feedStarredOnly: false,      // 事件紀錄是否僅顯示加星標項目
    starredFeedIndices: [],      // 已加星標事件索引
    candleCount: 0,              // 點燭計數
    currentLife: null,
    currentAge: 0,
    currentSeasonIdx: 0,
    isPaused: true,
    isGameOver: false,
    speedMultiplier: 1,
    readingProtection: true,
    timerId: null,
    companions: [],
    choicesMadeCount: 0,
    recentChoices: [],
    activeFocus: "hunt",
    soundEnabled: false,
    audioCtx: null,
    ambientGain: null,
    sceneMood: "calm",

    // 紙本書小說狀態
    bookPages: [],          // 每頁包含之段落數組: [ ["段落1", "段落2"], ... ]
    currentSpreadIndex: 0,  // 當前展開之右頁索引
    fullNovelText: "",      // 完整累積小說文字
    currentChapterTitle: "第一章",
    feedEvents: [],
    eulogy: "",
    isDeathNoticed: false,
    currentActiveChapter: null, // 當前面臨的抉擇章節資料
    prefetchedChapters: {},     // 提前生成的章節快取 { [chapterIdx]: chapterData }
    isPrefetching: false        // 背景生成狀態鎖
  };

  // DOM 元素引用
  const el = {};

  function initElements() {
    el.introSec = document.getElementById("intro");
    el.rollSec = document.getElementById("roll");
    el.lifeSec = document.getElementById("lifeview");
    el.deadSec = document.getElementById("dead");

    el.aiBar = document.getElementById("admin-ai-progress-bar");
    el.aiStatus = document.getElementById("ai-progress-status");
    el.aiFill = document.getElementById("ai-progress-fill");
    el.aiPct = document.getElementById("ai-progress-pct");

    el.animalTicker = document.getElementById("liveAnimalBirths");
    el.humanTicker = document.getElementById("liveHumanBirths");

    // 1in8b 序幕與設定元件
    el.eraGroup = document.getElementById("eraGroup");
    el.eraYrRow = document.getElementById("eraYrRow");
    el.eraYearSel = document.getElementById("eraYearSel");
    el.drawGroup = document.getElementById("drawGroup");
    el.paceGroup = document.getElementById("paceGroup");
    el.homeSel = document.getElementById("homeSel");
    el.homeDescText = document.getElementById("homeDescText");
    el.cBirth = document.getElementById("cBirth");
    el.cDeath = document.getElementById("cDeath");
    el.tgMap = document.getElementById("tgMap");
    el.certMap = document.getElementById("certMap");
    el.certHome = document.getElementById("certHome");
    el.certCardBtn = document.getElementById("certCardBtn");
    el.softBtn2 = document.getElementById("softBtn2");
    el.careLinkBtn = document.getElementById("careLinkBtn");
    el.heroMemo = document.getElementById("heroMemo");
    el.pastLives = document.getElementById("pastLives");

    el.contentModeGroup = document.getElementById("contentModeGroup");
    el.modeHintText = document.getElementById("modeHintText");
    el.experienceModeGroup = document.getElementById("experienceModeGroup");
    el.experienceHintText = document.getElementById("experienceHintText");
    el.authorGroup = document.getElementById("authorGroup");
    el.authorHintText = document.getElementById("authorHintText");
    el.addCustomAuthorBtn = document.getElementById("addCustomAuthorBtn");
    el.customAuthorInline = document.getElementById("customAuthorInline");
    el.customAuthorInput = document.getElementById("customAuthorInput");
    el.confirmCustomAuthorBtn = document.getElementById("confirmCustomAuthorBtn");
    el.cancelCustomAuthorBtn = document.getElementById("cancelCustomAuthorBtn");

    el.startRollBtn = document.getElementById("startRollBtn");
    el.rollerBox = document.getElementById("rollerBox");
    el.rollerDisplay = document.getElementById("rollerDisplay");
    el.rollerBiome = document.getElementById("rollerBiome");
    el.certCard = document.getElementById("certCard");
    el.certCharName = document.getElementById("certCharName");
    el.certMultiNames = document.getElementById("certMultiNames");
    el.certGenderBadge = document.getElementById("certGenderBadge");
    el.certAppearanceBox = document.getElementById("certAppearanceBox");
    el.certAppearanceText = document.getElementById("certAppearanceText");
    el.certBioScienceBox = document.getElementById("certBioScienceBox");
    el.certBioLookalike = document.getElementById("certBioLookalike");
    el.certBioScienceText = document.getElementById("certBioScienceText");
    el.certExpBadge = document.getElementById("certExpBadge");
    el.beginLifeBtn = document.getElementById("beginLifeBtn");
    el.reRollBtn = document.getElementById("reRollBtn");

    el.topAgeDisplay = document.getElementById("topAgeDisplay");
    el.topAgeUnit = document.getElementById("topAgeUnit");
    el.topSeasonBadge = document.getElementById("topSeasonBadge");
    el.topTimelineFill = document.getElementById("topTimelineFill");
    el.pauseBtn = document.getElementById("pauseBtn");
    el.pauseIcon = document.getElementById("pauseIcon");
    el.nextChoiceBtn = document.getElementById("nextChoiceBtn");
    el.readPauseToggleBtn = document.getElementById("readPauseToggleBtn");
    el.abandonLifeBtn = document.getElementById("abandonLifeBtn");
    el.abandonConfirmModal = document.getElementById("abandonConfirmModal");
    el.confirmAbandonYesBtn = document.getElementById("confirmAbandonYesBtn");
    el.confirmAbandonNoBtn = document.getElementById("confirmAbandonNoBtn");

    // 主畫面 1in8b 新增控制 (速度、快進、更多選單)
    el.ffBtn = document.getElementById("ffBtn");
    el.moreBtn = document.getElementById("moreBtn");
    el.moreMenu = document.getElementById("moreMenu");
    el.autoBtn = document.getElementById("autoBtn");
    el.autoStatusTag = document.getElementById("autoStatusTag");
    el.musicVolSlider = document.getElementById("musicVolSlider");
    el.pauseQ = document.getElementById("pauseQ");
    el.pauseQStatusTag = document.getElementById("pauseQStatusTag");
    el.softBtn = document.getElementById("softBtn");
    el.softStatusTag = document.getElementById("softStatusTag");
    el.themeBtn2 = document.getElementById("themeBtn2");
    el.careBtn = document.getElementById("careBtn");
    el.goFam = document.getElementById("goFam");
    el.goShop = document.getElementById("goShop");
    el.famCard = document.getElementById("famCard");
    el.famList = document.getElementById("famList");
    el.dashHomeCard = document.getElementById("dashHomeCard");
    el.filterStarredBtn = document.getElementById("filterStarredBtn");

    el.dashAvatar = document.getElementById("dashAvatar");
    el.dashName = document.getElementById("dashName");
    el.dashMultiNames = document.getElementById("dashMultiNames");
    el.dashSpecies = document.getElementById("dashSpecies");
    el.dashGenderBadge = document.getElementById("dashGenderBadge");
    el.dashAppearanceText = document.getElementById("dashAppearanceText");
    el.dashBioScienceRow = document.getElementById("dashBioScienceRow");
    el.dashBioScienceText = document.getElementById("dashBioScienceText");
    el.dashExpBadge = document.getElementById("dashExpBadge");
    el.dashRank = document.getElementById("dashRank");
    el.dashBiome = document.getElementById("dashBiome");
    el.dashCurrency = document.getElementById("dashCurrency");
    el.dashSocialType = document.getElementById("dashSocialType");
    el.dashHumanEcoRow = document.getElementById("dashHumanEcoRow");

    el.valHealth = document.getElementById("valHealth");
    el.barHealth = document.getElementById("barHealth");
    el.valEnergy = document.getElementById("valEnergy");
    el.barEnergy = document.getElementById("barEnergy");
    el.valInstinct = document.getElementById("valInstinct");
    el.barInstinct = document.getElementById("barInstinct");
    el.valSocial = document.getElementById("valSocial");
    el.barSocial = document.getElementById("barSocial");
    el.valResource = document.getElementById("valResource");
    el.labelResource = document.getElementById("labelResource");
    el.labelInstinct = document.getElementById("labelInstinct");
    el.labelEnergy = document.getElementById("labelEnergy");
    el.labelSocial = document.getElementById("labelSocial");

    // 紙本書元件
    el.novelBookCard = document.getElementById("novelBookCard");
    el.novelChapterTitle = document.getElementById("novelChapterTitle");
    el.readingModeToggleBtn = document.getElementById("readingModeToggleBtn");
    el.readingModeIcon = document.getElementById("readingModeIcon");
    el.readingModeText = document.getElementById("readingModeText");
    el.prevPageBtn = document.getElementById("prevPageBtn");
    el.nextPageBtn = document.getElementById("nextPageBtn");
    el.bookPageIndicator = document.getElementById("bookPageIndicator");
    el.novelDeathNotice = document.getElementById("novelDeathNotice");
    el.goToMemorialBtn = document.getElementById("goToMemorialBtn");

    el.bookSpreadContainer = document.getElementById("bookSpreadContainer");
    el.novelLoadingBanner = document.getElementById("novelLoadingBanner");
    el.novelLoadingOverlay = document.getElementById("novelLoadingOverlay");
    el.novelLoadingTitle = document.getElementById("novelLoadingTitle");
    el.novelLoadingDesc = document.getElementById("novelLoadingDesc");
    el.bookPageRight = document.getElementById("bookPageRight");
    el.bookPageLeft = document.getElementById("bookPageLeft");
    el.headerChapterRight = document.getElementById("headerChapterRight");
    el.headerChapterLeft = document.getElementById("headerChapterLeft");
    el.pageContentRight = document.getElementById("pageContentRight");
    el.pageContentLeft = document.getElementById("pageContentLeft");
    el.pageNumRight = document.getElementById("pageNumRight");
    el.pageNumLeft = document.getElementById("pageNumLeft");

    // 風格設定顧問 AI
    el.openStyleTunerBtn = document.getElementById("openStyleTunerBtn");
    el.styleTunerModal = document.getElementById("styleTunerModal");
    el.closeStyleTunerBtn = document.getElementById("closeStyleTunerBtn");
    el.styleTunerInput = document.getElementById("styleTunerInput");
    el.styleTunerSendBtn = document.getElementById("styleTunerSendBtn");
    el.styleTunerChatBox = document.getElementById("styleTunerChatBox");
    el.applyTunedStyleBtn = document.getElementById("applyTunedStyleBtn");
    el.currentTunedStyleSummary = document.getElementById("currentTunedStyleSummary");

    // 生命終暮結算彈窗
    el.deathSettlementModal = document.getElementById("deathSettlementModal");
    el.stayReadDeathBtn = document.getElementById("stayReadDeathBtn");
    el.confirmGoMemorialBtn = document.getElementById("confirmGoMemorialBtn");
    el.settleCauseText = document.getElementById("settleCauseText");
    el.settlePercentileText = document.getElementById("settlePercentileText");
    el.settleChaptersText = document.getElementById("settleChaptersText");

    el.choiceContainer = document.getElementById("choiceContainer");
    el.choiceIncidentText = document.getElementById("choiceIncidentText");
    el.choiceChapterBadge = document.getElementById("choiceChapterBadge");
    el.choicePromptText = document.getElementById("choicePromptText");
    el.choiceButtonsGrid = document.getElementById("choiceButtonsGrid");
    el.customChoiceWrap = document.getElementById("customChoiceWrap");
    el.customChoiceInput = document.getElementById("customChoiceInput");
    el.submitCustomChoiceBtn = document.getElementById("submitCustomChoiceBtn");

    el.focusChipsContainer = document.getElementById("focusChipsContainer");
    el.eventFeedList = document.getElementById("eventFeedList");
    el.companionsList = document.getElementById("companionsList");
    el.lifeGridContainer = document.getElementById("lifeGridContainer");
    el.ecoDataContent = document.getElementById("ecoDataContent");
    el.svgCurvePath = document.getElementById("svgCurvePath");
    el.svgAgeMarker = document.getElementById("svgAgeMarker");
    el.chartCaption = document.getElementById("chartCaption");

    el.themeToggleBtn = document.getElementById("themeToggleBtn");
    el.themeIcon = document.getElementById("themeIcon");
    el.ambientSoundBtn = document.getElementById("ambientSoundBtn");
    el.ambientSoundLabel = document.getElementById("ambientSoundLabel");
    el.restartGameBtn = document.getElementById("restartGameBtn");
    el.reviewNovelBtn = document.getElementById("reviewNovelBtn");
    el.closeMemoNovelBtn = document.getElementById("closeMemoNovelBtn");
    el.memorialNovelContainer = document.getElementById("memorialNovelContainer");
    el.memoFullNovelText = document.getElementById("memoFullNovelText");

    // 荒野追思館
    el.candleSection = document.getElementById("candleSection");
    el.lightCandleBtn = document.getElementById("lightCandleBtn");
    el.candleCount = document.getElementById("candleCount");
    el.memoPresetsRow = document.getElementById("memoPresetsRow");
    el.memoMsgInput = document.getElementById("memoMsgInput");
    el.memoSendBtn = document.getElementById("sendMemoMsgBtn") || document.getElementById("memoSendBtn");
    el.memoWall = document.getElementById("memoWall");
    el.memoRandBtn = document.getElementById("memoRandBtn");
    el.memoMineBtn = document.getElementById("memoMineBtn");
    el.moveRecordsBtn = document.getElementById("moveRecordsBtn");
    el.shareMemorialBtn = document.getElementById("shareMemorialBtn");
    el.pastShelfSection = document.getElementById("pastShelfSection");
    el.pastShelfList = document.getElementById("pastShelfList");

    // 內建彈窗
    el.questionPauseModal = document.getElementById("questionPauseModal");
    el.reflectAgeTag = document.getElementById("reflectAgeTag");
    el.reflectQuestionText = document.getElementById("reflectQuestionText");
    el.reflectAnswerInput = document.getElementById("reflectAnswerInput");
    el.skipReflectBtn = document.getElementById("skipReflectBtn");
    el.submitReflectBtn = document.getElementById("submitReflectBtn");

    el.shopModal = document.getElementById("shopModal");
    el.closeShopBtn = document.getElementById("closeShopBtn");
    el.shopBalanceLabel = document.getElementById("shopBalanceLabel");

    el.careModal = document.getElementById("careModal");
    el.closeCareModalBtn = document.getElementById("closeCareModalBtn");
    el.ackCareBtn = document.getElementById("ackCareBtn");

    el.shareCardModal = document.getElementById("shareCardModal");
    el.closeShareModalBtn = document.getElementById("closeShareModalBtn");
    el.scSerial = document.getElementById("scSerial");
    el.scTitle = document.getElementById("scTitle");
    el.scMeta = document.getElementById("scMeta");
    el.scStory = document.getElementById("scStory");
    el.scStats = document.getElementById("scStats");
    el.shareTextContent = document.getElementById("shareTextContent");
    el.copyShareBtn = document.getElementById("copyShareBtn");

    el.moveModal = document.getElementById("moveModal");
    el.closeMoveModalBtn = document.getElementById("closeMoveModalBtn");
    el.exportCodeArea = document.getElementById("exportCodeArea");
    el.copyExportCodeBtn = document.getElementById("copyExportCodeBtn");
    el.importCodeArea = document.getElementById("importCodeArea");
    el.confirmImportBtn = document.getElementById("confirmImportBtn");

    el.myMemorialModal = document.getElementById("myMemorialModal");
    el.closeMyMemorialBtn = document.getElementById("closeMyMemorialBtn");
    el.myMemorialListContainer = document.getElementById("myMemorialListContainer");

    // 全螢幕省思文字引言與頁尾
    el.introPrologueOverlay = document.getElementById("introPrologueOverlay");
    el.prologueLine = document.getElementById("prologueLine");
    el.replayPrologueBtn = document.getElementById("replayPrologueBtn");
    el.replayPrologueBtnDead = document.getElementById("replayPrologueBtnDead");
    el.topPrologueBtn = document.getElementById("topPrologueBtn");
  }

  // 出生計數器 (每秒更新，無表情符號)
  let birthTickerCount = 0;
  function startBirthTickers() {
    setInterval(() => {
      birthTickerCount++;
      const animalBirths = birthTickerCount * 142000 + Math.floor(Math.random() * 8000);
      const humanBirths = Math.floor(birthTickerCount * 4.3);
      if (el.animalTicker) el.animalTicker.textContent = animalBirths.toLocaleString();
      if (el.humanTicker) el.humanTicker.textContent = humanBirths.toLocaleString();
    }, 1000);
  }

  // 綁定事件監聽
  function bindEvents() {
    // 物種池選擇
    document.querySelectorAll("#speciesPoolGroup .seg-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#speciesPoolGroup .seg-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.selectedPool = btn.dataset.pool;
      });
    });

    // 內容敘事模式選擇 (取代原步調選擇)
    if (el.contentModeGroup) {
      el.contentModeGroup.querySelectorAll(".seg-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          el.contentModeGroup.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          state.contentMode = btn.dataset.mode;
          updateModeHint(state.contentMode);
          restartSimulationTimer();
          saveGameState();
        });
      });
    }

    // 生命體驗維度選擇 (故事模式 vs 現實模式)
    if (el.experienceModeGroup) {
      el.experienceModeGroup.querySelectorAll(".seg-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          el.experienceModeGroup.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          state.experienceMode = btn.dataset.exp || "story";
          updateExperienceHint(state.experienceMode);
          updateDashboardUI();
          saveGameState();
        });
      });
    }

    // 參考作家選擇
    if (el.authorGroup) {
      el.authorGroup.querySelectorAll(".seg-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          el.authorGroup.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          state.selectedAuthor = btn.dataset.author;
          updateAuthorHint(state.selectedAuthor);
          saveGameState();
        });
      });
    }

    // 新增自訂作家 (改為內建表單，不用 prompt)
    if (el.addCustomAuthorBtn) {
      el.addCustomAuthorBtn.addEventListener("click", () => {
        if (el.customAuthorInline) {
          const isHidden = el.customAuthorInline.style.display === "none";
          el.customAuthorInline.style.display = isHidden ? "block" : "none";
          if (isHidden && el.customAuthorInput) {
            el.customAuthorInput.focus();
          }
        }
      });
    }

    const handleConfirmCustomAuthor = () => {
      if (!el.customAuthorInput) return;
      const inputName = el.customAuthorInput.value.trim();
      if (inputName) {
        state.selectedAuthor = { name: inputName };

        // 建立新按鈕並置為 active
        el.authorGroup.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
        const newBtn = document.createElement("button");
        newBtn.type = "button";
        newBtn.className = "seg-btn active";
        newBtn.dataset.author = "custom_" + Date.now();
        newBtn.textContent = inputName;
        newBtn.addEventListener("click", () => {
          el.authorGroup.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
          newBtn.classList.add("active");
          state.selectedAuthor = { name: inputName };
          updateAuthorHint(state.selectedAuthor);
          saveGameState();
        });
        el.authorGroup.appendChild(newBtn);
        updateAuthorHint(state.selectedAuthor);
        saveGameState();
        el.customAuthorInput.value = "";
        if (el.customAuthorInline) el.customAuthorInline.style.display = "none";
      }
    };

    if (el.confirmCustomAuthorBtn) {
      el.confirmCustomAuthorBtn.addEventListener("click", handleConfirmCustomAuthor);
    }
    if (el.cancelCustomAuthorBtn) {
      el.cancelCustomAuthorBtn.addEventListener("click", () => {
        if (el.customAuthorInline) el.customAuthorInline.style.display = "none";
      });
    }
    if (el.customAuthorInput) {
      el.customAuthorInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleConfirmCustomAuthor();
        } else if (e.key === "Escape") {
          if (el.customAuthorInline) el.customAuthorInline.style.display = "none";
        }
      });
    }

    // 1in8b 時代選擇
    if (el.eraGroup) {
      el.eraGroup.querySelectorAll(".seg-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          el.eraGroup.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          state.era = btn.dataset.era;
          if (el.eraYrRow) {
            el.eraYrRow.style.display = (state.era === "past") ? "flex" : "none";
          }
          saveGameState();
        });
      });
    }

    if (el.eraYearSel) {
      el.eraYearSel.addEventListener("change", (e) => {
        state.eraYear = parseInt(e.target.value, 10);
        saveGameState();
      });
    }

    // 1in8b 抽籤方式選擇 (此刻出生 vs 現存群體)
    if (el.drawGroup) {
      el.drawGroup.querySelectorAll(".seg-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          el.drawGroup.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          state.drawMode = btn.dataset.draw;
          saveGameState();
        });
      });
    }

    // 1in8b 人生長度 (30分/60分/90分)
    if (el.paceGroup) {
      el.paceGroup.querySelectorAll(".seg-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          el.paceGroup.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          state.lifePace = btn.dataset.pace;
          restartSimulationTimer();
          saveGameState();
        });
      });
    }

    // 1in8b 實際出生地母國選擇
    if (el.homeSel) {
      el.homeSel.addEventListener("change", (e) => {
        state.homeCountry = e.target.value;
        const hc = (window.HOME_COUNTRIES_LIST || []).find(c => c.id === state.homeCountry);
        if (hc && el.homeDescText) {
          el.homeDescText.textContent = `${hc.name}：預期壽命約 ${hc.avgLifespan} 歲，嬰兒死亡率 ${(hc.infantMortality * 100).toFixed(2)}%，人均 GDP $${hc.gdpPppUsd.toLocaleString()} 美元。`;
        }
        saveGameState();
      });
    }

    // 敏感內容切換 (略過可怕的情節)
    const toggleSoftContent = () => {
      state.skipHeavy = !state.skipHeavy;
      const statusText = state.skipHeavy ? "已開啟過濾" : "未開啟過濾";
      if (el.softBtn2) el.softBtn2.textContent = state.skipHeavy ? "已略過可怕的情節" : "略過可怕的情節";
      if (el.softStatusTag) el.softStatusTag.textContent = statusText;
      saveGameState();
    };
    if (el.softBtn2) el.softBtn2.addEventListener("click", toggleSoftContent);
    if (el.softBtn) el.softBtn.addEventListener("click", toggleSoftContent);

    // 心理與求助諮詢彈窗
    if (el.careLinkBtn) el.careLinkBtn.addEventListener("click", () => { if (el.careModal) el.careModal.style.display = "flex"; });
    if (el.careBtn) el.careBtn.addEventListener("click", () => {
      if (el.moreMenu) el.moreMenu.classList.remove("active");
      if (el.careModal) el.careModal.style.display = "flex";
    });
    if (el.careCloseBtn) el.careCloseBtn.addEventListener("click", () => { if (el.careModal) el.careModal.style.display = "none"; });
    if (el.careModal) el.careModal.addEventListener("click", (e) => { if (e.target === el.careModal) el.careModal.style.display = "none"; });

    // 更多選單 (⋯) 下拉開關
    if (el.moreBtn) {
      el.moreBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (el.moreMenu) el.moreMenu.classList.toggle("active");
      });
    }
    document.addEventListener("click", (e) => {
      if (el.moreMenu && el.moreMenu.classList.contains("active")) {
        if (!el.moreMenu.contains(e.target) && e.target !== el.moreBtn) {
          el.moreMenu.classList.remove("active");
        }
      }
    });

    // 自動抉擇開關
    if (el.autoBtn) {
      el.autoBtn.addEventListener("click", () => {
        state.autoDecision = !state.autoDecision;
        if (el.autoStatusTag) el.autoStatusTag.textContent = state.autoDecision ? "開" : "關";
        if (el.autoStatusTag) el.autoStatusTag.classList.toggle("more-status-active", state.autoDecision);
        saveGameState();
      });
    }

    // 音量滑桿
    if (el.musicVolSlider) {
      el.musicVolSlider.addEventListener("input", (e) => {
        state.musicVolume = parseFloat(e.target.value);
        if (state.ambientGain && state.audioCtx) {
          state.ambientGain.gain.setValueAtTime(state.musicVolume * 0.08, state.audioCtx.currentTime);
        }
      });
    }

    // 里程碑沉思停頓開關
    if (el.pauseQ) {
      el.pauseQ.addEventListener("click", () => {
        state.pauseOnReflection = !state.pauseOnReflection;
        if (el.pauseQStatusTag) el.pauseQStatusTag.textContent = state.pauseOnReflection ? "開" : "關";
        if (el.pauseQStatusTag) el.pauseQStatusTag.classList.toggle("more-status-active", state.pauseOnReflection);
        saveGameState();
      });
    }

    // 主題切換 (選單內)
    if (el.themeBtn2) {
      el.themeBtn2.addEventListener("click", () => {
        toggleTheme();
        if (el.moreMenu) el.moreMenu.classList.remove("active");
      });
    }

    // 查看家庭成員
    if (el.goFam) {
      el.goFam.addEventListener("click", () => {
        if (el.moreMenu) el.moreMenu.classList.remove("active");
        if (el.famCard) el.famCard.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }

    // 花費與投資彈窗
    if (el.goShop) {
      el.goShop.addEventListener("click", () => {
        if (el.moreMenu) el.moreMenu.classList.remove("active");
        openShopModal();
      });
    }
    if (el.closeShopBtn) el.closeShopBtn.addEventListener("click", () => { if (el.shopModal) el.shopModal.style.display = "none"; });
    if (el.shopModal) el.shopModal.addEventListener("click", (e) => { if (e.target === el.shopModal) el.shopModal.style.display = "none"; });

    // 事件流星星篩選
    if (el.filterStarredBtn) {
      el.filterStarredBtn.addEventListener("click", () => {
        state.feedStarredOnly = !state.feedStarredOnly;
        el.filterStarredBtn.classList.toggle("active", state.feedStarredOnly);
        renderFeedEvents();
      });
    }

    // 快進到下一個抉擇
    if (el.ffBtn) {
      el.ffBtn.addEventListener("click", fastForwardToNextChoice);
    }

    // 出生證明分享卡
    if (el.certCardBtn) {
      el.certCardBtn.addEventListener("click", () => openShareCardModal(false));
    }

    // 荒野追思館分享卡
    if (el.shareMemorialBtn) {
      el.shareMemorialBtn.addEventListener("click", () => openShareCardModal(true));
    }
    if (el.closeShareModalBtn) el.closeShareModalBtn.addEventListener("click", () => { if (el.shareCardModal) el.shareCardModal.style.display = "none"; });
    if (el.shareCardModal) el.shareCardModal.addEventListener("click", (e) => { if (e.target === el.shareCardModal) el.shareCardModal.style.display = "none"; });
    if (el.copyShareBtn) el.copyShareBtn.addEventListener("click", copyShareCardContent);

    // 點亮蠟燭
    if (el.lightCandleBtn) {
      el.lightCandleBtn.addEventListener("click", handleLightCandle);
    }

    // 思念牆留言
    if (el.memoPresetsRow) {
      el.memoPresetsRow.querySelectorAll(".preset-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          if (el.memoMsgInput) el.memoMsgInput.value = chip.dataset.text || chip.textContent.trim();
        });
      });
    }
    if (el.memoSendBtn) el.memoSendBtn.addEventListener("click", handlePostMemorialMessage);
    if (el.memoMsgInput) {
      el.memoMsgInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handlePostMemorialMessage();
        }
      });
    }

    // 隨機重現一則過往人生
    if (el.memoRandBtn) el.memoRandBtn.addEventListener("click", handleShowRandomMemorialLife);

    // 我的紀念碑清單
    if (el.memoMineBtn) el.memoMineBtn.addEventListener("click", openMyMemorialLivesModal);
    if (el.closeMyMemorialBtn) el.closeMyMemorialBtn.addEventListener("click", () => { if (el.myMemorialModal) el.myMemorialModal.style.display = "none"; });
    if (el.myMemorialModal) el.myMemorialModal.addEventListener("click", (e) => { if (e.target === el.myMemorialModal) el.myMemorialModal.style.display = "none"; });

    // 跨裝置紀錄轉移
    if (el.moveRecordsBtn) el.moveRecordsBtn.addEventListener("click", openTransferRecordsModal);
    if (el.closeMoveModalBtn) el.closeMoveModalBtn.addEventListener("click", () => { if (el.moveModal) el.moveModal.style.display = "none"; });
    if (el.moveModal) el.moveModal.addEventListener("click", (e) => { if (e.target === el.moveModal) el.moveModal.style.display = "none"; });
    if (el.copyExportCodeBtn) el.copyExportCodeBtn.addEventListener("click", copyExportTransferCode);
    if (el.confirmImportBtn) el.confirmImportBtn.addEventListener("click", applyImportTransferCode);

    // 里程碑沉思彈窗按鈕
    if (el.skipReflectBtn) {
      el.skipReflectBtn.addEventListener("click", () => {
        if (el.questionPauseModal) el.questionPauseModal.style.display = "none";
        setPauseState(false);
        startSimulationLoop();
      });
    }
    if (el.submitReflectBtn) {
      el.submitReflectBtn.addEventListener("click", () => {
        const thought = el.reflectAnswerInput ? el.reflectAnswerInput.value.trim() : "";
        pushEventToFeed({
          ageLabel: `${state.currentAge} ${state.currentLife.species.unit}・深層沉思`,
          type: "milestone",
          isConsolidated: true,
          text: thought ? `在 ${state.currentAge} 歲銘刻感悟：「${thought}」。` : `在 ${state.currentAge} 歲佇足沉思，將對荒野生命的眷戀化為深層直覺。`
        });
        if (el.questionPauseModal) el.questionPauseModal.style.display = "none";
        setPauseState(false);
        startSimulationLoop();
      });
    }

    // 輪盤與投胎
    if (el.startRollBtn) el.startRollBtn.addEventListener("click", startRollingLife);
    if (el.reRollBtn) el.reRollBtn.addEventListener("click", startRollingLife);
    if (el.beginLifeBtn) el.beginLifeBtn.addEventListener("click", enterLifeDashboard);

    // 時間控制器
    if (el.pauseBtn) el.pauseBtn.addEventListener("click", togglePause);
    document.querySelectorAll(".sp-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".sp-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.speedMultiplier = parseInt(btn.dataset.sp, 10);
        restartSimulationTimer();
      });
    });

    if (el.nextChoiceBtn) el.nextChoiceBtn.addEventListener("click", fastForwardToNextChoice);
    if (el.ffBtn) el.ffBtn.addEventListener("click", fastForwardToNextChoice);

    // 閱讀保護開關
    if (el.readPauseToggleBtn) {
      el.readPauseToggleBtn.addEventListener("click", () => {
        state.readingProtection = !state.readingProtection;
        if (state.readingProtection) {
          el.readPauseToggleBtn.classList.add("active");
          el.readPauseToggleBtn.innerHTML = '<i class="fas fa-book-reader"></i> 閱讀保護：開';
        } else {
          el.readPauseToggleBtn.classList.remove("active");
          el.readPauseToggleBtn.innerHTML = '<i class="fas fa-book-reader"></i> 閱讀保護：關';
        }
        saveGameState();
      });
    }

    // 放棄此生按鈕 (改為內建確認視窗，不用 confirm)
    if (el.abandonLifeBtn) {
      el.abandonLifeBtn.addEventListener("click", () => {
        if (el.abandonConfirmModal) {
          el.abandonConfirmModal.style.display = "flex";
        }
      });
    }

    if (el.confirmAbandonYesBtn) {
      el.confirmAbandonYesBtn.addEventListener("click", () => {
        if (el.abandonConfirmModal) el.abandonConfirmModal.style.display = "none";
        clearGameState();
        if (state.timerId) clearInterval(state.timerId);
        el.lifeSec.style.display = "none";
        el.rollSec.style.display = "none";
        el.deadSec.style.display = "none";
        el.introSec.style.display = "block";
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    if (el.confirmAbandonNoBtn) {
      el.confirmAbandonNoBtn.addEventListener("click", () => {
        if (el.abandonConfirmModal) el.abandonConfirmModal.style.display = "none";
      });
    }

    if (el.abandonConfirmModal) {
      el.abandonConfirmModal.addEventListener("click", (e) => {
        if (e.target === el.abandonConfirmModal) {
          el.abandonConfirmModal.style.display = "none";
        }
      });
    }

    // 閱讀模式（保持經典直排紙本書）
    if (el.readingModeToggleBtn) {
      el.readingModeToggleBtn.addEventListener("click", toggleReadingMode);
    }

    // 書本翻頁按鈕與點擊頁面翻頁支援
    if (el.prevPageBtn) el.prevPageBtn.addEventListener("click", turnPagePrev);
    if (el.nextPageBtn) el.nextPageBtn.addEventListener("click", turnPageNext);

    if (el.bookPageRight) {
      el.bookPageRight.addEventListener("click", () => {
        if (window.getSelection && window.getSelection().toString()) return;
        turnPagePrev();
      });
    }
    if (el.bookPageLeft) {
      el.bookPageLeft.addEventListener("click", () => {
        if (window.getSelection && window.getSelection().toString()) return;
        turnPageNext();
      });
    }

    window.addEventListener("keydown", (e) => {
      if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowLeft") {
        turnPageNext();
      } else if (e.key === "ArrowRight") {
        turnPagePrev();
      }
    });

    // 前往追思館按鈕
    if (el.goToMemorialBtn) el.goToMemorialBtn.addEventListener("click", showMemorialHall);

    // 自訂/其他自主行動輸入按鈕
    if (el.submitCustomChoiceBtn) {
      el.submitCustomChoiceBtn.addEventListener("click", handleCustomChoiceSubmit);
    }
    if (el.customChoiceInput) {
      el.customChoiceInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleCustomChoiceSubmit();
        }
      });
    }

    // 追思館內翻閱全篇小說
    if (el.reviewNovelBtn) {
      el.reviewNovelBtn.addEventListener("click", () => {
        if (el.memoFullNovelText) el.memoFullNovelText.textContent = state.fullNovelText || "尚無文字記錄。";
        if (el.memorialNovelContainer) {
          el.memorialNovelContainer.style.display = "block";
          el.memorialNovelContainer.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
    if (el.closeMemoNovelBtn) {
      el.closeMemoNovelBtn.addEventListener("click", () => {
        if (el.memorialNovelContainer) el.memorialNovelContainer.style.display = "none";
      });
    }

    // 重生按鈕
    if (el.restartGameBtn) {
      el.restartGameBtn.addEventListener("click", () => {
        clearGameState();
        if (el.deadSec) el.deadSec.style.display = "none";
        if (el.introSec) el.introSec.style.display = "block";
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    // 風格設定顧問 AI 事件綁定
    let pendingTunedStyle = null;
    let tunerHistory = [];

    if (el.openStyleTunerBtn) {
      el.openStyleTunerBtn.addEventListener("click", () => {
        if (el.styleTunerModal) el.styleTunerModal.style.display = "flex";
      });
    }

    if (el.closeStyleTunerBtn) {
      el.closeStyleTunerBtn.addEventListener("click", () => {
        if (el.styleTunerModal) el.styleTunerModal.style.display = "none";
      });
    }

    if (el.styleTunerModal) {
      el.styleTunerModal.addEventListener("click", (e) => {
        if (e.target === el.styleTunerModal) el.styleTunerModal.style.display = "none";
      });
    }

    // 快速推薦風格按鈕
    document.querySelectorAll(".preset-pill-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const preset = btn.dataset.preset;
        if (el.styleTunerInput) {
          el.styleTunerInput.value = `我想採用${preset}的文字風格與描寫要求`;
          handleStyleTunerSend();
        }
      });
    });

    const appendTunerMessage = (role, text) => {
      if (!el.styleTunerChatBox) return;
      const msgDiv = document.createElement("div");
      msgDiv.className = `tuner-msg ${role === 'user' ? 'user-msg' : 'bot-msg'}`;
      msgDiv.innerHTML = `<div class="tuner-bubble">${escapeHtml(text)}</div>`;
      el.styleTunerChatBox.appendChild(msgDiv);
      el.styleTunerChatBox.scrollTop = el.styleTunerChatBox.scrollHeight;
    };

    const handleStyleTunerSend = async () => {
      if (!el.styleTunerInput) return;
      const inputVal = el.styleTunerInput.value.trim();
      if (!inputVal) return;

      appendTunerMessage("user", inputVal);
      el.styleTunerInput.value = "";
      tunerHistory.push({ role: "user", content: inputVal });

      const thinkingDiv = document.createElement("div");
      thinkingDiv.className = "tuner-msg bot-msg";
      thinkingDiv.innerHTML = `<div class="tuner-bubble"><i class="fas fa-spinner fa-spin"></i> 顧問正在研讀並調校筆觸世界觀...</div>`;
      el.styleTunerChatBox.appendChild(thinkingDiv);
      el.styleTunerChatBox.scrollTop = el.styleTunerChatBox.scrollHeight;

      try {
        const res = await window.AiService.tuneAuthorStyleWithAi(inputVal, tunerHistory.slice(-4));
        thinkingDiv.remove();
        if (res && res.replyText) {
          appendTunerMessage("bot", res.replyText);
          tunerHistory.push({ role: "assistant", content: res.replyText });
          if (res.styleConfig) {
            pendingTunedStyle = res.styleConfig;
            if (el.currentTunedStyleSummary) {
              el.currentTunedStyleSummary.textContent = `已調校風格：${res.styleConfig.name}`;
            }
          }
        }
      } catch (err) {
        thinkingDiv.remove();
        appendTunerMessage("bot", "風格調校完成！已為您匹配相應的野生文學規則。");
        pendingTunedStyle = { name: inputVal, directive: inputVal };
      }
    };

    if (el.styleTunerSendBtn) {
      el.styleTunerSendBtn.addEventListener("click", handleStyleTunerSend);
    }
    if (el.styleTunerInput) {
      el.styleTunerInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleStyleTunerSend();
        }
      });
    }

    if (el.applyTunedStyleBtn) {
      el.applyTunedStyleBtn.addEventListener("click", () => {
        if (!pendingTunedStyle) {
          alert("請先在對話中輸入您想調校的風格或點選快速推薦！");
          return;
        }
        state.selectedAuthor = pendingTunedStyle;
        updateAuthorHint(state.selectedAuthor);

        // 在作家切換列加上自訂按鈕
        el.authorGroup.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
        const customBtn = document.createElement("button");
        customBtn.type = "button";
        customBtn.className = "seg-btn active";
        customBtn.textContent = pendingTunedStyle.name;
        customBtn.addEventListener("click", () => {
          el.authorGroup.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
          customBtn.classList.add("active");
          state.selectedAuthor = pendingTunedStyle;
          updateAuthorHint(state.selectedAuthor);
          saveGameState();
        });
        el.authorGroup.appendChild(customBtn);

        if (el.styleTunerModal) el.styleTunerModal.style.display = "none";
        saveGameState();
      });
    }

    // 生命終暮結算彈窗按鈕
    if (el.stayReadDeathBtn) {
      el.stayReadDeathBtn.addEventListener("click", () => {
        if (el.deathSettlementModal) el.deathSettlementModal.style.display = "none";
        el.novelBookCard.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    if (el.confirmGoMemorialBtn) {
      el.confirmGoMemorialBtn.addEventListener("click", () => {
        if (el.deathSettlementModal) el.deathSettlementModal.style.display = "none";
        showMemorialHall();
      });
    }
    if (el.deathSettlementModal) {
      el.deathSettlementModal.addEventListener("click", (e) => {
        if (e.target === el.deathSettlementModal) el.deathSettlementModal.style.display = "none";
      });
    }

    // 主題與音效
    el.themeToggleBtn.addEventListener("click", toggleTheme);
    el.ambientSoundBtn.addEventListener("click", toggleAmbientSound);
  }

  function updateModeHint(mode) {
    if (!el.modeHintText) return;
    if (mode === "full") {
      el.modeHintText.textContent = "完整模式：直接把每小時每分鐘每秒鐘都一字不漏的描述出來，時間較長，深度沉浸。";
    } else if (mode === "compact") {
      el.modeHintText.textContent = "精簡模式：採用原版「八十億分之一」事件敘述，簡明扼要，只有重大事件才會跳出抉擇。";
    } else {
      el.modeHintText.textContent = "普通模式：採用小說適時省略，詳細描述重要段落，其他簡述帶過，節奏適中。";
    }
  }

  function updateAuthorHint(author) {
    if (!el.authorHintText) return;
    if (typeof author === "object" && author.name) {
      el.authorHintText.textContent = `目前風格：自訂作家「${author.name}」文學風格演繹。`;
    } else if (author === "shenshixi") {
      el.authorHintText.textContent = "目前風格：沈石溪（注重殘酷自然生存哲學、心理深度剖析與個體意志抉擇）。";
    } else {
      el.authorHintText.textContent = "目前風格：艾琳·杭特（細膩感官、野性本能、10+ 半馬賽克少年文學，個體具獨立思維）。";
    }
  }

  function updateExperienceHint(expMode) {
    if (!el.experienceHintText) return;
    if (expMode === "realism") {
      el.experienceHintText.textContent = "現實模式：遵循大自然客觀殘酷的生態生存法則，冷靜寫實記錄物種在荒野中的客觀掙扎與本能反應。";
    } else {
      el.experienceHintText.textContent = "故事模式：故意加深對角色與同伴的情感描摹，身歷其境，使每一次抉擇與離別產生強烈共鳴。";
    }
  }

  // 切換直排/橫排閱讀模式
  function toggleReadingMode() {
    state.isHorizontalReading = !state.isHorizontalReading;
    if (state.isHorizontalReading) {
      el.novelBookCard.classList.add("reading-mode-horizontal");
      el.readingModeIcon.className = "fas fa-bars-staggered";
      el.readingModeText.textContent = "切換直排";
    } else {
      el.novelBookCard.classList.remove("reading-mode-horizontal");
      el.readingModeIcon.className = "fas fa-table-columns";
      el.readingModeText.textContent = "切換橫排";
    }
    rePaginateBook(state.currentSpreadIndex);
    saveGameState();
  }

  // 1. 命運輪盤與出生登記 (修復：最後停駐物種與出生證 100% 保持一致)
  async function startRollingLife() {
    clearGameState();
    el.introSec.style.display = "none";
    el.deadSec.style.display = "none";
    el.lifeSec.style.display = "none";
    el.rollSec.style.display = "block";

    el.rollerBox.style.display = "block";
    el.certCard.style.display = "none";

    let candidates = window.SPECIES_DATABASE;
    if (state.selectedPool === "wild") {
      candidates = candidates.filter(s => !s.isHuman && s.category === "mammal");
    } else if (state.selectedPool === "marine") {
      candidates = candidates.filter(s => s.category === "marine" || s.category === "avian");
    } else if (state.selectedPool === "human") {
      candidates = candidates.filter(s => s.isHuman);
    }

    // 先決定最終選中的物種
    let chosenSpecies = null;
    if (state.selectedPool === "human") {
      chosenSpecies = candidates.find(s => s.isHuman);
    } else if (state.selectedPool === "all") {
      const rollVal = Math.random();
      if (rollVal < 0.005) {
        chosenSpecies = candidates.find(s => s.isHuman);
      } else {
        const nonHuman = candidates.filter(s => !s.isHuman);
        chosenSpecies = nonHuman[Math.floor(Math.random() * nonHuman.length)];
      }
    } else {
      chosenSpecies = candidates[Math.floor(Math.random() * candidates.length)];
    }

    // 啟動動畫滾動，且確保最後一次停駐文字必定為 chosenSpecies
    let rollTicks = 0;
    const maxRollTicks = 18;
    const rollInterval = setInterval(() => {
      rollTicks++;
      if (rollTicks < maxRollTicks) {
        const rand = candidates[Math.floor(Math.random() * candidates.length)];
        el.rollerDisplay.textContent = rand.name;
        el.rollerBiome.textContent = rand.scientificName;
      } else {
        // 關鍵修正：最後一刻停駐必定精確對齊 chosenSpecies！
        el.rollerDisplay.textContent = chosenSpecies.name;
        el.rollerBiome.textContent = chosenSpecies.scientificName;
      }
    }, 70);

    el.aiBar.style.display = "block";
    const pipelineConfig = {
      author: state.selectedAuthor,
      contentMode: state.contentMode,
      experienceMode: state.experienceMode,
      era: state.era,
      eraYear: state.eraYear,
      drawMode: state.drawMode,
      pace: state.lifePace,
      homeCountry: state.homeCountry,
      skipHeavy: state.skipHeavy
    };

    const lifeData = await window.AiService.generateLifePipeline(chosenSpecies, pipelineConfig, (pct, msg) => {
      el.aiFill.style.width = pct + "%";
      el.aiPct.textContent = pct + "%";
      el.aiStatus.textContent = msg;
    });

    clearInterval(rollInterval);
    // 確保畫面文字無誤
    el.rollerDisplay.textContent = chosenSpecies.name;
    el.rollerBiome.textContent = chosenSpecies.scientificName;

    setTimeout(() => {
      el.aiBar.style.display = "none";
      state.currentLife = lifeData;
      renderBirthCertificate(lifeData);
      saveGameState("roll");
    }, 450);
  }

  function renderBirthCertificate(life) {
    el.rollerBox.style.display = "none";
    el.certCard.style.display = "block";

    const s = life.species;

    // 名字處理：若未命名則為空白
    if (life.name && life.name.trim()) {
      el.certCharName.textContent = life.name;
    } else {
      el.certCharName.textContent = ""; // 依規定姓名格為空白！
    }

    // 多重稱呼標籤列表
    renderMultiNameTags(el.certMultiNames, life.names);

    // 性別徽章
    if (el.certGenderBadge) {
      const g = life.gender || "雄性";
      el.certGenderBadge.textContent = g;
      el.certGenderBadge.className = "cert-gender-badge";
      if (g === "雌性") el.certGenderBadge.classList.add("female");
      else if (g === "雌雄同體") el.certGenderBadge.classList.add("hermaphrodite");
    }

    // 樣貌特徵描寫
    if (el.certAppearanceText) {
      el.certAppearanceText.textContent = life.appearance || "體態勻稱，毛色健康自然，帶著野外獨有的生命張力。";
    }

    // 外表科普與易混淆物種辨識指南
    if (el.certBioScienceBox) {
      const lg = s.lookalikeGuide;
      if (lg) {
        el.certBioScienceBox.style.display = "block";
        if (el.certBioLookalike) {
          el.certBioLookalike.innerHTML = `<span><i class="fas fa-arrows-split-up-and-left"></i> 容易搞混物種：</span><span class="cert-bio-lookalike-badge">${escapeHtml(lg.confusedWith)}</span>`;
        }
        if (el.certBioScienceText) {
          el.certBioScienceText.textContent = lg.differences;
        }
      } else {
        el.certBioScienceBox.style.display = "none";
      }
    }

    document.querySelector(".cert-species-cn").textContent = s.name;
    document.querySelector(".cert-species-sci").textContent = `(${s.scientificName})`;
    if (el.certExpBadge) {
      if (state.experienceMode === "realism") {
        el.certExpBadge.className = "cert-exp-badge realism-tag";
        el.certExpBadge.innerHTML = '<i class="fas fa-mountain-sun"></i> 客觀生態';
      } else {
        el.certExpBadge.className = "cert-exp-badge";
        el.certExpBadge.innerHTML = '<i class="fas fa-heart"></i> 故事體驗';
      }
    }
    document.getElementById("certSerialNo").textContent = `NO. 10T-${Math.floor(10000 + Math.random() * 90000)}`;

    const iconEl = document.getElementById("certAvatarIcon");
    if (s.isHuman) iconEl.className = "fas fa-person";
    else if (s.category === "marine") iconEl.className = "fas fa-fish";
    else if (s.category === "avian") iconEl.className = "fas fa-crow";
    else if (s.category === "insect") iconEl.className = "fas fa-bug";
    else iconEl.className = "fas fa-paw";

    const grid = document.getElementById("certFieldsGrid");
    grid.innerHTML = "";

    if (s.isHuman) {
      const c = life.countryData;
      grid.innerHTML = `
        <div class="cert-field-item">
          <span class="cf-title">出生國家 / 區域</span>
          <span class="cf-val">${c.name}</span>
        </div>
        <div class="cert-field-item">
          <span class="cf-title">法定貨幣與月薪中位數</span>
          <span class="cf-val">${c.currencySymbol} (約 NT$ ${c.localEquivMonthly.toLocaleString()})</span>
        </div>
        <div class="cert-field-item">
          <span class="cf-title">人均 GDP (PPP)</span>
          <span class="cf-val">$${c.gdpPppUsd.toLocaleString()} 美元</span>
        </div>
        <div class="cert-field-item">
          <span class="cf-title">嬰兒死亡率 / 預期壽命</span>
          <span class="cf-val">${(c.infantMortality * 100).toFixed(2)}% / ${c.avgLifespan} 歲</span>
        </div>
        <div class="cert-field-item" style="grid-column: span 2;">
          <span class="cf-title">社會環境概述</span>
          <span class="cf-val" style="font-weight:normal; font-size:12.5px;">${c.description}</span>
        </div>
      `;
    } else {
      grid.innerHTML = `
        <div class="cert-field-item">
          <span class="cf-title">誕生原生棲地</span>
          <span class="cf-val">${life.biome.name}</span>
        </div>
        <div class="cert-field-item">
          <span class="cf-title">幼體第一年存活率</span>
          <span class="cf-val">${(s.infantSurvivalRate * 100).toFixed(1)}% (自然篩選)</span>
        </div>
        <div class="cert-field-item">
          <span class="cf-title">野外平均壽命</span>
          <span class="cf-val">約 ${s.avgAgeWild} ${s.unit}</span>
        </div>
        <div class="cert-field-item">
          <span class="cf-title">社會群體結構</span>
          <span class="cf-val">${s.socialType.split("（")[0]}</span>
        </div>
        <div class="cert-field-item" style="grid-column: span 2;">
          <span class="cf-title">主要生存考驗與天敵威脅</span>
          <span class="cf-val" style="font-weight:normal; font-size:12.5px;">${s.threats.join(" • ")}</span>
        </div>
      `;
    }

    document.getElementById("certPrologueText").textContent = life.prologueNovel;

    // 1in8b 出生證明世界地圖繪製
    renderCertMap(life);
    // 1in8b 母國比較卡片
    renderCertHome(life);
  }

  // --------------------------------------------------------------------------
  // 世界地圖 Canvas 繪製器 (點陣極簡投影 + 出生地與母國連線 + 全球生滅脈搏)
  // --------------------------------------------------------------------------
  const WORLD_LAND_POINTS = [
    { lat: 35, lng: 105 }, { lat: 38, lng: 116 }, { lat: 31, lng: 121 }, { lat: 24, lng: 121 },
    { lat: 22, lng: 114 }, { lat: 36, lng: 128 }, { lat: 36, lng: 138 }, { lat: 43, lng: 142 },
    { lat: 14, lng: 100 }, { lat: 10, lng: 106 }, { lat: 1, lng: 104 }, { lat: -6, lng: 106 },
    { lat: 13, lng: 122 }, { lat: 21, lng: 105 },
    { lat: 28, lng: 77 }, { lat: 19, lng: 73 }, { lat: 13, lng: 80 }, { lat: 23, lng: 90 },
    { lat: 33, lng: 73 }, { lat: 41, lng: 69 }, { lat: 32, lng: 53 }, { lat: 35, lng: 51 },
    { lat: 51, lng: 0 }, { lat: 48, lng: 2 }, { lat: 52, lng: 13 }, { lat: 41, lng: 12 },
    { lat: 40, lng: -3 }, { lat: 55, lng: 37 }, { lat: 59, lng: 18 }, { lat: 60, lng: 25 },
    { lat: 52, lng: 21 }, { lat: 44, lng: 26 }, { lat: 38, lng: 23 },
    { lat: 30, lng: 31 }, { lat: 9, lng: 7 }, { lat: 6, lng: 3 }, { lat: -1, lng: 36 },
    { lat: -26, lng: 28 }, { lat: -33, lng: 18 }, { lat: 14, lng: -17 }, { lat: 33, lng: -7 },
    { lat: 4, lng: 9 }, { lat: -4, lng: 15 }, { lat: -18, lng: 47 },
    { lat: 40, lng: -74 }, { lat: 34, lng: -118 }, { lat: 41, lng: -87 }, { lat: 29, lng: -95 },
    { lat: 45, lng: -75 }, { lat: 49, lng: -123 }, { lat: 64, lng: -147 }, { lat: 19, lng: -99 },
    { lat: 4, lng: -74 }, { lat: -12, lng: -77 }, { lat: -23, lng: -46 }, { lat: -34, lng: -58 },
    { lat: -33, lng: -70 }, { lat: -15, lng: -47 }, { lat: -3, lng: -60 },
    { lat: -33, lng: 151 }, { lat: -37, lng: 144 }, { lat: -31, lng: 115 }, { lat: -41, lng: 174 },
    { lat: -9, lng: 147 }
  ];

  function drawWorldMap(canvas, targetCoord, homeCoord) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const parent = canvas.parentElement || canvas;
    const w = parent.clientWidth || 360;
    const h = parent.clientHeight || 180;
    canvas.width = w;
    canvas.height = h;

    // 背景底色 (深太空藍黑)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "#13171F");
    bgGrad.addColorStop(1, "#1A1E29");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    const toCanvasX = (lng) => Math.round(((lng + 180) / 360) * w);
    const toCanvasY = (lat) => Math.round(((90 - lat) / 180) * h);

    // 經緯格線
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = toCanvasY(lat);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let lng = -150; lng <= 150; lng += 50) {
      const x = toCanvasX(lng);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // 世界陸地基準點陣
    ctx.fillStyle = "rgba(226, 221, 213, 0.35)";
    WORLD_LAND_POINTS.forEach(pt => {
      const px = toCanvasX(pt.lng);
      const py = toCanvasY(pt.lat);
      ctx.beginPath();
      ctx.arc(px, py, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // 全球前 12 大概率微光點
    const oddsPoints = [];
    if (window.GLOBAL_ODDS_DATA) {
      if (Array.isArray(window.GLOBAL_ODDS_DATA)) {
        oddsPoints.push(...window.GLOBAL_ODDS_DATA);
      } else {
        if (Array.isArray(window.GLOBAL_ODDS_DATA.humanOdds)) oddsPoints.push(...window.GLOBAL_ODDS_DATA.humanOdds);
        if (Array.isArray(window.GLOBAL_ODDS_DATA.animalOdds)) oddsPoints.push(...window.GLOBAL_ODDS_DATA.animalOdds);
      }
    }
    oddsPoints.forEach(od => {
      if (od && typeof od.lng === 'number' && typeof od.lat === 'number') {
        const ox = toCanvasX(od.lng);
        const oy = toCanvasY(od.lat);
        ctx.fillStyle = "rgba(140, 29, 60, 0.45)";
        ctx.beginPath();
        ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 若有母國座標：青綠色標記
    if (homeCoord && typeof homeCoord.lat === 'number' && typeof homeCoord.lng === 'number') {
      const hx = toCanvasX(homeCoord.lng);
      const hy = toCanvasY(homeCoord.lat);

      ctx.beginPath();
      ctx.arc(hx, hy, 7, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(hx, hy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#10B981";
      ctx.fill();

      ctx.font = "10px sans-serif";
      ctx.fillStyle = "#34D399";
      ctx.fillText(homeCoord.name || "母國", hx + 8, hy + 3);
    }

    // 若有降生地座標：金色光環標記與連線
    if (targetCoord && typeof targetCoord.lat === 'number' && typeof targetCoord.lng === 'number') {
      const tx = toCanvasX(targetCoord.lng);
      const ty = toCanvasY(targetCoord.lat);

      if (homeCoord && typeof homeCoord.lat === 'number') {
        const hx = toCanvasX(homeCoord.lng);
        const hy = toCanvasY(homeCoord.lat);
        const midX = (tx + hx) / 2;
        const midY = Math.min(ty, hy) - 20;

        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.quadraticCurveTo(midX, midY, tx, ty);
        ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      ctx.arc(tx, ty, 9, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(tx, ty, 5, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(tx, ty, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#F59E0B";
      ctx.fill();

      ctx.font = "bold 10px sans-serif";
      ctx.fillStyle = "#FBBF24";
      ctx.fillText(targetCoord.name || "降生地", tx + 8, ty - 4);
    }
  }

  function renderCertMap(life) {
    if (!el.certMap) return;
    const targetCoord = {
      lat: life.countryData ? life.countryData.lat : (life.biome.lat || 30),
      lng: life.countryData ? life.countryData.lng : (life.biome.lng || 110),
      name: life.countryData ? life.countryData.name : life.biome.name
    };

    const hc = (window.HOME_COUNTRIES_LIST || []).find(c => c.id === state.homeCountry) || {
      lat: 23.6978, lng: 120.9605, name: "台灣"
    };

    drawWorldMap(el.certMap, targetCoord, { lat: hc.lat, lng: hc.lng, name: hc.name });
  }

  function renderCertHome(life) {
    if (!el.certHome) return;
    const cmp = life.homeComparison;
    if (!cmp) {
      el.certHome.style.display = "none";
      return;
    }
    el.certHome.style.display = "block";
    const deltaSign = cmp.lifespanDelta >= 0 ? `+${cmp.lifespanDelta}` : `${cmp.lifespanDelta}`;
    const badgeClass = cmp.lifespanDelta >= 0 ? "cmp-badge-better" : "cmp-badge-worse";

    el.certHome.innerHTML = `
      <div class="home-cmp-title">
        <i class="fas fa-scale-balanced"></i>
        <span>與你的母國（${escapeHtml(cmp.homeCountry.name)}）命運對照</span>
      </div>
      <table class="cmp-table">
        <thead>
          <tr>
            <th>指標維度</th>
            <th>降生環境</th>
            <th>母國水準</th>
            <th>命運差額</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>預期壽命</strong></td>
            <td>${cmp.birthEnvironment.lifespan} 歲</td>
            <td>${cmp.homeCountry.lifespan} 歲</td>
            <td><span class="cmp-badge ${badgeClass}">${deltaSign} 歲</span></td>
          </tr>
          <tr>
            <td><strong>幼年夭折風險</strong></td>
            <td>${cmp.birthEnvironment.infantMortality}</td>
            <td>${cmp.homeCountry.infantMortality}</td>
            <td><span class="cmp-badge ${cmp.birthEnvironment.infantMortality > cmp.homeCountry.infantMortality ? 'cmp-badge-worse' : 'cmp-badge-better'}">${cmp.infantRiskRatio}x 倍率</span></td>
          </tr>
          <tr>
            <td><strong>物質/領地資源</strong></td>
            <td>${cmp.birthEnvironment.gdpOrResource}</td>
            <td>${cmp.homeCountry.gdpOrResource}</td>
            <td><span class="cmp-badge cmp-badge-neutral">${cmp.wealthRatio}</span></td>
          </tr>
          <tr>
            <td><strong>生存環境評估</strong></td>
            <td colspan="3" style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5; padding-top: 6px;">
              ${escapeHtml(cmp.summary)}
            </td>
          </tr>
        </tbody>
      </table>
    `;
  }

  function renderMultiNameTags(container, names) {
    if (!container) return;
    container.innerHTML = "";
    if (!names || names.length === 0) {
      container.style.display = "none";
      return;
    }
    container.style.display = "flex";
    names.forEach(n => {
      const tag = document.createElement("span");
      tag.className = "name-badge";
      tag.innerHTML = `<i class="fas fa-tag"></i> <strong>${escapeHtml(n.source)}：</strong>${escapeHtml(n.name)} <small>(${escapeHtml(n.time || '')})</small>`;
      container.appendChild(tag);
    });
  }

  // 2. 進入主遊戲儀表板
  async function enterLifeDashboard() {
    el.rollSec.style.display = "none";
    el.lifeSec.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 重設狀態，時鐘維持暫停
    state.currentAge = 0;
    state.currentSeasonIdx = 0;
    state.isPaused = true;
    state.isGameOver = false;
    state.choicesMadeCount = 0;
    state.recentChoices = [];
    state.bookPages = [];
    state.currentSpreadIndex = 0;
    state.fullNovelText = "";
    state.feedEvents = [];
    state.isDeathNoticed = false;
    state.currentActiveChapter = null;
    state.prefetchedChapters = {};
    state.isPrefetching = false;
    el.novelDeathNotice.style.display = "none";
    el.choiceContainer.style.display = "none";

    // 啟動載入遮罩
    showNovelLoading("AI 正在構思開篇生靈小說...", "正在編織最初的感官與野性本能。生成完成前生命時鐘保持暫停中，請稍候...");

    generateCohortCompanions();
    renderFocusChips();
    renderLifeGrid();
    renderSurvivalChart();
    updateDashboardUI();

    // 載入第一章 (篇名嚴格為「第一章」)
    const firstChapter = state.currentLife.storyTimeline[0];
    if (firstChapter) {
      state.currentChapterTitle = "第一章";
      el.novelChapterTitle.textContent = "第一章";
      state.fullNovelText = `【第一章】\n${firstChapter.narrative}`;
      rePaginateBook();
    }

    await delay(600);
    hideNovelLoading();

    pushEventToFeed({
      ageLabel: `0 ${state.currentLife.species.unit}・初誕`,
      type: "milestone",
      text: state.currentLife.species.isHuman
        ? `在${state.currentLife.countryData.name}平安降生，邁出探索文明世界的第一步。`
        : `在${state.currentLife.biome.name}微光中降生，感受初次呼吸與心跳。`
    });

    saveGameState("lifeview");
    setPauseState(false);
    startSimulationLoop();

    // 核心優化：生命開始之初，立即在背景提前構思第二章，拒絕翻頁等待！
    prefetchUpcomingMilestone(2);
  }

  // 雙頁紙本小說分頁系統 (貓戰士平裝本開本規格，首行縮排兩字，兩頁接續對開)
  function rePaginateBook(targetSpread = null) {
    const rawText = state.fullNovelText || "";
    if (!rawText.trim()) {
      state.bookPages = [
        { chapterTitle: "第一章", paragraphs: [{ text: "（尚無篇章紀錄）", isContinuation: false }] },
        { chapterTitle: "第一章", paragraphs: [] }
      ];
      renderBookSpread();
      return;
    }

    // 解析所有章節區塊
    // 格式如：【第一章】\n正文...\n\n【第二章】\n正文...
    const rawChapters = [];
    const blocks = rawText.split(/(?=【第[零一二三四五六七八九十百]+章】)/);

    blocks.forEach(block => {
      const trimmed = block.trim();
      if (!trimmed) return;
      const match = trimmed.match(/^【(第[零一二三四五六七八九十百]+章)】\s*([\s\S]*)$/);
      if (match) {
        rawChapters.push({
          title: match[1],
          body: match[2].trim()
        });
      } else {
        rawChapters.push({
          title: state.currentChapterTitle || "第一章",
          body: trimmed
        });
      }
    });

    const pages = [];

    // 對每個章節進行「雙頁接續排版」
    rawChapters.forEach(chap => {
      const chapPages = splitChapterIntoBalancedPages(chap.title, chap.body);
      chapPages.forEach(p => pages.push(p));
    });

    // 確保總頁數為偶數，符合雙頁對開規格
    if (pages.length % 2 !== 0) {
      const lastPage = pages[pages.length - 1];
      pages.push({
        chapterTitle: lastPage ? lastPage.chapterTitle : "第一章",
        paragraphs: []
      });
    }

    state.bookPages = pages.length > 0 ? pages : [
      { chapterTitle: "第一章", paragraphs: [{ text: "（尚無篇章紀錄）", isContinuation: false }] },
      { chapterTitle: "第一章", paragraphs: [] }
    ];

    if (targetSpread !== null) {
      state.currentSpreadIndex = Math.floor(Math.min(targetSpread, Math.max(0, state.bookPages.length - 1)) / 2) * 2;
    } else {
      const last = Math.max(0, state.bookPages.length - 1);
      state.currentSpreadIndex = Math.floor(last / 2) * 2;
    }

    renderBookSpread();
  }

  // 將單一章節拆分成接續的雙頁面（貓戰士規格：右頁先讀、左頁接續，雙頁內容連貫不中斷）
  function splitChapterIntoBalancedPages(chapterTitle, narrative) {
    const rawParas = window.DestinyEngine && window.DestinyEngine.splitIntoNaturalParagraphs
      ? window.DestinyEngine.splitIntoNaturalParagraphs(narrative)
      : narrative.split(/\n+/).map(p => p.trim()).filter(Boolean);

    // 過濾可能混入的章節標題標籤
    const paras = rawParas.filter(p => !/^【第[零一二三四五六七八九十百]+章】$/.test(p.trim()));

    if (paras.length === 0) {
      return [
        { chapterTitle, isChapterStart: true, paragraphs: [{ text: "...", isContinuation: false }] },
        { chapterTitle, isChapterStart: false, paragraphs: [] }
      ];
    }

    let pages = [];

    // 單頁容量字數預算：約 140~190 字元
    if (paras.length === 1) {
      const text = paras[0];
      if (text.length <= 160) {
        // 短單段：於中間標點符號處切分，前半右頁、後半左頁接續
        const half = Math.floor(text.length / 2);
        let splitIdx = -1;
        let minDiff = 999;
        const puncts = ['。', '！', '？', '；', '，'];
        puncts.forEach(p => {
          let idx = text.indexOf(p);
          while (idx !== -1) {
            let diff = Math.abs(idx - half);
            if (diff < minDiff && idx >= 25 && idx <= text.length - 25) {
              minDiff = diff;
              splitIdx = idx + 1;
            }
            idx = text.indexOf(p, idx + 1);
          }
        });
        if (splitIdx === -1) splitIdx = half;
        pages = [
          {
            chapterTitle,
            paragraphs: [{ text: text.slice(0, splitIdx).trim(), isContinuation: false }]
          },
          {
            chapterTitle,
            paragraphs: [{ text: text.slice(splitIdx).trim(), isContinuation: true }]
          }
        ];
      } else {
        const splitIdx = findBestSentenceSplit(text, 150);
        pages = [
          {
            chapterTitle,
            paragraphs: [{ text: text.slice(0, splitIdx).trim(), isContinuation: false }]
          },
          {
            chapterTitle,
            paragraphs: [{ text: text.slice(splitIdx).trim(), isContinuation: true }]
          }
        ];
      }
    } else if (paras.length === 2) {
      pages = [
        {
          chapterTitle,
          paragraphs: [{ text: paras[0], isContinuation: false }]
        },
        {
          chapterTitle,
          paragraphs: [{ text: paras[1], isContinuation: false }]
        }
      ];
    } else if (paras.length === 3) {
      const len01 = paras[0].length + paras[1].length;
      if (len01 <= 180) {
        pages = [
          {
            chapterTitle,
            paragraphs: [
              { text: paras[0], isContinuation: false },
              { text: paras[1], isContinuation: false }
            ]
          },
          {
            chapterTitle,
            paragraphs: [{ text: paras[2], isContinuation: false }]
          }
        ];
      } else {
        pages = [
          {
            chapterTitle,
            paragraphs: [{ text: paras[0], isContinuation: false }]
          },
          {
            chapterTitle,
            paragraphs: [
              { text: paras[1], isContinuation: false },
              { text: paras[2], isContinuation: false }
            ]
          }
        ];
      }
    } else {
      let curParas = [];
      let curLen = 0;

      paras.forEach(p => {
        if (curLen + p.length > 180 && curParas.length > 0) {
          pages.push({ chapterTitle, paragraphs: curParas });
          curParas = [{ text: p, isContinuation: false }];
          curLen = p.length;
        } else {
          curParas.push({ text: p, isContinuation: false });
          curLen += p.length;
        }
      });

      if (curParas.length > 0) {
        pages.push({ chapterTitle, paragraphs: curParas });
      }
    }

    if (pages.length % 2 !== 0) {
      pages.push({ chapterTitle, paragraphs: [] });
    }

    // 標記該章節開篇第一頁，以便渲染大章節標題
    if (pages.length > 0) {
      pages[0].isChapterStart = true;
    }

    return pages;
  }

  function findBestSentenceSplit(text, targetLen) {
    const puncts = ['。', '！', '？', '；'];
    let best = -1;
    let minDiff = 999;
    puncts.forEach(p => {
      let idx = text.indexOf(p);
      while (idx !== -1) {
        let diff = Math.abs(idx - targetLen);
        if (diff < minDiff && idx >= 40 && idx <= text.length - 40) {
          minDiff = diff;
          best = idx + 1;
        }
        idx = text.indexOf(p, idx + 1);
      }
    });
    return best !== -1 ? best : Math.min(targetLen, text.length);
  }

  // 渲染雙頁面 (紙本書版心規格：右頁在右、左頁在左，兩頁始終同時呈現且內容接續)
  function renderBookSpread() {
    const total = state.bookPages.length;
    const rIdx = state.currentSpreadIndex;
    const lIdx = state.currentSpreadIndex + 1;

    const rPage = state.bookPages[rIdx] || { chapterTitle: "第一章", paragraphs: [], isChapterStart: false };
    const lPage = (lIdx < total) ? state.bookPages[lIdx] : { chapterTitle: rPage.chapterTitle, paragraphs: [], isChapterStart: false };

    // 渲染右頁 (文字直排，右頁優先；若為章節開篇首頁則先渲染大章節名)
    let rHtml = "";
    if (rPage.isChapterStart) {
      rHtml += `<div class="chapter-opening-title">${escapeHtml(rPage.chapterTitle)}</div>`;
    }
    rHtml += rPage.paragraphs.map(p =>
      p.text.trim() ? `<p class="novel-para ${p.isContinuation ? 'para-continuation' : ''}">${escapeHtml(p.text)}</p>` : ""
    ).join("");
    el.pageContentRight.innerHTML = rHtml;

    // 渲染左頁 (接續右頁內容)
    let lHtml = "";
    if (lPage.isChapterStart) {
      lHtml += `<div class="chapter-opening-title">${escapeHtml(lPage.chapterTitle)}</div>`;
    }
    lHtml += lPage.paragraphs.map(p =>
      p.text.trim() ? `<p class="novel-para ${p.isContinuation ? 'para-continuation' : ''}">${escapeHtml(p.text)}</p>` : ""
    ).join("");
    el.pageContentLeft.innerHTML = lHtml;

    // 阿拉伯數字頁碼 (1, 2, 3...)
    el.pageNumRight.textContent = rIdx < total ? String(rIdx + 1) : "";
    el.pageNumLeft.textContent = (lIdx < total && (lPage.paragraphs.length > 0 || lPage.isChapterStart)) ? String(lIdx + 1) : "";

    // 書眉章節更新：固定在右頁右上角、左頁左上角
    if (el.headerChapterRight) el.headerChapterRight.textContent = rPage.chapterTitle || "第一章";
    if (el.headerChapterLeft) el.headerChapterLeft.textContent = lPage.chapterTitle || rPage.chapterTitle || "第一章";
    el.novelChapterTitle.textContent = rPage.chapterTitle || "第一章";

    // 頁碼導航指示器 (阿拉伯數字)
    const curRightNum = rIdx + 1;
    const curLeftNum = Math.min(lIdx + 1, total);
    el.bookPageIndicator.textContent = `第 ${curRightNum}–${curLeftNum} 頁 / 全書共 ${total} 頁`;

    el.prevPageBtn.disabled = (rIdx <= 0);
    el.nextPageBtn.disabled = (rIdx + 2 >= total);
  }

  function turnPagePrev() {
    if (state.currentSpreadIndex > 0) {
      state.currentSpreadIndex = Math.max(0, state.currentSpreadIndex - 2);
      renderBookSpread();
      saveGameState();
    }
  }

  function turnPageNext() {
    if (state.currentSpreadIndex + 2 < state.bookPages.length) {
      state.currentSpreadIndex = state.currentSpreadIndex + 2;
      renderBookSpread();
      saveGameState();
      if (state.currentSpreadIndex + 2 >= state.bookPages.length && !state.isGameOver) {
        prefetchUpcomingMilestone();
      }
    }
  }

  // 提前生成機制 (Pre-generation)：在玩家閱讀當前頁面時，已在背景提前準備好下一章，拒絕翻頁等待！
  async function prefetchUpcomingMilestone(targetChapterIdx = null) {
    if (state.isPrefetching || state.isGameOver || state.isDeathNoticed) return;
    if (!state.currentLife || !state.currentLife.storyTimeline) return;

    const timeline = state.currentLife.storyTimeline;
    const nextIdx = targetChapterIdx || (state.choicesMadeCount + 2);
    if (state.prefetchedChapters[nextIdx]) return; // 已預先生成好

    const milestoneChapter = timeline[nextIdx - 1];
    if (!milestoneChapter) return;

    state.isPrefetching = true;
    try {
      const playerContext = {
        activeFocus: state.activeFocus,
        recentChoices: state.recentChoices,
        companionsAliveCount: state.companions.filter(c => c.isAlive).length,
        season: state.currentSeasonIdx
      };

      const aiChapter = await window.AiService.generateMilestoneChapter(
        state.currentLife.species,
        state.currentLife.name,
        milestoneChapter.age || (state.currentAge + 2),
        state.currentLife.initialStats,
        state.currentLife.biome,
        state.currentLife.countryData,
        nextIdx,
        playerContext,
        state.selectedAuthor,
        state.contentMode,
        state.experienceMode
      );

      if (aiChapter) {
        state.prefetchedChapters[nextIdx] = aiChapter;
        console.log(`[提前生成] 第 ${nextIdx} 章已在背景構思完畢，翻頁即讀！`);
      }
    } catch (err) {
      console.warn("提前生成章節備援：", err);
    } finally {
      state.isPrefetching = false;
    }
  }

  function showNovelLoading(title, desc) {
    if (el.novelLoadingTitle) el.novelLoadingTitle.textContent = title;
    if (el.novelLoadingDesc) el.novelLoadingDesc.textContent = desc;
    if (el.novelLoadingBanner) el.novelLoadingBanner.style.display = "block";
    if (el.novelLoadingOverlay) el.novelLoadingOverlay.style.display = "flex";
  }

  function hideNovelLoading() {
    if (el.novelLoadingBanner) el.novelLoadingBanner.style.display = "none";
    if (el.novelLoadingOverlay) el.novelLoadingOverlay.style.display = "none";
  }

  // 產生 4 位同秒降生夥伴
  function generateCohortCompanions() {
    const list = [];
    const pool = window.SPECIES_DATABASE;
    const pickCount = 4;

    for (let i = 0; i < pickCount; i++) {
      const sp = pool[Math.floor(Math.random() * pool.length)];
      const b = sp.biomes[Math.floor(Math.random() * sp.biomes.length)];
      const loc = sp.isHuman ? sp.countries[Math.floor(Math.random() * sp.countries.length)].name : b.name;
      list.push({
        id: "comp_" + i,
        name: sp.namingPool[Math.floor(Math.random() * sp.namingPool.length)],
        speciesName: sp.name,
        location: loc,
        maxAge: Math.max(1, Math.floor(sp.avgAgeWild * (0.6 + Math.random() * 0.8))),
        isAlive: true
      });
    }

    state.companions = list;
    renderCompanions();
  }

  function renderCompanions() {
    el.companionsList.innerHTML = "";
    state.companions.forEach(c => {
      const li = document.createElement("li");
      li.className = "comp-item";
      li.innerHTML = `
        <span class="comp-name">
          <i class="fas fa-circle" style="font-size:7px; color:${c.isAlive ? '#16A34A' : '#9E9891'}"></i>
          ${escapeHtml(c.speciesName)} · ${escapeHtml(c.name)}
        </span>
        <span class="comp-status ${c.isAlive ? 'comp-alive' : 'comp-dead'}">
          ${c.isAlive ? `${state.currentAge} 歲 (存活)` : `已故 (${escapeHtml(c.location)})`}
        </span>
      `;
      el.companionsList.appendChild(li);
    });
  }

  // 當前生活重心 (全以 FontAwesome 圖示呈現，絕無表情符號)
  function renderFocusChips() {
    const isHuman = state.currentLife.species.isHuman;
    const chips = isHuman
      ? [
          { id: "study", icon: "fa-graduation-cap", label: "學業進修" },
          { id: "work", icon: "fa-briefcase", label: "職場打拼" },
          { id: "family", icon: "fa-house", label: "家庭陪伴" },
          { id: "health", icon: "fa-person-running", label: "運動保健" },
          { id: "leisure", icon: "fa-mug-saucer", label: "放鬆休閒" }
        ]
      : [
          { id: "hunt", icon: "fa-paw", label: "狩獵覓食" },
          { id: "patrol", icon: "fa-tree", label: "巡守領界" },
          { id: "skills", icon: "fa-bolt", label: "磨練野性" },
          { id: "pack", icon: "fa-users", label: "族群羈絆" },
          { id: "rest", icon: "fa-bed", label: "休養避寒" }
        ];

    el.focusChipsContainer.innerHTML = "";
    chips.forEach(c => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `chip ${state.activeFocus === c.id ? "active" : ""}`;
      btn.innerHTML = `<i class="fas ${c.icon}"></i> ${c.label}`;
      btn.addEventListener("click", () => {
        document.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.activeFocus = c.id;
        saveGameState();
      });
      el.focusChipsContainer.appendChild(btn);
    });
  }

  function renderLifeGrid() {
    const maxAge = state.currentLife.species.maxAge;
    el.lifeGridContainer.innerHTML = "";
    for (let i = 0; i < 100; i++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.id = `gridCell_${i}`;
      if (i > maxAge) cell.style.opacity = "0.2";
      el.lifeGridContainer.appendChild(cell);
    }
  }

  function updateLifeGrid() {
    const current = state.currentAge;
    for (let i = 0; i <= 100; i++) {
      const cell = document.getElementById(`gridCell_${i}`);
      if (!cell) continue;
      cell.className = "grid-cell";
      if (i < current) cell.classList.add("past");
      else if (i === current) cell.classList.add("current");
    }
  }

  function renderSurvivalChart() {
    const s = state.currentLife.species;
    const curve = s.survivalCurve;
    const w = 300, h = 130;
    const stepX = w / (curve.length - 1);

    let d = `M 0 ${h - (curve[0] / 100) * (h - 20) - 10}`;
    for (let i = 1; i < curve.length; i++) {
      const x = i * stepX;
      const y = h - (curve[i] / 100) * (h - 20) - 10;
      d += ` L ${x} ${y}`;
    }
    el.svgCurvePath.setAttribute("d", d);
  }

  function updateSurvivalChartMarker() {
    const s = state.currentLife.species;
    const maxAge = s.maxAge;
    const ratio = Math.min(1, state.currentAge / maxAge);
    const x = ratio * 300;
    const curve = s.survivalCurve;
    const idx = Math.min(curve.length - 1, Math.floor(ratio * (curve.length - 1)));
    const yVal = curve[idx] || 5;
    const y = 130 - (yVal / 100) * 110 - 10;

    el.svgAgeMarker.setAttribute("cx", x);
    el.svgAgeMarker.setAttribute("cy", y);
    el.chartCaption.textContent = `同儕群體存活率：約 ${yVal}%`;
  }

  // 3. 主循環模擬引擎 (依內容敘事模式動態配置節奏)
  function getPaceInterval() {
    let base = 4000; // 普通模式 (約 4 秒/季)
    if (state.contentMode === "full") base = 7500;   // 完整模式 (約 7.5 秒/季，字多慢讀)
    if (state.contentMode === "compact") base = 1600; // 精簡模式 (約 1.6 秒/季)
    return Math.max(600, Math.round(base / state.speedMultiplier));
  }

  function startSimulationLoop() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = setInterval(() => {
      if (state.isPaused || state.isGameOver) return;
      advanceLifeOneStep();
    }, getPaceInterval());
  }

  function restartSimulationTimer() {
    if (!state.isPaused && !state.isGameOver) {
      startSimulationLoop();
    }
  }

  function setPauseState(paused) {
    state.isPaused = paused;
    if (paused) {
      el.pauseBtn.classList.remove("active");
      el.pauseIcon.className = "fas fa-play";
      const span = el.pauseBtn.querySelector("span");
      if (span) span.textContent = "繼續";
    } else {
      el.pauseBtn.classList.add("active");
      el.pauseIcon.className = "fas fa-pause";
      const span = el.pauseBtn.querySelector("span");
      if (span) span.textContent = "暫停";
    }
  }

  function togglePause() {
    setPauseState(!state.isPaused);
    if (!state.isPaused) {
      restartSimulationTimer();
    }
  }

  // 推進生命一季
  async function advanceLifeOneStep() {
    if (state.isGameOver) return;
    const seasons = ["春之甦醒", "盛夏繁茂", "清秋收成", "凜冬考驗"];
    state.currentSeasonIdx = (state.currentSeasonIdx + 1) % 4;

    if (state.currentSeasonIdx === 0) {
      state.currentAge++;

      // 1in8b 里程碑沉思停頓 (Ages 5, 15, 30, 50, 70)
      if (checkMilestoneReflection()) {
        return;
      }

      // 1in8b 家庭成員生命週期更新
      updateFamilyLifeCycle();
    }

    const life = state.currentLife;
    const maxAge = life.maxPossibleAge;

    // 檢查生命終暮：達到最大年齡或健康耗盡，立即觸發終局
    if (state.currentAge >= maxAge || life.initialStats.health <= 0) {
      await triggerDeathProcess();
      return;
    }

    // 更新同儕存活狀態
    state.companions.forEach(c => {
      if (c.isAlive && state.currentAge >= c.maxAge) {
        c.isAlive = false;
      }
    });
    renderCompanions();

    // 檢查是否有即時 AI 篇章推進
    await checkStoryProgression();

    injectFeedEventsForCurrentAge();
    updateDashboardUI();
    saveGameState();
  }

  // 檢查是否觸發新章節或抉擇 (篇名一律為第N章)
  async function checkStoryProgression() {
    if (state.isGameOver) return;
    const life = state.currentLife;
    const timeline = life.storyTimeline;

    const chapter = timeline.find(ch => ch.age === state.currentAge && state.currentSeasonIdx === 0);

    if (chapter && chapter.age > 0) {
      const chapterIdx = state.choicesMadeCount + 2;
      const chapterTitleFixed = window.DestinyEngine.formatChapterTitle(chapterIdx);

      // 檢查是否已提前預先生成好
      let activeChap = state.prefetchedChapters[chapterIdx];

      if (!activeChap) {
        setPauseState(true);
        showNovelLoading("正在展開新篇章...", "正在編織自然生靈的全新轉折...");

        const playerContext = {
          activeFocus: state.activeFocus,
          recentChoices: state.recentChoices,
          companionsAliveCount: state.companions.filter(c => c.isAlive).length,
          season: state.currentSeasonIdx
        };

        try {
          activeChap = await window.AiService.generateMilestoneChapter(
            life.species,
            life.name,
            state.currentAge,
            life.initialStats,
            life.biome,
            life.countryData,
            chapterIdx,
            playerContext,
            state.selectedAuthor,
            state.contentMode,
            state.experienceMode
          );
        } catch (err) {
          console.warn("AI 章節生成備援", err);
        }
        hideNovelLoading();
      }

      if (!activeChap) activeChap = chapter;
      state.currentActiveChapter = activeChap;
      state.currentChapterTitle = chapterTitleFixed;
      el.novelChapterTitle.textContent = chapterTitleFixed;

      // 附加篇章文字至書本小說
      state.fullNovelText += `\n\n【${chapterTitleFixed}】\n${activeChap.narrative}`;
      rePaginateBook();

      // 核心機制：立刻在背景提前構思下一章，保證讀者下一頁毫無停頓
      prefetchUpcomingMilestone(chapterIdx + 1);

      // 檢查是否包含抉擇或自主輸入
      const hasChoices = Array.isArray(activeChap.choices) && activeChap.choices.length > 0;
      const allowCustom = activeChap.allowCustom !== false;

      if (hasChoices || allowCustom) {
        pauseGameForChoice(activeChap);
      } else {
        if (!state.readingProtection) {
          setTimeout(() => {
            if (!state.isGameOver) {
              setPauseState(false);
              startSimulationLoop();
            }
          }, 3500);
        }
      }
    }
  }

  // 抉擇暫停面板 (支援預設選項與「其他」自主行動自由輸入)
  function pauseGameForChoice(chapter) {
    setPauseState(true);

    // 填充突發情境敘述，讓玩家明確知道發生了什麼危機事件
    let incidentText = (chapter && chapter.dilemma) ? chapter.dilemma.trim() : "";
    if (!incidentText && chapter && chapter.narrative) {
      const paras = chapter.narrative.split(/\n+/).map(p => p.trim()).filter(Boolean);
      incidentText = paras[paras.length - 1] || "";
    }
    if (!incidentText) {
      incidentText = "你在命運的荒野中面臨生死去向的重大時刻，情勢緊迫，你的每一步都將決定未來的生存軌跡。";
    }

    if (el.choiceIncidentText) {
      el.choiceIncidentText.textContent = incidentText;
    }
    if (el.choiceChapterBadge) {
      el.choiceChapterBadge.textContent = state.currentChapterTitle || (chapter && chapter.title) || "當前危機";
    }

    el.choiceContainer.style.display = "block";
    el.choiceButtonsGrid.innerHTML = "";

    if (chapter.choices && chapter.choices.length > 0) {
      chapter.choices.forEach(ch => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "choice-btn";
        btn.innerHTML = `
          <span class="choice-btn-title">${escapeHtml(ch.text)}</span>
          <span class="choice-btn-impact"><i class="fas fa-sparkles"></i> 影響：${escapeHtml(ch.impact || '命運轉折')}</span>
        `;
        btn.addEventListener("click", async () => {
          await executeChoice(chapter, ch);
        });
        el.choiceButtonsGrid.appendChild(btn);
      });
    }

    // 「其他」自主行動格 (AI 決定或預設開放)
    if (el.customChoiceWrap) {
      const allowCustom = chapter.allowCustom !== false;
      el.customChoiceWrap.style.display = allowCustom ? "block" : "none";
      if (el.customChoiceInput) {
        el.customChoiceInput.value = "";
        el.customChoiceInput.placeholder = chapter.customPromptHint || "輸入你想採取的自主行動策略...";
      }
    }

    // 輕柔滾動至可視區域，確保上方小說與下方抉擇卡片皆完整可見，不遮擋小說
    el.choiceContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // 1in8b 自動抉擇模式支援 (若使用者開啟 autoDecision，延遲 1.2 秒自動順應本能抉擇)
    if (state.autoDecision) {
      setTimeout(async () => {
        if (state.isGameOver || el.choiceContainer.style.display === "none") return;
        if (chapter.choices && chapter.choices.length > 0) {
          await executeChoice(chapter, chapter.choices[0]);
        } else {
          await executeChoice(chapter, { text: "順應野性直覺行動", impact: "自動生存應對" });
        }
      }, 1200);
    }

    saveGameState();
  }

  // 處理自訂輸入提交
  async function handleCustomChoiceSubmit() {
    if (!el.customChoiceInput) return;
    const customText = el.customChoiceInput.value.trim();
    if (!customText) return;

    const chapter = state.currentActiveChapter || { title: state.currentChapterTitle };
    const customChoiceObj = {
      text: customText,
      impact: "自主抉擇",
      isCustom: true
    };

    await executeChoice(chapter, customChoiceObj);
  }

  // 執行玩家抉擇
  async function executeChoice(chapter, choice) {
    state.choicesMadeCount++;
    state.recentChoices.push(choice.text);
    el.choiceContainer.style.display = "none";

    showNovelLoading("AI 正在根據你的自主抉擇推演後續...", "正在根據你的行動計算生存反饋與心理震撼...");

    if (choice.statChange) {
      applyStatDeltas(choice.statChange);
    } else if (choice.isCustom) {
      // 自訂行動給予野性直覺與經驗回饋
      applyStatDeltas({ instinct: +8, energy: -6 });
    }

    const playerContext = {
      activeFocus: state.activeFocus,
      stats: state.currentLife.initialStats
    };

    const followupText = await window.AiService.generateChoiceFollowup(
      state.currentLife.species,
      state.currentLife.name,
      choice.text,
      chapter,
      playerContext,
      state.selectedAuthor,
      state.experienceMode
    );

    state.fullNovelText += `\n\n【抉擇：${choice.text}】\n${followupText}`;
    rePaginateBook();

    hideNovelLoading();

    pushEventToFeed({
      ageLabel: `${state.currentAge} ${state.currentLife.species.unit}・抉擇`,
      type: "milestone",
      text: `作出自主行動抉擇：「${choice.text}」。${choice.impact || ''}`
    });

    saveGameState();

    if (!state.readingProtection) {
      setTimeout(() => {
        if (!state.isGameOver) {
          setPauseState(false);
          startSimulationLoop();
        }
      }, 2500);
    }
  }

  function applyStatDeltas(deltas) {
    if (!deltas) return;
    const stats = state.currentLife.initialStats;

    if (deltas.health) stats.health = Math.min(100, Math.max(0, stats.health + deltas.health));
    if (deltas.energy) stats.energy = Math.min(100, Math.max(0, stats.energy + deltas.energy));
    if (deltas.instinct) stats.instinct = Math.min(100, Math.max(0, stats.instinct + deltas.instinct));
    if (deltas.social) stats.social = Math.min(100, Math.max(0, stats.social + deltas.social));
    if (deltas.resource) stats.resource = Math.max(0, stats.resource + deltas.resource);

    updateDashboardUI();
  }

  function injectFeedEventsForCurrentAge() {
    const events = state.currentLife.events;
    const matching = events.filter(e => e.age === state.currentAge && state.currentSeasonIdx === 0);
    matching.forEach(evt => pushEventToFeed(evt));
  }

  function pushEventToFeed(evt) {
    state.feedEvents.unshift(evt);
    if (state.feedEvents.length > 60) state.feedEvents.pop();
    renderFeedEvents();
  }

  function renderFeedEvents() {
    if (!el.eventFeedList) return;
    el.eventFeedList.innerHTML = "";

    const eventsToRender = state.feedEvents.map((evt, idx) => ({ evt, idx })).filter(item => {
      if (!state.feedStarredOnly) return true;
      return state.starredFeedIndices.includes(item.idx);
    });

    eventsToRender.forEach(({ evt, idx }) => {
      const isStarred = state.starredFeedIndices.includes(idx);
      const li = document.createElement("li");
      li.className = `feed-item ${evt.type === 'milestone' || evt.isConsolidated ? 'milestone' : ''}`;
      const typeHtml = evt.isConsolidated
        ? '<i class="fas fa-star" style="color:#eab308;"></i> 階段沉澱'
        : (evt.type === 'milestone' ? '<i class="fas fa-bolt" style="color:#ef4444;"></i> 命運轉折' : '<i class="fas fa-leaf" style="color:#22c55e;"></i> 生態紀錄');

      li.innerHTML = `
        <div class="feed-meta">
          <span class="feed-age">${escapeHtml(evt.ageLabel)}</span>
          <span class="feed-type">${typeHtml}</span>
          <button type="button" class="feed-star-btn ${isStarred ? 'starred' : ''}" title="收藏此事件">
            <i class="${isStarred ? 'fas' : 'far'} fa-star"></i>
          </button>
        </div>
        <div class="feed-text">${escapeHtml(evt.text)}</div>
      `;

      const starBtn = li.querySelector(".feed-star-btn");
      if (starBtn) {
        starBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const starPos = state.starredFeedIndices.indexOf(idx);
          if (starPos === -1) {
            state.starredFeedIndices.push(idx);
          } else {
            state.starredFeedIndices.splice(starPos, 1);
          }
          renderFeedEvents();
          saveGameState();
        });
      }

      el.eventFeedList.appendChild(li);
    });
  }

  function updateDashboardUI() {
    const life = state.currentLife;
    if (!life) return;

    const s = life.species;
    const stats = life.initialStats;
    const maxAge = s.maxAge;

    el.topAgeDisplay.innerHTML = `${state.currentAge} <small id="topAgeUnit">${s.unit}</small>`;
    const seasons = ["春之甦醒", "盛夏繁茂", "清秋收成", "凜冬考驗"];
    el.topSeasonBadge.textContent = seasons[state.currentSeasonIdx];

    const progressPct = Math.min(100, (state.currentAge / maxAge) * 100);
    el.topTimelineFill.style.width = progressPct + "%";

    // 名字與多重稱呼處理：未命名時名字為空白！
    if (life.name && life.name.trim()) {
      el.dashName.textContent = life.name;
    } else {
      el.dashName.textContent = ""; // 空白
    }
    renderMultiNameTags(el.dashMultiNames, life.names);

    el.dashSpecies.textContent = s.name;
    if (el.dashGenderBadge) {
      const g = life.gender || "雄性";
      el.dashGenderBadge.textContent = g;
      el.dashGenderBadge.className = "id-gender-tag";
      if (g === "雌性") el.dashGenderBadge.classList.add("female");
      else if (g === "雌雄同體") el.dashGenderBadge.classList.add("hermaphrodite");
    }
    if (el.dashAppearanceText) {
      el.dashAppearanceText.textContent = life.appearance || "體態勻稱，毛色健康自然。";
    }
    if (el.dashBioScienceText) {
      const lg = s.lookalikeGuide;
      if (lg) {
        if (el.dashBioScienceRow) el.dashBioScienceRow.style.display = "flex";
        el.dashBioScienceText.innerHTML = `<span style="color:var(--accent-burgundy); font-weight:700;"><i class="fas fa-arrows-split-up-and-left"></i> 易混淆: ${escapeHtml(lg.confusedWith)}</span><br><span style="white-space:pre-line; color:var(--text-secondary);">${escapeHtml(lg.differences)}</span>`;
      } else if (el.dashBioScienceRow) {
        el.dashBioScienceRow.style.display = "none";
      }
    }
    if (el.dashExpBadge) {
      if (state.experienceMode === "realism") {
        el.dashExpBadge.className = "id-exp-tag realism-tag";
        el.dashExpBadge.innerHTML = '<i class="fas fa-mountain-sun"></i> 客觀生態';
      } else {
        el.dashExpBadge.className = "id-exp-tag";
        el.dashExpBadge.innerHTML = '<i class="fas fa-heart"></i> 故事沉浸';
      }
    }
    const currentStage = window.DestinyEngine.getStageForAge(s, state.currentAge);
    el.dashRank.textContent = currentStage ? currentStage.name : "荒野行者";
    el.dashBiome.textContent = s.isHuman ? life.countryData.name : life.biome.name;

    if (s.isHuman) {
      el.dashHumanEcoRow.style.display = "flex";
      el.dashCurrency.textContent = `${life.countryData.currency} ($${life.countryData.gdpPppUsd.toLocaleString()})`;
      el.dashSocialType.textContent = "現代家庭與職場社群";
      el.labelInstinct.textContent = "知識與思維";
      el.labelEnergy.textContent = "身心精力";
      el.labelSocial.textContent = "社會人際關係";
      el.labelResource.textContent = "個人儲蓄資產：";
      el.valResource.textContent = `${life.countryData.currencySymbol} ${stats.resource.toLocaleString()}`;
    } else {
      el.dashHumanEcoRow.style.display = "none";
      el.dashSocialType.textContent = s.socialType.split("（")[0];
      el.labelInstinct.textContent = "野性直覺";
      el.labelEnergy.textContent = "飽足精力";
      el.labelSocial.textContent = "族群羈絆";
      el.labelResource.textContent = "領地掌控度：";
      el.valResource.textContent = `${Math.min(100, stats.instinct)}%`;
    }

    el.valHealth.textContent = `${stats.health}/100`;
    el.barHealth.style.width = stats.health + "%";
    el.valEnergy.textContent = `${stats.energy}/100`;
    el.barEnergy.style.width = stats.energy + "%";
    el.valInstinct.textContent = `${stats.instinct}/100`;
    el.barInstinct.style.width = Math.min(100, stats.instinct) + "%";
    el.valSocial.textContent = `${stats.social}/100`;
    el.barSocial.style.width = stats.social + "%";

    updateLifeGrid();
    updateSurvivalChartMarker();

    // 1in8b 家庭面版與母國卡片更新
    renderFamilyUI();
    renderDashHomeCard();

    el.ecoDataContent.innerHTML = `
      <div class="eco-row">
        <span class="eco-k">IUCN 紅皮書評級：</span>
        <span class="eco-v">${s.iucnStatus.split(" (")[0]}</span>
      </div>
      <div class="eco-row">
        <span class="eco-k">全球現存總量：</span>
        <span class="eco-v">${s.wildPopulation}</span>
      </div>
      <div class="eco-row">
        <span class="eco-k">感官特化重點：</span>
        <span class="eco-v" style="font-size:11px;">${escapeHtml(s.sensoryTraits.slice(0, 18))}...</span>
      </div>
    `;
  }

  function fastForwardToNextChoice() {
    if (state.isGameOver) return;
    state.speedMultiplier = 4;
    document.querySelectorAll(".sp-btn").forEach(b => b.classList.remove("active"));
    const sp4 = document.querySelector('.sp-btn[data-sp="4"]');
    if (sp4) sp4.classList.add("active");
    setPauseState(false);
    startSimulationLoop();
  }

  // 4. 完整死亡小說流程 (篇名嚴格為第N章)
  async function triggerDeathProcess() {
    if (state.isGameOver && state.isDeathNoticed) return; // 避免重複觸發
    state.isGameOver = true;
    state.isDeathNoticed = true;
    setPauseState(true);
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
    saveGameState(); // 立即將終暮長眠狀態寫入硬碟儲存，刷新頁面絕不重新生成！

    const life = state.currentLife;
    const s = life.species;

    showNovelLoading("生命旅程已至終暮，AI 正在編織長眠篇章...", "正在詳細描摹面對終局與歸宿的過程...");

    let deathPack = null;
    try {
      deathPack = await window.AiService.generateDeathChapter(
        s,
        life.name,
        state.currentAge,
        life.deathCause,
        life.biome,
        life.countryData,
        {
          choicesCount: state.choicesMadeCount,
          recentChoices: state.recentChoices,
          gender: life.gender,
          appearance: life.appearance
        },
        state.selectedAuthor,
        state.experienceMode
      );
    } catch (e) {
      console.warn("死亡章節生成異常：", e);
    }

    const finalIdx = state.choicesMadeCount + 2;
    const chapterTitleFixed = window.DestinyEngine.formatChapterTitle(finalIdx);

    if (!deathPack) {
      deathPack = {
        chapterTitle: chapterTitleFixed,
        deathNarrative: s.isHuman
          ? `在${state.currentAge}歲這一年，因${life.deathCause}，病房的窗櫺外是夕陽溫暖的光芒。監護儀的波動漸漸舒緩，親人的手掌傳來熟悉的溫度。回顧這一生走過的坎坷與選擇，心跳漸漸放慢，如同一葉扁舟平穩駛入了無風的港灣，歸於久違的安息。`
          : `刺骨的寒意侵入四肢，劇烈的喘息在冷空氣中化作白霧。視線中的古木與山稜逐漸模糊化為柔和的微光，骨骼間的劇痛奇蹟般地平復，取而代之的是如春日溪流般的寧靜。你緩緩伏下身軀，任由最後一口吐息融入狂風，靈魂奔向了群星與先祖的遼闊獵場。`,
        eulogy: s.isHuman
          ? `生命在文明的浪潮中劃下了休止符。你在這片大地上留下的足跡、親情與愛意，已經真實地溫暖過這個世界。安息吧，歸於星河。`
          : `風吹過荒原，帶走了最後一道足跡。你以無畏的野性與忠誠活過這僅有一次的荒野旅程。在星族的永恆獵場中，繼續自由奔跑吧。`
      };
    }

    state.eulogy = deathPack.eulogy;
    state.currentChapterTitle = chapterTitleFixed;
    el.novelChapterTitle.textContent = chapterTitleFixed;

    state.fullNovelText += `\n\n【${chapterTitleFixed}】\n${deathPack.deathNarrative}`;
    rePaginateBook();

    hideNovelLoading();

    state.isDeathNoticed = true;
    el.novelDeathNotice.style.display = "flex";

    // 彈出內建的生命終暮結算彈窗！
    if (el.deathSettlementModal) {
      if (el.settleCauseText) el.settleCauseText.textContent = life.deathCause || "壽終正寢";
      if (el.settlePercentileText) el.settlePercentileText.textContent = `${life.survivalPercentile}% 的同族生靈`;
      if (el.settleChaptersText) el.settleChaptersText.textContent = `${finalIdx} 章 (含 ${state.choicesMadeCount} 次關鍵抉擇)`;
      el.deathSettlementModal.style.display = "flex";
    }

    saveGameState();
  }

  // 前往荒野追思館結算
  function showMemorialHall() {
    el.lifeSec.style.display = "none";
    el.deadSec.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });

    const life = state.currentLife;
    const s = life.species;

    let titlePrefix = "荒野的行者";
    if (s.isHuman) titlePrefix = "文明的追尋者";
    else if (state.currentAge > s.avgAgeWild * 1.2) titlePrefix = "古老傳奇守護者";
    else if (state.choicesMadeCount >= 3) titlePrefix = "不屈的先鋒戰士";

    const charTitle = life.name ? `${titlePrefix} · ${life.name}` : `${titlePrefix} (這片土地上的生靈)`;
    document.getElementById("memoCharTitle").textContent = charTitle;
    document.getElementById("memoLifespan").textContent = `享年 ${state.currentAge} ${s.unit} (${s.isHuman ? life.countryData.name : life.biome.name})`;
    document.getElementById("memoDeathCause").textContent = life.deathCause;
    document.getElementById("memoPercentile").textContent = `${life.survivalPercentile}% 的同族生靈`;
    document.getElementById("memoChoicesCount").textContent = `${state.choicesMadeCount} 次關鍵抉擇`;
    const expModeEl = document.getElementById("memoExpMode");
    if (expModeEl) {
      expModeEl.textContent = state.experienceMode === "realism" ? "現實模式 (客觀生態)" : "故事模式 (深層情感)";
    }
    document.getElementById("memoEulogyText").textContent = state.eulogy;

    // 1in8b 荒野追思館典藏更新 (存入書架、點燭渲染、留言牆渲染)
    saveLifeToPastShelf(life, state.currentAge, state.choicesMadeCount, state.eulogy, state.fullNovelText);
    renderCandleCount();
    renderMemorialWall();
    renderPastShelf();

    saveGameState("dead");
  }

  // --------------------------------------------------------------------------
  // 1in8b 里程碑沉思停頓 (Ages 5, 15, 30, 50, 70)
  // --------------------------------------------------------------------------
  const MILESTONE_REFLECTION_AGES = [5, 15, 30, 50, 70];
  let lastReflectedAge = -1;

  function checkMilestoneReflection() {
    if (!state.pauseOnReflection || state.isGameOver) return false;
    const curAge = state.currentAge;
    if (MILESTONE_REFLECTION_AGES.includes(curAge) && lastReflectedAge !== curAge) {
      lastReflectedAge = curAge;
      const isHuman = state.currentLife && state.currentLife.species && state.currentLife.species.isHuman;
      const qGroup = (window.REFLECTION_QUESTIONS && (isHuman ? window.REFLECTION_QUESTIONS.human : window.REFLECTION_QUESTIONS.wild)) || {};
      const qObj = qGroup[curAge] || {
        title: "命運的迴響與沉思",
        desc: "走到這個年歲，回望走過的小徑與荒野，你心中最深刻的感悟是什麼？"
      };

      setPauseState(true);
      if (el.reflectAgeTag) el.reflectAgeTag.textContent = `${curAge} ${state.currentLife.species.unit}・生命轉折反思`;
      if (el.reflectQuestionText) el.reflectQuestionText.textContent = qObj.desc;
      if (el.reflectAnswerInput) el.reflectAnswerInput.value = "";

      if (el.questionPauseModal) el.questionPauseModal.style.display = "flex";
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // 1in8b 家庭成員生命週期與面板 (Family & Life Panel)
  // --------------------------------------------------------------------------
  function updateFamilyLifeCycle() {
    if (!state.currentLife || !state.currentLife.familyMembers) return;
    const members = state.currentLife.familyMembers;
    const curAge = state.currentAge;

    members.forEach(m => {
      if (m.isAlive) {
        m.age++;
        if (m.relation.includes("母") || m.relation.includes("父")) {
          if (curAge >= Math.floor(state.currentLife.species.avgAgeWild * 0.75) && Math.random() < 0.2) {
            m.isAlive = false;
            pushEventToFeed({
              ageLabel: `${curAge} ${state.currentLife.species.unit}・家庭變故`,
              type: "milestone",
              text: `至親的【${m.relation} ${m.name}】在時光的流逝中長眠，野地的風撫平了祂留下的痕跡。`
            });
          }
        }
      }
    });
    renderFamilyUI();
  }

  function renderFamilyUI() {
    if (!el.famList || !state.currentLife) return;
    const members = state.currentLife.familyMembers || [];
    el.famList.innerHTML = "";
    if (members.length === 0) {
      el.famList.innerHTML = `<li style="font-size:12px; color:var(--text-muted); padding:6px 0;">荒野獨行者，孤身迎向大自然的考驗。</li>`;
      return;
    }

    members.forEach(m => {
      const li = document.createElement("li");
      li.className = "fam-member-item";
      li.innerHTML = `
        <div class="fam-member-left">
          <span class="fam-relation-tag">${escapeHtml(m.relation)}</span>
          <span class="fam-member-name ${!m.isAlive ? 'fam-member-dead' : ''}">${escapeHtml(m.name)}</span>
        </div>
        <div class="fam-member-status">
          ${m.isAlive ? `${m.age} 歲 · 羈絆 ${m.bond}%` : '<span style="color:#ef4444;"><i class="fas fa-cross"></i> 已故</span>'}
        </div>
      `;
      el.famList.appendChild(li);
    });
  }

  function renderDashHomeCard() {
    if (!el.dashHomeCard || !state.currentLife) return;
    const cmp = state.currentLife.homeComparison;
    if (!cmp) {
      el.dashHomeCard.style.display = "none";
      return;
    }
    el.dashHomeCard.style.display = "block";
    const deltaSign = cmp.lifespanDelta >= 0 ? `+${cmp.lifespanDelta}` : `${cmp.lifespanDelta}`;

    el.dashHomeCard.innerHTML = `
      <div style="font-size:11.5px; font-weight:700; color:var(--accent-gold); margin-bottom:6px; display:flex; align-items:center; gap:5px;">
        <i class="fas fa-earth-americas"></i> 母國命運參照 (${escapeHtml(cmp.homeCountry.name)})
      </div>
      <div style="font-size:12px; color:var(--text-secondary); line-height:1.5;">
        預期壽命差：<strong style="color:var(--accent-burgundy);">${deltaSign} 歲</strong><br>
        幼體存活率：<strong>${cmp.infantRiskRatio}x</strong> 差異
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 1in8b 花費與投資面板 (Shop & Spend)
  // --------------------------------------------------------------------------
  function openShopModal() {
    if (!el.shopModal || !state.currentLife) return;
    const isHuman = state.currentLife.species.isHuman;
    const stats = state.currentLife.initialStats;

    if (el.shopBalanceLabel) {
      el.shopBalanceLabel.textContent = isHuman
        ? `當前可用資源：${state.currentLife.countryData.currencySymbol} ${stats.resource.toLocaleString()}`
        : `當前領地掌控度：${Math.min(100, stats.instinct)}%`;
    }

    document.querySelectorAll(".shop-buy-btn").forEach(btn => {
      btn.onclick = () => {
        const type = btn.dataset.type;
        handleShopPurchase(type);
      };
    });

    el.shopModal.style.display = "flex";
  }

  function handleShopPurchase(type) {
    if (!state.currentLife) return;
    const isHuman = state.currentLife.species.isHuman;
    const stats = state.currentLife.initialStats;

    const costs = isHuman
      ? { health: 12000, study: 18000, family: 25000, invest: 30000 }
      : { health: 15, study: 20, family: 25, invest: 30 };

    const cost = costs[type] || 10000;
    const canAfford = isHuman ? (stats.resource >= cost) : (stats.instinct >= cost);

    if (!canAfford) {
      alert("當前可用資源或領地掌控度不足！");
      return;
    }

    if (isHuman) stats.resource -= cost;
    else stats.instinct = Math.max(0, stats.instinct - cost);

    if (type === "health") {
      applyStatDeltas({ health: +15, energy: +10 });
      pushEventToFeed({ ageLabel: `${state.currentAge} ${state.currentLife.species.unit}・體魄調理`, type: "milestone", text: "進行了深度健康調養與醫療檢查，體質大幅改善。" });
    } else if (type === "study") {
      applyStatDeltas({ instinct: +16, energy: -5 });
      pushEventToFeed({ ageLabel: `${state.currentAge} ${state.currentLife.species.unit}・技能精進`, type: "milestone", text: "研習深造並磨礪關鍵直覺，開拓了生存思維。" });
    } else if (type === "family") {
      applyStatDeltas({ social: +18, health: +5 });
      pushEventToFeed({ ageLabel: `${state.currentAge} ${state.currentLife.species.unit}・家庭照料`, type: "milestone", text: "投入資源呵護家人並加固巢居，族群羈絆更加堅韌。" });
    } else if (type === "invest") {
      applyStatDeltas({ energy: +25 });
      pushEventToFeed({ ageLabel: `${state.currentAge} ${state.currentLife.species.unit}・長期儲備`, type: "milestone", text: "配置儲蓄資產與防禦性物資儲備，生活安全感顯著提升。" });
    }

    if (el.shopBalanceLabel) {
      el.shopBalanceLabel.textContent = isHuman
        ? `當前可用資源：${state.currentLife.countryData.currencySymbol} ${stats.resource.toLocaleString()}`
        : `當前領地掌控度：${Math.min(100, stats.instinct)}%`;
    }
  }

  // --------------------------------------------------------------------------
  // 1in8b 荒野追思館：點燭、留言、書架、轉移代碼、分享卡
  // --------------------------------------------------------------------------
  const CANDLE_KEY = "10t_candle_count";
  const MEMO_POSTS_KEY = "10t_memorial_posts";
  const PAST_SHELF_KEY = "10t_past_shelf";

  function handleLightCandle() {
    let count = parseInt(localStorage.getItem(CANDLE_KEY) || "128", 10);
    count++;
    localStorage.setItem(CANDLE_KEY, count);
    state.candleCount = count;
    renderCandleCount();

    if (el.candleSection) {
      const flame = el.candleSection.querySelector(".candle-flame");
      if (flame) {
        flame.style.animation = "none";
        void flame.offsetWidth;
        flame.style.animation = "candleFlicker 0.4s 4 ease-in-out alternate";
      }
    }
  }

  function renderCandleCount() {
    const count = parseInt(localStorage.getItem(CANDLE_KEY) || "128", 10);
    if (el.candleCount) {
      el.candleCount.textContent = count.toLocaleString();
    }
  }

  function handlePostMemorialMessage() {
    if (!el.memoMsgInput) return;
    const msg = el.memoMsgInput.value.trim();
    if (!msg) return;

    let posts = [];
    try {
      posts = JSON.parse(localStorage.getItem(MEMO_POSTS_KEY) || "[]");
    } catch (e) { posts = []; }

    const newPost = {
      id: "post_" + Date.now(),
      text: msg,
      speciesName: state.currentLife ? state.currentLife.species.name : "未知生靈",
      charName: (state.currentLife && state.currentLife.name) ? state.currentLife.name : "無名行者",
      time: new Date().toLocaleDateString("zh-TW")
    };

    posts.unshift(newPost);
    if (posts.length > 40) posts.pop();
    localStorage.setItem(MEMO_POSTS_KEY, JSON.stringify(posts));

    el.memoMsgInput.value = "";
    renderMemorialWall();
  }

  function renderMemorialWall() {
    if (!el.memoWall) return;
    let posts = [];
    try {
      posts = JSON.parse(localStorage.getItem(MEMO_POSTS_KEY) || "[]");
    } catch (e) { posts = []; }

    if (posts.length === 0) {
      posts = [
        { text: "生如野火熾熱，歸如晨露無聲。願你在星辰的獵場自由馳騁。", charName: "荒原旅伴", speciesName: "野生生靈", time: "2026/10/29" },
        { text: "謝謝你陪大自然度過這段壯闊的旅途，靈魂長眠於古木與微風之中。", charName: "行路者", speciesName: "荒野行者", time: "2026/10/29" }
      ];
    }

    el.memoWall.innerHTML = "";
    posts.forEach(p => {
      const card = document.createElement("div");
      card.className = "memo-post-card";
      card.innerHTML = `
        <div style="color:var(--text-primary);">${escapeHtml(p.text)}</div>
        <div class="memo-post-meta">
          <span>致：${escapeHtml(p.charName)} (${escapeHtml(p.speciesName)})</span>
          <span>${escapeHtml(p.time)}</span>
        </div>
      `;
      el.memoWall.appendChild(card);
    });
  }

  function saveLifeToPastShelf(life, age, choicesCount, eulogy, novelText) {
    if (!life) return;
    let shelf = [];
    try {
      shelf = JSON.parse(localStorage.getItem(PAST_SHELF_KEY) || "[]");
    } catch (e) { shelf = []; }

    const entry = {
      id: "shelf_" + Date.now(),
      speciesName: life.species.name,
      charName: life.name || "荒野無名生靈",
      age: age,
      unit: life.species.unit,
      deathCause: life.deathCause || "壽終正寢",
      choicesCount: choicesCount,
      eulogy: eulogy,
      fullNovelText: novelText,
      era: state.era,
      experienceMode: state.experienceMode,
      date: new Date().toLocaleDateString("zh-TW")
    };

    if (!shelf.find(s => s.id === entry.id)) {
      shelf.unshift(entry);
      if (shelf.length > 50) shelf.pop();
      localStorage.setItem(PAST_SHELF_KEY, JSON.stringify(shelf));
    }

    renderPastShelf();
  }

  function renderPastShelf() {
    if (!el.pastShelfList) return;
    let shelf = [];
    try {
      shelf = JSON.parse(localStorage.getItem(PAST_SHELF_KEY) || "[]");
    } catch (e) { shelf = []; }

    el.pastShelfList.innerHTML = "";
    if (shelf.length === 0) {
      el.pastShelfList.innerHTML = `<div style="grid-column:span 3; color:var(--text-muted); font-size:13px; text-align:center; padding:20px;">荒野書架尚無過往生靈的傳奇，當前生命結束後將在此被永恆典藏。</div>`;
      return;
    }

    shelf.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "past-shelf-card";
      card.innerHTML = `
        <div>
          <h4 class="shelf-card-title">${escapeHtml(item.charName)} (${escapeHtml(item.speciesName)})</h4>
          <p class="shelf-card-desc">
            享年 ${item.age} ${item.unit} · 因${escapeHtml(item.deathCause)}長眠<br>
            歷經 ${item.choicesCount} 次命運抉擇
          </p>
        </div>
        <div class="shelf-card-footer">
          <span class="shelf-card-date">${escapeHtml(item.date)}</span>
          <button type="button" class="shelf-replay-btn" data-index="${index}">
            <i class="fas fa-book-open"></i> 再讀一次小說
          </button>
        </div>
      `;

      const replayBtn = card.querySelector(".shelf-replay-btn");
      if (replayBtn) {
        replayBtn.addEventListener("click", () => {
          el.memoFullNovelText.textContent = item.fullNovelText || "尚無詳細文字檔案。";
          el.memorialNovelContainer.style.display = "block";
          el.memorialNovelContainer.scrollIntoView({ behavior: "smooth" });
        });
      }

      el.pastShelfList.appendChild(card);
    });
  }

  function handleShowRandomMemorialLife() {
    let shelf = [];
    try {
      shelf = JSON.parse(localStorage.getItem(PAST_SHELF_KEY) || "[]");
    } catch (e) { shelf = []; }

    if (shelf.length > 0) {
      const randLife = shelf[Math.floor(Math.random() * shelf.length)];
      el.memoFullNovelText.textContent = randLife.fullNovelText || "尚無詳細文字檔案。";
      el.memorialNovelContainer.style.display = "block";
      el.memorialNovelContainer.scrollIntoView({ behavior: "smooth" });
    } else {
      alert("目前書架尚無其他過往生靈紀錄，請先完成一次人生旅程！");
    }
  }

  function openMyMemorialLivesModal() {
    if (!el.myMemorialModal || !el.myMemorialListContainer) return;
    let shelf = [];
    try {
      shelf = JSON.parse(localStorage.getItem(PAST_SHELF_KEY) || "[]");
    } catch (e) { shelf = []; }

    el.myMemorialListContainer.innerHTML = "";
    if (shelf.length === 0) {
      el.myMemorialListContainer.innerHTML = `<li style="padding:12px; color:var(--text-muted); font-size:12.5px;">此裝置尚未建立任何生靈紀念碑。</li>`;
    } else {
      shelf.forEach(item => {
        const li = document.createElement("li");
        li.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:10px 12px; border-bottom:1px solid var(--border-light); font-size:12.5px;";
        li.innerHTML = `
          <div>
            <strong>${escapeHtml(item.charName)}</strong> (${escapeHtml(item.speciesName)})
            <div style="font-size:11px; color:var(--text-muted);">享年 ${item.age} ${item.unit} · ${escapeHtml(item.deathCause)}</div>
          </div>
          <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">${escapeHtml(item.date)}</span>
        `;
        el.myMemorialListContainer.appendChild(li);
      });
    }

    el.myMemorialModal.style.display = "flex";
  }

  function openTransferRecordsModal() {
    if (!el.moveModal) return;
    let exportObj = {
      pastShelf: JSON.parse(localStorage.getItem(PAST_SHELF_KEY) || "[]"),
      candleCount: parseInt(localStorage.getItem(CANDLE_KEY) || "128", 10),
      memoPosts: JSON.parse(localStorage.getItem(MEMO_POSTS_KEY) || "[]"),
      exportedAt: Date.now()
    };

    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(exportObj))));
    if (el.exportCodeArea) el.exportCodeArea.value = b64;
    if (el.importCodeArea) el.importCodeArea.value = "";
    el.moveModal.style.display = "flex";
  }

  function copyExportTransferCode() {
    if (!el.exportCodeArea) return;
    el.exportCodeArea.select();
    navigator.clipboard.writeText(el.exportCodeArea.value).then(() => {
      alert("轉移代碼已複製到剪貼簿！可在其他裝置貼上並還原。");
    });
  }

  function applyImportTransferCode() {
    if (!el.importCodeArea) return;
    const raw = el.importCodeArea.value.trim();
    if (!raw) {
      alert("請先貼入有效的轉移代碼！");
      return;
    }
    try {
      const decoded = decodeURIComponent(escape(atob(raw)));
      const obj = JSON.parse(decoded);
      if (obj.pastShelf && Array.isArray(obj.pastShelf)) {
        let curShelf = JSON.parse(localStorage.getItem(PAST_SHELF_KEY) || "[]");
        obj.pastShelf.forEach(item => {
          if (!curShelf.find(c => c.id === item.id)) {
            curShelf.push(item);
          }
        });
        localStorage.setItem(PAST_SHELF_KEY, JSON.stringify(curShelf));
      }
      if (typeof obj.candleCount === "number") {
        const curC = parseInt(localStorage.getItem(CANDLE_KEY) || "128", 10);
        localStorage.setItem(CANDLE_KEY, Math.max(curC, obj.candleCount));
      }
      alert("紀錄合併還原成功！已為您同步生靈書架與點燭紀錄。");
      if (el.moveModal) el.moveModal.style.display = "none";
      renderPastShelf();
      renderCandleCount();
    } catch (e) {
      alert("代碼格式無效或已損毀，請確認複製了完整的轉移代碼！");
    }
  }

  function openShareCardModal(isMemorial = false) {
    if (!el.shareCardModal || !state.currentLife) return;
    const life = state.currentLife;
    const s = life.species;
    const name = life.name || "荒野無名生靈";

    let shareTitle = "";
    let shareQuote = "";
    let statsLine = "";

    if (isMemorial) {
      shareTitle = `${s.name} · ${name}`;
      shareQuote = state.eulogy || "風吹過荒原，帶走了最後一道足跡。在星族的永恆獵場中自由奔跑吧。";
      statsLine = `享年 ${state.currentAge} ${s.unit} | 超越 ${life.survivalPercentile}% 同族 | 歷經 ${state.choicesMadeCount} 次關鍵抉擇`;
    } else {
      shareTitle = `${s.name} · ${name}`;
      shareQuote = life.prologueNovel ? life.prologueNovel.slice(0, 110) + "..." : "初誕於大地微光之中。";
      statsLine = `原生棲地：${s.isHuman ? life.countryData.name : life.biome.name} | 性別：${life.gender || '雄性'}`;
    }

    if (el.scSerial) el.scSerial.textContent = `NO. 10T-${Math.floor(10000 + Math.random() * 90000)}`;
    if (el.scTitle) el.scTitle.textContent = shareTitle;
    if (el.scMeta) el.scMeta.textContent = isMemorial ? `享年 ${state.currentAge} ${s.unit} · ${s.isHuman ? life.countryData.name : life.biome.name} · ${life.gender || '雄性'}` : statsLine;
    if (el.scStory) el.scStory.textContent = `「${shareQuote}」`;
    if (el.scStats) {
      el.scStats.innerHTML = isMemorial
        ? `<span>超越 ${life.survivalPercentile}% 同儕</span><span>${state.choicesMadeCount} 次關鍵抉擇</span>`
        : `<span>幼體存活率 ${(s.infantSurvivalRate ? s.infantSurvivalRate * 100 : 70).toFixed(1)}%</span><span>自然壽命約 ${s.avgAgeWild} ${s.unit}</span>`;
    }

    const shareUrl = window.location.href.split('#')[0];
    const fullShareText = `【十兆分之一 · 生命紀錄】${shareTitle}\n\n「${shareQuote}」\n\n${statsLine}\n\n探索你在十兆分之一定律下的命運演繹：\n${shareUrl}`;
    if (el.shareTextContent) {
      el.shareTextContent.value = fullShareText;
    }

    el.shareCardModal.style.display = "flex";
  }

  function copyShareCardContent() {
    if (!el.shareTextContent) return;
    el.shareTextContent.select();
    navigator.clipboard.writeText(el.shareTextContent.value).then(() => {
      alert("分享文字與連結已複製到剪貼簿！");
    });
  }

  // --------------------------------------------------------------------------
  // 首頁地圖與母國選擇初始化 (Intro Page & Map Initialization)
  // --------------------------------------------------------------------------
  function initIntroPageAndMap() {
    if (el.homeSel && window.HOME_COUNTRIES_LIST) {
      el.homeSel.innerHTML = "";
      window.HOME_COUNTRIES_LIST.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = `${c.name} (${c.continent})`;
        if (c.id === state.homeCountry) opt.selected = true;
        el.homeSel.appendChild(opt);
      });

      const curH = window.HOME_COUNTRIES_LIST.find(c => c.id === state.homeCountry);
      if (curH && el.homeDescText) {
        el.homeDescText.textContent = `${curH.name}：預期壽命約 ${curH.avgLifespan} 歲，嬰兒死亡率 ${(curH.infantMortality * 100).toFixed(2)}%，人均 GDP $${curH.gdpPppUsd.toLocaleString()} 美元。`;
      }
    }

    if (el.tgMap) {
      const hc = (window.HOME_COUNTRIES_LIST || []).find(c => c.id === state.homeCountry) || { lat: 23.6978, lng: 120.9605, name: "台灣" };
      drawWorldMap(el.tgMap, null, { lat: hc.lat, lng: hc.lng, name: hc.name });
    }

    renderIntroPastLives();
    startLiveOddsTicker();
  }

  function renderIntroPastLives() {
    if (!el.pastLives) return;
    let shelf = [];
    try {
      shelf = JSON.parse(localStorage.getItem(PAST_SHELF_KEY) || "[]");
    } catch (e) { shelf = []; }

    el.pastLives.innerHTML = "";
    if (shelf.length === 0) {
      el.pastLives.innerHTML = `<div style="font-size:12px; color:var(--text-muted); padding:8px 0;">尚無過去人生紀錄，點擊上方按鈕開始輪盤抽選！</div>`;
      return;
    }

    shelf.slice(0, 4).forEach(item => {
      const pill = document.createElement("div");
      pill.className = "past-live-pill";
      pill.innerHTML = `
        <div>
          <strong>${escapeHtml(item.charName)}</strong> (${escapeHtml(item.speciesName)})
          <span style="font-size:11px; color:var(--text-muted); margin-left:6px;">享年 ${item.age} ${item.unit}</span>
        </div>
        <span style="font-size:11px; color:var(--accent-gold);">${escapeHtml(item.deathCause)}</span>
      `;
      el.pastLives.appendChild(pill);
    });
  }

  let globalPulseCount = 0;
  function startLiveOddsTicker() {
    setInterval(() => {
      globalPulseCount++;
      const births = 280000000 + (globalPulseCount * 4600);
      const deaths = 195000000 + (globalPulseCount * 2800);
      if (el.cBirth) el.cBirth.textContent = births.toLocaleString();
      if (el.cDeath) el.cDeath.textContent = deaths.toLocaleString();
    }, 800);
  }

  // 5. 自動存檔與進度還原系統 (localStorage)
  function saveGameState(customView = null) {
    if (!state.currentLife) return;

    let view = customView;
    if (!view) {
      if (el.deadSec.style.display === "block") view = "dead";
      else if (el.lifeSec.style.display === "block") view = "lifeview";
      else if (el.rollSec.style.display === "block") view = "roll";
      else view = "intro";
    }

    const payload = {
      view,
      life: state.currentLife,
      selectedAuthor: state.selectedAuthor,
      contentMode: state.contentMode,
      experienceMode: state.experienceMode,
      era: state.era,
      eraYear: state.eraYear,
      drawMode: state.drawMode,
      lifePace: state.lifePace,
      homeCountry: state.homeCountry,
      skipHeavy: state.skipHeavy,
      autoDecision: state.autoDecision,
      pauseOnReflection: state.pauseOnReflection,
      starredFeedIndices: state.starredFeedIndices,
      feedStarredOnly: state.feedStarredOnly,
      currentAge: state.currentAge,
      currentSeasonIdx: state.currentSeasonIdx,
      isPaused: state.isPaused,
      isGameOver: state.isGameOver,
      speedMultiplier: state.speedMultiplier,
      readingProtection: state.readingProtection,
      companions: state.companions,
      choicesMadeCount: state.choicesMadeCount,
      recentChoices: state.recentChoices,
      activeFocus: state.activeFocus,
      bookPages: state.bookPages,
      currentSpreadIndex: state.currentSpreadIndex,
      fullNovelText: state.fullNovelText,
      currentChapterTitle: state.currentChapterTitle,
      feedEvents: state.feedEvents,
      eulogy: state.eulogy,
      isDeathNoticed: state.isDeathNoticed,
      isHorizontalReading: state.isHorizontalReading,
      savedAt: Date.now()
    };

    try {
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("無法寫入 localStorage：", e);
    }
  }

  function loadGameState() {
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || !data.life) return false;

      state.currentLife = data.life;
      state.selectedAuthor = data.selectedAuthor || "erinhunter";
      state.contentMode = data.contentMode || "normal";
      state.experienceMode = data.experienceMode || "story";
      state.era = data.era || "now";
      state.eraYear = data.eraYear || 1990;
      state.drawMode = data.drawMode || "birth";
      state.lifePace = data.lifePace || "30";
      state.homeCountry = data.homeCountry || "TW";
      state.skipHeavy = !!data.skipHeavy;
      state.autoDecision = !!data.autoDecision;
      state.pauseOnReflection = data.pauseOnReflection !== undefined ? data.pauseOnReflection : true;
      state.starredFeedIndices = data.starredFeedIndices || [];
      state.feedStarredOnly = !!data.feedStarredOnly;
      state.currentAge = data.currentAge || 0;
      state.currentSeasonIdx = data.currentSeasonIdx || 0;
      state.isPaused = true;
      state.isGameOver = !!data.isGameOver;
      state.speedMultiplier = data.speedMultiplier || 1;
      state.readingProtection = data.readingProtection !== undefined ? data.readingProtection : true;
      state.companions = data.companions || [];
      state.choicesMadeCount = data.choicesMadeCount || 0;
      state.recentChoices = data.recentChoices || [];
      state.activeFocus = data.activeFocus || "hunt";
      state.bookPages = data.bookPages || [];
      state.currentSpreadIndex = data.currentSpreadIndex || 0;
      state.fullNovelText = data.fullNovelText || "";
      state.currentChapterTitle = data.currentChapterTitle || "第一章";
      state.feedEvents = data.feedEvents || [];
      state.eulogy = data.eulogy || "";
      state.isDeathNoticed = !!data.isDeathNoticed;
      state.isHorizontalReading = !!data.isHorizontalReading;

      updateModeHint(state.contentMode);
      updateAuthorHint(state.selectedAuthor);
      updateExperienceHint(state.experienceMode);

      if (el.experienceModeGroup) {
        el.experienceModeGroup.querySelectorAll(".seg-btn").forEach(btn => {
          btn.classList.toggle("active", btn.dataset.exp === state.experienceMode);
        });
      }

      el.introSec.style.display = "none";
      el.rollSec.style.display = "none";
      el.lifeSec.style.display = "none";
      el.deadSec.style.display = "none";

      if (data.view === "dead") {
        showMemorialHall();
      } else if (data.view === "roll") {
        el.rollSec.style.display = "block";
        renderBirthCertificate(state.currentLife);
      } else {
        el.lifeSec.style.display = "block";
        if (state.isHorizontalReading) {
          el.novelBookCard.classList.add("reading-mode-horizontal");
          el.readingModeIcon.className = "fas fa-bars-staggered";
          el.readingModeText.textContent = "切換直排";
        }

        renderCompanions();
        renderFocusChips();
        renderLifeGrid();
        renderSurvivalChart();
        updateDashboardUI();

        el.novelChapterTitle.textContent = state.currentChapterTitle || "第一章";
        rePaginateBook(state.currentSpreadIndex);

        if (state.isDeathNoticed || state.isGameOver) {
          state.isGameOver = true;
          state.isDeathNoticed = true;
          hideNovelLoading();
          if (el.novelDeathNotice) el.novelDeathNotice.style.display = "flex";
          if (state.timerId) {
            clearInterval(state.timerId);
            state.timerId = null;
          }
          if (el.deathSettlementModal) {
            const finalIdx = (state.choicesMadeCount || 0) + 2;
            if (el.settleCauseText) el.settleCauseText.textContent = state.currentLife?.deathCause || "壽終正寢";
            if (el.settlePercentileText) el.settlePercentileText.textContent = `${state.currentLife?.survivalPercentile || 80}% 的同族生靈`;
            if (el.settleChaptersText) el.settleChaptersText.textContent = `${finalIdx} 章 (含 ${state.choicesMadeCount || 0} 次關鍵抉擇)`;
            el.deathSettlementModal.style.display = "flex";
          }
        }

        renderFeedEvents();
        setPauseState(true);
      }

      return true;
    } catch (e) {
      console.warn("進度還原失敗：", e);
      return false;
    }
  }

  function clearGameState() {
    try {
      localStorage.removeItem(SAVE_STORAGE_KEY);
    } catch (e) {}
  }

  // 6. 主題與環境音效
  function toggleTheme() {
    const isDark = document.body.classList.toggle("theme-dark");
    if (el.themeIcon) {
      el.themeIcon.className = isDark ? "fas fa-sun" : "fas fa-circle-half-stroke";
    }
  }

  function toggleAmbientSound() {
    if (!state.soundEnabled) {
      initWebAudio();
      state.soundEnabled = true;
      el.ambientSoundLabel.textContent = "自然音效：開啟";
      el.ambientSoundBtn.classList.add("active");
    } else {
      if (state.ambientGain) {
        state.ambientGain.gain.setValueAtTime(0, state.audioCtx.currentTime);
      }
      state.soundEnabled = false;
      el.ambientSoundLabel.textContent = "自然音效：關閉";
      el.ambientSoundBtn.classList.remove("active");
    }
  }

  function initWebAudio() {
    if (!state.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      state.audioCtx = new AudioCtx();
    }
    if (state.audioCtx.state === "suspended") {
      state.audioCtx.resume();
    }

    const ctx = state.audioCtx;
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(420, ctx.currentTime);

    state.ambientGain = ctx.createGain();
    state.ambientGain.gain.setValueAtTime(0.04, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(state.ambientGain);
    state.ambientGain.connect(ctx.destination);

    whiteNoise.start();
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  window.addEventListener("resize", () => {
    if (state.fullNovelText) {
      rePaginateBook(state.currentSpreadIndex);
    }
    if (el.tgMap) {
      const hc = (window.HOME_COUNTRIES_LIST || []).find(c => c.id === state.homeCountry) || { lat: 23.6978, lng: 120.9605, name: "台灣" };
      drawWorldMap(el.tgMap, null, { lat: hc.lat, lng: hc.lng, name: hc.name });
    }
    if (el.certMap && state.currentLife) {
      renderCertMap(state.currentLife);
    }
  });

  // ============================================================================
  // 首次進入全螢幕省思文字引言 (Prologue Reflection Screen)
  // ============================================================================
  const PROLOGUE_REFLECTION_LINES = [
    "這個世界上，約有十兆個有意識的生命。",
    "你，僅僅是其中之一。",
    "牠們感知世界，牠們畏懼死亡。",
    "但人類留給牠們的生存空間，正在迅速消逝。",
    "每一次人為的代價，都是另一個生命的終點。",
    "如果這一次，你不再是人類——"
  ];

  let prologueCurrentIdx = 0;
  let prologueTimer = null;
  let prologueIsTransitioning = false;

  function initPrologueReflection() {
    const overlay = el.introPrologueOverlay || document.getElementById("introPrologueOverlay");
    const lineEl = el.prologueLine || document.getElementById("prologueLine");
    const replayBtn = el.replayPrologueBtn || document.getElementById("replayPrologueBtn");
    const replayBtnDead = el.replayPrologueBtnDead || document.getElementById("replayPrologueBtnDead");
    const topPrologueBtn = el.topPrologueBtn || document.getElementById("topPrologueBtn");

    if (!overlay || !lineEl) return;

    function clearTimer() {
      if (prologueTimer) {
        clearTimeout(prologueTimer);
        prologueTimer = null;
      }
    }

    function showLine(idx) {
      if (idx >= PROLOGUE_REFLECTION_LINES.length) {
        completePrologue();
        return;
      }
      prologueCurrentIdx = idx;
      prologueIsTransitioning = true;

      // 如果有現有文字，先淡出
      if (lineEl.textContent) {
        lineEl.classList.remove("visible");
        lineEl.classList.add("fading");

        setTimeout(() => {
          lineEl.textContent = PROLOGUE_REFLECTION_LINES[idx];
          lineEl.classList.remove("fading");
          // 強制重繪後觸發淡入
          void lineEl.offsetWidth;
          lineEl.classList.add("visible");
          prologueIsTransitioning = false;

          // 停留後自動淡出進入下一句
          prologueTimer = setTimeout(() => {
            showLine(idx + 1);
          }, 2700);
        }, 800);
      } else {
        // 第一句直接淡入
        lineEl.textContent = PROLOGUE_REFLECTION_LINES[idx];
        lineEl.classList.remove("fading");
        void lineEl.offsetWidth;
        lineEl.classList.add("visible");
        prologueIsTransitioning = false;

        prologueTimer = setTimeout(() => {
          showLine(idx + 1);
        }, 2700);
      }
    }

    function advanceNextLine() {
      if (prologueIsTransitioning) return;
      clearTimer();
      if (prologueCurrentIdx >= PROLOGUE_REFLECTION_LINES.length - 1) {
        completePrologue();
      } else {
        showLine(prologueCurrentIdx + 1);
      }
    }

    // 只有完整看完最後一句，才標記看過並寫入 localStorage！
    function completePrologue() {
      clearTimer();
      try {
        localStorage.setItem("10t_reflection_seen", "true");
      } catch (e) {}

      // 文字先柔和淡出
      lineEl.classList.remove("visible");
      lineEl.classList.add("fading");

      // 整體黑幕淡出
      overlay.classList.add("fade-out-overlay");
      setTimeout(() => {
        overlay.style.display = "none";
        overlay.classList.remove("fade-out-overlay");
        lineEl.textContent = "";
        lineEl.classList.remove("fading", "visible");
        prologueIsTransitioning = false;
      }, 1200);
    }

    function startPrologue() {
      clearTimer();
      prologueCurrentIdx = 0;
      lineEl.textContent = "";
      lineEl.classList.remove("visible", "fading");
      overlay.classList.remove("fade-out-overlay");
      overlay.style.display = "flex";
      showLine(0);
    }

    // 點擊畫面任意處即可加速推進下一句
    overlay.addEventListener("click", () => {
      advanceNextLine();
    });

    // 鍵盤導航：空白鍵、Enter 或方向鍵前進
    document.addEventListener("keydown", (e) => {
      if (overlay.style.display !== "none" && overlay.style.display !== "") {
        if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          advanceNextLine();
        }
      }
    });

    // 網站頁尾與導覽列回顧按鈕
    if (replayBtn) replayBtn.addEventListener("click", () => startPrologue());
    if (replayBtnDead) replayBtnDead.addEventListener("click", () => startPrologue());
    if (topPrologueBtn) topPrologueBtn.addEventListener("click", () => startPrologue());

    // 檢查是否初次進入且尚未完整看完
    const hasSeen = localStorage.getItem("10t_reflection_seen");
    if (!hasSeen) {
      startPrologue();
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    try { initElements(); } catch (e) { console.error("initElements error:", e); }
    try { bindEvents(); } catch (e) { console.error("bindEvents error:", e); }
    try { initIntroPageAndMap(); } catch (e) { console.error("initIntroPageAndMap error:", e); }
    try { startBirthTickers(); } catch (e) { console.error("startBirthTickers error:", e); }

    try {
      const hasRestored = loadGameState();
      if (!hasRestored && el.introSec) {
        el.introSec.style.display = "block";
      }
    } catch (e) {
      console.error("loadGameState error:", e);
      if (el.introSec) el.introSec.style.display = "block";
    }

    try { initPrologueReflection(); } catch (e) { console.error("initPrologueReflection error:", e); }
  });
})();
