/**
 * 十兆分之一 (1 in 10 Trillion) - 主應用邏輯與遊戲控制器
 * 功能特點：
 * 1. 雙頁直書右翻小說閱讀器（左右兩面・右翻・直式・右到左，支援手機響應單頁與橫排切換）
 * 2. 嚴格生命時鐘保護：生成完第一頁之前時鐘絕對暫停，生成中顯示載入遮罩
 * 3. AI 即時生成：不寫死情節，AI 接收完整玩家狀態（物種、年齡、數值、生活重心、同儕狀態），並能控制畫面數值與情境
 * 4. 閱讀保護機制：新篇章生成後自動暫停，提供充裕時間品讀，放慢步調
 * 5. 死亡完整小說流程：死前由 AI 生成詳細死亡與長眠篇章，讀者於雙頁書中閱讀完畢後才前往荒野追思館
 * 6. 自動儲存進度 (localStorage)：重新整理頁面後無縫保留在同一畫面與狀態
 */

(function () {
  "use strict";

  const SAVE_STORAGE_KEY = "10t_life_save";

  // 全域遊戲狀態
  const state = {
    selectedPool: "all",
    selectedPace: "normal", // fast, normal, slow
    currentLife: null,
    currentAge: 0,
    currentSeasonIdx: 0,
    isPaused: true,
    isGameOver: false,
    speedMultiplier: 1, // 預設 1x 步調更慢更適合閱讀
    readingProtection: true, // 閱讀保護模式：新章節出現自動暫停
    timerId: null,
    companions: [],
    choicesMadeCount: 0,
    recentChoices: [],
    activeFocus: "hunt",
    soundEnabled: false,
    audioCtx: null,
    ambientGain: null,
    sceneMood: "calm",

    // 雙頁直書小說狀態
    bookPages: [],          // 所有已解鎖的小說頁面文字數組
    currentSpreadIndex: 0,  // 當前展開之右頁索引 (0, 2, 4...)
    fullNovelText: "",      // 完整累積小說純文字
    currentChapterTitle: "",
    feedEvents: [],
    eulogy: "",
    isDeathNoticed: false,
    isHorizontalReading: false
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

    el.startRollBtn = document.getElementById("startRollBtn");
    el.rollerBox = document.getElementById("rollerBox");
    el.rollerDisplay = document.getElementById("rollerDisplay");
    el.rollerBiome = document.getElementById("rollerBiome");
    el.certCard = document.getElementById("certCard");
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

    // 雙頁書本元件
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
    el.pageContentRight = document.getElementById("pageContentRight");
    el.pageContentLeft = document.getElementById("pageContentLeft");
    el.pageNumRight = document.getElementById("pageNumRight");
    el.pageNumLeft = document.getElementById("pageNumLeft");

    el.choiceContainer = document.getElementById("choiceContainer");
    el.choiceButtonsGrid = document.getElementById("choiceButtonsGrid");
    el.focusChipsContainer = document.getElementById("focusChipsContainer");
    el.eventFeedList = document.getElementById("eventFeedList");
    el.companionsList = document.getElementById("companionsList");
    el.lifeGridContainer = document.getElementById("lifeGridContainer");
    el.ecoDataContent = document.getElementById("ecoDataContent");
    el.svgCurvePath = document.getElementById("svgCurvePath");
    el.svgAgeMarker = document.getElementById("svgAgeMarker");
    el.chartCaption = document.getElementById("chartCaption");

    el.themeToggleBtn = document.getElementById("themeToggleBtn");
    el.ambientSoundBtn = document.getElementById("ambientSoundBtn");
    el.ambientSoundLabel = document.getElementById("ambientSoundLabel");
    el.restartGameBtn = document.getElementById("restartGameBtn");
    el.reviewNovelBtn = document.getElementById("reviewNovelBtn");
    el.closeMemoNovelBtn = document.getElementById("closeMemoNovelBtn");
    el.memorialNovelContainer = document.getElementById("memorialNovelContainer");
    el.memoFullNovelText = document.getElementById("memoFullNovelText");
  }

  // 即時每秒生命出生計數器
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
    // 降生物種池按鈕
    document.querySelectorAll("#speciesPoolGroup .seg-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#speciesPoolGroup .seg-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.selectedPool = btn.dataset.pool;
      });
    });

    // 生命步調選擇
    document.querySelectorAll("#paceGroup .seg-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#paceGroup .seg-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.selectedPace = btn.dataset.pace;
      });
    });

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

    // 閱讀模式切換 (直排 <-> 橫排)
    el.readingModeToggleBtn.addEventListener("click", toggleReadingMode);

    // 書本翻頁按鈕 (右翻直書：往前翻看較早段落，往後翻看後續情節)
    el.prevPageBtn.addEventListener("click", turnPagePrev);
    el.nextPageBtn.addEventListener("click", turnPageNext);

    // 前往追思館按鈕 (從死亡橫幅)
    el.goToMemorialBtn.addEventListener("click", showMemorialHall);

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

  // 切換直排/橫排閱讀模式
  function toggleReadingMode() {
    state.isHorizontalReading = !state.isHorizontalReading;
    if (state.isHorizontalReading) {
      el.novelBookCard.classList.add("reading-mode-horizontal");
      el.readingModeIcon.textContent = "☰";
      el.readingModeText.textContent = "切換直排";
    } else {
      el.novelBookCard.classList.remove("reading-mode-horizontal");
      el.readingModeIcon.textContent = "〣";
      el.readingModeText.textContent = "切換橫排";
    }
    rePaginateBook(state.currentSpreadIndex);
    saveGameState();
  }

  // 1. 命運輪盤與出生登記
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

    let rollTicks = 0;
    const rollInterval = setInterval(() => {
      const rand = candidates[Math.floor(Math.random() * candidates.length)];
      el.rollerDisplay.textContent = rand.name;
      el.rollerBiome.textContent = rand.scientificName;
      rollTicks++;
    }, 70);

    let chosenSpecies = null;
    if (state.selectedPool === "human") {
      chosenSpecies = candidates.find(s => s.isHuman);
    } else if (state.selectedPool === "all") {
      const rollVal = Math.random();
      // 人類約千分之一真實生態比例
      if (rollVal < 0.005) {
        chosenSpecies = candidates.find(s => s.isHuman);
      } else {
        const nonHuman = candidates.filter(s => !s.isHuman);
        chosenSpecies = nonHuman[Math.floor(Math.random() * nonHuman.length)];
      }
    } else {
      chosenSpecies = candidates[Math.floor(Math.random() * candidates.length)];
    }

    el.aiBar.style.display = "block";
    const lifeData = await window.AiService.generateLifePipeline(chosenSpecies, {}, (pct, msg) => {
      el.aiFill.style.width = pct + "%";
      el.aiPct.textContent = pct + "%";
      el.aiStatus.textContent = msg;
    });

    clearInterval(rollInterval);
    setTimeout(() => {
      el.aiBar.style.display = "none";
      state.currentLife = lifeData;
      renderBirthCertificate(lifeData);
      saveGameState("roll");
    }, 400);
  }

  function renderBirthCertificate(life) {
    el.rollerBox.style.display = "none";
    el.certCard.style.display = "block";

    const s = life.species;
    document.getElementById("certCharName").textContent = life.name;
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
          <span class="cf-val">${(s.infantSurvivalRate * 100).toFixed(1)}% (極端野外篩選)</span>
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

  // 2. 進入主遊戲儀表板（生成完第一頁之前不要開始遊戲，顯示載入中）
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
    el.novelDeathNotice.style.display = "none";
    el.choiceContainer.style.display = "none";

    // 啟動載入遮罩：生成第一頁小說中，時鐘嚴格暫停
    showNovelLoading("艾琳·杭特 AI 正在構思開篇生靈小說...", "正在編織最初的感官與野性本能。生成完成前生命時鐘保持暫停中，請稍候...");

    // 設置同伴、重心、地圖與存活曲線
    generateCohortCompanions();
    renderFocusChips();
    renderLifeGrid();
    renderSurvivalChart();
    updateDashboardUI();

    // 載入第一章
    const firstChapter = state.currentLife.storyTimeline[0];
    if (firstChapter) {
      state.currentChapterTitle = firstChapter.title;
      el.novelChapterTitle.textContent = firstChapter.title;
      state.fullNovelText = `【${firstChapter.title}】\n${firstChapter.narrative}`;
      rePaginateBook();
    }

    // 稍微延遲確保平滑過渡
    await delay(700);

    // 第一頁生成完成！收起載入中遮罩，開放遊戲開始
    hideNovelLoading();

    // 注入初生事件
    pushEventToFeed({
      ageLabel: `0 ${state.currentLife.species.unit}・初誕`,
      type: "milestone",
      text: state.currentLife.species.isHuman
        ? `在${state.currentLife.countryData.name}呱呱墜地，開啟文明旅途。`
        : `在${state.currentLife.biome.name}微光中降生，感受初次呼吸。`
    });

    // 儲存狀態
    saveGameState("lifeview");

    // 依照使用者設定啟動時鐘（若啟用閱讀保護，則暫停待讀者開啟；預設播放）
    setPauseState(false);
    startSimulationLoop();
  }

  // 雙頁直書分頁系統 (Paginator)
  function rePaginateBook(targetSpread = null) {
    const text = state.fullNovelText || "";
    if (!text.trim()) {
      state.bookPages = [""];
      renderBookSpread();
      return;
    }

    const pages = [];
    // 依手機或桌機、直排或橫排動態調節單頁最佳字數
    const isMobile = window.innerWidth <= 768;
    const PAGE_CHAR_LIMIT = state.isHorizontalReading ? 210 : (isMobile ? 120 : 145);
    let remaining = text.trim();

    while (remaining.length > 0) {
      if (remaining.length <= PAGE_CHAR_LIMIT) {
        pages.push(remaining);
        break;
      }

      // 尋找句號、驚嘆號或換行作為自然斷頁點
      let cutIdx = PAGE_CHAR_LIMIT;
      for (let i = PAGE_CHAR_LIMIT; i >= PAGE_CHAR_LIMIT - 35; i--) {
        const char = remaining[i];
        if (char === "。" || char === "！" || char === "？" || char === "\n") {
          cutIdx = i + 1;
          break;
        }
      }

      const pageText = remaining.slice(0, cutIdx).trim();
      pages.push(pageText);
      remaining = remaining.slice(cutIdx).trim();
    }

    state.bookPages = pages;

    // 分頁索引控制
    const isSinglePageMode = isMobile && !state.isHorizontalReading;
    const step = isSinglePageMode ? 1 : 2;

    if (targetSpread !== null) {
      state.currentSpreadIndex = Math.min(targetSpread, Math.max(0, pages.length - 1));
    } else {
      // 預設翻到最後一頁
      const last = Math.max(0, pages.length - 1);
      state.currentSpreadIndex = isSinglePageMode ? last : Math.floor(last / 2) * 2;
    }

    renderBookSpread();
  }

  // 渲染雙頁面 (右頁 + 左頁，直式，右到左)
  function renderBookSpread() {
    const total = state.bookPages.length;
    const isMobile = window.innerWidth <= 768;
    const isSinglePageMode = isMobile && !state.isHorizontalReading;

    const rIdx = state.currentSpreadIndex;
    const lIdx = state.currentSpreadIndex + 1;

    const rText = state.bookPages[rIdx] || "";
    const lText = (!isSinglePageMode && lIdx < total) ? state.bookPages[lIdx] : "";

    el.pageContentRight.textContent = rText;
    el.pageContentLeft.textContent = lText;

    // 漢字頁碼 (壹, 貳, 參...)
    const numToChinese = ["壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖", "拾", "拾壹", "拾貳", "拾參", "拾肆", "拾伍", "拾陸", "拾柒", "拾捌", "拾玖", "貳拾"];
    el.pageNumRight.textContent = numToChinese[rIdx] || `${rIdx + 1}`;
    el.pageNumLeft.textContent = lText ? (numToChinese[lIdx] || `${lIdx + 1}`) : "";

    // 頁碼導航指示器
    if (isSinglePageMode) {
      el.bookPageIndicator.textContent = `第 ${rIdx + 1} 頁 / 共 ${Math.max(1, total)} 頁`;
      el.prevPageBtn.disabled = (rIdx <= 0);
      el.nextPageBtn.disabled = (rIdx >= total - 1);
    } else {
      el.bookPageIndicator.textContent = `第 ${rIdx + 1}–${Math.min(lIdx + 1, Math.max(1, total))} 頁 / 共 ${Math.max(1, total)} 頁`;
      el.prevPageBtn.disabled = (rIdx <= 0);
      el.nextPageBtn.disabled = (rIdx + 2 >= total);
    }
  }

  // 往前翻頁 (查看較早篇章)
  function turnPagePrev() {
    const isMobile = window.innerWidth <= 768;
    const step = (isMobile && !state.isHorizontalReading) ? 1 : 2;
    if (state.currentSpreadIndex > 0) {
      state.currentSpreadIndex = Math.max(0, state.currentSpreadIndex - step);
      renderBookSpread();
      saveGameState();
    }
  }

  // 往後翻頁 (接續閱讀情節)
  function turnPageNext() {
    const isMobile = window.innerWidth <= 768;
    const step = (isMobile && !state.isHorizontalReading) ? 1 : 2;
    if (state.currentSpreadIndex + step < state.bookPages.length) {
      state.currentSpreadIndex = state.currentSpreadIndex + step;
      renderBookSpread();
      saveGameState();
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
          <i class="fas fa-circle-dot" style="font-size:8px; color:${c.isAlive ? '#16A34A' : '#9E9891'}"></i>
          ${c.speciesName} · ${c.name}
        </span>
        <span class="comp-status ${c.isAlive ? 'comp-alive' : 'comp-dead'}">
          ${c.isAlive ? `${state.currentAge} 歲 (存活)` : `已故 (${c.location})`}
        </span>
      `;
      el.companionsList.appendChild(li);
    });
  }

  function renderFocusChips() {
    const isHuman = state.currentLife.species.isHuman;
    const chips = isHuman
      ? [
          { id: "study", label: "📚 學業與進修" },
          { id: "work", label: "💼 職場打拼" },
          { id: "family", label: "🏡 家庭與陪伴" },
          { id: "health", label: "🏃 運動保健" },
          { id: "leisure", label: "☕ 放鬆休閒" }
        ]
      : [
          { id: "hunt", label: "🐾 狩獵與覓食" },
          { id: "patrol", label: "🌲 巡守領地邊界" },
          { id: "skills", label: "⚡ 磨練生存野性" },
          { id: "pack", label: "🐺 凝聚族群羈絆" },
          { id: "rest", label: "💤 休養避寒" }
        ];

    el.focusChipsContainer.innerHTML = "";
    chips.forEach(c => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `chip ${state.activeFocus === c.id ? "active" : ""}`;
      btn.textContent = c.label;
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

  // 3. 主循環模擬引擎（放慢步調，讓使用者有充裕閱讀時間）
  function getPaceInterval() {
    // 基準節奏：慢步調 5200ms、一般 3800ms、極速 1800ms
    const base = state.selectedPace === "fast" ? 1800 : (state.selectedPace === "slow" ? 5200 : 3800);
    return Math.max(700, Math.round(base / state.speedMultiplier));
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
      el.pauseIcon.textContent = "▶";
      el.pauseBtn.querySelector("span:last-child")?.remove();
      el.pauseBtn.appendChild(document.createTextNode(" 繼續"));
    } else {
      el.pauseBtn.classList.add("active");
      el.pauseIcon.textContent = "❚❚";
      el.pauseBtn.querySelector("span:last-child")?.remove();
      el.pauseBtn.appendChild(document.createTextNode(" 暫停"));
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

    // 檢查生命終暮 (壽命到期或健康耗盡)
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

  // 檢查是否觸發新章節或抉擇
  async function checkStoryProgression() {
    const life = state.currentLife;
    const timeline = life.storyTimeline;

    // 尋找符合當前年齡的章節
    const chapter = timeline.find(ch => ch.age === state.currentAge && state.currentSeasonIdx === 0);

    if (chapter && chapter.age > 0) {
      // 觸發新篇章：先暫停時鐘以保護閱讀，顯示載入遮罩
      setPauseState(true);
      showNovelLoading("AI 正在即時生成下一篇冒險篇章...", "正在結合你的生活重心與當前體魄，推演野性遭遇...");

      // 呼叫 AI 產生或精煉此篇章（傳送完整玩家資訊）
      const playerContext = {
        activeFocus: state.activeFocus,
        recentChoices: state.recentChoices,
        companionsAliveCount: state.companions.filter(c => c.isAlive).length,
        season: state.currentSeasonIdx
      };

      let aiChapter = null;
      try {
        aiChapter = await window.AiService.generateMilestoneChapter(
          life.species,
          life.name,
          state.currentAge,
          life.initialStats,
          life.biome,
          life.countryData,
          state.choicesMadeCount + 2,
          playerContext
        );
      } catch (err) {
        console.warn("AI 章節生成備援", err);
      }

      const activeChap = aiChapter || chapter;
      state.currentChapterTitle = activeChap.title;
      el.novelChapterTitle.textContent = activeChap.title;

      // 附加到小說並重新分頁
      state.fullNovelText += `\n\n【${activeChap.title}】\n${activeChap.narrative}`;
      rePaginateBook();

      hideNovelLoading();

      // 處理抉擇或平穩閱讀
      if (activeChap.choices && activeChap.choices.length > 0) {
        pauseGameForChoice(activeChap);
      } else {
        // 若啟用閱讀保護，保持暫停，讓讀者安心閱讀；否則短暫停留後自動前進
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

  // 抉擇暫停面板
  function pauseGameForChoice(chapter) {
    setPauseState(true);

    el.choiceContainer.style.display = "block";
    el.choiceButtonsGrid.innerHTML = "";

    chapter.choices.forEach(ch => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.innerHTML = `
        <span class="choice-btn-title">${ch.text}</span>
        <span class="choice-btn-impact"><i class="fas fa-sparkles"></i> 影響：${ch.impact}</span>
      `;

      btn.addEventListener("click", async () => {
        await executeChoice(chapter, ch);
      });

      el.choiceButtonsGrid.appendChild(btn);
    });

    saveGameState();
  }

  // 執行玩家抉擇
  async function executeChoice(chapter, choice) {
    state.choicesMadeCount++;
    state.recentChoices.push(choice.text);
    el.choiceContainer.style.display = "none";

    // 顯示抉擇後續生成載入中
    showNovelLoading("AI 正在以艾琳·杭特風格演繹你的抉擇後續...", "正在根據你的選擇計算生存張力與本能反饋...");

    // 套用數值變化（由 AI 控制）
    applyStatDeltas(choice.statChange);

    const playerContext = {
      activeFocus: state.activeFocus,
      stats: state.currentLife.initialStats
    };

    const followupText = await window.AiService.generateChoiceFollowup(
      state.currentLife.species,
      state.currentLife.name,
      choice.text,
      chapter,
      playerContext
    );

    state.fullNovelText += `\n\n【抉擇：${choice.text}】\n${followupText}`;
    rePaginateBook();

    hideNovelLoading();

    pushEventToFeed({
      ageLabel: `${state.currentAge} ${state.currentLife.species.unit}・抉擇`,
      type: "milestone",
      text: `作出命運抉擇：「${choice.text}」。${choice.impact}`
    });

    saveGameState();

    // 抉擇完成後，若閱讀保護啟用則讓使用者自己按繼續，或稍候 2.5 秒自動繼續
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
    li.innerHTML = `
      <div class="feed-meta">
        <span class="feed-age">${evt.ageLabel}</span>
        <span class="feed-type">${evt.isConsolidated ? '🌟 階段沉澱' : (evt.type === 'milestone' ? '⚡ 命運轉折' : '🌿 生態紀錄')}</span>
      </div>
      <div class="feed-text">${evt.text}</div>
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

    el.dashName.textContent = life.name;
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
        <span class="eco-v" style="font-size:11px;">${s.sensoryTraits.slice(0, 18)}...</span>
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

  // 4. 完整死亡小說流程（死時在書本中完整呈現過程，讀者看完才點擊前往追思館）
  async function triggerDeathProcess() {
    state.isGameOver = true;
    setPauseState(true);
    if (state.timerId) clearInterval(state.timerId);

    const life = state.currentLife;
    const s = life.species;

    // 顯示 AI 正在撰寫終章小說
    showNovelLoading("生命旅程已至終暮，AI 正在編織長眠小說篇章...", "正在以艾琳·杭特莊嚴筆觸，詳細描摹面對終局與歸宿的過程...");

    let deathPack = null;
    try {
      deathPack = await window.AiService.generateDeathChapter(
        s,
        life.name,
        state.currentAge,
        life.deathCause,
        life.biome,
        life.countryData,
        { choicesCount: state.choicesMadeCount, recentChoices: state.recentChoices }
      );
    } catch (e) {
      console.warn("死亡章節生成異常：", e);
    }

    if (!deathPack) {
      deathPack = {
        chapterTitle: s.isHuman ? "最終章 · 晚霞與最後的告別" : "最終章 · 星芒與永恆長眠",
        deathNarrative: s.isHuman
          ? `在${state.currentAge}歲這一年，因${life.deathCause}，病房的窗櫺外是夕陽溫暖的光芒。監護儀的波動漸漸舒緩，親人的手掌傳來熟悉的溫度。回顧這一生走過的坎坷與選擇，心跳漸漸放慢，如同一葉扁舟平穩駛入了無風的港灣，歸於久違的安息。`
          : `【面對${life.deathCause}的終局】刺骨的寒意侵入四肢，劇烈的喘息在冷空氣中化作白霧。視線中的古木與山稜逐漸模糊化為柔和的微光，骨骼間的劇痛奇蹟般地平復，取而代之的是如春日溪流般的寧靜。你緩緩伏下身軀，任由最後一口吐息融入狂風，靈魂奔向了群星與先祖的遼闊獵場。`,
        eulogy: s.isHuman
          ? `生命在文明的浪潮中劃下了休止符。你在這片大地上留下的足跡、親情與愛意，已經真實地溫暖過這個世界。安息吧，歸於星河。`
          : `風吹過荒原，帶走了最後一道足跡。你以無畏的野性與忠誠活過這僅有一次的荒野旅程。在星族的永恆獵場中，繼續自由奔跑吧。`
      };
    }

    state.eulogy = deathPack.eulogy;
    state.currentChapterTitle = deathPack.chapterTitle;
    el.novelChapterTitle.textContent = deathPack.chapterTitle;

    // 附加終章並重新分頁、自動翻到最後一頁
    state.fullNovelText += `\n\n【${deathPack.chapterTitle}】\n${deathPack.deathNarrative}`;
    rePaginateBook();

    hideNovelLoading();

    // 顯示書本頂部的死亡閱讀提示橫幅
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

    document.getElementById("memoCharTitle").textContent = `${titlePrefix} · ${life.name}`;
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

      // 還原狀態
      state.currentLife = data.life;
      state.currentAge = data.currentAge || 0;
      state.currentSeasonIdx = data.currentSeasonIdx || 0;
      state.isPaused = true; // 還原時預設暫停讓玩家安心確認
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
      state.currentChapterTitle = data.currentChapterTitle || "";
      state.feedEvents = data.feedEvents || [];
      state.eulogy = data.eulogy || "";
      state.isDeathNoticed = !!data.isDeathNoticed;
      state.isHorizontalReading = !!data.isHorizontalReading;

      // 切換視圖
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
        // 恢復 lifeview 視圖
        el.lifeSec.style.display = "block";
        if (state.isHorizontalReading) {
          el.novelBookCard.classList.add("reading-mode-horizontal");
          el.readingModeIcon.textContent = "☰";
          el.readingModeText.textContent = "切換直排";
        }

        renderCompanions();
        renderFocusChips();
        renderLifeGrid();
        renderSurvivalChart();
        updateDashboardUI();

        el.novelChapterTitle.textContent = state.currentChapterTitle || "荒野篇章";
        rePaginateBook(state.currentSpreadIndex);

        if (state.isDeathNoticed) {
          el.novelDeathNotice.style.display = "flex";
        }

        // 還原歷史事件流
        el.eventFeedList.innerHTML = "";
        (state.feedEvents || []).forEach(evt => {
          const li = document.createElement("li");
          li.className = `feed-item ${evt.type === 'milestone' || evt.isConsolidated ? 'milestone' : ''}`;
          li.innerHTML = `
            <div class="feed-meta">
              <span class="feed-age">${evt.ageLabel}</span>
              <span class="feed-type">${evt.isConsolidated ? '🌟 階段沉澱' : (evt.type === 'milestone' ? '⚡ 命運轉折' : '🌿 生態紀錄')}</span>
            </div>
            <div class="feed-text">${evt.text}</div>
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

  // 6. 音效與主題
  function toggleTheme() {
    const isDark = document.body.classList.toggle("theme-dark");
    document.getElementById("themeIcon").textContent = isDark ? "☼" : "◐";
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

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 視窗縮放自動重新分頁適應
  window.addEventListener("resize", () => {
    if (state.fullNovelText) {
      rePaginateBook(state.currentSpreadIndex);
    }
  });

  // 初始化啟動
  window.addEventListener("DOMContentLoaded", () => {
    initElements();
    bindEvents();
    startBirthTickers();

    // 嘗試從 localStorage 恢復存檔進度
    const hasRestored = loadGameState();
    if (!hasRestored) {
      el.introSec.style.display = "block";
    }
  });
})();
