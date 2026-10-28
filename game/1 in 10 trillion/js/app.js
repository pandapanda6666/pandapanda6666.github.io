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

    el.contentModeGroup = document.getElementById("contentModeGroup");
    el.modeHintText = document.getElementById("modeHintText");
    el.authorGroup = document.getElementById("authorGroup");
    el.authorHintText = document.getElementById("authorHintText");
    el.addCustomAuthorBtn = document.getElementById("addCustomAuthorBtn");

    el.startRollBtn = document.getElementById("startRollBtn");
    el.rollerBox = document.getElementById("rollerBox");
    el.rollerDisplay = document.getElementById("rollerDisplay");
    el.rollerBiome = document.getElementById("rollerBiome");
    el.certCard = document.getElementById("certCard");
    el.certCharName = document.getElementById("certCharName");
    el.certMultiNames = document.getElementById("certMultiNames");
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

    el.dashAvatar = document.getElementById("dashAvatar");
    el.dashName = document.getElementById("dashName");
    el.dashMultiNames = document.getElementById("dashMultiNames");
    el.dashSpecies = document.getElementById("dashSpecies");
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
    el.novelLoadingOverlay = document.getElementById("novelLoadingOverlay");
    el.novelLoadingTitle = document.getElementById("novelLoadingTitle");
    el.novelLoadingDesc = document.getElementById("novelLoadingDesc");
    el.headerChapterRight = document.getElementById("headerChapterRight");
    el.headerChapterLeft = document.getElementById("headerChapterLeft");
    el.pageContentRight = document.getElementById("pageContentRight");
    el.pageContentLeft = document.getElementById("pageContentLeft");
    el.pageNumRight = document.getElementById("pageNumRight");
    el.pageNumLeft = document.getElementById("pageNumLeft");

    el.choiceContainer = document.getElementById("choiceContainer");
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

    // 新增自訂作家
    if (el.addCustomAuthorBtn) {
      el.addCustomAuthorBtn.addEventListener("click", () => {
        const inputName = prompt("請輸入你想參考的作家或文學流派名稱（例如：傑克·倫敦、法布爾、吉卜林、卡夫卡...）：");
        if (inputName && inputName.trim()) {
          const cleanName = inputName.trim();
          state.selectedAuthor = { name: cleanName };

          // 建立新按鈕並置為 active
          el.authorGroup.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
          const newBtn = document.createElement("button");
          newBtn.type = "button";
          newBtn.className = "seg-btn active";
          newBtn.dataset.author = "custom_" + Date.now();
          newBtn.textContent = cleanName;
          newBtn.addEventListener("click", () => {
            el.authorGroup.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
            newBtn.classList.add("active");
            state.selectedAuthor = { name: cleanName };
            updateAuthorHint(state.selectedAuthor);
            saveGameState();
          });
          el.authorGroup.appendChild(newBtn);
          updateAuthorHint(state.selectedAuthor);
          saveGameState();
        }
      });
    }

    // 輪盤與投胎
    el.startRollBtn.addEventListener("click", startRollingLife);
    el.reRollBtn.addEventListener("click", startRollingLife);
    el.beginLifeBtn.addEventListener("click", enterLifeDashboard);

    // 時間控制器
    el.pauseBtn.addEventListener("click", togglePause);
    document.querySelectorAll(".sp-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".sp-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.speedMultiplier = parseInt(btn.dataset.sp, 10);
        restartSimulationTimer();
      });
    });

    el.nextChoiceBtn.addEventListener("click", fastForwardToNextChoice);

    // 閱讀保護開關
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

    // 放棄此生按鈕
    el.abandonLifeBtn.addEventListener("click", () => {
      if (confirm("確定要放棄當前生命進度並重新開始投胎嗎？所有當前歷程將會重置。")) {
        clearGameState();
        if (state.timerId) clearInterval(state.timerId);
        el.lifeSec.style.display = "none";
        el.rollSec.style.display = "none";
        el.deadSec.style.display = "none";
        el.introSec.style.display = "block";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    // 閱讀模式（保持經典直排紙本書）
    if (el.readingModeToggleBtn) {
      el.readingModeToggleBtn.addEventListener("click", toggleReadingMode);
    }

    // 書本翻頁按鈕
    el.prevPageBtn.addEventListener("click", turnPagePrev);
    el.nextPageBtn.addEventListener("click", turnPageNext);

    // 前往追思館按鈕
    el.goToMemorialBtn.addEventListener("click", showMemorialHall);

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
    el.reviewNovelBtn.addEventListener("click", () => {
      el.memoFullNovelText.textContent = state.fullNovelText || "尚無文字記錄。";
      el.memorialNovelContainer.style.display = "block";
      el.memorialNovelContainer.scrollIntoView({ behavior: "smooth" });
    });
    el.closeMemoNovelBtn.addEventListener("click", () => {
      el.memorialNovelContainer.style.display = "none";
    });

    // 重生按鈕
    el.restartGameBtn.addEventListener("click", () => {
      clearGameState();
      el.deadSec.style.display = "none";
      el.introSec.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

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
      contentMode: state.contentMode
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

    document.querySelector(".cert-species-cn").textContent = s.name;
    document.querySelector(".cert-species-sci").textContent = `(${s.scientificName})`;
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

  // 雙頁紙本小說分頁系統 (依實體紙本書規格滿版排版，首行縮排兩字，始終雙頁對開)
  function rePaginateBook(targetSpread = null) {
    const rawText = state.fullNovelText || "";
    if (!rawText.trim()) {
      state.bookPages = [["（尚無篇章紀錄）"], [""]];
      renderBookSpread();
      return;
    }

    // 利用自然段落智慧切分器，確保每段均具備標點與縮排
    const paragraphs = window.DestinyEngine
      ? window.DestinyEngine.splitIntoNaturalParagraphs(rawText)
      : rawText.split(/\n+/).map(p => p.trim()).filter(Boolean);

    const cleanParas = [];
    paragraphs.forEach(p => {
      const trimmed = p.trim();
      if (!trimmed) return;
      if (/^【第[零一二三四五六七八九十百]+章】$/.test(trimmed)) {
        state.currentChapterTitle = trimmed.replace(/【|】/g, "");
        return;
      }
      cleanParas.push(trimmed);
    });

    // 紙本書單頁容量預算 (使每頁適中雅緻，約 220~280 字元)
    const PAGE_BUDGET = 260;

    const pages = [];
    let curParas = [];
    let curChars = 0;

    cleanParas.forEach(p => {
      if (curChars + p.length > PAGE_BUDGET && curParas.length > 0) {
        pages.push(curParas);
        curParas = [p];
        curChars = p.length;
      } else {
        curParas.push(p);
        curChars += p.length;
      }
    });

    if (curParas.length > 0) {
      pages.push(curParas);
    }

    // 確保偶數頁對開 (雙頁閱讀)
    if (pages.length % 2 !== 0) {
      pages.push([""]);
    }

    state.bookPages = pages.length > 0 ? pages : [[""], [""]];

    if (targetSpread !== null) {
      state.currentSpreadIndex = Math.floor(Math.min(targetSpread, Math.max(0, state.bookPages.length - 1)) / 2) * 2;
    } else {
      const last = Math.max(0, state.bookPages.length - 1);
      state.currentSpreadIndex = Math.floor(last / 2) * 2;
    }

    renderBookSpread();
  }

  // 渲染雙頁面 (紙本書版心規格：右頁在右、左頁在左，兩頁始終同時呈現)
  function renderBookSpread() {
    const total = state.bookPages.length;
    const rIdx = state.currentSpreadIndex;
    const lIdx = state.currentSpreadIndex + 1;

    const rParas = state.bookPages[rIdx] || [];
    const lParas = (lIdx < total) ? state.bookPages[lIdx] : [];

    // 渲染右頁 (文字直排，右頁優先)
    el.pageContentRight.innerHTML = rParas.map(p => p.trim() ? `<p class="novel-para">${escapeHtml(p)}</p>` : "").join("");
    // 渲染左頁
    el.pageContentLeft.innerHTML = lParas.map(p => p.trim() ? `<p class="novel-para">${escapeHtml(p)}</p>` : "").join("");

    // 漢字頁碼 (壹, 貳, 參...)
    const numToChinese = ["壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖", "拾", "拾壹", "拾貳", "拾參", "拾肆", "拾伍", "拾陸", "拾柒", "拾捌", "拾玖", "貳拾", "貳拾壹", "貳拾貳", "貳拾參", "貳拾肆", "貳拾伍", "貳拾陸", "貳拾柒", "貳拾捌", "貳拾玖", "參拾"];
    
    // 頁數顯示規範：右頁右下角、左頁左下角
    el.pageNumRight.textContent = rIdx < total ? `第 ${numToChinese[rIdx] || (rIdx + 1)} 頁` : "";
    el.pageNumLeft.textContent = (lIdx < total && lParas.length > 0) ? `第 ${numToChinese[lIdx] || (lIdx + 1)} 頁` : "";

    // 書眉章節更新 (嚴格為「第N章」)
    if (el.headerChapterRight) el.headerChapterRight.textContent = state.currentChapterTitle || "第一章";
    if (el.headerChapterLeft) el.headerChapterLeft.textContent = state.currentChapterTitle || "第一章";
    el.novelChapterTitle.textContent = state.currentChapterTitle || "第一章";

    // 頁碼導航指示器
    el.bookPageIndicator.textContent = `第 ${rIdx + 1}–${Math.min(lIdx + 1, Math.max(1, total))} 頁 / 共 ${Math.max(1, total)} 頁`;
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
      // 提前預判：若已接近當前末頁，主動觸發下一章提前預先生成
      if (state.currentSpreadIndex + 2 >= state.bookPages.length) {
        prefetchUpcomingMilestone();
      }
    }
  }

  // 提前生成機制 (Pre-generation)：在玩家閱讀當前頁面時，已在背景提前準備好下一章，拒絕翻頁等待！
  async function prefetchUpcomingMilestone(targetChapterIdx = null) {
    if (state.isPrefetching || state.isGameOver) return;
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
        state.contentMode
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
    el.novelLoadingTitle.textContent = title;
    el.novelLoadingDesc.textContent = desc;
    el.novelLoadingOverlay.style.display = "flex";
  }

  function hideNovelLoading() {
    el.novelLoadingOverlay.style.display = "none";
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
    const seasons = ["春之甦醒", "盛夏繁茂", "清秋收成", "凜冬考驗"];
    state.currentSeasonIdx = (state.currentSeasonIdx + 1) % 4;

    if (state.currentSeasonIdx === 0) {
      state.currentAge++;
    }

    const life = state.currentLife;
    const maxAge = life.maxPossibleAge;

    // 檢查生命終暮
    if ((state.currentAge >= maxAge && state.currentSeasonIdx === 0) || life.initialStats.health <= 0) {
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
            state.contentMode
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
      state.selectedAuthor
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
    if (state.feedEvents.length > 50) state.feedEvents.pop();

    const li = document.createElement("li");
    li.className = `feed-item ${evt.type === 'milestone' || evt.isConsolidated ? 'milestone' : ''}`;
    const typeHtml = evt.isConsolidated
      ? '<i class="fas fa-star" style="color:#eab308;"></i> 階段沉澱'
      : (evt.type === 'milestone' ? '<i class="fas fa-bolt" style="color:#ef4444;"></i> 命運轉折' : '<i class="fas fa-leaf" style="color:#22c55e;"></i> 生態紀錄');

    li.innerHTML = `
      <div class="feed-meta">
        <span class="feed-age">${escapeHtml(evt.ageLabel)}</span>
        <span class="feed-type">${typeHtml}</span>
      </div>
      <div class="feed-text">${escapeHtml(evt.text)}</div>
    `;
    el.eventFeedList.insertBefore(li, el.eventFeedList.firstChild);
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
    state.isGameOver = true;
    setPauseState(true);
    if (state.timerId) clearInterval(state.timerId);

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
        { choicesCount: state.choicesMadeCount, recentChoices: state.recentChoices },
        state.selectedAuthor
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
          : `【面對${life.deathCause}的終局】刺骨的寒意侵入四肢，劇烈的喘息在冷空氣中化作白霧。視線中的古木與山稜逐漸模糊化為柔和的微光，骨骼間的劇痛奇蹟般地平復，取而代之的是如春日溪流般的寧靜。你緩緩伏下身軀，任由最後一口吐息融入狂風，靈魂奔向了群星與先祖的遼闊獵場。`,
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
    el.novelDeathNotice.scrollIntoView({ behavior: "smooth", block: "center" });

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
    document.getElementById("memoEulogyText").textContent = state.eulogy;

    saveGameState("dead");
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

        if (state.isDeathNoticed) {
          el.novelDeathNotice.style.display = "flex";
        }

        el.eventFeedList.innerHTML = "";
        (state.feedEvents || []).forEach(evt => {
          const li = document.createElement("li");
          li.className = `feed-item ${evt.type === 'milestone' || evt.isConsolidated ? 'milestone' : ''}`;
          const typeHtml = evt.isConsolidated
            ? '<i class="fas fa-star" style="color:#eab308;"></i> 階段沉澱'
            : (evt.type === 'milestone' ? '<i class="fas fa-bolt" style="color:#ef4444;"></i> 命運轉折' : '<i class="fas fa-leaf" style="color:#22c55e;"></i> 生態紀錄');
          li.innerHTML = `
            <div class="feed-meta">
              <span class="feed-age">${escapeHtml(evt.ageLabel)}</span>
              <span class="feed-type">${typeHtml}</span>
            </div>
            <div class="feed-text">${escapeHtml(evt.text)}</div>
          `;
          el.eventFeedList.appendChild(li);
        });

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
  });

  window.addEventListener("DOMContentLoaded", () => {
    initElements();
    bindEvents();
    startBirthTickers();

    const hasRestored = loadGameState();
    if (!hasRestored) {
      el.introSec.style.display = "block";
    }
  });
})();
