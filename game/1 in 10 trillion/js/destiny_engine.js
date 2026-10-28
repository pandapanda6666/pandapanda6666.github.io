/**
 * 十兆分之一 (1 in 10 Trillion) - 命運統計與艾琳·杭特式 AI 敘事引擎
 * 流程：
 * 1. 根據物種生態統計表產生原始一生年表 (Cohort Hazard Simulation)
 * 2. AI 智慧剪輯去重：合併日常重複瑣事，凸顯生命轉折 (Deduplication & Polishing)
 * 3. 艾琳·杭特式（半馬賽克 10+）小說生成：半互動式抉擇與自然命運交織
 */

window.DestinyEngine = {
  /**
   * 產生一生完整生命軌跡與事件
   * @param {Object} species 物種資料
   * @param {Object} config 配置（包含國家、出生設定等）
   */
  generateLifeTrajectory(species, config = {}) {
    const isHuman = species.isHuman;
    const maxAge = species.maxAge;
    const unit = species.unit || "歲";

    // 隨機抽選名字與棲地
    const name = config.customName || species.namingPool[Math.floor(Math.random() * species.namingPool.length)];
    const biome = species.biomes[Math.floor(Math.random() * species.biomes.length)];
    
    // 若為人類，抽選國家與經濟設定
    let countryData = null;
    if (isHuman) {
      const cList = species.countries;
      countryData = config.country || cList[Math.floor(Math.random() * cList.length)];
    }

    // 1. 根據統計曲線計算壽命極限與死因
    const lifeDeathPlan = this.calculateLifespanAndFate(species, countryData);

    // 2. 原始年表模擬：逐年/逐期生成生態統計事件
    const rawEvents = this.simulateRawLifecycle(species, lifeDeathPlan, biome, countryData);

    // 3. AI 智慧去重與修剪：過濾重複的日常事件，提煉核心轉折
    const deduplicatedEvents = this.aiDeduplicateEvents(rawEvents, species);

    // 4. 生成艾琳·杭特式小說序幕 (出生登記段落)
    const prologueNovel = this.writeErinHunterPrologue(species, name, biome, countryData, lifeDeathPlan);

    // 5. 預先編織互動抉擇與命運節點
    const storyTimeline = this.compileStoryTimeline(species, name, deduplicatedEvents, lifeDeathPlan, biome, countryData);

    return {
      species,
      name,
      biome,
      countryData,
      maxPossibleAge: lifeDeathPlan.finalAge,
      deathCause: lifeDeathPlan.deathCause,
      survivalPercentile: lifeDeathPlan.survivalPercentile,
      events: deduplicatedEvents,
      storyTimeline,
      prologueNovel,
      initialStats: {
        health: 85 + Math.floor(Math.random() * 10),
        energy: 90,
        instinct: isHuman ? 50 : 70, // 人類為知識/敏銳，動物為野性直覺
        social: 80, // 群體羈絆 / 人際關係
        resource: isHuman ? countryData.localEquivMonthly * 2 : 50 // 人類為貨幣儲蓄，動物為儲糧/領地掌控
      }
    };
  },

  /**
   * 根據生態存活率分佈計算死亡年齡與最終死因
   */
  calculateLifespanAndFate(species, countryData) {
    const maxAge = species.maxAge;
    let finalAge = 0;
    let deathCause = "";

    // 幼體死亡率檢查
    const infantSurvival = species.isHuman && countryData 
      ? (1 - countryData.infantMortality) 
      : species.infantSurvivalRate;

    if (Math.random() > infantSurvival) {
      // 未挺過幼年期
      finalAge = species.unit === "週" ? Math.floor(Math.random() * 3) : (Math.random() < 0.6 ? 0 : 1);
      deathCause = species.threats[Math.floor(Math.random() * species.threats.length)];
      return {
        finalAge,
        deathCause,
        survivalPercentile: Math.max(1, Math.floor(infantSurvival * 100))
      };
    }

    // 成年後存活率模擬
    const avgWild = species.isHuman && countryData ? countryData.avgLifespan : species.avgAgeWild;
    
    // 使用高斯/韋伯加權分佈模擬壽命
    for (let age = 1; age <= maxAge; age++) {
      const ageRatio = age / maxAge;
      // 隨年齡上升的年死亡風險率
      let annualHazard = Math.pow(ageRatio, 2.3) * (age > avgWild ? 0.35 : 0.12);
      
      // 特殊物種調整
      if (species.id === "honeybee_worker" && age > 6) annualHazard += 0.25;

      if (Math.random() < annualHazard || age === maxAge) {
        finalAge = age;
        if (age >= maxAge * 0.85) {
          deathCause = species.isHuman ? "自然衰老引發多重器官衰竭" : "衰暮力竭、在平靜深眠中回歸大地";
        } else {
          deathCause = species.threats[Math.floor(Math.random() * species.threats.length)];
        }
        break;
      }
    }

    // 計算存活百分位
    let survivalPercentile = Math.min(99, Math.max(5, Math.floor((finalAge / maxAge) * 100)));

    return { finalAge, deathCause, survivalPercentile };
  },

  /**
   * 逐期模擬生態事件 (Raw Lifecycle)
   */
  simulateRawLifecycle(species, lifeDeathPlan, biome, countryData) {
    const rawEvents = [];
    const finalAge = lifeDeathPlan.finalAge;
    const unit = species.unit;

    for (let age = 0; age <= finalAge; age++) {
      const isFinalYear = (age === finalAge);
      const stage = this.getStageForAge(species, age);

      if (age === 0) {
        rawEvents.push({
          age: 0,
          unit,
          season: "初誕之季",
          type: "birth",
          rawText: species.isHuman 
            ? `在${countryData.name}平安降生，第一聲啼哭在產房中迴盪。`
            : `在${biome.name}破曉的微光中降生，感受母體的溫度與初次呼吸。`,
          statChange: { health: +5, energy: +10 }
        });
        continue;
      }

      if (isFinalYear) {
        rawEvents.push({
          age,
          unit,
          season: "終幕之期",
          type: "death",
          rawText: `${lifeDeathPlan.deathCause}。這段荒野旅程劃下了休止符。`,
          statChange: { health: -100 }
        });
        break;
      }

      // 產生該時期的常態生態遭遇
      const occurrences = this.generateEcologicalEncounters(species, age, stage, biome, countryData);
      occurrences.forEach(occ => rawEvents.push(occ));
    }

    return rawEvents;
  },

  /**
   * 根據物種與時空生成生態統計遭遇
   */
  generateEcologicalEncounters(species, age, stage, biome, countryData) {
    const unit = species.unit;
    const encounters = [];
    const seasons = ["春", "夏", "秋", "冬"];

    // 每年模擬 1~2 個事件
    const season = seasons[age % 4];

    if (species.isHuman) {
      if (age <= 6) {
        encounters.push({
          age,
          unit,
          season,
          type: "routine_growth",
          rawText: `幼兒期生長發育，開始牙牙學語與探索身邊環境。`,
          statChange: { instinct: +4, social: +3 }
        });
      } else if (age <= 18) {
        encounters.push({
          age,
          unit,
          season,
          type: Math.random() < 0.4 ? "milestone" : "routine_school",
          rawText: Math.random() < 0.4 
            ? `在${countryData.name}面臨關鍵升學考試與同儕競合，熬夜讀書。`
            : `在學校與社群中度過平穩求學時光，結識好友。`,
          statChange: { instinct: +6, energy: -5 }
        });
      } else if (age <= 60) {
        const moneyDelta = (Math.random() * 0.4 - 0.1) * countryData.localEquivMonthly;
        encounters.push({
          age,
          unit,
          season,
          type: Math.random() < 0.35 ? "milestone" : "routine_work",
          rawText: Math.random() < 0.35
            ? `職場生涯轉折：參與重大專案並承受高壓工作負載，薪水調升。`
            : `日復一日的職場日常通勤與生計打拼，生活開銷持平。`,
          statChange: { resource: Math.round(moneyDelta), health: -2, energy: -3 }
        });
      } else {
        encounters.push({
          age,
          unit,
          season,
          type: "routine_elder",
          rawText: `進入退休歲月，體力漸退，常在公園散步或回憶往事。`,
          statChange: { health: -4, energy: -4, social: +2 }
        });
      }
      return encounters;
    }

    // 野生動物生態事件
    const roll = Math.random();
    if (roll < 0.3) {
      // 獵食與覓食
      encounters.push({
        age,
        unit,
        season,
        type: "foraging",
        rawText: `在${biome.name}追蹤${biome.prey}，憑藉本能精準出擊，飽餐一頓。`,
        statChange: { energy: +12, health: +4 }
      });
    } else if (roll < 0.55) {
      // 領地巡邏與環境威脅
      encounters.push({
        age,
        unit,
        season,
        type: "territory_danger",
        rawText: `巡邏領地邊界，遭遇鄰近族群氣味標記與警告低吼，雙方對峙後退讓。`,
        statChange: { instinct: +8, energy: -8 }
      });
    } else if (roll < 0.8) {
      // 極端氣候或常態遷徙
      encounters.push({
        age,
        unit,
        season,
        type: "climate_test",
        rawText: `${season}季遭逢嚴峻天氣考驗，蜷縮於隱蔽岩穴避寒耐飢。`,
        statChange: { energy: -10, health: -2 }
      });
    } else {
      // 平淡渡過
      encounters.push({
        age,
        unit,
        season,
        type: "routine_survival",
        rawText: `氣候溫和，獵物充裕，在族群邊緣平穩度過此季節。`,
        statChange: { health: +2, energy: +4 }
      });
    }

    return encounters;
  },

  /**
   * AI 去重與修剪管道 (AI Deduplication Engine)
   * 刪除連續過度重複的日常事件（例如連續多年的平穩覓食或日常通勤），
   * 合併成精煉生動的生命階段標記，讓玩家看到的事件流每一條都具有意義。
   */
  aiDeduplicateEvents(rawEvents, species) {
    const deduplicated = [];
    let consecutiveRoutineCount = 0;
    let pendingRoutineGroup = null;

    for (let i = 0; i < rawEvents.length; i++) {
      const evt = rawEvents[i];

      // 保留出生、死亡與關鍵里程碑
      if (evt.type === "birth" || evt.type === "death" || evt.type === "milestone" || evt.type === "territory_danger") {
        if (pendingRoutineGroup) {
          deduplicated.push(this.formatConsolidatedRoutine(pendingRoutineGroup, species));
          pendingRoutineGroup = null;
          consecutiveRoutineCount = 0;
        }
        deduplicated.push(this.aiPolishEvent(evt, species));
        continue;
      }

      // 檢查是否為重複的常規事件
      if (evt.type.startsWith("routine") || evt.type === "foraging" || evt.type === "climate_test") {
        if (!pendingRoutineGroup) {
          pendingRoutineGroup = {
            startAge: evt.age,
            endAge: evt.age,
            unit: evt.unit,
            types: [evt.type],
            events: [evt]
          };
          consecutiveRoutineCount = 1;
        } else {
          pendingRoutineGroup.endAge = evt.age;
          pendingRoutineGroup.types.push(evt.type);
          pendingRoutineGroup.events.push(evt);
          consecutiveRoutineCount++;

          // 若連續達到 3 期以上，或者到達中年轉折，進行壓縮
          if (consecutiveRoutineCount >= 3) {
            deduplicated.push(this.formatConsolidatedRoutine(pendingRoutineGroup, species));
            pendingRoutineGroup = null;
            consecutiveRoutineCount = 0;
          }
        }
      }
    }

    if (pendingRoutineGroup) {
      deduplicated.push(this.formatConsolidatedRoutine(pendingRoutineGroup, species));
    }

    return deduplicated;
  },

  /**
   * 將連續重複的日常事件壓縮成單一有意義的階段紀錄
   */
  formatConsolidatedRoutine(group, species) {
    const span = group.endAge - group.startAge;
    const unit = group.unit;
    const ageLabel = span > 0 ? `${group.startAge}～${group.endAge} ${unit}` : `${group.startAge} ${unit}`;

    let polishedText = "";
    if (species.isHuman) {
      polishedText = `【生活沉澱期】連續${span + 1}個年頭，在工作、家庭與社交生活中維持規律節奏，積累了寶貴的社會履歷與人脈。`;
    } else {
      polishedText = `【野性熟成期】連續${span + 1}個歲月在領地內巡獵。在一次次的伏擊與追逐中，筋骨變得更為結實，熟悉林間每一處風向與微小聲響。`;
    }

    return {
      age: group.startAge,
      endAge: group.endAge,
      ageLabel,
      type: "consolidated_period",
      isConsolidated: true,
      text: polishedText,
      statChange: { instinct: +6, health: +3, energy: +2 }
    };
  },

  /**
   * AI 潤色個別事件：將生硬統計資料轉化為生動精準的短句
   */
  aiPolishEvent(evt, species) {
    const ageLabel = `${evt.age} ${evt.unit}・${evt.season}`;
    let polishedText = evt.rawText;

    if (evt.type === "territory_danger") {
      polishedText = species.isHuman 
        ? `在職場或生活遭遇嚴重利益爭端與對立，歷經一番周旋才化險為夷。`
        : `邊境爆發緊張對峙！與入侵的同族互露獠牙警告，空氣中瀰漫火藥味，所幸成功守住領界。`;
    }

    return {
      age: evt.age,
      ageLabel,
      type: evt.type,
      text: polishedText,
      statChange: evt.statChange || {}
    };
  },

  /**
   * 艾琳·杭特風格（10+ 半馬賽克）小說序幕撰寫
   */
  writeErinHunterPrologue(species, name, biome, countryData, lifeDeathPlan) {
    if (species.isHuman) {
      return `夜色在${countryData.name}的天際線緩緩隱退。一陣尖銳的胎心監護儀蜂鳴聲中，你用力吸入了這個文明世界的第一口冰涼空氣。\n\n消毒水、窗外的雨氣，以及兩雙溫暖大手輕輕將你裹入柔軟的棉被。你不知道這個國家的吉尼係數、人均所得或是醫療負擔，但心臟在小小的胸膛裡有力地跳動著——你成為了這個星球八十億人中的一員，一個名為「${name}」的人類旅程正式啟航。`;
    }

    // 艾琳·杭特純粹動物感官筆觸
    return `黑暗，黏稠而溫暖。鼻腔裡首先充斥著母親腹毛上帶有潮濕泥土與落葉的濃烈氣味。\n\n遠處傳來風穿過高大林冠的呼嘯，伴隨著極遙遠的一聲雷鳴。你微弱地蹬動四肢，盲目的眼皮試圖阻擋縫隙中滲入的清冷微光。一隻粗糙而溫暖的舌頭舔過你的耳廓，帶來了本能的戰慄與安心。\n\n在${biome.name}這片古老荒野裡，無數生靈在泥土、草葉與暴雪間誕生、獵食與逝去。你的名字是「${name}」——這片廣袤天地已經在你的骨髓深處留下了第一道印記。`;
  },

  /**
   * 編織半互動式小說時間線（包含抉擇分支與命運節點）
   */
  compileStoryTimeline(species, name, events, lifeDeathPlan, biome, countryData) {
    const chapters = [];
    const unit = species.unit;
    const finalAge = lifeDeathPlan.finalAge;

    // 依年齡階段挑選 4~6 個核心小說章節
    const chapterAges = this.selectMilestoneAges(finalAge);

    chapterAges.forEach((age, idx) => {
      const isLast = (age === finalAge);
      const isChoice = !isLast && (idx === 1 || idx === 2 || idx === 3);

      const chapter = this.generateChapterContent({
        species,
        name,
        age,
        unit,
        biome,
        countryData,
        isLast,
        isChoice,
        chapterIndex: idx + 1,
        lifeDeathPlan
      });

      chapters.push(chapter);
    });

    return chapters;
  },

  selectMilestoneAges(finalAge) {
    if (finalAge <= 1) return [0, finalAge];
    if (finalAge <= 3) return [0, 1, finalAge];
    if (finalAge <= 6) return [0, 1, 3, finalAge];
    if (finalAge <= 15) return [0, 2, 5, 8, finalAge];
    return [0, 3, 10, 25, Math.floor(finalAge * 0.7), finalAge];
  },

  /**
   * 艾琳·杭特式章節生成器（強調感官、心理、半馬賽克搏鬥與莊嚴宿命）
   */
  generateChapterContent(params) {
    const { species, name, age, unit, biome, countryData, isLast, isChoice, chapterIndex, lifeDeathPlan } = params;
    const isHuman = species.isHuman;

    let title = `第${chapterIndex}章 · `;
    let narrative = "";
    let choices = null;

    if (age === 0) {
      title += isHuman ? `誕生之鳴` : `苔原與母體微光`;
      narrative = isHuman
        ? `五歲之前的歲月，世界由模糊的光影、父母的懷抱以及最初的語言片段拼湊而成。在${countryData.name}，你第一次學會走路，在跌倒與哭泣中摸索這個文明社會的輪廓。`
        : `幼時的記憶由黑暗中溫熱的皮毛與乳汁的甜香構築。當你第一次跌跌撞撞爬出洞穴時，冰冷的空氣刺得鼻尖生疼。你看見了無邊無際的樹海與高懸的灰白色天空，那是荒野向你發出的第一聲無言呼喚。`;
    } else if (isLast) {
      title += `星芒與永恆長眠`;
      narrative = isHuman
        ? `在${age}歲這一年，醫院監護儀上的波形逐漸平緩。窗外陽光穿過樹梢灑在白色的被單上。親友握著你的手，耳邊傳來溫和的道別聲。在${countryData.name}經歷過歡笑、奮鬥與遺憾的一生，在此刻歸於最深沉的安詳。`
        : `【半馬賽克終曲】寒風吹過粗糙的被毛，四肢沉重如灌滿了鉛。視線中的群山與林冠逐漸模糊化為朦朧的灰影。耳畔迴盪著爪尖踩碎枯枝的微弱脆響，伴隨骨骼深處傳來的久遠疲憊。疼痛正奇蹟般地退去，只剩下一股如春日陽光般的暖意悄然蔓延——你緩緩合上雙眼，靈魂如奔向繁星的輕風，回歸荒野的古老懷抱。`;
    } else if (isChoice) {
      // 互動抉擇章節！
      if (isHuman) {
        title += `人生的分水嶺抉擇`;
        narrative = `在${age}歲這一年，現實的重壓如陰雲般籠罩在頭頂。一邊是平穩但一眼望穿的穩定工作，另一邊是充滿未知風險但可能改寫命運的創業冒險，或是遠赴異地求學的決定。你在深夜的書桌前盯著合約與帳單，心跳因焦慮與渴望而加速。`;
        choices = [
          {
            text: "選擇極端冒險：投入所有積蓄開創新局",
            impact: "野性/智識 +15，儲蓄資源 -40，高風險回報",
            statChange: { instinct: +15, resource: -40000, energy: -15 },
            followupText: "你簽下了這份合約。接下來的數百個夜晚，咖啡與焦慮伴隨著你，但也為你撕開了嶄新世界的入口。"
          },
          {
            text: "穩紮穩打：留守既有崗位，累積人脈與存款",
            impact: "儲蓄穩定成長，羈絆 +10，生活平穩",
            statChange: { resource: +25000, social: +10, energy: +5 },
            followupText: "你選擇了克制。生活像一條平靜的河流緩緩向前，雖然少了驚心動魄，卻多了一份遮蔽風雨的踏實。"
          },
          {
            text: "兼顧平衡：發展副業，探尋另一種可能",
            impact: "體力消耗大，但多方下注",
            statChange: { energy: -20, resource: +10000, instinct: +8 },
            followupText: "你開始了日夜兼程的生活。疲憊寫在眼角，但內心點燃的希望支撐著你熬過每一個凌晨。"
          }
        ];
      } else {
        // 艾琳·杭特式野生動物重大抉擇
        title += `利爪與暗影的交鋒`;
        narrative = `【艾琳·杭特式半馬賽克描繪】\n狂風捲起刺鼻的腐植土與陌生公獸的兇猛氣息。灌木叢劇烈晃動，一對琥珀色的森冷瞳孔自陰影中顯現！\n對方的喉頭發出雷鳴般的咆哮，肩背肌肉如鋼纜般繃緊，尖銳的利爪在凍土上刮出深痕。鮮血的腥味在寒風中驟然升騰——這是一場爭奪獵場或生死存亡的宿命對決！你的背毛猛烈炸開，喉嚨發出警告的嘶鳴，心臟在肋骨間急促撞擊！`;
        choices = [
          {
            text: "亮出獠牙正面迎擊！捍衛尊嚴與領地",
            impact: "展現領袖魄力！體能消耗劇烈，可能負傷但威名大震",
            statChange: { health: -15, energy: -25, instinct: +20, social: +15 },
            followupText: "雙方在泥濘與飛濺的草屑中轟然撞在一起！銳利的爪尖擦過你的肩頭，撕開灼熱的皮肉，溫熱的血珠在毛髮上凝結；但你咬緊牙關發出震天的狂吼，藉著下顎的猛烈扭咬重重將對手逼退入林木深處！"
          },
          {
            text: "低伏身姿，利用敏捷身手迂迴避入密林深處",
            impact: "保留實力！消耗較少體能，但可能失去部分地盤",
            statChange: { energy: -10, instinct: +10, health: -2 },
            followupText: "你壓低重心，如同一道無聲的暗影滑入荊棘叢中。背後傳來對手示威性的咆哮，刺鼻的泥水浸濕了你的腳掌，但你保全了最核心的生存力量。"
          },
          {
            text: "發出呼喚！引領同族夥伴發起群體包圍",
            impact: "考驗族群羈絆！成功則無損驅逐強敵",
            statChange: { social: +20, energy: -15, instinct: +12 },
            followupText: "你昂首向天發出悠長而急迫的嗥鳴！林地各處立刻傳來響應的呼喝聲，數道矯健的影子自樹影後疾馳而來，化為銅牆鐵壁，令強敵在震驚中夾起尾巴倉皇遁逃！"
          }
        ];
      }
    } else {
      // 命運考驗章節 (不可逆的生態命運)
      if (isHuman) {
        title += `時代浪潮與不可測之命運`;
        narrative = `在${age}歲這一年，全球經濟劇烈波動與科技變革席捲了${countryData.name}。通貨膨脹、產業轉型讓每個人都在風浪中顛簸。你見證了身邊朋友的聚散起落，學會了在無奈與堅韌中尋找平靜。`;
      } else {
        title += `嚴冬暴雪與自然的試煉`;
        narrative = `【大自然的命運法則】\n罕見的五十年極端暴雪連續肆虐了三個星期。積雪深達腹部，獵物早已銷聲匿跡。寒冷如同細密的鋼針刺透每一寸骨骼，胃部因極度飢餓而劇烈抽搐。\n這不是戰鬥，而是面對大自然浩瀚法則的無言忍耐。你只能縮在落葉與積雪的避風凹地裡，用同伴微弱的體溫相互支撐，等待暴風雪停歇的那一絲微光。`;
      }
    }

    return {
      age,
      unit,
      title,
      narrative,
      choices
    };
  },

  getStageForAge(species, age) {
    for (let st of species.stages) {
      if (age >= st.min && age <= st.max) return st;
    }
    return species.stages[species.stages.length - 1];
  }
};
