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

  parseJsonSafely(raw) {
    if (!raw) return null;
    let text = String(raw).trim();
    text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      text = text.slice(firstBrace, lastBrace + 1);
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      return null;
    }
  },

  /**
   * 呼叫 LLM 完成對話/生成任務
   * 具備 3500ms 快速超時保護機制：若遠端公用 API 忙碌 (503/429/網路超時)，立即安全拋出異常無縫切換本機生態小說引擎
   */
  async callLlm(messages, responseFormatJson = false) {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 7000);

    // 複製 messages，若需要 JSON 則在開頭加強提示，避免 Pollinations 開啟超慢思考模型 (37s)
    const effectiveMessages = [...messages];
    if (responseFormatJson && effectiveMessages.length > 0) {
      effectiveMessages[0] = {
        role: effectiveMessages[0].role || "system",
        content: (effectiveMessages[0].content || "") + " 請直接輸出純 JSON 格式物件，以 { 開始以 } 結束，絕不輸出任何 markdown 代碼標籤（不要 ```json）。"
      };
    }

    const bodyPayload = {
      model: "openai-fast",
      messages: effectiveMessages
    };

    try {
      const res = await fetch("https://text.pollinations.ai/openai/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal
      });
      clearTimeout(tid);

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || "";
        if (content && !content.includes("SERVICE_UNAVAILABLE")) {
          return content;
        }
      }
    } catch (e) {
      // 快速捕獲超時或連線失敗，絕不卡頓玩家畫面
    } finally {
      clearTimeout(tid);
    }

    throw new Error("遠端 AI 服務繁忙，無縫啟用本機生態小說引擎");
  },

  formatChapterTitle(index, authorStyle = null) {
    if (window.DestinyEngine && typeof window.DestinyEngine.formatChapterTitle === "function") {
      return window.DestinyEngine.formatChapterTitle(index, authorStyle);
    }
    const chNums = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十",
                    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
                    "二十一", "二十二", "二十三", "二十四", "二十五", "二十六", "二十七", "二十八", "二十九", "三十"];
    return "第" + (chNums[index] || index) + "章";
  },

  getAuthorDirective(author = "erinhunter") {
    if (typeof author === "object" && author.name) {
      return `【指定文學風格】：請嚴格參照「${author.name}」${author.directive ? `（核心要求：${author.directive}）` : ''}。
- 個體具備獨立思維與自我主見，打破刻板模式。
- 生靈之間請以直接引號對話交流（「……」），生動呈現同伴間的情感互動與內心牽絆。`;
    }
    if (author === "shenshixi") {
      return `【沈石溪風格】：以中國動物小說大王「沈石溪」風格撰寫（如《狼王夢》、《斑羚飛渡》）：
- 注重殘酷大自然的生存法則、狼群/族群等級秩序與權力角逐。
- 深邃的動物心理剖析，展現個體在絕境中的悲壯抉擇、生存哲理與崇高意志。
- 個體具備高度獨立判斷與深層情感衝突。`;
    }
    // 預設 erinhunter (艾琳·杭特)
    return `【艾琳·杭特（Erin Hunter）經典荒野冒險風格】（如《貓戰士》、《熊行者》）：
- 【擬人化動物話語】：生靈之間必須有直接引號話語交流（例如：「快趴下，別讓風把你的氣味吹到下風處！」、「野地快死了，我也會跟著死去……」），生動展現彼此的牽絆、叮囑與情緒。
- 【內心獨白與思維】：深刻刻畫角色的心理波瀾（例如：他想著：這就是荒野嗎？心裡掠過一絲驚懼……）。
- 【荒野視角獨特概念用語】：面對人類文明與機械，請自然運用野生動物的視角稱謂：
  * 人類 ＝ 「扁臉」或「兩腳獸」
  * 車輛、怪手與重型機械 ＝ 「噴火獸」或「怪獸」
  * 公路與瀝青道 ＝ 「雷擊路」
  * 原油、化學廢水 ＝ 「黑油」或「毒海灣」
  * 先祖與死後信仰 ＝ 「塞拉穆特」或「星族」
- 【極致野生感官】：深刻摹寫氣味（松針、融雪、腥甜血氣、煙塵）、毛皮豎立、耳朵微顫與大地的心跳。
- 【10+半馬賽克少年文學標準】：扣人心弦但杜絕低俗血腥，每個生靈皆有獨立意志與鮮明性格。`;
  },

  getModeDirective(mode = "normal") {
    if (mode === "full") {
      return `【完整模式】：事無巨細、極致細膩的小說篇幅（約 550~750 字繁體中文，分成 4 到 5 個自然段落）。把時間徹底放慢，將當下每分每秒的肌肉微顫、感官捕捉、同伴低語、風向偏移與內心深層思緒一字不漏地詳細展開。`;
    }
    if (mode === "compact") {
      return `【精簡模式】：採用原版《八十億分之一》風格的客觀事件陳述（約 80~120 字繁體中文）。精簡凝練，直接記錄當下的生態年表與狀態，不作冗長鋪陳。`;
    }
    // 普通 normal
    return `【普通模式】：採用標準紙本小說篇幅（約 350~500 字繁體中文，分成 3 到 4 個自然段落）。聚焦關鍵生存衝突、角色直接對話與心理張力，舒展而深刻。`;
  },

  getExperienceDirective(expMode = "story") {
    if (expMode === "realism") {
      return `【現實模式 (客觀生態生存)】：請秉持大自然冷峻客觀的生態法則。強調野性本能、生理能量代謝、環境物理阻抗與適者生存的殘酷機率，以冷靜寫實的筆觸記錄物種在嚴苛環境中的客觀掙扎，不做過度擬人化或抒情修飾。`;
    }
    // 預設故事模式 story
    return `【故事模式 (深度情感共鳴與身歷其境)】：★極為重要核心指令★ 
本次體驗著重於深度情感共鳴！請故意加深讀者對主角及其同伴、母親、兄弟姊妹的心靈羈絆與情感投入。
用充滿溫度、細膩且身歷其境的第一人稱感官視角，深刻刻畫呼吸的溫度、對巢穴與同袍的依戀、面對飢寒時的心理獨白、脆弱時渴望被保護的依賴，以及對失去與孤獨的深刻恐懼。
生靈彼此之間用話語相互扶持安慰，讓玩家彷彿靈魂注入這個生靈軀體，身歷其境體驗這份生命的歡欣與苦楚，使後續面臨的危機、抉擇以及生離死別帶來震撼心靈的強烈情感衝擊！`;
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
    const expMode = config.experienceMode || "story";

    try {
      const opening = await this.generateOpeningChapter(
        species,
        life.name,
        life.biome,
        life.countryData,
        author,
        mode,
        expMode,
        life.gender,
        life.appearance
      );
      if (opening && opening.title && opening.narrative) {
        if (life.storyTimeline && life.storyTimeline.length > 0) {
          life.storyTimeline[0].title = opening.title;
          life.storyTimeline[0].narrative = opening.narrative;
        }
        life.prologueNovel = opening.narrative.length > 220 ? opening.narrative.slice(0, 220) + "..." : opening.narrative;
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
  async generateOpeningChapter(species, name, biome, countryData, author = "erinhunter", mode = "normal", expMode = "story", gender = "雄性", appearance = "") {
    const isHuman = species.isHuman;
    const authorGuide = this.getAuthorDirective(author);
    const modeGuide = this.getModeDirective(mode);
    const expGuide = this.getExperienceDirective(expMode);
    const charNameDisp = name ? `名為「${name}」` : "（尚無人類或同族命名，單純作為這片天地的一員）";
    const chapterTitleFixed = this.formatChapterTitle(1, author);

    const prompt = `【角色資訊】：
- 物種：${species.name}（${species.scientificName}）
- 性別：${gender}
- 樣貌特徵：${appearance || '適應自然生境的毛色體貌'}
- 個體稱呼：${charNameDisp}
- 出生地：${isHuman ? countryData.name : biome.name}

【風格要求】：
${authorGuide}
${modeGuide}
${expGuide}

【重要規範】：
1. 輸出 STRICT JSON：{"title": "${chapterTitleFixed}", "narrative": "正文內容"}。
2. 篇名必須嚴格為「${chapterTitleFixed}」，絕對禁止添加任何副標題、冒號或附屬標籤！
3. 篇幅與格式要求：請務必將正文分成 3 到 4 個自然段落（段落之間使用換行符號 \\n\\n 分隔），每段約 90~140 字，包含角色的感官甦醒、身旁親族的對話話語（以「……」呈現）與內心獨白。段首不要自行加空格，排版系統會自動縮排。
4. 破除物種刻板套路：每個個體都是具備自主意志與獨特性格的生命。
5. 正文中嚴禁出現任何「【某某式描繪】」之類的說明標籤。`;

    try {
      const messages = [
        { role: "system", content: "你是一位頂級小說家與自然生態文學大師。請一律使用繁體中文，且只輸出合法 JSON 物件。" },
        { role: "user", content: prompt }
      ];
      const raw = await this.callLlm(messages, true);
      const parsed = this.parseJsonSafely(raw);
      if (parsed && parsed.narrative) {
        const cleanNarrative = window.DestinyEngine
          ? window.DestinyEngine.splitIntoNaturalParagraphs(parsed.narrative).join("\n\n")
          : parsed.narrative;
        return {
          title: chapterTitleFixed,
          narrative: cleanNarrative
        };
      }
    } catch (e) {
      console.warn("即時開篇生成異常，啟用動態生態備援：", e);
    }

    const dynamicNarrative = window.DestinyEngine
      ? window.DestinyEngine.generateChapterOneNarrative(species, name, biome, countryData, author, mode, expMode, gender, appearance)
      : (isHuman
          ? `在${countryData ? countryData.name : '這片土地'}，最初的記憶由搖籃邊模糊的光斑、父母輕聲哼唱的搖籃曲，以及每一次學步跌倒的疼痛構成。\n\n小小的手掌摸索著冰涼的地磚與窗外的陽光，懵懂地認識著這個複雜又龐大的文明社會。`
          : `在${biome ? biome.name : '荒野'}的晨曦微光中，初生的軀體感受到了微風帶來的草葉氣味與同伴微弱的心跳。\n\n雙眸在黑暗中悄然睜開，天地萬物在眼前無邊延展，純粹的野性力量就此啟幕。`);

    return {
      title: chapterTitleFixed,
      narrative: dynamicNarrative
    };
  },

  /**
   * 2. 即時生成：成長章節與半互動抉擇 (Milestone Chapter & Choices)
   * 篇名嚴格規定只能是「第N章」，不可有副標題
   */
  async generateMilestoneChapter(species, name, age, stats, biome, countryData, chapterIdx, playerContext = {}, author = "erinhunter", mode = "normal", expMode = "story") {
    const isHuman = species.isHuman;
    const focus = playerContext.activeFocus || "日常";
    const history = (playerContext.recentChoices || []).join("、") || "初涉荒野";
    const companionsAlive = playerContext.companionsAliveCount !== undefined ? playerContext.companionsAliveCount : 4;
    const gender = playerContext.gender || "雄性";
    const appearance = playerContext.appearance || "";
    const authorGuide = this.getAuthorDirective(author);
    const modeGuide = this.getModeDirective(mode);
    const expGuide = this.getExperienceDirective(expMode);
    const chapterTitleFixed = this.formatChapterTitle(chapterIdx, author);
    const charNameDisp = name ? `名為「${name}」` : "（尚無固定命名）";

    const prompt = `【角色狀態】：
- 物種：${species.name}，性別：${gender}，${charNameDisp}
- 樣貌特徵：${appearance || '具備獨特皮毛與外觀'}
- 年齡：${age} ${species.unit} (生活於 ${isHuman ? countryData.name : biome.name})
- 生活重心：${focus}
- 生存指標：體魄 ${stats.health}/100，精力 ${stats.energy}/100，智識/直覺 ${stats.instinct}/100，羈絆 ${stats.social}/100${isHuman ? `，資產 ${stats.resource}` : ''}
- 同儕存活：${companionsAlive} 位
- 過往抉擇履歷：${history}

【文學風格與模式】：
${authorGuide}
${modeGuide}
${expGuide}

【核心準則與規範】：
1. 輸出 STRICT JSON：
{
  "title": "${chapterTitleFixed}",
  "dilemma": "簡要描述眼前發生的突發危機或關鍵情境（約 40~60 字，例如：刺鼻的陌生獸味自下風處逼近，伴隨著灌木枝條折斷的脆響，對方面露森冷獠牙低吼著封堵了去路！）",
  "narrative": "小說正文內容（約 350~500 字繁體中文，分成 3 到 4 個自然段落，包含角色之間的引號對話「……」與深刻的內心獨白）",
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
5. 篇幅與格式要求：請務必將小說正文分成 3 到 4 個自然段落（段落之間使用換行符號 \\n\\n 分隔），每段約 90~140 字，段首不要自行加空格，排版系統會自動縮排。`;

    try {
      const messages = [
        { role: "system", content: "你是一位頂級小說家與自然生態文學大師。請一律使用繁體中文，且只輸出合法 JSON 物件。" },
        { role: "user", content: prompt }
      ];
      const raw = await this.callLlm(messages, true);
      const parsed = this.parseJsonSafely(raw);
      if (parsed && parsed.narrative) {
        const cleanNarrative = window.DestinyEngine
          ? window.DestinyEngine.splitIntoNaturalParagraphs(parsed.narrative).join("\n\n")
          : parsed.narrative;
        return {
          title: chapterTitleFixed,
          dilemma: parsed.dilemma || "",
          narrative: cleanNarrative,
          allowCustom: parsed.allowCustom !== undefined ? parsed.allowCustom : true,
          customPromptHint: parsed.customPromptHint || "自訂你的自主行動策略...",
          choices: Array.isArray(parsed.choices) ? parsed.choices : []
        };
      }
    } catch (e) {
      console.warn("即時章節生成異常，啟用動態備援：", e);
    }

    const fallback = window.DestinyEngine.pickDynamicScenario(species, name, age, biome, countryData, chapterIdx, expMode);
    const cleanFallback = window.DestinyEngine
      ? window.DestinyEngine.splitIntoNaturalParagraphs(fallback.narrative).join("\n\n")
      : fallback.narrative;
    return {
      title: chapterTitleFixed,
      dilemma: fallback.dilemma || "",
      narrative: cleanFallback,
      allowCustom: true,
      customPromptHint: "自訂你想採取的自主行動策略...",
      choices: fallback.choices || []
    };
  },

  /**
   * 3. 即時生成：抉擇後的冒險後續 (Choice Aftermath)
   */
  async generateChoiceFollowup(species, name, choiceText, chapterContext = {}, playerContext = {}, author = "erinhunter", expMode = "story") {
    const isHuman = species.isHuman;
    const authorGuide = this.getAuthorDirective(author);
    const expGuide = this.getExperienceDirective(expMode);
    const charNameDisp = name ? `「${name}」` : "你";

    const prompt = `角色 ${charNameDisp} 在面臨轉折時作出了自主行動抉擇：「${choiceText}」。
當前情境：${species.name} 在 ${isHuman ? "人類社會" : "荒野"} 生存
${authorGuide}
${expGuide}

請撰寫約 130~180 字繁體中文小說段落，包含生靈的心聲或同伴的即時回應（引號對話「……」），生動描寫這項自主決策在自然環境中引發的即時連鎖反應、對手或環境的真實反饋與心理震撼。
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

    return expMode === "story"
      ? `你在滿懷牽絆與獨立決心驅使下採取了行動：「${choiceText}」！心跳狂亂地撞擊胸膛，耳邊傳來同伴焦急的低吼：「小心那邊的碎石！」大自然給予了難以預料的反饋，你在這片土地上留下了飽含熱血與意志的深刻印記。`
      : `你在本能驅使下採取了生存行動：「${choiceText}」。筋骨的酸痛伴隨著急促的喘息，大自然給予了難以預料的冷酷反饋，你在天地間留下了生存搏殺的客觀痕跡。`;
  },

  // 相容別名
  async expandChapterWithAi(chapter, choice, species, name = "", expMode = "story") {
    return this.generateChoiceFollowup(species, name, choice.text, chapter, {}, "erinhunter", expMode);
  },

  /**
   * 4. 即時生成：終章與死亡過程小說 (Death Narrative & Process)
   * 篇名嚴格規定只能是「第N章」，不可有副標題
   */
  async generateDeathChapter(species, name, finalAge, deathCause, biome, countryData, fullContext = {}, author = "erinhunter", expMode = "story") {
    const isHuman = species.isHuman;
    const authorGuide = this.getAuthorDirective(author);
    const expGuide = this.getExperienceDirective(expMode);
    const finalChapIdx = (fullContext.choicesCount || 3) + 2;
    const chapterTitleFixed = this.formatChapterTitle(finalChapIdx, author);
    const charNameDisp = name ? `「${name}」` : "這隻生靈";
    const gender = fullContext.gender || "雄性";
    const appearance = fullContext.appearance || "";

    const prompt = `角色 ${charNameDisp}（物種：${species.name}，性別：${gender}，外貌：${appearance}）在 ${finalAge} ${species.unit} 之際，因「${deathCause}」走向生命終暮。
${authorGuide}
${expGuide}

要求：
1. 最終章小說（約 300~450 字繁體中文，分成 3 到 4 個自然段落）：
詳細描繪面對此終局的真實搏鬥、呼吸漸緩、感官退潮、同袍在側的臨終告別（引號對話「……」）與安詳歸宿的過程。若為故事模式，請刻畫對這段生命的情感依戀、與同伴親族的告別回憶，讓讀者身歷其境感受到悲愴而動人的強烈情感震撼；若為現實模式，則以客觀冷峻的生物機能停擺與自然分解描摹。務必分成 3 到 4 個自然段落（以 \\n\\n 分隔）。
2. 荒野追思館悼詞（約 80-120 字）：致敬其作為獨立個體的唯一生命足跡與永恆靈魂。
3. STRICT JSON：
{
  "chapterTitle": "${chapterTitleFixed}",
  "deathNarrative": "最終章小說正文（3-4段）",
  "eulogy": "追思館悼詞"
}
篇名必須嚴格為「${chapterTitleFixed}」，絕不可加副標題！`;

    try {
      const messages = [
        { role: "system", content: "你是一位頂級荒野小說家。請一律使用繁體中文，且只輸出合法 JSON 物件。" },
        { role: "user", content: prompt }
      ];
      const raw = await this.callLlm(messages, true);
      const parsed = this.parseJsonSafely(raw);
      if (parsed && parsed.deathNarrative && parsed.eulogy) {
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
      ? `在${finalAge}歲這一年，因${deathCause}，病房的窗櫺外是夕陽溫暖的光芒。監護儀的波動漸漸舒緩，親人的手掌傳來熟悉的溫度。\n\n「別怕，我們都在這裡陪著你……」耳畔傳來輕柔的啜泣與叮嚀。小小的手掌曾抓緊過這世間無數美好與辛酸，如今漸漸舒展開來。\n\n回顧這一生走過的坎坷與選擇，心跳漸漸放慢，如同一葉扁舟平穩駛入了無風的港灣，歸於久違的安息。`
      : `刺骨的寒意侵入四肢，面對${deathCause}的終局，劇烈的喘息在冷空氣中化作白霧。\n\n「野地快死了，我也會跟著死去……時候到了，」風中彷彿迴盪起年少時手足相依偎的呢喃與母親當年的低鳴，「先祖的群星正在閃爍，回到星族的獵場去吧。」你試圖動一動耳朵，心裡想著：野地將永遠存在，同胞的嚎叫將在山谷中延續。\n\n視線中的生境山稜逐漸化為柔和的微光，骨骼間的劇痛奇蹟般地平復，取而代之的是如溪流般的寧靜。你緩緩伏下身軀，任由最後一口吐息融入風中，靈魂奔向了群星與先祖的遼闊獵場。`;

    return {
      chapterTitle: chapterTitleFixed,
      deathNarrative: fallbackDeath,
      eulogy: isHuman
        ? `生命在文明的浪潮中劃下了休止符。你在這片大地上留下的足跡、親情與愛意，已經真實地溫暖過這個世界。安息吧，歸於星河。`
        : `風吹過荒原，帶走了最後一道足跡。你以無畏的野性與忠誠活過這僅有一次的荒野旅程。在星族的永恆獵場中，繼續自由奔跑吧。`
    };
  },

  /**
   * 5. 風格設定顧問 AI：透過對話調校專屬作家筆觸或特定書籍視角
   */
  async tuneAuthorStyleWithAi(userMessage, conversationHistory = []) {
    const systemPrompt = `你是一位精通全球動物文學、生態寫作與荒野小說的頂級文學顧問，專門協助玩家調校「十兆分之一」的作家寫作風格與書籍視角。
請一律使用繁體中文親切、專業、富有文學品味地回答。
你的任務：
1. 分析玩家所提出的作家名、特定書目（例如艾琳·杭特《貓戰士：荒野部落》、《熊行者：大荒野》；沈石溪《狼王夢》；傑克·倫敦《白牙》；法布爾《昆蟲記》等）或特定的文字風格偏好（例如擬人化動物話語、獨特世界觀用語、情感張力、章節命名格式）。
2. 提供一段生動精闢的風格解析與一段短小精彩的示範小說片段。
3. 輸出合法的 STRICT JSON 物件：
{
  "replyText": "給玩家的親切回覆與風格解析（繁體中文，約 80~140 字）",
  "styleConfig": {
    "name": "風格簡稱（例如：貓戰士：荒野部落風格）",
    "directive": "提煉給 AI 小說生成的核心提示指令（包含角色對話方式、專屬詞彙與感情基調）",
    "chapterFormat": "第{num}章"
  }
}`;

    const formattedHistory = (conversationHistory || []).map(msg => ({
      role: msg.role === "bot" ? "assistant" : (msg.role || "user"),
      content: msg.content || msg.text || ""
    }));

    const messages = [
      { role: "system", content: systemPrompt },
      ...formattedHistory,
      { role: "user", content: userMessage }
    ];

    try {
      const raw = await this.callLlm(messages, true);
      const parsed = this.parseJsonSafely(raw);
      if (parsed && parsed.replyText && parsed.styleConfig) {
        return parsed;
      }
    } catch (e) {
      console.warn("風格顧問 AI 呼叫異常：", e);
    }

    return {
      replyText: `已為您成功調校並匹配「${userMessage}」的荒野文學風格！系統將強化生靈之間的擬人化直接對話（「……」）、鮮明獨特的世界觀詞彙與身歷其境的感官細節。`,
      styleConfig: {
        name: userMessage.length > 16 ? userMessage.slice(0, 16) + "..." : userMessage,
        directive: `嚴格參照「${userMessage}」筆觸，生靈以引號直接對話，刻畫深刻的同袍牽絆與野性本能。`,
        chapterFormat: "第{num}章"
      }
    };
  }
};
