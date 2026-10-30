/**
 * 十兆分之一 (1 in 10 Trillion) - 命運統計與艾琳·杭特式 AI 敘事引擎
 * 流程：
 * 1. 根據物種生態統計表產生一生年表 (Cohort Hazard Simulation)
 * 2. AI 智慧剪輯去重：合併日常重複瑣事，凸顯生命轉折
 * 3. 艾琳·杭特式（半馬賽克 10+）小說生成：按物種特徵、成長期動態編織獨一無二的感官篇章與抉擇
 */

window.DestinyEngine = {
  formatChapterTitle(index, authorStyle = null) {
    const chNums = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十",
                    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
                    "二十一", "二十二", "二十三", "二十四", "二十五", "二十六", "二十七", "二十八", "二十九", "三十"];
    const chNum = chNums[index] || index;
    if (authorStyle && typeof authorStyle === "object" && authorStyle.chapterFormat) {
      return authorStyle.chapterFormat.replace("{num}", chNum).replace("{arabic}", index);
    }
    return "第" + chNum + "章";
  },

  /**
   * 判定生物性別 (雄性 / 雌性 / 雌雄同體)
   */
  determineGender(species) {
    if (species.isHermaphrodite || species.id === "common_earthworm" || species.id === "garden_snail") {
      return "雌雄同體";
    }
    return Math.random() < 0.5 ? "雄性" : "雌性";
  },

  /**
   * 生成生物/人類樣貌特徵描述
   */
  generateAppearance(species, gender, isHuman, biome) {
    if (isHuman) {
      const hairStyles = ["濃密烏黑的微捲短髮", "柔軟細緻的栗褐色直髮", "俐落修剪的深黑短髮", "蓬鬆帶有自然光澤的長髮", "天生微棕的柔軟髮絲"];
      const eyeColors = ["明亮清澈的深褐色眼眸", "沉穩溫和的墨黑雙眸", "靈動且帶有神采的淺棕色眼睛"];
      const skinTones = ["健康的小麥色膚質", "溫潤白皙的皮膚", "帶有陽光氣息的自然膚色"];
      const builds = ["身形勻稱矯健", "修長苗條、體態挺拔", "骨架結實有力、步履穩健", "身形勻稱、充滿朝氣"];
      const hair = hairStyles[Math.floor(Math.random() * hairStyles.length)];
      const eyes = eyeColors[Math.floor(Math.random() * eyeColors.length)];
      const skin = skinTones[Math.floor(Math.random() * skinTones.length)];
      const build = builds[Math.floor(Math.random() * builds.length)];
      return `${skin}，配有一頭${hair}與一雙${eyes}，${build}。`;
    }

    const sId = species.id;
    if (sId === "gray_wolf") {
      const coats = ["厚實濃密的銀灰色毛皮夾雜深黑脊線", "泛著蒼白色澤的厚重冬毛", "帶有灰褐色暗斑的耐寒雙層毛皮", "如深暮般沉靜的炭灰色皮毛"];
      const marks = ["右耳帶有一道幼年時被冰刺劃破的微小白痕", "鼻吻兩側帶有對稱的霜白紋理", "左前爪趾端有一撮純白被毛", "寬闊的面頰覆蓋著威嚴的黑髭"];
      const eyes = ["一雙如融金般深邃的琥珀色狼眸", "清冷如冬日初陽的淡金色雙眼", "沉著冷靜的深黃色瞳孔"];
      const builds = ["肩胛骨寬闊隆起、四肢長而有力", "體格勻稱緊湊、奔跑時身形如灰影般流暢", "骨骼粗壯、胸膛寬闊沉穩"];
      return `${coats[Math.floor(Math.random() * coats.length)]}，${marks[Math.floor(Math.random() * marks.length)]}，配有${eyes[Math.floor(Math.random() * eyes.length)]}，${builds[Math.floor(Math.random() * builds.length)]}。`;
    }

    if (sId === "feral_cat") {
      const coats = ["深灰色虎斑條紋皮毛、腹部潔白", "帶有玳瑁斑塊的柔軟毛皮", "純黑油亮、光線下泛著墨藍光澤的被毛", "橘黃相間、背脊帶有微紅輪廓的蓬鬆毛皮"];
      const marks = ["右耳尖端有一道打鬥留下的微小豁口", "粉紅鼻尖旁有顆醒目的黑色斑點", "修長靈巧的斑紋長尾末端微曲", "四足均覆蓋著如穿白襪般的雪白掌毛"];
      const eyes = ["澄澈透亮如翡翠的碧綠眼眸", "如黃昏落日般耀眼的古銅金色瞳孔", "警惕機敏的淡海藍色雙眼"];
      const builds = ["身形纖細柔軟、骨肉緊實敏捷", "步履輕盈無聲、爆發力極佳的矯健身軀"];
      return `${coats[Math.floor(Math.random() * coats.length)]}，${marks[Math.floor(Math.random() * marks.length)]}，${eyes[Math.floor(Math.random() * eyes.length)]}，${builds[Math.floor(Math.random() * builds.length)]}。`;
    }

    if (sId === "orca") {
      const marks = ["背鰭後方帶有如馬鞍般獨特的灰白斑紋", "左側眼斑略寬、呈流線形橢圓", "下顎至腹部覆蓋著無瑕的雪白紋路"];
      const builds = ["長達數公尺的漆黑流線巨軀、背鰭高聳挺立", "雄渾強健的黑白身軀、尾鰭強韌有力"];
      return `黑白分明的極致流線身軀，${marks[Math.floor(Math.random() * marks.length)]}，深邃如深海淵潭的黑眼，${builds[Math.floor(Math.random() * builds.length)]}。`;
    }

    if (sId === "emperor_penguin") {
      const marks = ["頸側如晨曦破曉般的明黃色漸層羽斑", "耳部邊緣綻放鮮明的金橙色羽帶", "背部覆蓋著如鋼鐵般緻密的藍黑防水羽翎"];
      const builds = ["胸膛飽滿厚實、腹部白羽柔軟如絲", "體態敦實威嚴、足掌寬厚帶黑色銳爪"];
      return `${marks[Math.floor(Math.random() * marks.length)]}，${builds[Math.floor(Math.random() * builds.length)]}，深褐色的圓眼敏銳注視著冰原。`;
    }

    if (sId === "red_fox") {
      const coats = ["如秋日烈焰般鮮紅的金赤色皮毛", "橙紅中夾雜著金黃光澤的厚實絨毛", "背部赤紅、腹部與下頜純白的鮮明毛色"];
      const marks = ["蓬鬆巨大的赤色尾巴末端帶著一撮雪白毛尖", "修長的黑襪式四足、耳背覆蓋著深黑色被毛"];
      const eyes = ["一雙狡黠靈動且帶有好奇光芒的琥珀金眼眸", "敏銳閃爍的黃褐色瞳孔"];
      return `${coats[Math.floor(Math.random() * coats.length)]}，${marks[Math.floor(Math.random() * marks.length)]}，配上一雙${eyes[Math.floor(Math.random() * eyes.length)]}，身形修長靈巧。`;
    }

    const baseColors = ["深褐色", "灰褐色", "砂黃色", "斑駁斑紋", "暗灰夾黑", "墨黑泛光"];
    const col = baseColors[Math.floor(Math.random() * baseColors.length)];
    return `具有適應${biome ? biome.name : '自然棲所'}的${col}被毛/表皮，身形勻稱緊湊，雙眸明亮機敏，展現出健康的生命力。`;
  },

  generateFamilyMembers(species, isHuman, biome, countryData) {
    const list = [];
    if (isHuman) {
      const c = countryData || { name: "本地" };
      list.push({ relation: "父親", name: "父親", age: 29, status: "健康", bond: 88, icon: "fa-person" });
      list.push({ relation: "母親", name: "母親", age: 27, status: "健康", bond: 94, icon: "fa-person-dress" });
      if (Math.random() > 0.4) {
        list.push({ relation: "手足", name: "哥哥", age: 3, status: "活潑", bond: 82, icon: "fa-child" });
      }
      if (Math.random() > 0.6) {
        list.push({ relation: "手足", name: "妹妹", age: 1, status: "健康", bond: 85, icon: "fa-baby" });
      }
    } else {
      const sId = species.id;
      if (sId === "gray_wolf") {
        list.push({ relation: "首領母狼", name: "母狼·霜影", age: 5, status: "健壯巡守", bond: 95, icon: "fa-shield-heart" });
        list.push({ relation: "首領公狼", name: "灰首·裂爪", age: 6, status: "狼群領航", bond: 88, icon: "fa-paw" });
        list.push({ relation: "同巢手足", name: "灰尾", age: 0, status: "稚嫩玩耍", bond: 90, icon: "fa-paw" });
        list.push({ relation: "同巢手足", name: "白足", age: 0, status: "緊隨母腹", bond: 88, icon: "fa-paw" });
      } else if (sId === "orca") {
        list.push({ relation: "家族族長", name: "老祖母·碧浪", age: 48, status: "領航聲納", bond: 96, icon: "fa-water" });
        list.push({ relation: "生母", name: "長泳·鳴波", age: 22, status: "並肩伴游", bond: 98, icon: "fa-fish" });
        list.push({ relation: "同輩幼鯨", name: "破浪", age: 2, status: "嬉浪躍游", bond: 85, icon: "fa-fish" });
      } else if (sId === "emperor_penguin") {
        list.push({ relation: "育雛父親", name: "暖腹·蒼羽", age: 7, status: "抵禦暴風雪", bond: 98, icon: "fa-shield-halved" });
        list.push({ relation: "遠海捕食母企鵝", name: "踏海·清露", age: 6, status: "返航途中", bond: 92, icon: "fa-crow" });
      } else {
        list.push({ relation: "守護母體", name: "母體", age: Math.max(1, Math.floor(species.avgAgeWild * 0.5)), status: "悉心哺育", bond: 95, icon: "fa-heart" });
        list.push({ relation: "同巢手足", name: "同巢幼體", age: 0, status: "相依取暖", bond: 86, icon: "fa-paw" });
      }
    }
    return list;
  },

  generateHomeComparison(species, countryData, biome, homeCountryId) {
    if (!homeCountryId || !window.HOME_COUNTRIES_LIST) return null;
    const home = window.HOME_COUNTRIES_LIST.find(c => c.id === homeCountryId) || window.HOME_COUNTRIES_LIST[0];
    const isHuman = species.isHuman;

    if (isHuman && countryData) {
      const diffLifespan = (countryData.avgLifespan - home.avgLifespan).toFixed(1);
      const infantRatio = (countryData.infantMortality / Math.max(0.0001, home.infantMortality)).toFixed(1);
      const gdpDiff = countryData.gdpPppUsd - home.gdpPppUsd;

      return {
        homeName: home.name,
        targetName: countryData.name,
        diffLifespan: diffLifespan > 0 ? `+${diffLifespan} 歲` : `${diffLifespan} 歲`,
        lifespanVerdict: diffLifespan >= 0 ? `比${home.name}多活約 ${diffLifespan} 歲` : `比${home.name}少活約 ${Math.abs(diffLifespan)} 歲`,
        infantComparison: infantRatio > 1.2 ? `嬰兒死亡風險約為${home.name}的 ${infantRatio} 倍` : (infantRatio < 0.8 ? `嬰兒死亡率比${home.name}更低` : `與${home.name}相近`),
        economicVerdict: gdpDiff >= 0 ? `人均GDP高於${home.name} (約高 $${gdpDiff.toLocaleString()})` : `人均GDP低於${home.name} (約低 $${Math.abs(gdpDiff).toLocaleString()})`,
        summaryText: `若你在${home.name}成長，平均預期壽命為 ${home.avgLifespan} 歲（${home.env}）；而降生在${countryData.name}，你將在${countryData.description}中展開一生。`
      };
    } else {
      const wildAvg = species.avgAgeWild;
      const wildUnit = species.unit;
      const infantSurvival = (species.infantSurvivalRate * 100).toFixed(1);
      const homeLifespan = home.avgLifespan;

      return {
        homeName: home.name,
        targetName: `${species.name} (${biome ? biome.name : '荒野生境'})`,
        diffLifespan: `${wildAvg} ${wildUnit}`,
        lifespanVerdict: `野外平均壽命僅約 ${wildAvg} ${wildUnit} (人類家鄉${home.name}約 ${homeLifespan} 歲)`,
        infantComparison: `自然首年存活率僅約 ${infantSurvival}%，面臨純粹的物競天擇`,
        economicVerdict: `領地掌控與自然獵場生態代謝`,
        summaryText: `你在文明社會${home.name}習慣了安全庇護與醫療；而作為${biome ? biome.name : '自然荒野'}中的${species.name}，每一步都將在寒冬、天敵與野性直覺的真實洗禮中渡過。`
      };
    }
  },

  /**
   * 產生一生完整生命軌跡與事件 (支援多重稱呼、出生的世界、故鄉對比、家庭結構)
   */
  generateLifeTrajectory(species, config = {}) {
    const isHuman = species.isHuman;
    const biome = species.biomes[Math.floor(Math.random() * species.biomes.length)];

    let countryData = null;
    if (isHuman) {
      const cList = species.countries;
      countryData = config.country || cList[Math.floor(Math.random() * cList.length)];
    }

    // 生物性別與外觀樣貌特徵生成
    const gender = this.determineGender(species);
    const appearance = this.generateAppearance(species, gender, isHuman, biome);

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

    // 2. 原始年表模擬：逐年/逐期生成生態統計事件
    const rawEvents = this.simulateRawLifecycle(species, lifeDeathPlan, biome, countryData, names);

    // 若歷程中有獲得稱呼，更新 currentName
    if (names.length > 0 && !currentName) {
      currentName = names[names.length - 1].name;
    }

    // 3. AI 智慧去重與修剪 (若開啟 skipHeavy 則過濾極端悲慘與殘忍暴力描寫)
    let deduplicatedEvents = this.aiDeduplicateEvents(rawEvents, species);
    if (config.skipHeavy) {
      deduplicatedEvents = deduplicatedEvents.map(evt => {
        let txt = evt.text || "";
        txt = txt.replace(/被殘忍分屍|血肉模糊|四肢斷裂|開膛破肚|自戕自絕/g, "遭遇重創不幸離世");
        return { ...evt, text: txt };
      });
    }

    // 4. 生成作家小說序幕 (出生登記段落，動態物種專屬)
    const prologueNovel = this.generateChapterOneNarrative(species, currentName, biome, countryData, config.author, config.contentMode, config.experienceMode, gender, appearance);

    // 5. 動態編織完全不重複、依據物種特化的互動抉擇與命運章節
    const storyTimeline = this.compileStoryTimeline(species, currentName, deduplicatedEvents, lifeDeathPlan, biome, countryData, config, gender, appearance);

    // 6. 生成家人與群體結構 (1in8b 家人與生活面板支援)
    const familyMembers = this.generateFamilyMembers(species, isHuman, biome, countryData);

    // 7. 生成故鄉並排對比數據 (1in8b 故鄉對比支援)
    const homeComparison = this.generateHomeComparison(species, countryData, biome, config.homeCountry);

    return {
      species,
      name: currentName,
      names,
      gender,
      appearance,
      biome,
      countryData,
      era: config.era || "now",
      eraYear: config.eraYear || 2026,
      drawMode: config.drawMode || "birth",
      pace: config.pace || "60",
      homeCountry: config.homeCountry || null,
      homeComparison,
      familyMembers,
      experienceMode: config.experienceMode || "story",
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
        resource: isHuman ? (countryData ? countryData.localEquivMonthly * 2 : 50000) : 50
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
  compileStoryTimeline(species, name, events, lifeDeathPlan, biome, countryData, config = {}, gender = "雄性", appearance = "") {
    const chapters = [];
    const finalAge = lifeDeathPlan.finalAge;
    const chapterAges = this.selectMilestoneAges(finalAge);

    chapterAges.forEach((age, idx) => {
      const isLast = (age === finalAge);
      const isChoice = !isLast && idx > 0;

      const chapter = this.generateUniqueChapter({
        species,
        name,
        gender,
        appearance,
        age,
        biome,
        countryData,
        isLast,
        isChoice,
        chapterIndex: idx + 1,
        stepIndex: idx,
        author: config.author || "erinhunter",
        mode: config.contentMode || "normal",
        experienceMode: config.experienceMode || "story"
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
      // 若單一段落過長（超過 120 字且無分段），在標點處自然切分
      if (part.length > 120) {
        const sentences = part.match(/[^。！？]+[。！？]*/g) || [part];
        let buf = "";
        sentences.forEach(s => {
          if (buf.length + s.length > 105 && buf.length >= 50) {
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
   * 根據物種、棲地、作家與模式動態生成第一章開篇小說（艾琳·杭特/沈石溪風格、擬人化話語與內心獨白）
   */
  generateChapterOneNarrative(species, name, biome, countryData, author = "erinhunter", mode = "normal", expMode = "story", gender = "雄性", appearance = "") {
    const isHuman = species.isHuman;
    const sId = species.id;
    const bName = biome ? biome.name : "未知生境";
    const appDesc = appearance ? `帶著${appearance}` : "";

    if (isHuman) {
      const cName = (countryData && countryData.name) ? countryData.name : "這個國度";
      return `在${cName}，最初的記憶始於刺目而潔白的產房頂燈，以及猛然湧入肺部的第一口灼熱空氣。伴隨著劃破寂靜的清脆啼哭，冰涼的世界在被柔軟溫暖的襁褓包裹的那一刻安靜了下來。你${appDesc}，在親人的注視下睜開了懵懂的眼眸。\n\n「看他的眼睛多明亮，」母親疲憊而溫柔的聲音在耳畔響起，眼眶中帶著喜悅的淚光，「歡迎來到這個世界，我們的孩子。」小小的手掌在半空中無意識地抓握，指尖碰觸到父親微顫而厚實的掌心。你聽不懂周遭的話語，但心臟在小小的胸膛裡有力地跳動著。\n\n窗外是這座城市日夜奔流的車水馬龍與街道脈動。在家庭、社會與文明交織的龐大網絡中，你作為八十億分之一的微光，踏出了人生漫長跋涉的第一步。`;
    }

    if (sId === "gray_wolf") {
      return `洞穴深處瀰漫著濃重的潮濕泥土與母狼腹毛的溫熱。最初的知覺是緊閉的眼皮外朦朧的微光，以及手足幼崽擠挨在身側急促的心跳。乳汁的甘甜伴隨著母親溫柔粗糙的舌舔，撫平了初臨塵世的戰慄。那一身${appearance || '濃密厚實的被毛'}，在幽暗的穴壁石縫間若隱若現。\n\n「快趴低，別發出聲音，」母親沙啞而溫暖的鼻息拂過耳際，她的利爪輕輕將你往懷裡撥了撥，「外頭的暴風雪還在呼嘯，雷擊路上的怪獸正在咆哮。」你縮了縮脖子，心裡想著：外頭究竟是什麼樣的世界？長者們口中那些噴著黑煙的鐵皮怪物，真的會吞噬森林嗎？\n\n幾週後，稚嫩的四爪終於跌跌撞撞地探出了岩穴。迎面而來的是${bName}凜冽刺骨的寒風，松針與殘雪在腳爪下發出細微的碎裂聲。山脊另一端傳來了族群嘹亮悠長的嚎叫，先祖星族的呼喚在風中迴盪。荒野用第一陣冷風向你宣告了生存的嚴苛，也為你揭開了獵手一生的宿命。`;
    }

    if (sId === "feral_cat" || species.name.includes("貓")) {
      return `破舊紙箱與廢棄磚瓦搭建的窄縫深處，殘留著瀝青與雨水的潮濕氣味。幾隻毛茸茸的手足在陰暗的角落裡交疊蜷縮，母親輕柔的呼嚕聲如引擎般震顫著單薄的胸膛，驅散了初春的寒氣。你的身上帶著${appearance || '柔軟細密的毛皮'}，在昏暗中微微泛光。\n\n「別往洞口擠，」身旁的手足幼貓瑟縮了一下，發出軟糯的喵叫，「兩腳獸剛剛才走過去，他們丟下來的鐵皮箱發出好可怕的巨響。」你好奇地豎起耳尖，心裡想著：兩腳獸到底是敵是友？為什麼母親總是告誡我們千萬不能踏上那條被稱為雷擊路的黑硬地面？\n\n當藍灰色的瞳孔第一次聚焦，映入眼簾的是霓虹閃爍的高聳水泥牆。遠處急馳而過的噴火獸掀起刺鼻的尾氣，母親警惕地亮出了雪白的爪尖。這片由人類遺棄物、暗巷鼠跡與未知危險構築的領地，就是你必須用勇氣與利爪守護的全部世界。`;
    }

    if (sId === "orca" || species.category === "marine") {
      return `沒有重力，沒有泥土，唯有一片無邊無際的湛藍與冰冷水流包裹著身軀。剛脫離母體的一剎那，本能驅使著尾鰭用力擺動，母親與族群副手隨即以強健的身軀將你托向海面。破水而出的瞬間，頭頂的氣孔噴出一道細密的白霧，吸入了${bName}純淨而冷冽的第一口空氣。你那一身${appearance || '黑白分明的極致流線身軀'}，在陽光折射下閃爍著如黑曜石般的光澤。\n\n「跟著我們的聲納，小傢伙，」母親發出悠長而清脆的高頻哨音，身軀溫柔地蹭過你的背脊，「海灣很深，但只要你跟緊族群，這片大洋就沒有什麼能傷害你。」你用胸鰭輕觸母親的側腹，心裡滿是驚奇與安心：這座廣闊的水下宮殿，就是先祖世代游弋的王國嗎？\n\n然而遠處的深海中，隱隱傳來了金屬螺旋槳沉悶的轟鳴與人類巨輪撕裂浪潮的震顫。家族長老高高躍出海面，白色的巨浪隨之翻滾。家族的哨音在萬里冰海間交織成一張無形的情感之網，引領著你踏上這片屬於海洋霸主的浩瀚征途。`;
    }

    if (sId === "emperor_penguin") {
      return `零下四十度的極地暴風雪在幾寸之外咆哮，但你所感知的第一個世界，卻是父親溫暖緊繃的育兒袋皺褶與厚重脂肪層。微小的喙尖破開堅硬的卵殼，在黑暗中發出微弱而尖銳的索食嘶鳴。那一身${appearance || '稚嫩細軟的絨毛'}，在微光下顯得無比嬌小。\n\n「別怕，縮進來一點，」父親低沉的咕噥聲伴隨著胸腔的共鳴傳來，他用厚實的羽翼將你護得更緊，「這場白毛風很快就會過去，海裡的母親正在為我們帶回食物。」你依偎在父親溫暖的腳背上，心裡想著：外面的風暴究竟有多麼寒冷？大海又是怎樣一片寬廣的世界？\n\n暴風雪暫歇的短暫時刻，父親微微抬起腹部羽翼。那一瞬間，極晝微光下耀眼奪目的藍白冰原與千萬同族緊密相依的壯闊景象震撼了幼小的心靈。在無邊無際的白色荒原邊緣，死寂與嚴寒構築了最嚴苛的生存試煉，而親族的心跳是唯一的避風港。`;
    }

    if (sId === "african_elephant") {
      return `烈日烘烤著赤紅的大地，金黃色的草浪在熱浪中蒸騰扭曲。甫一落地，四條笨拙的粗壯小腿便在母象長鼻的輕柔扶持下，一次次摔倒又固執地站起。熱風掠過寬大薄嫩的雙耳，送來遠方相思樹皮與乾燥泥土的氣息。你身上帶有${appearance || '褶皺厚實的灰色皮膚'}，正試探性地甩動幼小的鼻子。\n\n「站直了，孩子，」母親長鼻發出低沉而柔和的低鳴，輕輕頂住你的後膝，「這片荒原很漫長，獅群隨時都在暗處窺伺，你必須學會自己邁開腳步。」你依偎在母親高聳如山峰的象腿旁，心裡湧起對這個世界無盡的好奇與敬畏。\n\n整個象群停下了遷徙的沉重腳步，圍攏成一道堅不可摧的移動肉牆。族群長老的長鼻輕撫過你的背脊，發出低沉而溫柔的次聲波共鳴。在金色大草原上，古老的家族記憶與無盡的跋涉就此啟航。`;
    }

    if (sId === "red_fox") {
      return `山坡樹根下的泥穴裡，散發著乾草與母狐被毛濃郁的野性氣味。柔軟的小爪相互推搡著爭奪乳頭，耳尖微微顫動，捕捉著泥土上方傳來的落葉沙沙聲與晨露滴落的脆響。那一身${appearance || '金赤色的蓬鬆毛皮'}，在昏暗的地穴中宛如跳動的小火苗。\n\n「別鬧了，快把頭低下去！」母狐用前爪輕輕拍了拍你的額頭，警惕地豎起雙耳，「上頭有獵犬的氣味，兩腳獸正扛著會噴火的鐵管穿過樹林。」你緊緊貼著同伴的肚腹，心裡想著：獵犬很可怕嗎？為什麼母親的眼睛裡充滿了緊張？\n\n幾週後，大膽地探出洞口，初升的旭日將你金赤色的皮毛鍍上一層耀眼的金輝。遠處農莊的炊煙在微風中飄散，田埂上的野兔敏銳地跳動。機敏與狡黠的天性在這一刻悄然覺醒，荒野的生存博弈就此拉開序幕。`;
    }

    // 通用自然生靈備援（嚴格分段，按生境描寫）
    return `在${bName}的晨曦微光中，最初的生命脈動悄然甦醒。微風拂過初生的軀體，帶來了泥土、草葉與遠方同伴微弱的氣息，生命的本能在此刻被全面喚醒。你身上帶有${appearance || '適應棲所的獨特皮毛'}，靜靜凝望著浩瀚的天地。\n\n「荒野永遠不會憐憫弱者，」長者的低語似乎隨風拂過耳畔，「但只要你遵從野性的直覺，群星與大地就會為你引路。」心臟在胸腔中有力地跳動著，你深吸了一口這片自由的空氣，心裡燃起了對未知生命的無盡好奇與勇氣。\n\n睜開雙眸的那一瞬，浩瀚的天地在眼前鋪展而開。無論前路隱伏著多少風雨與捕食者的陰影，屬於你的這一篇章已然展開，以最純粹的野性力量向荒野致敬。`;
  },

  /**
   * 物種專屬章節生成器（篇名嚴格規定只能是「第一章」、「第二章」…不可有標題）
   */
  generateUniqueChapter(params) {
    const { species, name, gender, appearance, age, biome, countryData, isLast, isChoice, chapterIndex, stepIndex, author, mode, experienceMode } = params;
    const expMode = experienceMode || "story";
    const isHuman = species.isHuman;
    const title = this.formatChapterTitle(chapterIndex, author);

    // 開篇第一章 (誕生與幼年探索)
    if (chapterIndex === 1) {
      const narrative = this.generateChapterOneNarrative(species, name, biome, countryData, author, mode, expMode, gender, appearance);
      return { age, title, narrative, choices: null };
    }

    // 終幕章節 (生命回歸)
    if (isLast) {
      const narrative = isHuman
        ? (expMode === "story"
            ? `歲月在鬢角染上霜白，病房的窗櫺外是${countryData ? countryData.name : ''}熟悉的街道夕陽。監護儀器緩慢而規律地震顫著，親人的掌心傳來熟悉的暖意與不捨的淚水。\n\n「別怕，我們都在這裡陪著你……」耳畔傳來輕柔的啜泣與叮嚀。小小的手掌曾抓緊過這世間無數美好與辛酸，如今漸漸舒展開來。\n\n回顧這一生走過的坎坷、歡笑與深情羈絆，心跳漸漸放慢，如同一葉扁舟平穩駛入了無風的港灣，歸於久違的安息。`
            : `在${countryData ? countryData.name : ''}，監護儀數值逐漸衰退，生理機能隨衰老停止運轉，生命走向平靜終局。`)
        : (expMode === "story"
            ? `刺骨的寒風穿過斑白襤褸的皮毛，四肢沉重如鉛。骨骼深處隱隱作痛，但視線中的山嵐與林濤卻透出一種奇異的清澈與溫柔。\n\n「時候到了……」風中彷彿迴盪起年少時手足相依偎的呢喃與母親當年的低鳴，「先祖的群星正在閃爍，回到星族的獵場去吧。」你試圖動一動耳朵，心裡想著：野地將永遠存在，同胞的嚎叫將在山谷中延續。\n\n你緩緩伏下身軀，任由最後一口溫熱吐息化作微風，帶著一生濃烈的記憶奔向群星與先祖的古老獵場。`
            : `刺骨寒風穿透衰老的皮毛，體溫漸降，呼吸止歇於凍土之上，軀體回歸大自然的物質循環。`);
      return { age, title, narrative, choices: null };
    }

    // 中間章節：依據物種分類與年齡階段抽選情境
    const scenario = this.pickDynamicScenario(species, name, age, biome, countryData, stepIndex, expMode);
    return {
      age,
      title,
      dilemma: scenario.dilemma || "",
      narrative: scenario.narrative,
      choices: isChoice ? scenario.choices : null
    };
  },

  /**
   * 根據物種與生命週期挑選獨特情境
   */
  pickDynamicScenario(species, name, age, biome, countryData, stepIndex, expMode = "story") {
    const isHuman = species.isHuman;

    // 1. 人類情境庫
    if (isHuman) {
      if (stepIndex === 1) {
        return {
          title: "校園同儕與最初的考驗",
          dilemma: `在${countryData.name}，關鍵的考核與好友的誤會同時降臨，面對升學競爭與人際牽絆，你該如何權衡取捨？`,
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
          dilemma: "職場重組動盪來襲，一邊是高薪但通宵加班的冒險企劃，另一邊是安穩平淡的常態業務，你該如何立足？",
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
          dilemma: "父母老邁且經濟週期波動，面對緊縮開支保守防護或投資副業拓寬維度，你該如何為家庭掌舵？",
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
            dilemma: "風中傳來半里外跛足麋鹿的氣味，但前方的冰河薄冰已發出碎裂聲，身為年輕獵手該冒險涉冰還是穩健繞行？",
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
            dilemma: "鄰近狼群副首領越界露齒低吼，空氣中充斥著焦躁敵意，你該正面咆哮宣誓主權還是長嗥呼喚同伴支援？",
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
            dilemma: "五十年一遇的白毛風封閉了整座針葉林，獵物絕跡，巢穴幼崽飢寒交迫，族群該冒險遷徙還是原地死守？",
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
        dilemma: "酷熱蒸乾大地，水窪邊暗影潛伏，草叢中枯枝斷裂聲驟響，你該疾速痛飲避走，還是呼喚同伴互為犄角？",
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
        dilemma: "雨夜窄巷垃圾桶旁，一隻兇暴的斷耳流浪公貓正虎視眈眈盯著你的領地，利爪在紅磚牆上抓出火花！",
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
        dilemma: "冰海上方突然垂下巨大的捕撈尼龍巨網，螺旋槳轟鳴逼近，你該深潛穿透暗礁，還是鳴叫領航族群側轉？",
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
        dilemma: "絕壁狂風中，一頭金雕巨大的翼影在懸崖上方盤旋鎖定了幼雛，你該收羽俯衝狹縫避難，還是振翅合圍威懾猛禽？",
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
      dilemma: "兩隻體型巨大的兇猛胡蜂破空襲擊蜂巢，守衛蜂發出緊急警報，你該撲入熱殺蜂球死戰，還是撤退封死深層蜜房？",
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
