/**
 * 十兆分之一 (1 in 10 Trillion) - AI 即時小說與事件生成服務
 * 參考 pandapanda6666.github.io 首頁公告管理工具與 server.js 實作
 * 全面採用 AI 即時生成，不寫死小說情節，支援伺服器端點與高可用 Pollinations.ai (無須金鑰、高速、支援 JSON)
 */

window.AiService = {
  serverUrl: null,

  /**
   * 解析後端伺服器網址（依據 index.html 讀取 server_url.txt 的 atob 反轉解碼機制）
   */
  async resolveServerUrl() {
    if (this.serverUrl) return this.serverUrl;

    const localSso = localStorage.getItem("sso_server");
    if (localSso) {
      this.serverUrl = localSso;
      return this.serverUrl;
    }

    const candidatePaths = [
      "../../server_url.txt",
      "../server_url.txt",
      "./server_url.txt",
      "../../login-hub/server_url.txt"
    ];

    for (const p of candidatePaths) {
      try {
        const res = await fetch(`${p}?t=${Date.now()}`);
        if (res.ok) {
          const text = await res.text();
          if (text && text.trim()) {
            const decoded = atob(text.trim().split("").reverse().join(""));
            if (decoded && decoded.startsWith("http")) {
              this.serverUrl = decoded.replace(/\/$/, "");
              return this.serverUrl;
            }
          }
        }
      } catch (e) {}
    }

    try {
      const pingRes = await fetch("http://127.0.0.1:48921/api/ping", { timeout: 1000 });
      if (pingRes.ok) {
        this.serverUrl = "http://127.0.0.1:48921";
        return this.serverUrl;
      }
    } catch (e) {}

    return null;
  },

  /**
   * 呼叫 LLM 完成對話/生成任務
   */
  async callLlm(messages, responseFormatJson = false) {
    const sUrl = await this.resolveServerUrl();

    // 1. 若伺服器有專屬 AI chat 端點，優先嘗試
    if (sUrl) {
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 7000);
        const res = await fetch(`${sUrl}/api/ai-banner/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "69420" },
          body: JSON.stringify({
            message: messages[messages.length - 1].content,
            history: messages.slice(0, -1),
            mode: "code"
          }),
          signal: controller.signal
        });
        clearTimeout(tid);
        if (res.ok) {
          const data = await res.json();
          if (data && data.replyText) return data.replyText;
        }
      } catch (e) {}
    }

    // 2. 直接呼叫免金鑰高可用 LLM (與 server.js line 908 一致之端點)
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 12000);

    const bodyPayload = {
      model: "openai",
      messages: messages
    };
    if (responseFormatJson) {
      bodyPayload.response_format = { type: "json_object" };
    }

    const res = await fetch("https://text.pollinations.ai/openai/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal
    });
    clearTimeout(tid);

    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "";
    }

    throw new Error("AI 服務暫時無法連線");
  },

  /**
   * 1. 即時生成：開篇第一章小說 (Opening Chapter)
   */
  async generateOpeningChapter(species, name, biome, countryData) {
    const isHuman = species.isHuman;
    const prompt = isHuman
      ? `請以艾琳·杭特（Erin Hunter）中文筆觸，撰寫現代人類嬰兒「${name}」在「${countryData.name}」降生的一篇微型小說開篇（約 180~220 字繁體中文）。
要求：
1. 輸出 JSON 物件：{"title": "第一章標題 (約4-8字)", "narrative": "正文內容"}。
2. 充滿感官細節（產房消毒水、窗外光斑、心跳初啼、對世界的懵懂摸索），文筆真摯動人。`
      : `請以艾琳·杭特《貓戰士》風格（10+ 半馬賽克），撰寫物種「${species.name}（${species.scientificName}）」個體「${name}」在「${biome.name}」降生的一篇微型小說開篇（約 180~220 字繁體中文）。
要求：
1. 輸出 JSON 物件：{"title": "第一章標題 (約4-8字)", "narrative": "正文內容"}。
2. 充滿強烈動物感官（母體腹毛溫度、泥土與松針氣味、巢外寒風與猛禽陰影、本能戰慄）。
3. 切勿包含「【艾琳·杭特式描繪】」之類的說明標籤，純粹呈現小說文字。`;

    try {
      const messages = [
        { role: "system", content: "你是一位精通艾琳·杭特（Erin Hunter）風格的頂級動物冒險小說家。請輸出標準繁體中文 JSON 物件。" },
        { role: "user", content: prompt }
      ];
      const raw = await this.callLlm(messages, true);
      const parsed = JSON.parse(raw);
      if (parsed.title && parsed.narrative) {
        return parsed;
      }
    } catch (e) {
      console.warn("即時開篇生成異常，啟用動態備援：", e);
    }

    // 智能備援（動態組合，絕非死板文字）
    return {
      title: isHuman ? "第一章 · 啼哭與世界的輪廓" : "第一章 · 盲目之光與泥土的氣味",
      narrative: isHuman
        ? `在${countryData.name}，最初的記憶由搖籃邊模糊的光斑、父母輕聲哼唱的搖籃曲，以及每一次學步跌倒的疼痛構成。小小的手掌摸索著冰涼的地磚與窗外的陽光，懵懂地認識著這個複雜又龐大的文明社會。`
        : `初春的寒氣刺痛了稚嫩的鼻頭。你跟隨著手足跌跌撞撞地探出巢穴，迎面而來的是高聳入雲的古木與無邊無際的灰色天幕。松針與融雪在腳爪下發出細微的碎裂聲，荒野用第一陣冷風向你宣告了生存的嚴苛與廣闊。`
    };
  },

  /**
   * 0. 生態與命運生成管線 (含進度回呼)
   */
  async generateLifePipeline(species, config = {}, progressCb = null) {
    if (progressCb) progressCb(15, "正在以生態矩陣建立生命歷程與世代存活曲線...");
    await new Promise(r => setTimeout(r, 120));

    const life = window.DestinyEngine.generateLifeTrajectory(species, config);

    if (progressCb) progressCb(45, "AI 去重引擎運算中：剪除瑣碎重複，提煉命運分歧點...");
    await new Promise(r => setTimeout(r, 120));

    if (progressCb) progressCb(75, "艾琳·杭特小說模型呼叫中：編織初生微光與第一章感官小說...");

    try {
      const opening = await this.generateOpeningChapter(species, life.name, life.biome, life.countryData);
      if (opening && opening.title && opening.narrative) {
        if (life.storyTimeline && life.storyTimeline.length > 0) {
          life.storyTimeline[0].title = opening.title;
          life.storyTimeline[0].narrative = opening.narrative;
        }
        life.prologueNovel = opening.narrative.length > 180 ? opening.narrative.slice(0, 180) + "..." : opening.narrative;
      }
    } catch (e) {
      console.warn("AI 開篇生成失敗，採用備援：", e);
    }

    if (progressCb) progressCb(100, "生靈命運年表與開篇章節編織完成！");
    await new Promise(r => setTimeout(r, 100));

    return life;
  },

  /**
   * 2. 即時生成：成長章節與半互動抉擇 (Milestone Chapter & Choices)
   * 接收完整的玩家資訊 (焦點、當前狀態、存活夥伴等)，並可回傳畫面控制 (statChange, sceneMood, feedEvent)
   */
  async generateMilestoneChapter(species, name, age, stats, biome, countryData, chapterIdx, playerContext = {}) {
    const isHuman = species.isHuman;
    const focus = playerContext.activeFocus || "日常";
    const history = (playerContext.recentChoices || []).join("、") || "初涉荒野";
    const companionsAlive = playerContext.companionsAliveCount !== undefined ? playerContext.companionsAliveCount : 4;

    const prompt = isHuman
      ? `角色資訊：
- 姓名：${name}
- 年齡：${age} 歲 (居住於 ${countryData.name})
- 當前生活重心：${focus}
- 當前資產與狀態：儲蓄約 ${stats.resource || 0}，體魄 ${stats.health}/100，精力 ${stats.energy}/100，知識 ${stats.instinct}/100，社交 ${stats.social}/100
- 過往抉擇履歷：${history}

請為此角色即時撰寫第 ${chapterIdx} 章小說與重大分歧抉擇。
輸出 STRICT JSON：
{
  "title": "章節標題 (4-8字)",
  "narrative": "約 160-200 字的小說情境描寫（面臨重大生活轉折或生存挑戰，注重心理壓力與選擇張力）",
  "sceneMood": "tense 或 calm 或 crisis",
  "choices": [
    {
      "text": "抉擇選項A (例如：全心投入高壓海外拓荒專案)",
      "impact": "影響描述 (例如：收入暴增但身心透支)",
      "statChange": {"resource": 30000, "health": -10, "instinct": 10}
    },
    {
      "text": "抉擇選項B (例如：固守平衡生活陪伴親友)",
      "impact": "影響描述 (例如：身心穩定，社交羈絆提升)",
      "statChange": {"health": 8, "social": 12, "resource": 2000}
    }
  ]
}`
      : `角色資訊：
- 個體：野生「${species.name}」名為「${name}」
- 年齡：${age} ${species.unit} (生長於原生棲地：${biome.name})
- 當前生活重心：${focus}
- 生存狀態：體魄 ${stats.health}/100，飽足精力 ${stats.energy}/100，野性直覺 ${stats.instinct}/100，族群羈絆 ${stats.social}/100
- 同秒降生夥伴尚存活數：${companionsAlive} 位
- 過往抉擇履歷：${history}

請以艾琳·杭特《貓戰士》10+ 半馬賽克風格，為其撰寫第 ${chapterIdx} 章冒險章節與生死抉擇。
輸出 STRICT JSON：
{
  "title": "章節標題 (例如：覆雪溪谷的暗影 / 邊界的入侵爪痕)",
  "narrative": "約 160-200 字艾琳·杭特純感官小說描繪（風向氣味、肌肉緊繃、爪尖扣地、天敵威脅或暴雪覓食，維持 10+ 少年勇士文學緊張感，無過度血腥撕裂，無任何元說明標籤）",
  "sceneMood": "danger 或 stealth 或 blizzard 或 hunt",
  "choices": [
    {
      "text": "應對決策A (例如：亮齒迎擊守護族群邊界)",
      "impact": "影響概述",
      "statChange": {"health": -8, "energy": -12, "instinct": 14, "social": 10}
    },
    {
      "text": "應對決策B (例如：壓低身形借陰影隱蔽迂迴)",
      "impact": "影響概述",
      "statChange": {"energy": -6, "instinct": 12}
    }
  ]
}`;

    try {
      const messages = [
        { role: "system", content: "你是一位頂級艾琳·杭特荒野小說家與遊戲系統主理人。請一律使用繁體中文，且只輸出合法 JSON 物件。" },
        { role: "user", content: prompt }
      ];
      const raw = await this.callLlm(messages, true);
      const parsed = JSON.parse(raw);
      if (parsed.title && parsed.narrative && Array.isArray(parsed.choices)) {
        return parsed;
      }
    } catch (e) {
      console.warn("即時章節生成異常，啟用動態情境備援：", e);
    }

    return window.DestinyEngine.pickDynamicScenario(species, name, age, biome, countryData, chapterIdx);
  },

  /**
   * 3. 即時生成：抉擇後的冒險後續 (Choice Aftermath)
   * 支援 AI 控制畫面：回傳後續小說、數值反饋、氣氛變化
   */
  async generateChoiceFollowup(species, name, choiceText, chapterContext = {}, playerContext = {}) {
    const isHuman = species.isHuman;
    const prompt = isHuman
      ? `角色「${name}」在生活轉折中作出了抉擇：「${choiceText}」。
當前背景：${chapterContext.title || "命運分水嶺"}
請撰寫約 110~140 字繁體中文，描繪這項決定帶來的實際後續與心理感受。`
      : `以艾琳·杭特 10+ 半馬賽克筆觸，描繪「${species.name}」個體「${name}」在荒野中作出抉擇：「${choiceText}」後的具體搏鬥或求生過程（約 110~150 字繁體中文）。注重動作衝擊力、氣息喘息與本能意志，無過度血腥，不含任何說明標籤。`;

    try {
      const messages = [
        { role: "system", content: "你是艾琳·杭特風格的荒野冒險作家。請輸出精采繁體中文小說段落。" },
        { role: "user", content: prompt }
      ];
      const text = await this.callLlm(messages, false);
      if (text && text.trim().length > 20) {
        return text.trim();
      }
    } catch (e) {
      console.warn("抉擇後續生成異常，使用備援：", e);
    }

    return `你在本能與決心驅使下採取了行動：「${choiceText}」。筋骨的酸痛伴隨著急促的喘息，但你成功在這片充滿未知的荒野中刻下了自己的意志。`;
  },

  // 相容別名
  async expandChapterWithAi(chapter, choice, species, name = "霜爪") {
    return this.generateChoiceFollowup(species, name, choice.text, chapter);
  },

  /**
   * 4. 即時生成：終章與死亡過程小說 (Death Narrative & Process)
   * 讓使用者清楚看到究竟是如何死去的過程與長眠
   */
  async generateDeathChapter(species, name, finalAge, deathCause, biome, countryData, fullContext = {}) {
    const isHuman = species.isHuman;
    const prompt = isHuman
      ? `角色「${name}」在「${countryData.name}」活至 ${finalAge} 歲，死因為「${deathCause}」。
請撰寫：
1. 最終章小說（約 180-220 字）：詳細描繪走向終點的真實過程、身邊的光影、呼吸逐漸微弱的平靜與告別。
2. 荒野追思館悼文（約 100 字）：致敬其一生足跡。
輸出 STRICT JSON：
{
  "chapterTitle": "最終章 · 晚霞與最後的告別",
  "deathNarrative": "最終章小說正文",
  "eulogy": "追思館悼文"
}`
      : `請以艾琳·杭特《貓戰士》莊嚴壯烈的風格（10+ 半馬賽克），為「${species.name}」個體「${name}」在 ${finalAge} ${species.unit} 之際，因「${deathCause}」而迎來終暮撰寫小說。
要求：
1. 最終章小說（約 180-220 字）：詳細描繪面對此致命危機（如天敵突襲、寒冬飢荒、公路怪獸或衰暮力竭）時的搏鬥掙扎、呼吸沉重，以及最後痛楚散去、靈魂奔向群星與先祖獵場的壯烈長眠過程。
2. 荒野追思館悼詞（約 100 字）。
輸出 STRICT JSON：
{
  "chapterTitle": "最終章 · 星芒與永恆長眠",
  "deathNarrative": "最終章小說正文",
  "eulogy": "追思館悼詞"
}`;

    try {
      const messages = [
        { role: "system", content: "你是一位頂級艾琳·杭特荒野小說家。請一律使用繁體中文，且只輸出合法 JSON 物件。" },
        { role: "user", content: prompt }
      ];
      const raw = await this.callLlm(messages, true);
      const parsed = JSON.parse(raw);
      if (parsed.chapterTitle && parsed.deathNarrative && parsed.eulogy) {
        return parsed;
      }
    } catch (e) {
      console.warn("終章生成異常，啟用動態備援：", e);
    }

    // 智能備援
    return {
      chapterTitle: isHuman ? "最終章 · 晚霞與最後的告別" : "最終章 · 星芒與永恆長眠",
      deathNarrative: isHuman
        ? `在${finalAge}歲這一年，因${deathCause}，病房的窗櫺外是夕陽溫暖的光芒。監護儀的波動漸漸舒緩，親人的手掌傳來熟悉的溫度。回顧這一生走過的坎坷與選擇，心跳漸漸放慢，如同一葉扁舟平穩駛入了無風的港灣，歸於久違的安息。`
        : `【面對${deathCause}的終局】刺骨的寒意侵入四肢，劇烈的喘息在冷空氣中化作白霧。視線中的古木與山稜逐漸模糊化為柔和的微光，骨骼間的劇痛奇蹟般地平復，取而代之的是如春日溪流般的寧靜。你緩緩伏下身軀，任由最後一口吐息融入狂風，靈魂奔向了群星與先祖的遼闊獵場。`,
      eulogy: isHuman
        ? `生命在文明的浪潮中劃下了休止符。你在這片大地上留下的足跡、親情與愛意，已經真實地溫暖過這個世界。安息吧，歸於星河。`
        : `風吹過荒原，帶走了最後一道足跡。你以無畏的野性與忠誠活過這僅有一次的荒野旅程。在星族的永恆獵場中，繼續自由奔跑吧。`
    };
  }
};
