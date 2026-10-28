/**
 * 十兆分之一 (1 in 10 Trillion) - 主應用邏輯與遊戲控制器
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
    ambientGain: null
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

    el.novelChapterTitle = document.getElementById("novelChapterTitle");
    el.novelBodyContent = document.getElementById("novelBodyContent");
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
      // 全球動物出生估算：每秒約數十萬
      const animalBirths = birthTickerCount * 142000 + Math.floor(Math.random() * 8000);
      // 人類出生：全球每秒約 4.3 人
      const humanBirths = Math.floor(birthTickerCount * 4.3);

      if (el.animalTicker) el.animalTicker.textContent = animalBirths.toLocaleString();
      if (el.humanTicker) el.humanTicker.textContent = humanBirths.toLocaleString();
    }, 1000);
  }

  // 綁定事件監聽
  function bindEvents() {
    // 物種池切換
    document.querySelectorAll("#speciesPoolGroup .seg-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#speciesPoolGroup .seg-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.selectedPool = btn.dataset.pool;
      });
    });

    // 步調切換
    document.querySelectorAll("#paceGroup .seg-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#paceGroup .seg-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.selectedPace = btn.dataset.pace;
      });
    });

    // 開始抽選
    el.startRollBtn.addEventListener("click", startRollingLife);
    el.reRollBtn.addEventListener("click", startRollingLife);
    el.beginLifeBtn.addEventListener("click", enterLifeDashboard);

    // 時間控制
    el.pauseBtn.addEventListener("click", togglePause);
    document.querySelectorAll(".sp-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".sp-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.speedMultiplier = parseInt(btn.dataset.sp, 10);
      });
    });
    el.nextChoiceBtn.addEventListener("click", fastForwardToNextChoice);

    // 主題與音效
    el.themeToggleBtn.addEventListener("click", toggleTheme);
    el.ambientSoundBtn.addEventListener("click", toggleAmbientSound);

    // 重新開始
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

    // 篩選物種池
    let candidates = window.SPECIES_DATABASE;
    if (state.selectedPool === "wild") {
      candidates = candidates.filter(s => !s.isHuman && s.category === "mammal");
    } else if (state.selectedPool === "marine") {
      candidates = candidates.filter(s => s.category === "marine" || s.category === "avian");
    } else if (state.selectedPool === "human") {
      candidates = candidates.filter(s => s.isHuman);
    }

    // 輪盤動態跳動效果
    let rollTicks = 0;
    const rollInterval = setInterval(() => {
      const rand = candidates[Math.floor(Math.random() * candidates.length)];
      el.rollerDisplay.textContent = rand.name;
      el.rollerBiome.textContent = rand.scientificName;
      rollTicks++;
    }, 80);

    // 決定最終物種
    let chosenSpecies = null;
    if (state.selectedPool === "human") {
      chosenSpecies = candidates.find(s => s.isHuman);
    } else if (state.selectedPool === "all") {
      // 真實機率加權：十兆生命中人類約 0.08%
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

    // AI 生成管道（頂部進度條同步）
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

  // 渲染出生登記證 (登溪/登記)
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

    // 填寫欄位資訊
    const grid = document.getElementById("certFieldsGrid");
    grid.innerHTML = "";

    if (s.isHuman) {
      // 人類特有屬性：國家、貨幣、GDP、吉尼係數
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
      // 野生動物屬性：生態系、幼體存活率、野生壽命、天敵
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

    // 艾琳·杭特小說序幕
    document.getElementById("certPrologueText").textContent = life.prologueNovel;
  }

  // 2. 進入主遊戲儀表板
  function enterLifeDashboard() {
    el.rollSec.style.display = "none";
    el.lifeSec.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 初始化狀態
    state.currentAge = 0;
    state.currentSeasonIdx = 0;
    state.isPaused = false;
    state.isGameOver = false;
    state.choicesMadeCount = 0;

    // 設置同刻出生的 4 位同伴
    generateCohortCompanions();

    // 設置重心選項
    renderFocusChips();

    // 渲染生命地圖
    renderLifeGrid();

    // 渲染生態存活圖表
    renderSurvivalChart();

    // 渲染生物身分卡與數值
    updateDashboardUI();

    // 啟動主模擬時鐘
    startSimulationLoop();
  }

  // 產生 4 位在同一秒誕生的十兆生靈夥伴
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

  // 設置當季重心選項
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

  // 渲染 10x10 生命地圖
  function renderLifeGrid() {
    const maxAge = state.currentLife.species.maxAge;
    el.lifeGridContainer.innerHTML = "";
    const totalCells = 100;

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.id = `gridCell_${i}`;
      if (i > maxAge) {
        cell.style.opacity = "0.2";
      }
      el.lifeGridContainer.appendChild(cell);
    }
  }

  function updateLifeGrid() {
    const current = state.currentAge;
    for (let i = 0; i <= 100; i++) {
      const cell = document.getElementById(`gridCell_${i}`);
      if (!cell) continue;
      cell.className = "grid-cell";
      if (i < current) {
        cell.classList.add("past");
      } else if (i === current) {
        cell.classList.add("current");
      }
    }
  }

  // 渲染存活率曲線 (SVG)
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

    // 步調間隔 (毫秒)
    const basePace = state.selectedPace === "fast" ? 900 : (state.selectedPace === "slow" ? 3000 : 1600);

    state.timerId = setInterval(() => {
      if (state.isPaused || state.isGameOver) return;
      advanceLifeOneStep();
    }, basePace / state.speedMultiplier);
  }

  // 推進一個季度/年份
  function advanceLifeOneStep() {
    const seasons = ["春之甦醒", "盛夏繁茂", "清秋收成", "凜冬考驗"];
    state.currentSeasonIdx = (state.currentSeasonIdx + 1) % 4;

    if (state.currentSeasonIdx === 0) {
      state.currentAge++;
    }

    const life = state.currentLife;
    const maxAge = life.maxPossibleAge;

    // 檢查生命終點
    if (state.currentAge >= maxAge && state.currentSeasonIdx === 0) {
      triggerDeath();
      return;
    }

    // 更新伴侶狀態
    state.companions.forEach(c => {
      if (c.isAlive && state.currentAge >= c.maxAge) {
        c.isAlive = false;
      }
    });
    renderCompanions();

    // 檢查是否觸發新章節或抉擇
    checkStoryProgression();

    // 觸發該年齡階段的 AI 潤色事件
    injectFeedEventsForCurrentAge();

    // 更新 UI 面板
    updateDashboardUI();
  }

  // 檢查小說故事章節與抉擇
  function checkStoryProgression() {
    const life = state.currentLife;
    const timeline = life.storyTimeline;

    // 尋找當前年齡對應的小說章節
    const chapter = timeline.find(ch => ch.age === state.currentAge && state.currentSeasonIdx === 0);

    if (chapter) {
      el.novelChapterTitle.textContent = chapter.title;
      el.novelBodyContent.textContent = chapter.narrative;

      if (chapter.choices && chapter.choices.length > 0) {
        // 進入半互動抉擇！暫停時間推進
        pauseGameForChoice(chapter);
      }
    }
  }

  // 暫停進入抉擇模式
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

  // 執行玩家抉擇
  async function executeChoice(chapter, choice) {
    state.choicesMadeCount++;
    el.choiceContainer.style.display = "none";

    // 應用數值修正
    applyStatDeltas(choice.statChange);

    // 嘗試透過 AI Service 或內建引擎獲取艾琳·杭特式後續段落
    const followupText = await window.AiService.expandChapterWithAi(chapter, choice, state.currentLife.species);

    // 在小說主文追加感官反應
    el.novelBodyContent.textContent += `\n\n【你的抉擇：${choice.text}】\n${followupText}`;

    // 在事件流添加紀錄
    pushEventToFeed({
      ageLabel: `${state.currentAge} ${state.currentLife.species.unit}・抉擇`,
      type: "milestone",
      text: `作出命運抉擇：「${choice.text}」。${choice.impact}`
    });

    // 恢復自動模擬
    setTimeout(() => {
      state.isPaused = false;
      el.pauseBtn.classList.add("active");
      el.pauseIcon.textContent = "❚❚";
    }, 1200);
  }

  // 應用數值變化
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

  // 注入 AI 剪輯潤色後的事件流 (Feed)
  function injectFeedEventsForCurrentAge() {
    const events = state.currentLife.events;
    const matching = events.filter(e => e.age === state.currentAge && state.currentSeasonIdx === 0);

    matching.forEach(evt => {
      pushEventToFeed(evt);
    });
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

  // 更新主儀表板介面
  function updateDashboardUI() {
    const life = state.currentLife;
    const s = life.species;
    const stats = life.initialStats;
    const maxAge = s.maxAge;

    // 頂部時鐘
    el.topAgeDisplay.innerHTML = `${state.currentAge} <small id="topAgeUnit">${s.unit}</small>`;
    const seasons = ["春之甦醒", "盛夏繁茂", "清秋收成", "凜冬考驗"];
    el.topSeasonBadge.textContent = seasons[state.currentSeasonIdx];

    const progressPct = Math.min(100, (state.currentAge / maxAge) * 100);
    el.topTimelineFill.style.width = progressPct + "%";

    // 身分卡
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

    // 狀態數值更新
    el.valHealth.textContent = `${stats.health}/100`;
    el.barHealth.style.width = stats.health + "%";

    el.valEnergy.textContent = `${stats.energy}/100`;
    el.barEnergy.style.width = stats.energy + "%";

    el.valInstinct.textContent = `${stats.instinct}/100`;
    el.barInstinct.style.width = Math.min(100, stats.instinct) + "%";

    el.valSocial.textContent = `${stats.social}/100`;
    el.barSocial.style.width = stats.social + "%";

    // 生命地圖與存活標記更新
    updateLifeGrid();
    updateSurvivalChartMarker();

    // 填充生態背景數據卡
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

  // 時間暫停切換
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

  // 快轉到下一個抉擇
  function fastForwardToNextChoice() {
    if (state.isGameOver) return;
    state.speedMultiplier = 8;
    document.querySelectorAll(".sp-btn").forEach(b => b.classList.remove("active"));
    const sp8 = document.querySelector('.sp-btn[data-sp="8"]');
    if (sp8) sp8.classList.add("active");
    startSimulationLoop();
  }

  // 4. 生命終點與荒野追思館
  function triggerDeath() {
    state.isGameOver = true;
    if (state.timerId) clearInterval(state.timerId);

    const life = state.currentLife;
    const s = life.species;

    el.lifeSec.style.display = "none";
    el.deadSec.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 授予荒野封號
    let titlePrefix = "荒野的行者";
    if (s.isHuman) titlePrefix = "文明的追尋者";
    else if (state.currentAge > s.avgAgeWild * 1.2) titlePrefix = "古老傳奇守護者";
    else if (state.choicesMadeCount >= 3) titlePrefix = "不屈的先鋒戰士";

    document.getElementById("memoCharTitle").textContent = `${titlePrefix} · ${life.name}`;
    document.getElementById("memoLifespan").textContent = `享年 ${state.currentAge} ${s.unit} (${s.isHuman ? life.countryData.name : life.biome.name})`;
    document.getElementById("memoDeathCause").textContent = life.deathCause;
    document.getElementById("memoPercentile").textContent = `${life.survivalPercentile}% 的同族生靈`;
    document.getElementById("memoChoicesCount").textContent = `${state.choicesMadeCount} 次關鍵抉擇`;

    // 艾琳·杭特悼念詞
    const eulogy = s.isHuman
      ? `漫長的人生像一艘靠岸的航船。在${life.countryData.name}，你走過了歡笑、疲憊、抉擇與堅持。\n生命或許只是十兆分之一的微小存在，但你在這片大地上留下的足跡、愛意與記憶，已經真實地溫暖過這個世界。安息吧，回到寧靜的星空。`
      : `【半馬賽克終曲】寒風吹過粗糙的被毛，四肢沉重如灌滿了鉛。耳畔迴盪著爪尖踩碎枯枝的微弱脆響，伴隨骨骼深處傳來的久遠疲憊。\n疼痛正奇蹟般地退去，只剩下一股如春日陽光般的暖意悄然蔓延——你緩緩合上雙眼，靈魂如奔向繁星的輕風，回歸荒野的古老懷抱。奔跑吧，在永恆無垠的獵場中。`;

    document.getElementById("memoEulogyText").textContent = eulogy;
  }

  // 主題切換 (明亮羊皮紙 / 暗黑荒野)
  function toggleTheme() {
    const isDark = document.body.classList.toggle("theme-dark");
    document.getElementById("themeIcon").textContent = isDark ? "☼" : "◐";
  }

  // Web Audio API 合成荒野氛圍音效 (免外部音訊檔案，高可用)
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
    // 產生溫和白噪音 (模擬林間風聲與溪流)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // 低通濾波器模擬遠處微風
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

  // 啟動入口
  window.addEventListener("DOMContentLoaded", () => {
    initElements();
    bindEvents();
    startBirthTickers();
  });
})();
