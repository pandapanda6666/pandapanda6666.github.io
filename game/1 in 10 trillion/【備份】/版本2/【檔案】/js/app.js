/**
 * 十兆分之一 (1 in 10 Trillion) - 主應用邏輯與遊戲控制器
 * 支援雙頁直書右翻小說、分頁導航、生成中載入遮罩門閘
 */

(function () {
  "use strict";

  // 全域遊戲狀態
  const state = {
    selectedPool: "all",
    selectedPace: "normal", // fast, normal, slow
    currentLife: null,
    currentAge: 0,
    currentSeasonIdx: 0,
    isPaused: true,
    isGameOver: false,
    speedMultiplier: 2,
    timerId: null,
    companions: [],
    choicesMadeCount: 0,
    activeFocus: "hunt",
    soundEnabled: false,
    audioCtx: null,
    ambientGain: null,

    // 雙頁直書小說狀態
    bookPages: [],          // 所有已解鎖的小說頁面文字數組
    currentSpreadIndex: 0,  // 當前展開之右頁索引 (0, 2, 4...)
    fullNovelText: ""       // 完整累積小說純文字
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
    el.novelChapterTitle = document.getElementById("novelChapterTitle");
    el.prevPageBtn = document.getElementById("prevPageBtn");
    el.nextPageBtn = document.getElementById("nextPageBtn");
    el.bookPageIndicator = document.getElementById("bookPageIndicator");
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
    document.querySelectorAll("#speciesPoolGroup .seg-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#speciesPoolGroup .seg-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.selectedPool = btn.dataset.pool;
      });
    });

    document.querySelectorAll("#paceGroup .seg-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#paceGroup .seg-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.selectedPace = btn.dataset.pace;
      });
    });

    el.startRollBtn.addEventListener("click", startRollingLife);
    el.reRollBtn.addEventListener("click", startRollingLife);
    el.beginLifeBtn.addEventListener("click", enterLifeDashboard);

    el.pauseBtn.addEventListener("click", togglePause);
    document.querySelectorAll(".sp-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".sp-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.speedMultiplier = parseInt(btn.dataset.sp, 10);
      });
    });
    el.nextChoiceBtn.addEventListener("click", fastForwardToNextChoice);

    // 書本翻頁按鈕 (右翻直書：往前翻看較早段落，往後翻看後續情節)
    el.prevPageBtn.addEventListener("click", turnPagePrev);
    el.nextPageBtn.addEventListener("click", turnPageNext);

    el.themeToggleBtn.addEventListener("click", toggleTheme);
    el.ambientSoundBtn.addEventListener("click", toggleAmbientSound);

    el.restartGameBtn.addEventListener("click", () => {
      el.deadSec.style.display = "none";
      el.introSec.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 1. 命運輪盤與出生登記
  async function startRollingLife() {
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
    }, 80);

    let chosenSpecies = null;
    if (state.selectedPool === "human") {
      chosenSpecies = candidates.find(s => s.isHuman);
    } else if (state.selectedPool === "all") {
      const rollVal = Math.random();
      if (rollVal < 0.02) {
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
    }, 600);
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
          <span class="cf-val">${(s.infantSurvivalRate * 100).toFixed(1)}% (極端生存篩選)</span>
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
    state.bookPages = [];
    state.currentSpreadIndex = 0;
    state.fullNovelText = "";

    // 啟動載入遮罩：生成第一頁小說中，時鐘暫停
    showNovelLoading("艾琳·杭特 AI 正在構思開篇生靈小說...", "正在編織第一頁小說與野性直覺。生成完成前生命時鐘保持暫停中，請稍候...");

    // 設置同伴、重心、地圖與存活曲線
    generateCohortCompanions();
    renderFocusChips();
    renderLifeGrid();
    renderSurvivalChart();
    updateDashboardUI();

    // 模擬 AI 生成第一頁小說並進行直書分頁 (至少保證 800ms 讓載入過渡平滑且確實)
    await delay(850);

    // 載入第一章
    const firstChapter = state.currentLife.storyTimeline[0];
    if (firstChapter) {
      el.novelChapterTitle.textContent = firstChapter.title;
      state.fullNovelText = firstChapter.narrative;
      rePaginateBook();
    }

    // 第一頁生成完成！收起載入中遮罩，開放遊戲開始
    hideNovelLoading();

    // 解除暫停並啟動生命推進時鐘
    state.isPaused = false;
    el.pauseBtn.classList.add("active");
    el.pauseIcon.textContent = "❚❚";
    startSimulationLoop();
  }

  // 雙頁直書分頁系統 (Paginator)
  // 將連續小說文字拆分為每頁約 130～160 字之直書版面
  function rePaginateBook(targetSpread = null) {
    const text = state.fullNovelText || "";
    if (!text.trim()) {
      state.bookPages = [""];
      renderBookSpread();
      return;
    }

    const pages = [];
    const PAGE_CHAR_LIMIT = 145; // 直書單頁最佳字數
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

    // 若未指定展開頁，預設翻到最新章節頁面
    if (targetSpread !== null) {
      state.currentSpreadIndex = targetSpread;
    } else {
      // 翻到最後兩頁
      const lastIndex = Math.max(0, pages.length - (pages.length % 2 === 0 ? 2 : 1));
      state.currentSpreadIndex = Math.floor(lastIndex / 2) * 2;
    }

    renderBookSpread();
  }

  // 渲染雙頁面 (右頁 + 左頁，直式，右到左)
  function renderBookSpread() {
    const total = state.bookPages.length;
    const rIdx = state.currentSpreadIndex;     // 右頁索引 (順位在前)
    const lIdx = state.currentSpreadIndex + 1; // 左頁索引 (順位在後)

    const rText = state.bookPages[rIdx] || "";
    const lText = state.bookPages[lIdx] || "";

    el.pageContentRight.textContent = rText;
    el.pageContentLeft.textContent = lText;

    // 漢字頁碼 (壹, 貳, 參...)
    const numToChinese = ["壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖", "拾", "拾壹", "拾貳", "拾參", "拾肆", "拾伍", "拾陸"];
    el.pageNumRight.textContent = numToChinese[rIdx] || `${rIdx + 1}`;
    el.pageNumLeft.textContent = lText ? (numToChinese[lIdx] || `${lIdx + 1}`) : "";

    // 頁碼導航指示器
    el.bookPageIndicator.textContent = `第 ${rIdx + 1}–${Math.min(lIdx + 1, Math.max(1, total))} 頁 / 共 ${Math.max(1, total)} 頁`;

    // 翻頁按鈕狀態 (右翻直書：往前翻按鈕若在第 0 頁則停用；往後翻若在末頁則停用)
    el.prevPageBtn.disabled = (rIdx <= 0);
    el.nextPageBtn.disabled = (rIdx + 2 >= total);
  }

  // 往前翻頁 (查看較早篇章)
  function turnPagePrev() {
    if (state.currentSpreadIndex > 0) {
      state.currentSpreadIndex = Math.max(0, state.currentSpreadIndex - 2);
      renderBookSpread();
    }
  }

  // 往後翻頁 (接續閱讀情節)
  function turnPageNext() {
    if (state.currentSpreadIndex + 2 < state.bookPages.length) {
      state.currentSpreadIndex = state.currentSpreadIndex + 2;
      renderBookSpread();
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
    chips.forEach((c, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `chip ${idx === 0 ? "active" : ""}`;
      btn.textContent = c.label;
      btn.addEventListener("click", () => {
        document.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.activeFocus = c.id;
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

  // 3. 主循環模擬引擎
  function startSimulationLoop() {
    if (state.timerId) clearInterval(state.timerId);
    const basePace = state.selectedPace === "fast" ? 900 : (state.selectedPace === "slow" ? 3000 : 1600);

    state.timerId = setInterval(() => {
      if (state.isPaused || state.isGameOver) return;
      advanceLifeOneStep();
    }, basePace / state.speedMultiplier);
  }

  async function advanceLifeOneStep() {
    const seasons = ["春之甦醒", "盛夏繁茂", "清秋收成", "凜冬考驗"];
    state.currentSeasonIdx = (state.currentSeasonIdx + 1) % 4;

    if (state.currentSeasonIdx === 0) {
      state.currentAge++;
    }

    const life = state.currentLife;
    const maxAge = life.maxPossibleAge;

    if (state.currentAge >= maxAge && state.currentSeasonIdx === 0) {
      triggerDeath();
      return;
    }

    state.companions.forEach(c => {
      if (c.isAlive && state.currentAge >= c.maxAge) {
        c.isAlive = false;
      }
    });
    renderCompanions();

    // 檢查小說故事章節推進
    await checkStoryProgression();

    injectFeedEventsForCurrentAge();
    updateDashboardUI();
  }

  async function checkStoryProgression() {
    const life = state.currentLife;
    const timeline = life.storyTimeline;

    const chapter = timeline.find(ch => ch.age === state.currentAge && state.currentSeasonIdx === 0);

    if (chapter) {
      // 觸發新篇章時，先暫停並顯示載入中
      state.isPaused = true;
      el.pauseBtn.classList.remove("active");
      el.pauseIcon.textContent = "▶";
      showNovelLoading("AI 正在撰寫接續章節中...", "正在演算野性情節與生命抉擇，載入中請稍候...");

      await delay(600);

      el.novelChapterTitle.textContent = chapter.title;
      state.fullNovelText += `\n\n【${chapter.title}】\n${chapter.narrative}`;
      rePaginateBook();

      hideNovelLoading();

      if (chapter.choices && chapter.choices.length > 0) {
        pauseGameForChoice(chapter);
      } else {
        // 非抉擇篇章，短暫停留後繼續推進
        setTimeout(() => {
          if (!state.isGameOver) {
            state.isPaused = false;
            el.pauseBtn.classList.add("active");
            el.pauseIcon.textContent = "❚❚";
          }
        }, 1200);
      }
    }
  }

  function pauseGameForChoice(chapter) {
    state.isPaused = true;
    el.pauseBtn.classList.remove("active");
    el.pauseIcon.textContent = "▶";

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
  }

  async function executeChoice(chapter, choice) {
    state.choicesMadeCount++;
    el.choiceContainer.style.display = "none";

    // 顯示抉擇後續生成載入中
    showNovelLoading("AI 正在以艾琳·杭特風格延續抉擇後續...", "正在根據你的選擇計算生存張力與本能反饋...");

    applyStatDeltas(choice.statChange);

    const followupText = await window.AiService.expandChapterWithAi(chapter, choice, state.currentLife.species);

    state.fullNovelText += `\n\n【你的抉擇：${choice.text}】\n${followupText}`;
    rePaginateBook();

    await delay(500);
    hideNovelLoading();

    pushEventToFeed({
      ageLabel: `${state.currentAge} ${state.currentLife.species.unit}・抉擇`,
      type: "milestone",
      text: `作出命運抉擇：「${choice.text}」。${choice.impact}`
    });

    setTimeout(() => {
      if (!state.isGameOver) {
        state.isPaused = false;
        el.pauseBtn.classList.add("active");
        el.pauseIcon.textContent = "❚❚";
      }
    }, 1200);
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

  function togglePause() {
    state.isPaused = !state.isPaused;
    if (state.isPaused) {
      el.pauseBtn.classList.remove("active");
      el.pauseIcon.textContent = "▶";
    } else {
      el.pauseBtn.classList.add("active");
      el.pauseIcon.textContent = "❚❚";
    }
  }

  function fastForwardToNextChoice() {
    if (state.isGameOver) return;
    state.speedMultiplier = 8;
    document.querySelectorAll(".sp-btn").forEach(b => b.classList.remove("active"));
    const sp8 = document.querySelector('.sp-btn[data-sp="8"]');
    if (sp8) sp8.classList.add("active");
    startSimulationLoop();
  }

  function triggerDeath() {
    state.isGameOver = true;
    if (state.timerId) clearInterval(state.timerId);

    const life = state.currentLife;
    const s = life.species;

    el.lifeSec.style.display = "none";
    el.deadSec.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });

    let titlePrefix = "荒野的行者";
    if (s.isHuman) titlePrefix = "文明的追尋者";
    else if (state.currentAge > s.avgAgeWild * 1.2) titlePrefix = "古老傳奇守護者";
    else if (state.choicesMadeCount >= 3) titlePrefix = "不屈的先鋒戰士";

    document.getElementById("memoCharTitle").textContent = `${titlePrefix} · ${life.name}`;
    document.getElementById("memoLifespan").textContent = `享年 ${state.currentAge} ${s.unit} (${s.isHuman ? life.countryData.name : life.biome.name})`;
    document.getElementById("memoDeathCause").textContent = life.deathCause;
    document.getElementById("memoPercentile").textContent = `${life.survivalPercentile}% 的同族生靈`;
    document.getElementById("memoChoicesCount").textContent = `${state.choicesMadeCount} 次關鍵抉擇`;

    const eulogy = s.isHuman
      ? `漫長的人生像一艘靠岸的航船。在${life.countryData.name}，你走過了歡笑、疲憊、抉擇與堅持。\n生命或許只是十兆分之一的微小存在，但你在這片大地上留下的足跡、愛意與記憶，已經真實地溫暖過這個世界。安息吧，回到寧靜的星空。`
      : `寒風吹過粗糙的被毛，四肢沉重如灌滿了鉛。耳畔迴盪著爪尖踩碎枯枝的微弱脆響，伴隨骨骼深處傳來的久遠疲憊。\n疼痛正奇蹟般地退去，只剩下一股如春日陽光般的暖意悄然蔓延——你緩緩合上雙眼，靈魂如奔向繁星的輕風，回歸荒野的古老懷抱。奔跑吧，在永恆無垠的獵場中。`;

    document.getElementById("memoEulogyText").textContent = eulogy;
  }

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

  window.addEventListener("DOMContentLoaded", () => {
    initElements();
    bindEvents();
    startBirthTickers();
  });
})();
