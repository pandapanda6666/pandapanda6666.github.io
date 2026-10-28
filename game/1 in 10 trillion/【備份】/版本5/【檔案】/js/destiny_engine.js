/**
 * 十兆分之一 (1 in 10 Trillion) - 命運統計與艾琳·杭特式 AI 敘事引擎
 * 流程：
 * 1. 根據物種生態統計表產生一生年表 (Cohort Hazard Simulation)
 * 2. AI 智慧剪輯去重：合併日常重複瑣事，凸顯生命轉折
 * 3. 艾琳·杭特式（半馬賽克 10+）小說生成：按物種特徵、成長期動態編織獨一無二的感官篇章與抉擇
 */

window.DestinyEngine = {
  formatChapterTitle(index) {
    const chNums = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十",
                    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
                    "二十一", "二十二", "二十三", "二十四", "二十五", "二十六", "二十七", "二十八", "二十九", "三十"];
    return "第" + (chNums[index] || index) + "章";
  },

  /**
   * 產生一生完整生命軌跡與事件 (支援多重稱呼與無名空白、個體自主意識)
   */
  generateLifeTrajectory(species, config = {}) {
    const isHuman = species.isHuman;
    const biome = species.biomes[Math.floor(Math.random() * species.biomes.length)];

    let countryData = null;
    if (isHuman) {
      const cList = species.countries;
      countryData = config.country || cList[Math.floor(Math.random() * cList.length)];
    }

    // 命名處理：野生生靈在自然界初生時無受命名，姓名格為空白！
    let currentName = "";
    const names = [];

    if (isHuman) {
      currentName = config.customName || species.namingPool[Math.floor(Math.random() * species.namingPool.length)];
      names.push({ source: "戶籍登記名", name: currentName, time: "誕生" });
    } else if (config.customName) {
      currentName = config.customName;
      names.push({ source: "指定命名", name: currentName, time: "誕生" });
    }

    // 1. 根據統計曲線計算壽命極限與死因
    const lifeDeathPlan = this.calculateLifespanAndFate(species, countryData);

    // 2. 原始年表模擬：逐年/逐期生成生態統計事件 (含個體獨立思維與動態命名機會)
    const rawEvents = this.simulateRawLifecycle(species, lifeDeathPlan, biome, countryData, names);

    // 若歷程中有獲得稱呼，更新 currentName
    if (names.length > 0 && !currentName) {
      currentName = names[names.length - 1].name;
    }

    // 3. AI 智慧去重與修剪：過濾重複的日常事件，提煉核心轉折
    const deduplicatedEvents = this.aiDeduplicateEvents(rawEvents, species);

    // 4. 生成作家小說序幕 (出生登記段落，動態物種專屬)
    const prologueNovel = this.generateChapterOneNarrative(species, currentName, biome, countryData, config.author, config.contentMode);

    // 5. 動態編織完全不重複、依據物種特化的互動抉擇與命運章節 (篇名嚴格規定為第N章)
    const storyTimeline = this.compileStoryTimeline(species, currentName, deduplicatedEvents, lifeDeathPlan, biome, countryData, config);

    return {
      species,
      name: currentName,
      names,
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
        instinct: isHuman ? 50 : 70,
        social: 80,
        resource: isHuman ? countryData.localEquivMonthly * 2 : 50
      }
    };
  },

  calculateLifespanAndFate(species, countryData) {
    const maxAge = species.maxAge;
    let finalAge = 0;
    let deathCause = "";

    const infantSurvival = species.isHuman && countryData
      ? (1 - countryData.infantMortality)
      : species.infantSurvivalRate;

    if (Math.random() > infantSurvival) {
      finalAge = species.unit === "週" ? Math.floor(Math.random() * 3) : (Math.random() < 0.6 ? 0 : 1);
      deathCause = species.threats[Math.floor(Math.random() * species.threats.length)];
      return {
        finalAge,
        deathCause,
        survivalPercentile: Math.max(1, Math.floor(infantSurvival * 100))
      };
    }

    const avgWild = species.isHuman && countryData ? countryData.avgLifespan : species.avgAgeWild;

    for (let age = 1; age <= maxAge; age++) {
      const ageRatio = age / maxAge;
      let annualHazard = Math.pow(ageRatio, 2.3) * (age > avgWild ? 0.35 : 0.12);
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

    let survivalPercentile = Math.min(99, Math.max(5, Math.floor((finalAge / maxAge) * 100)));
    return { finalAge, deathCause, survivalPercentile };
  },

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

      const occurrences = this.generateEcologicalEncounters(species, age, stage, biome, countryData);
      occurrences.forEach(occ => rawEvents.push(occ));
    }

    return rawEvents;
  },

  generateEcologicalEncounters(species, age, stage, biome, countryData) {
    const unit = species.unit;
    const encounters = [];
    const seasons = ["春", "夏", "秋", "冬"];
    const season = seasons[age % 4];

    if (species.isHuman) {
      if (age <= 6) {
        encounters.push({
          age, unit, season, type: "routine_growth",
          rawText: `幼兒期生長發育，開始牙牙學語與探索身邊環境。`,
          statChange: { instinct: +4, social: +3 }
        });
      } else if (age <= 18) {
        encounters.push({
          age, unit, season,
          type: Math.random() < 0.4 ? "milestone" : "routine_school",
          rawText: Math.random() < 0.4
            ? `在${countryData.name}面臨關鍵升學考試與同儕競合，熬夜讀書。`
            : `在學校與社群中度過平穩求學時光，結識好友。`,
          statChange: { instinct: +6, energy: -5 }
        });
      } else if (age <= 60) {
        const moneyDelta = (Math.random() * 0.4 - 0.1) * countryData.localEquivMonthly;
        encounters.push({
          age, unit, season,
          type: Math.random() < 0.35 ? "milestone" : "routine_work",
          rawText: Math.random() < 0.35
            ? `職場生涯轉折：參與重大專案並承受高壓工作負載，薪水調升。`
            : `日復一日的職場日常通勤與生計打拼，生活開銷持平。`,
          statChange: { resource: Math.round(moneyDelta), health: -2, energy: -3 }
        });
      } else {
        encounters.push({
          age, unit, season, type: "routine_elder",
          rawText: `進入退休歲月，體力漸退，常在公園散步或回憶往事。`,
          statChange: { health: -4, energy: -4, social: +2 }
        });
      }
      return encounters;
    }

    const roll = Math.random();
    if (roll < 0.3) {
      encounters.push({
        age, unit, season, type: "foraging",
        rawText: `在${biome.name}追蹤${biome.prey}，憑藉本能精準出擊，飽餐一頓。`,
        statChange: { energy: +12, health: +4 }
      });
    } else if (roll < 0.55) {
      encounters.push({
        age, unit, season, type: "territory_danger",
        rawText: `巡邏領地邊界，遭遇鄰近族群氣味標記與警告低吼，雙方對峙後退讓。`,
        statChange: { instinct: +8, energy: -8 }
      });
    } else if (roll < 0.8) {
      encounters.push({
        age, unit, season, type: "climate_test",
        rawText: `${season}季遭逢嚴峻天氣考驗，蜷縮於隱蔽岩穴避寒耐飢。`,
        statChange: { energy: -10, health: -2 }
      });
    } else {
      encounters.push({
        age, unit, season, type: "routine_survival",
        rawText: `氣候溫和，獵物充裕，在族群邊緣平穩度過此季節。`,
        statChange: { health: +2, energy: +4 }
      });
    }

    return encounters;
  },

  aiDeduplicateEvents(rawEvents, species) {
    const deduplicated = [];
    let consecutiveRoutineCount = 0;
    let pendingRoutineGroup = null;

    for (let i = 0; i < rawEvents.length; i++) {
      const evt = rawEvents[i];

      if (evt.type === "birth" || evt.type === "death" || evt.type === "milestone" || evt.type === "territory_danger") {
        if (pendingRoutineGroup) {
          deduplicated.push(this.formatConsolidatedRoutine(pendingRoutineGroup, species));
          pendingRoutineGroup = null;
          consecutiveRoutineCount = 0;
        }
        deduplicated.push(this.aiPolishEvent(evt, species));
        continue;
      }

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

  writeErinHunterPrologue(species, name, biome, countryData, lifeDeathPlan) {
    if (species.isHuman) {
      return `夜色在${countryData.name}的天際線緩緩隱退。一陣尖銳的胎心監護儀蜂鳴聲中，你用力吸入了這個文明世界的第一口冰涼空氣。\n\n消毒水、窗外的雨氣，以及兩雙溫暖大手輕輕將你裹入柔軟的棉被。你不知道這個國家的吉尼係數、人均所得或是醫療負擔，但心臟在小小的胸膛裡有力地跳動著——你成為了這個星球八十億人中的一員，一個名為「${name}」的人類旅程正式啟航。`;
    }

    return `黑暗，黏稠而溫暖。鼻腔裡首先充斥著母親腹毛上帶有潮濕泥土與落葉的濃烈氣味。\n\n遠處傳來風穿過高大林冠的呼嘯，伴隨著極遙遠的一聲雷鳴。你微弱地蹬動四肢，盲目的眼皮試圖阻擋縫隙中滲入的清冷微光。一隻粗糙而溫暖的舌頭舔過你的耳廓，帶來了本能的戰慄與安心。\n\n在${biome.name}這片古老荒野裡，無數生靈在泥土、草葉與暴雪間誕生、獵食與逝去。你的名字是「${name}」——這片廣袤天地已經在你的骨髓深處留下了第一道印記。`;
  },

  /**
   * 編織半互動式小說時間線（保證章節完全不重複，依據年齡階段與物種專屬情境演繹）
   */
  compileStoryTimeline(species, name, events, lifeDeathPlan, biome, countryData, config = {}) {
    const chapters = [];
    const finalAge = lifeDeathPlan.finalAge;
    const chapterAges = this.selectMilestoneAges(finalAge);

    chapterAges.forEach((age, idx) => {
      const isLast = (age === finalAge);
      const isChoice = !isLast && idx > 0;

      const chapter = this.generateUniqueChapter({
        species,
        name,
        age,
        biome,
        countryData,
        isLast,
        isChoice,
        chapterIndex: idx + 1,
        stepIndex: idx,
        author: config.author || "erinhunter",
        mode: config.contentMode || "normal"
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
   * 物種專屬章節生成器（篇名嚴格規定只能是「第一章」、「第二章」…不可有標題）
   */
  /**
   * 自然段落智能切分器：確保文本具備 2 到 3 個段落，段首縮排兩字
   */
  splitIntoNaturalParagraphs(text) {
    if (!text) return [];
    const rawParts = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
    const result = [];

    rawParts.forEach(part => {
      if (/^【第[零一二三四五六七八九十百]+章】$/.test(part)) {
        result.push(part);
        return;
      }
      // 若單一段落過長（超過 110 字且無分段），在標點處自然切分
      if (part.length > 110) {
        const sentences = part.match(/[^。！？]+[。！？]*/g) || [part];
        let buf = "";
        sentences.forEach(s => {
          if (buf.length + s.length > 95 && buf.length >= 50) {
            result.push(buf);
            buf = s;
          } else {
            buf += s;
          }
        });
        if (buf) result.push(buf);
      } else {
        result.push(part);
      }
    });

    return result.length > 0 ? result : [text];
  },

  /**
   * 根據物種、棲地、作家與模式動態生成第一章開篇小說（嚴格分成 2-3 段落）
   */
  generateChapterOneNarrative(species, name, biome, countryData, author = "erinhunter", mode = "normal") {
    const isHuman = species.isHuman;
    const sId = species.id;
    const bName = biome ? biome.name : "未知生境";

    if (isHuman) {
      const cName = (countryData && countryData.name) ? countryData.name : "這個國度";
      return `在${cName}，最初的記憶始於刺目而潔白的產房頂燈，以及猛然湧入肺部的第一口灼熱空氣。伴隨著劃破寂靜的清脆啼哭，冰涼的世界在被柔軟溫暖的襁褓包裹的那一刻安靜了下來。\n\n小小的手掌在半空中無意識地抓握，指尖碰觸到母親微顫而帶著淚痕的臉頰。窗外是這座國度日夜奔流的街道脈動與喧囂，在家庭、社會與文明交織的龐大網絡中，你作為八十億分之一的微光，正式啟程。`;
    }

    // 依據物種 ID 精準配置專屬生物感官與生態細節（絕不混淆）
    if (sId === "gray_wolf") {
      return `洞穴深處瀰漫著濃重的潮濕泥土與母狼腹毛的溫熱。最初的知覺是緊閉的眼皮外朦朧的微光，以及同胞幼崽擠挨在身側急促微弱的心跳。乳汁的甘甜伴隨著母親溫柔粗糙的舌舔，撫平了初臨塵世的戰慄。\n\n幾週後，稚嫩的四爪終於跌跌撞撞地邁出了幽暗的石穴。迎面而來的是${bName}凜冽刺骨的寒風，松針與未融的殘雪在腳掌下發出細碎的脆響。遠方山嶺間迴盪起族群蒼涼綿長的嗥叫，荒野用第一陣戰慄與浩瀚，向你宣示了獵手一生的宿命。`;
    }

    if (sId === "feral_cat" || species.name.includes("貓")) {
      return `紙箱與廢棄磚瓦搭建的狹縫裡，殘留著瀝青與雨水的混合氣味。幾隻毛茸茸的手足在陰暗的角落裡交疊蜷縮，母親輕柔的咕嚕聲如引擎般震顫著單薄的胸膛，驅散了破瓦殘縫間漏進的初春寒意。\n\n當藍灰色的幼貓瞳孔第一次聚焦，映入眼簾的是霓虹閃爍的水泥縫隙與高聳如峭壁的垃圾箱。遠處急馳而過的車輪掀起刺鼻的尾氣，身旁的母貓警惕地豎直了耳尖。這片由人類遺棄物與暗巷鼠跡構築的領地，就是你必須用利爪征服的全部世界。`;
    }

    if (sId === "orca" || species.category === "marine") {
      return `沒有重力，沒有泥土，唯有一片無邊無際的湛藍與冰冷水流包裹著身軀。剛脫離母體的一剎那，本能驅使著尾鰭用力擺動，母親與族群副手隨即以強健的身軀將你托向海面。破水而出的瞬間，頭頂的氣孔噴出一道細密的白霧，吸入了${bName}純淨而冷冽的第一口空氣。\n\n沉入海面之下，家族特有的高頻哨音與回聲定位脈衝在深邃的海溝間迴盪，如同一張無形而溫暖的聲波搖籃。龐大如島嶼的親族在身側靜默伴游，黑白分明的流線身軀撕開浪潮，帶你領略這片縱橫萬里的冰海王者疆域。`;
    }

    if (sId === "emperor_penguin") {
      return `零下四十度的極地暴風雪在幾寸之外咆哮，但你所感知的第一個世界，卻是父親溫暖緊繃的育兒袋皺褶與厚重脂肪層。微小的喙尖破開堅硬的卵殼，在黑暗中發出微弱而尖銳的索食嘶鳴。\n\n暴風雪暫歇的短暫時刻，父親微微抬起腹部羽翼。那一瞬間，極晝微光下耀眼奪目的藍白冰原與千萬同族緊密相依的壯闊景象震撼了幼小的心靈。在無邊無際的白色荒原邊緣，死寂與嚴寒構築了最嚴苛的生存試煉。`;
    }

    if (sId === "african_elephant") {
      return `烈日烘烤著赤紅的大地，金黃色的草浪在熱浪中蒸騰扭曲。甫一落地，四條如石柱般笨拙的長腿便在母象長鼻的輕柔扶持下，一次次摔倒又固執地站起。熱風掠過寬大薄嫩的雙耳，送來遠方相思樹皮與乾燥泥土的氣息。\n\n整個象群停下了遷徙的沉重腳步，圍攏成一道堅不可摧的移動肉牆，族群長老的長鼻輕撫過你的背脊，發出低沉而溫柔的次聲波共鳴。在獅群潛伏的金色大草原上，古老的家族記憶與無盡的跋涉就此啟航。`;
    }

    if (sId === "green_sea_turtle") {
      return `潮濕而溫熱的沙層深處，卵殼破裂的細響在黑暗中蔓延。數十隻同胞本能地一齊向上攀爬、扒開鬆散的珊瑚砂。當第一顆小腦袋頂破沙面，滿天璀璨的星光與白色海浪的磷光瞬間照亮了幼小的眼眸。\n\n沒有任何母性的庇護與告別，落地即是生死競速。夜空下，幽靈蟹在沙灘上橫行，海鳥的雙眼在樹影中窺伺。你揮動著如槳般的細小前肢，向著那片轟鳴而發光的大海拼盡全力狂奔，躍入翻滾浪潮的瞬間，漫長的大洋漂流正式展開。`;
    }

    if (sId === "red_fox") {
      return `山坡樹根下的泥穴裡，散發著乾草與母狐被毛濃郁的野性氣味。柔軟的小爪相互推搡著爭奪乳頭，耳尖微微顫動，捕捉著泥土上方傳來的落葉沙沙聲與晨露滴落的脆響。\n\n幾週後，大膽地探出洞口，初升的旭日將你赤紅如火焰的絨毛鍍上一層金輝。一隻金龜子在苔蘚上爬過，引發了你第一次笨拙的撲擊；遠處農莊的犬吠隱隱傳來，機敏與狡黠的天性在這一刻悄然覺醒。`;
    }

    if (sId === "honeybee" || species.category === "insect") {
      return `封蓋的六角形蠟房內，最後一層薄膜被堅硬的上顎咬破。伸展出濕漉漉的六足與透明的雙翅，空氣中瀰漫著溫熱濃郁的蜂蜜香氣與蜂王漿的信息素。身旁忙碌的撫育蜂用觸角輕柔觸碰，清理著身上的蠟屑。\n\n蜂巢深處如同一座精密運轉的金色鐘錶，數萬名姐妹的翅膀振動發出和諧的共鳴。當翅膀在溫暖的巢風中徹底晾乾硬化，本能的指令已在神經中樞中啟動——清理巢房、侍奉幼蟲，直到飛向藍天探尋花海，你的一生是無私與奉獻的壯麗史詩。`;
    }

    if (sId === "common_raven" || species.category === "avian") {
      return `松枝與羊毛編織的巨巢高懸在冷杉樹冠之巔。破殼而出的那一刻，光禿的頭頂感受到了高空冷冽氣流的激盪。親鳥漆黑如鐵的巨喙銜著腐肉與漿果俯下身來，發出深沉低沉的金屬般咕噥聲。\n\n烏黑的羽管在春風中迅速拔節生長，一對漆黑如黑曜石的敏銳雙眼好奇地審視著大地上的一切動靜。狼群在雪谷中狩獵的喧囂引來了注意——作為荒野中最具智慧的飛行觀察者，你與猛獸共生的傳奇旅程由此啟幕。`;
    }

    // 通用自然生靈備援（嚴格分段，按生境描寫）
    return `在${bName}的晨曦微光中，最初的生命脈動悄然甦醒。微風拂過初生的軀體，帶來了泥土、草葉與遠方同伴微弱的氣息，生命的本能在此刻被全面喚醒。\n\n睜開雙眸的那一瞬，浩瀚的天地在眼前鋪展而開。無論前路隱伏著多少風雨與捕食者的陰影，屬於你的這一篇章已然展開，以最純粹的野性力量向荒野致敬。`;
  },

  /**
   * 物種專屬章節生成器（篇名嚴格規定只能是「第一章」、「第二章」…不可有標題）
   */
  generateUniqueChapter(params) {
    const { species, name, age, biome, countryData, isLast, isChoice, chapterIndex, stepIndex, author, mode } = params;
    const isHuman = species.isHuman;
    const title = this.formatChapterTitle(chapterIndex);

    // 開篇第一章 (誕生與幼年探索)
    if (chapterIndex === 1) {
      const narrative = this.generateChapterOneNarrative(species, name, biome, countryData, author, mode);
      return { age, title, narrative, choices: null };
    }

    // 終幕章節 (生命回歸)
    if (isLast) {
      const narrative = isHuman
        ? `歲月在鬢角染上霜白，病房的窗櫺外是${countryData ? countryData.name : ''}熟悉的街道夕陽。監護儀器緩慢而規律地震顫著，親人的掌心傳來熟悉的暖意。\n\n回顧這一生走過的坎坷與選擇，心跳漸漸放慢，如同一葉扁舟平穩駛入了無風的港灣，歸於久違的安息。`
        : `刺骨的寒風穿過斑白襤褸的皮毛，四肢沉重如鉛。骨骼深處隱隱作痛，但視線中的山嵐與林濤卻透出一種奇異的清澈與平靜。\n\n沒有恐懼，也沒有慌亂，耳邊彷彿迴盪起年少時狂奔的呼嘯聲。你緩緩伏下身軀，將下顎貼在冰涼的泥土上，任由最後一口吐息化作微風，奔向群星與先祖的古老獵場。`;
      return { age, title, narrative, choices: null };
    }

    // 中間章節：依據物種分類與年齡階段抽選情境
    const scenario = this.pickDynamicScenario(species, name, age, biome, countryData, stepIndex);
    return {
      age,
      title,
      narrative: scenario.narrative,
      choices: isChoice ? scenario.choices : null
    };
  },

  /**
   * 根據物種與生命週期挑選獨特情境
   */
  pickDynamicScenario(species, name, age, biome, countryData, stepIndex) {
    const isHuman = species.isHuman;

    // 1. 人類情境庫
    if (isHuman) {
      if (stepIndex === 1) {
        return {
          title: "校園同儕與最初的考驗",
          narrative: `在${countryData.name}的少年時代，課堂的鐘聲、堆積的課本與同儕間複雜微妙的人際圈成了你的全部世界。一場關鍵的考核與好友的誤會同時降臨，深夜的檯燈下，你揉著酸澀的雙眼，思索著自己的堅持與未來的方向。`,
          choices: [
            {
              text: "專注課業競逐高分，暫時放下社交摩擦",
              impact: "智識 +15，精力 -10，人際持平",
              statChange: { instinct: +15, energy: -10 },
              followupText: "你沉下心投入題海。亮眼的成績單換來了師長讚許，但放學路上的孤單背影也成了青春難忘的代價。"
            },
            {
              text: "主動坦誠溝通，化解誤會維繫摯友牽絆",
              impact: "羈絆 +15，精力 +5，身心充實",
              statChange: { social: +15, energy: +5 },
              followupText: "真誠的長談解開了心結。夕陽下並肩走過校門口的笑聲，成了日後抵禦無數挫折的溫暖盾牌。"
            }
          ]
        };
      } else if (stepIndex === 2) {
        return {
          title: "職場洪流與立足之地的抉擇",
          narrative: `步入青年期，現實的生活開銷與租金帳單沉甸甸地壓在胸口。辦公室螢幕散發著冷光，部門面臨重組動盪。一邊是高薪但需要通宵加班的冒險企劃，另一邊是安穩平淡卻升遷緩慢的常態業務。`,
          choices: [
            {
              text: "承接高壓專案，爭取薪資躍升與個人突破",
              impact: "資產 +35000，健康 -12，智識 +10",
              statChange: { resource: +35000, health: -12, instinct: +10 },
              followupText: "數不清的黑咖啡與深夜通勤換來了專案的成功上線。存摺上的數字增長了，但也深刻體會到了成年人生活的代價。"
            },
            {
              text: "堅守生活平衡，保全身心健康與生活作息",
              impact: "健康 +8，精力 +10，收入穩定",
              statChange: { health: +8, energy: +10 },
              followupText: "你拒絕了無止盡的內耗。在下班後的微風中烹調一頓晚餐，讓內心在繁華都市中保有一方清朗的天地。"
            }
          ]
        };
      } else {
        return {
          title: "家庭責任與時代風浪的洗禮",
          narrative: `年屆中年，父母老邁、後輩漸長，經濟週期的波動讓身邊不少人動盪不安。你站在人生的中游，不僅要為自己掌舵，更成為身邊重要之人倚靠的屋脊。`,
          choices: [
            {
              text: "謹慎緊縮開支，建立抵禦風險的穩固防護網",
              impact: "資產安全度高，羈絆 +10，克制消費",
              statChange: { social: +10, instinct: +5 },
              followupText: "你的審慎讓家庭平穩渡過經濟寒冬。風雨過後，客廳溫暖的燈火證明了這份隱忍守護的價值。"
            },
            {
              text: "把握轉型機會投資副業，嘗試拓寬生活維度",
              impact: "風險投資，可能收穫全新機遇",
              statChange: { resource: +20000, energy: -15 },
              followupText: "新的嘗試充滿挑戰與焦慮，但在一次次調試中，你為家庭開闢出了一條更具彈性的新道路。"
            }
          ]
        };
      }
    }

    // 2. 野生動物情境庫（依物種綱別與階段精準派發，徹底消除單一重複）
    const cat = species.category;

    // 哺乳類 (灰狼 / 赤狐 / 非洲象)
    if (cat === "mammal") {
      if (species.id === "gray_wolf") {
        if (stepIndex === 1) {
          return {
            title: "覆雪溪谷與幼鹿的微弱氣息",
            narrative: `初冬的嚴霜將松針凍成硬刺。風中帶來了半里外一頭跛足麋鹿的溫熱腥甜味，但也夾雜著冰河薄冰碎裂的喀拉聲。\n你伏低身軀，肩胛骨在緊繃的毛皮下隆起，利爪深深扣入凍土。這是你作為年輕獵手的第一次獨立考驗，喉嚨深處的野性本能因興奮而隱隱發燙。`,
            choices: [
              {
                text: "冒險涉過薄冰，搶在對岸同伴前發起迅猛伏擊",
                impact: "考驗敏捷度！飽足大幅回升，但冰裂可能負傷",
                statChange: { energy: +25, health: -8, instinct: +15 },
                followupText: "薄冰在腳爪下驟然崩裂，刺骨的冰水濺濕腹毛！但你憑藉驚人的爆發力縱身一躍，精準撲倒了獵物，成功將熱騰騰的收穫獻給族群！"
              },
              {
                text: "耐心沿岩脊繞行，等待獵物步入下風處盲區",
                impact: "穩健狩獵！體力消耗平穩，無受傷風險",
                statChange: { energy: +15, instinct: +12 },
                followupText: "你如同一道無聲的灰色暗影在巨石間穿梭。風向將你的氣味完全抹去，一記精準的鎖喉瞬間終結了這場靜默的獵捕。"
              }
            ]
          };
        } else if (stepIndex === 2) {
          return {
            title: "邊界界木與異族狼群的警告",
            narrative: `巡邏至領地邊緣的山脊，樹幹上留有新鮮而刺鼻的陌生爪痕。空氣中瀰漫著濃烈的硫磺味與焦躁的敵意——鄰近狼群的先鋒小隊正越過乾涸的河床！\n對方的副首領露出尖銳森白的獠牙，低沉而威脅的咕嚕聲在林間震盪，心臟在你的肋骨間瘋狂擂動。`,
            choices: [
              {
                text: "弓背炸毛！亮出獠牙發出震天咆哮正面宣誓主權",
                impact: "捍衛狼群威信！可能引發撕咬負傷，但士氣大振",
                statChange: { health: -15, energy: -20, social: +20, instinct: +15 },
                followupText: "兩頭巨獸狠狠撞在泥濘中！銳利的爪尖劃破了你的肩側，熱血滲出刺骨生疼，但你寸步不退反口咬住對方耳根，逼得入侵者夾尾潰逃！"
              },
              {
                text: "引頸向天發出急促長嗥，召喚身後的巡邏主力",
                impact: "善用族群戰術！安全退敵，羈絆大幅提升",
                statChange: { social: +25, energy: -10, instinct: +10 },
                followupText: "高亢的嗥叫在群峰間迴盪，數道矯健的灰影如暴風般穿透樹影匯聚而來，敵方在強大的群體威壓下自知不敵，匆忙退回對岸。"
              }
            ]
          };
        } else {
          return {
            title: "暴風雪封山與傳奇獵手的暮年守護",
            narrative: `五十年罕見的狂暴白毛風肆虐了整座針葉林，積雪漫過膝蓋，獵物早已銷聲匿跡。巢穴深處的幼崽因飢餓而發出哀弱的哀鳴。\n你作為資深的族群砥柱，即便關節在寒風中隱隱作痛，仍必須決定如何在暴風雪中維持狼群的生機。`,
            choices: [
              {
                text: "頂著狂風深入絕壁尋找避風石洞，帶領族群遷徙",
                impact: "極度耗費體力，但能避開林木被雪壓斷砸傷的致命危險",
                statChange: { energy: -25, health: -10, social: +25 },
                followupText: "你在狂暴的風雪中用龐大的身軀為幼崽破開雪道。雖然毛皮結滿了硬冰，但成功引領大家抵達了堅固溫暖的岩穴深處。"
              },
              {
                text: "將最後一口儲存肉塊讓給幼崽，原地抱團取暖死守",
                impact: "自我奉獻！大幅提升族群向心力，自身健康損耗",
                statChange: { health: -15, social: +30, energy: -15 },
                followupText: "狼群緊緊簇擁在一起，彼此的體溫在絕望的寒夜中化作唯一的明燈。你守護住了族群未來的火種。"
              }
            ]
          };
        }
      }

      // 其他陸生哺乳類（赤狐、非洲象等通用精采情境）
      return {
        title: "旱季水塘與潛伏的暗影",
        narrative: `酷熱蒸乾了大地，水窪邊聚集了各懷鬼胎的生靈。空氣中夾雜著泥土的腥氣與大型猛獸的殘留氣味。一聲枯枝斷裂的脆響讓每一根神經瞬間繃緊——水源是生命的甘霖，也是死亡的陷阱。`,
        choices: [
          {
            text: "壓低身形貼地疾走，迅速痛飲數口隨即退回灌木",
            impact: "敏捷求生！恢復精力，遠離危險",
            statChange: { energy: +20, instinct: +10 },
            followupText: "清涼的水流滋潤了焦渴的喉嚨。你機警地在掠食者從蘆葦中探頭的前一秒沒入岩石陰影，安然脫險。"
          },
          {
            text: "登高望遠確認四周無埋伏後，呼喚同伴共同靠近",
            impact: "共享水源！族群羈絆增強",
            statChange: { social: +18, energy: +12 },
            followupText: "大家在互為犄角警戒的掩護下輪流飲水，無一落單，在嚴酷的乾季中展現了生命的團結。"
          }
        ]
      };
    }

    // 貓科 / 街貓 (Felis catus)
    if (species.id === "feral_cat") {
      return {
        title: "雷擊路與夜行巡守之戰",
        narrative: `潮濕的雨夜，兩腳獸的鋼鐵巨獸在雷擊路（公路）上呼嘯飛馳，刺眼的白光撕裂黑暗。\n窄巷垃圾桶旁，一隻斷耳的兇暴流浪公貓正虎視眈眈盯著你的地盤。風中帶著腐敗魚骨與消毒水的刺鼻氣味，雙方的利爪都在紅磚牆上抓出火花。`,
        choices: [
          {
            text: "弓背怒吼！騰空躍起利用牆面反蹬實施高速撲擊",
            impact: "勇猛戰士！爪尖撕破對手耳廓，確立巷道霸權",
            statChange: { health: -10, energy: -15, instinct: +20, social: +15 },
            followupText: "尖銳的嘶鳴劃破夜空！你的爪痕在對方鼻樑留下血痕，劇痛讓敵手倒抽一口冷氣，在驚恐中狼狽竄入通風道深處。"
          },
          {
            text: "靈巧翻上鐵絲圍籬，居高臨下嘲弄並固守高點",
            impact: "機智避戰！體力無損，安全化解危機",
            statChange: { instinct: +15, energy: -5 },
            followupText: "你在冰涼的鐵絲網頂端悠然舔舐爪掌。對手在下方向你狂吠卻無可奈何，最終無趣地甩尾離去。"
          }
        ]
      };
    }

    // 海洋生物 (虎鯨 / 綠蠵龜 / 魚類)
    if (cat === "marine") {
      return {
        title: "深藍湧流與巨網的陰影",
        narrative: `冰冷徹骨的洋流在鰭邊呼嘯。前方透光的海面突然垂下巨大的尼龍死神之網，同伴焦急的聲納鳴叫在水中如波紋般震盪。\n金屬螺旋槳的低頻轟鳴由遠及近，海水的壓力在胸腔沉悶作響。`,
        choices: [
          {
            text: "下潛至百米深淵，藉由水下暗礁裂隙避開大網",
            impact: "考驗深潛耐受！消耗氧氣但徹底擺脫纏繞風險",
            statChange: { energy: -20, health: -5, instinct: +25 },
            followupText: "深海的黑暗與寒冷壓迫著肺部，但你準確地穿透了暗流裂隙，帶領受驚的同伴在另一側安全上浮換氣。"
          },
          {
            text: "發出共鳴聲納指揮群體加速側轉，繞行開闊洋面",
            impact: "團隊領航！群體羈絆大幅提升",
            statChange: { social: +25, energy: -15 },
            followupText: "你的鳴叫宛如深海的燈塔。家族幼鯨緊隨你的尾鰭破浪疾馳，完美繞開了人類捕撈區的致命邊界。"
          }
        ]
      };
    }

    // 鳥類 (企鵝 / 渡鴉 / 倉鴞)
    if (cat === "avian") {
      return {
        title: "絕壁狂風與高空霸主的俯衝",
        narrative: `狂風如巨浪般撞擊著懸崖峭壁，鉛灰色的雲層壓得極低。一頭金雕巨大的翼影在懸崖上方盤旋，尖銳的啼鳴帶著穿透靈魂的威壓。\n巢中的風羽正在顫抖，你必須在陡峭的氣流中做出抉擇。`,
        choices: [
          {
            text: "收攏羽翼朝岩縫實施垂直俯衝，藉由狹窄石縫避難",
            impact: "驚險特技！羽翼擦傷，但成功避開利爪",
            statChange: { health: -8, instinct: +20, energy: -10 },
            followupText: "風聲在耳邊淒厲呼嘯！你在距岩壁僅數寸處猛然張開尾羽，滑入僅容一身的岩縫，金雕的鐵爪重重抓在岩石上擦出火星！"
          },
          {
            text: "昂首振翅高鳴，與周遭同伴組成盤旋防禦陣型",
            impact: "群鳥威懾！迫使猛禽放棄目標",
            statChange: { social: +22, energy: -12 },
            followupText: "黑色的羽翼在狂風中連成一片令人眼花撩亂的翻滾巨浪。猛禽在無處下爪的漫天鳴叫聲中被迫調頭離去。"
          }
        ]
      };
    }

    // 昆蟲 (蜜蜂等)
    return {
      title: "大黃蜂襲擊與蜂巢之盾",
      narrative: `巢門口的守衛蜂發出了劇烈的振動警報！兩隻體型巨大的胡蜂破空而來，巨大的口器嘎吱作響。巢內滿是嬌弱的幼蟲與儲藏的金色蜜脾。`,
      choices: [
        {
          text: "數百工蜂一擁而上，實施「熱殺蜂球」將敵包裹",
          impact: "自我犧牲與忠誠！劇烈消耗精力，成功退敵",
          statChange: { energy: -30, health: -15, social: +30 },
          followupText: "你毫不猶豫振翅撲入球心！數百隻姊妹用胸肌高頻震動釋放高熱，成功在高溫中將侵略者徹底瓦解！"
        },
        {
          text: "釋放警報費洛蒙，封鎖深層蜜房並轉移蜂王",
          impact: "戰略撤退！保全核心命脈",
          statChange: { instinct: +20, social: +15 },
          followupText: "濃烈的警報氣味引導工蜂迅速用蜂蠟封死通往深處的要道，為族群保住了最重要的繁衍火種。"
        }
      ]
    };
  },

  getStageForAge(species, age) {
    for (let st of species.stages) {
      if (age >= st.min && age <= st.max) return st;
    }
    return species.stages[species.stages.length - 1];
  }
};
