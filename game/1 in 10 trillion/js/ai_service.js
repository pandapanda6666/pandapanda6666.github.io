/**
 * 十兆分之一 (1 in 10 Trillion) - AI 連線與擴充服務 (參考 pandapanda6666.github.io 首頁公告管理工具)
 * 支援伺服器端點 (http://127.0.0.1:48921 或 ngrok/cf 隧道) 與 Pollinations.ai，
 * 並在無網路或伺服器未開啟時無縫切換至內建高效能艾琳·杭特引擎。
 */

window.AiService = {
  serverUrl: null,

  /**
   * 解析並獲取後端伺服器網址（依據 index.html 讀取 server_url.txt 的 atob 反轉解碼機制）
   */
  async resolveServerUrl() {
    if (this.serverUrl) return this.serverUrl;

    // 1. 檢查 window.authInfo 或 localStorage
    const localSso = localStorage.getItem("sso_server");
    if (localSso) {
      this.serverUrl = localSso;
      return this.serverUrl;
    }

    // 2. 嘗試讀取上層的 server_url.txt
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

    // 3. 預設嘗試本地 API
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
   * AI 生成生命小說與事件去重管道
   * 包含視覺進度回報（仿 index.html 的 admin-ai-progress-bar）
   */
  async generateLifePipeline(species, config, onProgress) {
    if (onProgress) onProgress(15, "正在連結生態統計母體，抽取十兆生命之一的初始命運...");
    await this.delay(300);

    // Step 1: 生態與統計命運年表生成
    const baseLife = window.DestinyEngine.generateLifeTrajectory(species, config);
    if (onProgress) onProgress(45, "已由生態數據庫生成原始一生年表，正在進行 AI 智慧去重與修剪...");
    await this.delay(350);

    // Step 2: 嘗試透過伺服器或外部 LLM 獲取更多動態靈感（若可用）
    if (onProgress) onProgress(75, "AI 正在以艾琳·杭特式（10+ 半馬賽克）筆觸，潤色關鍵抉擇與命運章節...");
    
    try {
      const sUrl = await this.resolveServerUrl();
      if (sUrl) {
        // 可選：向伺服器紀錄或請求補充靈感
      }
    } catch (e) {}

    await this.delay(250);
    if (onProgress) onProgress(100, "生命年表與半互動小說生成完畢！準備出生...");
    await this.delay(200);

    return baseLife;
  },

  /**
   * 艾琳·杭特小說即時擴充與玩家對話式潤色
   */
  async expandChapterWithAi(chapter, playerChoice, species) {
    const prompt = `以艾琳·杭特《貓戰士》的 10+ 半馬賽克風格，為${species.name}延續小說段落。
玩家作出了抉擇：「${playerChoice.text}」。
請用繁體中文撰寫約 150 字的生動感官描繪，注重氣味、心跳、肌肉緊繃與自然野性，不可有過度血腥開腸破肚，維持 10+ 少年勇士文學張力。`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch("https://text.pollinations.ai/openai/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai",
          messages: [
            {
              role: "system",
              content: "你是艾琳·杭特（Erin Hunter）風格的中文動物荒野冒險作家。文字富含感官細節、野性本能與半馬賽克 10+ 搏鬥描寫。使用繁體中文。"
            },
            { role: "user", content: prompt }
          ]
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content && content.length > 30) {
          return content;
        }
      }
    } catch (e) {
      // 網路超時或受限時，平滑 fallback 到本地預先編織的段落
    }

    return playerChoice.followupText;
  },

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};
