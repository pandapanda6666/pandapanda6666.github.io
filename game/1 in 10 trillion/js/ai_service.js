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

    // 1. 若伺服器在線，優先嘗試本機端點 (設定 1200ms 極速 ping 檢驗，避免卡頓)
    if (sUrl) {
      try {
        const pingCtrl = new AbortController();
        const pTid = setTimeout(() => pingCtrl.abort(), 1200);
        const pingRes = await fetch(`${sUrl}/api/ping`, { signal: pingCtrl.signal });
        clearTimeout(pTid);

        if (pingRes.ok) {
          const controller = new AbortController();
          const tid = setTimeout(() => controller.abort(), 8000);
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
        }
      } catch (e) {}
    }

    // 2. 直接呼叫免金鑰高速 LLM (採用極速且穩定的 openai-fast 模型，支援 JSON)
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 22000);

    const bodyPayload = {
      model: "openai-fast",
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

  formatChapterTitle(index) {
    const chNums = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十",
                    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
                    "二十一", "二十二", "二十三", "二十四", "二十五", "二十六", "二十七", "二十八", "二十九", "三十"];
    return "第" + (chNums[index] || index) + "章";
  },

  getAuthorDirective(author = "erinhunter") {
    if (typeof author === "object" && author.name) {
      return `請參照作家「${author.name}」的經典文學筆觸與哲思世界觀，深刻刻畫生靈的命運波瀾。`;
    }
    if (author === "shenshixi") {
      return `請以中國動物小說大王「沈石溪」風格撰寫：注重殘酷自然的生存法則與深邃的個體心理剖析，展現生命的高貴、掙扎、權力角逐與自主意志抉擇，充滿哲理與命運張力。`;
    }
    // 預設 erinhunter
    return `請以「艾琳·杭特（Erin Hunter）」經典風格撰寫：10+ 半馬賽克少年文學，從純粹動物感官出發（氣味、被毛豎立、爪尖扣地、先祖群星與荒野本能），戰鬥緊湊且著重同袍牽絆。`;
  },

  getModeDirective(mode = "normal") {
    if (mode === "full") {
      return `【完整模式】：事無巨細、極致細膩的小說描寫（約 260~320 字繁體中文）。把時間徹底放慢，將當下每分每秒的氣味變化、肌肉微顫、風向偏移、瞳孔縮放與內心深層思緒一字不漏地詳細展開。`;
    }
    if (mode === "compact") {
      return `【精簡模式】：採用原版《八十億分之一》風格的客觀事件陳述（約 40~70 字繁體中文）。精簡凝練，直接記錄當下的生態年表與狀態，不作冗長鋪陳。`;
    }
    // 普通 normal
    return `【普通模式】：採用小說適時省略筆觸（約 160~200 字繁體中文）。聚焦關鍵重大生存衝突與心理張力，過渡階段適時精要概括。`;
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

    if (progressCb) progressCb(75, "文學小說模型呼叫中：編織初生微光與第一章感官小說...");

    const author = config.author || "erinhunter";
    const mode = config.contentMode || "normal";

    try {
      const opening = await this.generateOpeningChapter(species, life.name, life.biome, life.countryData, author, mode);
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
   * 1. 即時生成：開篇第一章小說 (Opening Chapter)
   * 篇名嚴格規定只能是「第一章」，不可有副標題
   */
  async generateOpeningChapter(species, name, biome, countryData, author = "erinhunter", mode = "normal") {
    const isHuman = species.isHuman;
    const authorGuide = this.getAuthorDirective(author);
    const modeGuide = this.getModeDirective(mode);
    const charNameDisp = name ? `名為「${name}」` : "（尚無人類或同族命名，單純作為這片天地的一員）";

    const prompt = `【角色資訊】：
- 物種：${species.name}（${species.scientificName}）
- 個體：${charNameDisp}
- 出生地：${isHuman ? countryData.name : biome.name}

【風格要求】：
${authorGuide}
${modeGuide}

【重要規範】：
1. 輸出 STRICT JSON：{"title": "第一章", "narrative": "正文內容"}。
2. 篇名必須嚴格為「第一章」，絕對禁止添加任何副標題、冒號或附屬標籤！
3. 格式要求：請務必將正文分成 2 到 3 個自然段落（段落之間使用換行符號 \\n\\n 分隔），每段約 60~100 字，段首不要自行加空格，排版系統會自動處理縮排。
4. 破除物種刻板套路：每個個體都是具備自主意志與獨特性格的生命。
5. 正文中嚴禁出現任何「【某某式描繪】」之類的說明標籤。`;

    try {
      const messages = [
        { role: "system", content: "你是一位頂級小說家與自然生態文學大師。請一律使用繁體中文，且只輸出合法 JSON 物件。" },
        { role: "user", content: prompt }
      ];
      const raw = await this.callLlm(messages, true);
      const parsed = JSON.parse(raw);
      if (parsed.narrative) {
        const cleanNarrative = window.DestinyEngine
          ? window.DestinyEngine.splitIntoNaturalParagraphs(parsed.narrative).join("\n\n")
          : parsed.narrative;
        return {
          title: "第一章",
          narrative: cleanNarrative
        };
      }
    } catch (e) {
      console.warn("即時開篇生成異常，啟用動態生態備援：", e);
    }

    const dynamicNarrative = window.DestinyEngine
      ? window.DestinyEngine.generateChapterOneNarrative(species, name, biome, countryData, author, mode)
      : (isHuman
          ? `在${countryData ? countryData.name : '這片土地'}，最初的記憶由搖籃邊模糊的光斑、父母輕聲哼唱的搖籃曲，以及每一次學步跌倒的疼痛構成。\n\n小小的手掌摸索著冰涼的地磚與窗外的陽光，懵懂地認識著這個複雜又龐大的文明社會。`
          : `在${biome ? biome.name : '荒野'}的晨曦微光中，初生的軀體感受到了微風帶來的草葉氣味與同伴微弱的心跳。\n\n雙眸在黑暗中悄然睜開，天地萬物在眼前無邊延展，純粹的野性力量就此啟幕。`);

    return {
      title: "第一章",
      narrative: dynamicNarrative
    };
  },

  /**
   * 2. 即時生成：成長章節與半互動抉擇 (Milestone Chapter & Choices)
   * 篇名嚴格規定只能是「第N章」，不可有副標題
   */
  async generateMilestoneChapter(species, name, age, stats, biome, countryData, chapterIdx, playerContext = {}, author = "erinhunter", mode = "normal") {
    const isHuman = species.isHuman;
    const focus = playerContext.activeFocus || "日常";
    const history = (playerContext.recentChoices || []).join("、") || "初涉荒野";
    const companionsAlive = playerContext.companionsAliveCount !== undefined ? playerContext.companionsAliveCount : 4;
    const authorGuide = this.getAuthorDirective(author);
    const modeGuide = this.getModeDirective(mode);
    const chapterTitleFixed = this.formatChapterTitle(chapterIdx);
    const charNameDisp = name ? `名為「${name}」` : "（尚無固定命名）";

    const prompt = `【角色狀態】：
- 物種：${species.name}，${charNameDisp}
- 年齡：${age} ${species.unit} (生活於 ${isHuman ? countryData.name : biome.name})
- 生活重心：${focus}
- 生存指標：體魄 ${stats.health}/100，精力 ${stats.energy}/100，智識/直覺 ${stats.instinct}/100，羈絆 ${stats.social}/100${isHuman ? `，資產 ${stats.resource}` : ''}
- 同儕存活：${companionsAlive} 位
- 過往抉擇履歷：${history}

【文學風格與模式】：
${authorGuide}
${modeGuide}

【核心準則與規範】：
1. 輸出 STRICT JSON：
{
  "title": "${chapterTitleFixed}",
  "narrative": "小說正文內容",
  "allowCustom": true,
  "customPromptHint": "自訂自主行動（例如：發出試探性低鳴並緩步繞行）",
  "choices": [
    {
      "text": "應對決策A",
      "impact": "影響概述",
      "statChange": {"health": -8, "energy": -10, "instinct": 12}
    },
    {
      "text": "應對決策B",
      "impact": "影響概述",
      "statChange": {"social": 12, "energy": -5}
    }
  ]
}
2. 篇名只能是「${chapterTitleFixed}」，嚴格禁止添加任何冒號或副標題！
3. 嚴禁任何生物決定論！絕無「公棕熊必殺幼崽」或「某物種必定殘暴」等死板套路。每個生靈都有獨立性格、當下情緒與自主意志。
4. 可以包含 0~3 個預設選項，並保留 allowCustom: true 讓使用者自由輸入特殊應對。
5. 格式要求：請務必將小說正文分成 2 到 3 個自然段落（段落之間使用換行符號 \\n\\n 分隔），每段約 60~100 字，段首不要自行加空格，排版系統會自動縮排。`;

    try {
      const messages = [
        { role: "system", content: "你是一位頂級小說家與自然生態文學大師。請一律使用繁體中文，且只輸出合法 JSON 物件。" },
        { role: "user", content: prompt }
      ];
      const raw = await this.callLlm(messages, true);
      const parsed = JSON.parse(raw);
      if (parsed.narrative) {
        const cleanNarrative = window.DestinyEngine
          ? window.DestinyEngine.splitIntoNaturalParagraphs(parsed.narrative).join("\n\n")
          : parsed.narrative;
        return {
          title: chapterTitleFixed,
          narrative: cleanNarrative,
          allowCustom: parsed.allowCustom !== undefined ? parsed.allowCustom : true,
          customPromptHint: parsed.customPromptHint || "自訂你的自主行動策略...",
          choices: Array.isArray(parsed.choices) ? parsed.choices : []
        };
      }
    } catch (e) {
      console.warn("即時章節生成異常，啟用動態備援：", e);
    }

    const fallback = window.DestinyEngine.pickDynamicScenario(species, name, age, biome, countryData, chapterIdx);
    const cleanFallback = window.DestinyEngine
      ? window.DestinyEngine.splitIntoNaturalParagraphs(fallback.narrative).join("\n\n")
      : fallback.narrative;
    return {
      title: chapterTitleFixed,
      narrative: cleanFallback,
      allowCustom: true,
      customPromptHint: "自訂你想採取的自主行動策略...",
      choices: fallback.choices || []
    };
  },

  /**
   * 3. 即時生成：抉擇後的冒險後續 (Choice Aftermath)
   */
  async generateChoiceFollowup(species, name, choiceText, chapterContext = {}, playerContext = {}, author = "erinhunter") {
    const isHuman = species.isHuman;
    const authorGuide = this.getAuthorDirective(author);
    const charNameDisp = name ? `「${name}」` : "你";

    const prompt = `角色 ${charNameDisp} 在面臨轉折時作出了自主行動抉擇：「${choiceText}」。
當前情境：${species.name} 在 ${isHuman ? "人類社會" : "荒野"} 生存
${authorGuide}

請撰寫約 110~150 字繁體中文小說段落，生動描寫這項自主決策在自然環境中引發的即時連鎖反應、對手或環境的真實反饋與心理震撼。
規範：破除刻板印象，無過度血腥，不含任何說明標籤。`;

    try {
      const messages = [
        { role: "system", content: "你是精通生命文學與個體心理的頂級作家。請輸出精采繁體中文小說段落。" },
        { role: "user", content: prompt }
      ];
      const text = await this.callLlm(messages, false);
      if (text && text.trim().length > 20) {
        return text.trim();
      }
    } catch (e) {
      console.warn("抉擇後續生成異常，使用備援：", e);
    }

    return `你在本能與獨立決心驅使下採取了行動：「${choiceText}」。筋骨的酸痛伴隨著急促的喘息，大自然給予了難以預料的反饋，你在天地間留下了屬於自己意志的鮮明印記。`;
  },

  // 相容別名
  async expandChapterWithAi(chapter, choice, species, name = "") {
    return this.generateChoiceFollowup(species, name, choice.text, chapter);
  },

  /**
   * 4. 即時生成：終章與死亡過程小說 (Death Narrative & Process)
   * 篇名嚴格規定只能是「第N章」，不可有副標題
   */
  async generateDeathChapter(species, name, finalAge, deathCause, biome, countryData, fullContext = {}, author = "erinhunter") {
    const isHuman = species.isHuman;
    const authorGuide = this.getAuthorDirective(author);
    const finalChapIdx = (fullContext.choicesCount || 3) + 2;
    const chapterTitleFixed = this.formatChapterTitle(finalChapIdx);
    const charNameDisp = name ? `「${name}」` : "這隻生靈";

    const prompt = `角色 ${charNameDisp}（物種：${species.name}）在 ${finalAge} ${species.unit} 之際，因「${deathCause}」走向生命終暮。
${authorGuide}

要求：
1. 最終章小說（約 180-230 字）：詳細描繪面對此終局的真實搏鬥、呼吸漸緩、感官退潮與安詳歸宿的過程。務必分成 2 到 3 個自然段落（以 \\n\\n 分隔）。
2. 荒野追思館悼詞（約 80-100 字）：致敬其作為獨立個體的唯一荒野足跡。
3. STRICT JSON：
{
  "chapterTitle": "${chapterTitleFixed}",
  "deathNarrative": "最終章小說正文（2-3段）",
  "eulogy": "追思館悼詞"
}
篇名必須嚴格為「${chapterTitleFixed}」，絕不可加副標題！`;

    try {
      const messages = [
        { role: "system", content: "你是一位頂級荒野小說家。請一律使用繁體中文，且只輸出合法 JSON 物件。" },
        { role: "user", content: prompt }
      ];
      const raw = await this.callLlm(messages, true);
      const parsed = JSON.parse(raw);
      if (parsed.deathNarrative && parsed.eulogy) {
        const cleanNarrative = window.DestinyEngine
          ? window.DestinyEngine.splitIntoNaturalParagraphs(parsed.deathNarrative).join("\n\n")
          : parsed.deathNarrative;
        return {
          chapterTitle: chapterTitleFixed,
          deathNarrative: cleanNarrative,
          eulogy: parsed.eulogy
        };
      }
    } catch (e) {
      console.warn("終章生成異常，啟用動態備援：", e);
    }

    const fallbackDeath = isHuman
      ? `在${finalAge}歲這一年，因${deathCause}，病房的窗櫺外是夕陽溫暖的光芒。監護儀的波動漸漸舒緩，親人的手掌傳來熟悉的溫度。\n\n回顧這一生走過的坎坷與選擇，心跳漸漸放慢，如同一葉扁舟平穩駛入了無風的港灣，歸於久違的安息。`
      : `刺骨的寒意侵入四肢，面對${deathCause}的終局，劇烈的喘息在冷空氣中化作白霧。\n\n視線中的生境山稜逐漸化為柔和的微光，骨骼間的劇痛奇蹟般地平復，取而代之的是如溪流般的寧靜。你緩緩伏下身軀，任由最後一口吐息融入風中，靈魂奔向了群星與先祖的遼闊獵場。`;

    return {
      chapterTitle: chapterTitleFixed,
      deathNarrative: fallbackDeath,
      eulogy: isHuman
        ? `生命在文明的浪潮中劃下了休止符。你在這片大地上留下的足跡、親情與愛意，已經真實地溫暖過這個世界。安息吧，歸於星河。`
        : `風吹過荒原，帶走了最後一道足跡。你以無畏的野性與忠誠活過這僅有一次的荒野旅程。在星族的永恆獵場中，繼續自由奔跑吧。`
    };
  }
};
