/**
 * 十兆分之一 (1 in 10 Trillion) - 物種與生態統計數據庫
 * 涵蓋哺乳類、鳥類、海洋生物、爬蟲類、昆蟲以及智人（人類）。
 * 人類特別包含國家、貨幣（PPP美元與台幣體感金額）、GDP、吉尼係數與教育統計。
 */

window.SPECIES_DATABASE = [
  {
    id: "gray_wolf",
    name: "灰狼",
    scientificName: "Canis lupus",
    category: "mammal",
    isHuman: false,
    weightKg: 40,
    maxAge: 13,
    avgAgeWild: 6.5,
    unit: "歲",
    infantSurvivalRate: 0.48, // 48% 活過第一年
    biomes: [
      { name: "北美育空針葉林", climate: "極寒與積雪", prey: "駝鹿、馴鹿與野兔" },
      { name: "歐亞溫帶混合林", climate: "四季分明", prey: "馬鹿、野豬與小型齧齒類" },
      { name: "西伯利亞苔原邊界", climate: "凍土荒原", prey: "旅鼠、麝牛幼崽" }
    ],
    socialType: "階級狼群（首領、副手、巡邏者、底層）",
    sensoryTraits: "敏銳嗅覺（能嗅出兩公里外的麋鹿氣息）、靈敏聽覺與群體嗥叫共鳴",
    iucnStatus: "LC (無危，但特定亞種面臨生境碎裂)",
    wildPopulation: "約 300,000 隻",
    threats: ["非法盜獵與毒餌", "領地爭端互噬", "大型草食獸蹄擊重創", "嚴冬飢荒", "狂犬病毒"],
    namingPool: ["影爪", "灰鬃", "霜齒", "疾風", "落葉", "碎石", "月斑", "冷杉", "白棘", "夜嚎"],
    stages: [
      { min: 0, max: 1, name: "幼崽 (Pup)" },
      { min: 2, max: 3, name: "少年狼 (Yearling)" },
      { min: 4, max: 7, name: "壯年獵手 (Adult Hunter)" },
      { min: 8, max: 10, name: "狼群長老 (Veteran)" },
      { min: 11, max: 13, name: "衰暮孤狼 (Elder)" }
    ],
    lookalikeGuide: {
      confusedWith: "郊狼 (Coyote)、哈士奇 / 阿拉斯加雪橇犬 (Siberian Husky)",
      differences: "【胸腔與體態】：灰狼胸廓極為深窄，前肢間距狹窄，奔跑時後足精準踩入前足印記（成一直線直線單跡）；哈士奇等犬隻胸寬體闊，奔跑為雙線足跡。\n【尾巴姿態】：灰狼尾巴粗厚筆直，平時始終垂直下垂或微斜，絕不向上捲曲於背上；哈士奇等犬隻尾巴常向上捲成鐮刀狀或圈狀。\n【頭部與吻部】：灰狼頭部寬闊、吻部粗壯寬圓，雙眼呈傾斜的琥珀金眸；郊狼體型僅灰狼三分之一，耳廓不成比例地碩大尖聳，吻部極尖細如狐。\n【耳廓特徵】：灰狼耳尖較圓鈍且覆厚絨毛；犬類與郊狼耳尖較薄而尖銳。"
    },
    survivalCurve: [100, 48, 38, 30, 22, 14, 7, 3, 1, 0.2]
  },
  {
    id: "homo_sapiens",
    name: "智人（人類）",
    scientificName: "Homo sapiens",
    category: "human",
    isHuman: true,
    weightKg: 65,
    maxAge: 100,
    avgAgeWild: 73.2,
    unit: "歲",
    infantSurvivalRate: 0.965,
    biomes: [
      { name: "現代都會水泥叢林", climate: "人工空調與熱島效應", prey: "超市供應鏈、加工食品" },
      { name: "近郊住宅與農牧聚落", climate: "季風與溫帶氣候", prey: "在地農產、商業市場" },
      { name: "偏遠山區聚落", climate: "高海拔與自然節奏", prey: "自給自足耕作、採集" }
    ],
    socialType: "複雜社會體系（家庭、學校、企業與國家）",
    sensoryTraits: "發達大腦、語言象徵思維、工具運用與情感投射",
    iucnStatus: "LC (全球超過 80 億)",
    wildPopulation: "約 8,100,000,000 人",
    threats: ["心血管疾病與癌症", "交通事故與工傷", "心理壓力與憂鬱", "極端氣候災難", "地緣衝突"],
    namingPool: ["宇軒", "子涵", "品睿", "晨曦", "冠宇", "美玲", "俊傑", "思妤", "家豪", "若晴", "Liam", "Emma", "Noah", "Olivia", "Haruto", "Yui"],
    stages: [
      { min: 0, max: 5, name: "幼童時期" },
      { min: 6, max: 17, name: "青少年期" },
      { min: 18, max: 35, name: "青年打拼" },
      { min: 36, max: 60, name: "壯年中流" },
      { min: 61, max: 80, name: "熟齡退休" },
      { min: 81, max: 100, name: "耄耋之年" }
    ],
    lookalikeGuide: {
      confusedWith: "尼安德塔人 (Neanderthals)、早期直立人 (Homo erectus)",
      differences: "【下巴頦隆突 (Mental Eminence)】：現代智人是唯一擁有向前隆起突出「真正下巴」的靈長類；尼安德塔人與近緣古人類下頜向後傾斜縮進，無下巴突出結構。\n【高隆垂直前額】：智人眉脊骨平緩退化，額骨近乎垂直高聳以容納發達額葉；尼安德塔人具粗厚突出的眉脊雙拱與扁平後傾的顱骨。\n【體態與骨骼】：智人骨骼輕盈修長、骨盆特化為長期直立行走，上肢短於下肢；古人類骨骼粗壯厚重、胸腔呈圓桶狀。"
    },
    survivalCurve: [100, 96, 95, 93, 89, 83, 72, 55, 30, 8, 1],
    // 人類專屬國家與經濟資料庫
    countries: [
      {
        name: "台灣",
        currency: "TWD (新台幣)",
        currencySymbol: "NT$",
        gdpPppUsd: 72490,
        localEquivMonthly: 48000,
        gini: 0.34,
        avgLifespan: 81.3,
        infantMortality: 0.0038,
        description: "高科技島嶼、全民健保體系、教育普及度極高，生活節奏緊湊。"
      },
      {
        name: "日本",
        currency: "JPY (日圓)",
        currencySymbol: "¥",
        gdpPppUsd: 49530,
        localEquivMonthly: 58000,
        gini: 0.32,
        avgLifespan: 84.6,
        infantMortality: 0.0018,
        description: "世界最長壽國家之一，高齡化與少子化顯著，公共秩序嚴謹。"
      },
      {
        name: "美國",
        currency: "USD (美元)",
        currencySymbol: "$",
        gdpPppUsd: 80410,
        localEquivMonthly: 75000,
        gini: 0.41,
        avgLifespan: 77.5,
        infantMortality: 0.0054,
        description: "經濟規模龐大，創新蓬勃，但所得差距與醫療支出自負額較高。"
      },
      {
        name: "挪威",
        currency: "NOK (挪威克朗)",
        currencySymbol: "kr",
        gdpPppUsd: 114890,
        localEquivMonthly: 92000,
        gini: 0.27,
        avgLifespan: 83.2,
        infantMortality: 0.0019,
        description: "高福利北歐典範，自然資源充沛，社會貧富差距極低。"
      },
      {
        name: "印度",
        currency: "INR (印度盧比)",
        currencySymbol: "₹",
        gdpPppUsd: 9180,
        localEquivMonthly: 12000,
        gini: 0.35,
        avgLifespan: 70.8,
        infantMortality: 0.027,
        description: "人口第一大國，數位科技與傳統聚落並存，貧富差距極大。"
      },
      {
        name: "奈及利亞",
        currency: "NGN (奈拉)",
        currencySymbol: "₦",
        gdpPppUsd: 6150,
        localEquivMonthly: 7500,
        gini: 0.35,
        avgLifespan: 53.6,
        infantMortality: 0.071,
        description: "非洲人口大國，青年人口比例極高，但公共衛生與基礎設施挑戰嚴峻。"
      },
      {
        name: "巴西",
        currency: "BRL (巴西雷亞爾)",
        currencySymbol: "R$",
        gdpPppUsd: 18690,
        localEquivMonthly: 21000,
        gini: 0.52,
        avgLifespan: 75.9,
        infantMortality: 0.012,
        description: "南美熱情國度，生態豐富，但城市貧民窟與貧富不均課題深重。"
      },
      {
        name: "德國",
        currency: "EUR (歐元)",
        currencySymbol: "€",
        gdpPppUsd: 66040,
        localEquivMonthly: 68000,
        gini: 0.31,
        avgLifespan: 81.0,
        infantMortality: 0.0031,
        description: "歐洲工業火車頭，社會保障完備，勞動權益保障強大。"
      }
    ]
  },
  {
    id: "feral_cat",
    name: "街貓（野化家貓）",
    scientificName: "Felis catus",
    category: "mammal",
    isHuman: false,
    weightKg: 4.2,
    maxAge: 16,
    avgAgeWild: 3.8,
    unit: "歲",
    infantSurvivalRate: 0.35,
    biomes: [
      { name: "老舊都市暗巷與通風管道", climate: "避雨但潮濕寒冷", prey: "垃圾殘屑、麻雀與溝鼠" },
      { name: "近郊廢棄貨櫃工廠", climate: "空曠積水", prey: "壁虎、蟋蟀與野鼠" },
      { name: "社區公園綠籬灌木叢", climate: "隱蔽落葉堆", prey: "善心兩腳獸殘羹、池塘金魚" }
    ],
    socialType: "鬆散街區母系群或孤傲巡邏者",
    sensoryTraits: "夜視能力、鬍鬚感知微風氣流、無聲肉球伏擊步態",
    iucnStatus: "馴化與入侵物種 (全球超過 6 億隻)",
    wildPopulation: "約 480,000,000 隻（含街貓與野貓）",
    threats: ["雷擊路疾馳怪獸（車禍）", "流浪犬群圍攻", "貓傳染性腹膜炎/白血病", "兩腳獸捕殺與毒餌", "寒冬失溫凍斃"],
    namingPool: ["刺尾", "暗斑", "銀爪", "苔斑", "小燼", "霧鬚", "斑皮", "栗爪", "破耳", "黑夜"],
    stages: [
      { min: 0, max: 0.5, name: "盲眼幼貓 (Kit)" },
      { min: 1, max: 2, name: "學徒/少年貓 (Apprentice)" },
      { min: 3, max: 6, name: "戰士/街區巡邏貓 (Warrior)" },
      { min: 7, max: 10, name: "資深頑抗者 (Senior)" },
      { min: 11, max: 16, name: "九命長老 (Elder)" }
    ],
    lookalikeGuide: {
      confusedWith: "歐亞石虎 / 豹貓 (Leopard Cat)、歐洲野貓 (European Wildcat)",
      differences: "【耳後白斑（重要鑑別標記）】：石虎（豹貓）雙耳背面有極為醒目的「黑底白斑」（白點印記），兩眼內側有兩條白色線條延伸至額頂；家貓耳背絕無此對稱白斑。\n【尾巴外觀】：家貓尾巴細長末端收尖，或常有折尾（麒麟尾）；石虎與野貓尾巴粗圓如圓柱，末端粗鈍帶數道黑色環紋，絕無折尾。\n【瞳孔特徵】：家貓瞳孔在強光下收縮為垂直細裂縫；兔猻等部分野貓收縮為正圓形。"
    },
    survivalCurve: [100, 35, 25, 16, 9, 4, 1.5, 0.4]
  },
  {
    id: "orca",
    name: "虎鯨（殺人鯨）",
    scientificName: "Orcinus orca",
    category: "marine",
    isHuman: false,
    weightKg: 5500,
    maxAge: 80,
    avgAgeWild: 45,
    unit: "歲",
    infantSurvivalRate: 0.55,
    biomes: [
      { name: "北太平洋峽灣海域", climate: "冰冷深藍湧流", prey: "大西洋鮭魚、斑海豹" },
      { name: "南極羅斯海浮冰緣", climate: "浮冰密布、鹹冷急流", prey: "食蟹海豹、企鵝與小鬚鯨" },
      { name: "挪威沿岸峽灣群", climate: "峽灣深水與鯡魚風暴", prey: "旋轉拍擊鯡魚群" }
    ],
    socialType: "緊密母系聲納家族群（由祖母首領領航）",
    sensoryTraits: "高解析聲納回聲定位、方言鳴叫系統、世代傳授的戰術文化",
    iucnStatus: "DD (數據缺乏，各族群健康度差異大)",
    wildPopulation: "約 50,000 隻",
    threats: ["兩腳獸巨型貨輪螺旋槳撞擊", "海洋重金屬 (PCB) 蓄積導致免疫潰敗", "人類過度捕撈導致鮭魚荒", "水下軍事聲納震盪"],
    namingPool: ["深潮", "白腹", "裂鰭", "激浪", "海鳴", "冷渦", "重濤", "碎冰", "藍脊", "潮音"],
    stages: [
      { min: 0, max: 2, name: "跟隨母鯨幼犢 (Calf)" },
      { min: 3, max: 12, name: "學習獵陣青年 (Juvenile)" },
      { min: 13, max: 35, name: "強盛先鋒戰士 (Adult Prime)" },
      { min: 36, max: 55, name: "家族領航長老 (Matriarch Lead)" },
      { min: 56, max: 80, name: "深海智慧古鯨 (Venerable)" }
    ],
    lookalikeGuide: {
      confusedWith: "偽虎鯨 (False Killer Whale)、領航鯨 (Pilot Whale)、海豚 (Dolphin)",
      differences: "【眼斑 vs 真正眼睛】：虎鯨最標誌性的橢圓形白斑是「眼斑」，位於眼部後上方；真正的眼睛藏在眼斑前方的黑色皮膚處，常被大眾誤認。\n【體色與背鰭】：虎鯨黑白分明，下顎至腹部純白，背鰭後有灰白馬鞍斑，雄性背鰭高達1.8公尺呈高直三角形；偽虎鯨全身烏黑油亮無任何白斑，體型修長纖細；領航鯨頭部膨大呈西瓜球狀。"
    },
    survivalCurve: [100, 55, 48, 42, 35, 28, 20, 12, 5, 1]
  },
  {
    id: "emperor_penguin",
    name: "皇帝企鵝",
    scientificName: "Aptenodytes forsteri",
    category: "avian",
    isHuman: false,
    weightKg: 35,
    maxAge: 22,
    avgAgeWild: 12,
    unit: "歲",
    infantSurvivalRate: 0.32,
    biomes: [
      { name: "南極威德爾海固定冰原", climate: "-50°C 暴風雪與極夜", prey: "南極磷蝦、側紋南極魚" },
      { name: "羅斯冰棚邊緣裂隙", climate: "冰裂隙與強烈下降風", prey: "深潛魷魚、銀魚群" }
    ],
    socialType: "巨大抗寒擠壓群 (Huddle) 與終身輪替親職",
    sensoryTraits: "水下流線型羽翼、雙重保暖羽絨層、極寒耐受血液抗凍機制",
    iucnStatus: "NT (近危，氣候暖化衝擊繁殖海冰)",
    wildPopulation: "約 500,000 隻",
    threats: ["海冰提早融解導致未換羽幼雛落水淹死", "豹海豹水下伏擊", "南方巨海燕空中捕食幼雛", "極地颶風失溫"],
    namingPool: ["霜羽", "冰晶", "玄背", "寒星", "風嚎", "破浪", "雪爪", "極芒", "白翎", "夜風"],
    stages: [
      { min: 0, max: 1, name: "腹囊幼雛 (Chick)" },
      { min: 2, max: 4, name: "換羽入海青年 (Subadult)" },
      { min: 5, max: 12, name: "極寒繁育戰士 (Breeding Adult)" },
      { min: 13, max: 18, name: "老成巡洋者 (Experienced)" },
      { min: 19, max: 22, name: "冰原傳奇 (Elder)" }
    ],
    lookalikeGuide: {
      confusedWith: "國王企鵝 (King Penguin)",
      differences: "【耳斑與胸羽漸層】：皇帝企鵝耳部為淡檸檬黃，下方開口自然漸層融入胸腹部柔白羽毛；國王企鵝耳斑為全封閉如水滴狀的鮮豔火橙色斑塊，與下腹羽毛界線分明。\n【體型與體重差距】：皇帝企鵝為企鵝之王，體高達120公分、體重達35~45公斤；國王企鵝體高約90公分、體重僅15公斤左右（約皇帝企鵝三分之一）。\n【喙部斑紋】：皇帝企鵝下喙基部為柔和粉紅或淡紫色；國王企鵝下喙兩側有鮮豔橙紅色角質片。"
    },
    survivalCurve: [100, 32, 26, 20, 15, 10, 5, 2, 0.5]
  },
  {
    id: "african_elephant",
    name: "非洲草原象",
    scientificName: "Loxodonta africana",
    category: "mammal",
    isHuman: false,
    weightKg: 6000,
    maxAge: 70,
    avgAgeWild: 56,
    unit: "歲",
    infantSurvivalRate: 0.68,
    biomes: [
      { name: "塞倫蓋蒂稀樹熱帶草原", climate: "乾濕季分明、烈日高懸", prey: "金合歡嫩葉、灌木樹皮與草根" },
      { name: "奧卡萬戈三角洲濕地", climate: "季節性氾濫水道", prey: "蘆葦、水生莎草與睡蓮" }
    ],
    socialType: "母系智慧象群（由最年長母象族長帶路）",
    sensoryTraits: "足底低頻次聲波感應數十公里水脈、長鼻嗅覺超越獵犬、超強地理記憶",
    iucnStatus: "EN (瀕危，盜獵與生境破碎化嚴重)",
    wildPopulation: "約 415,000 隻",
    threats: ["兩腳獸盜獵火器（象牙交易）", "百年極端大旱水源枯竭", "幼象遭獅群夜間圍襲", "農田圍籬電網衝撞"],
    namingPool: ["重踏", "古木", "巨牙", "沃土", "長雲", "沙風", "晨露", "厚壁", "雷步", "深根"],
    stages: [
      { min: 0, max: 4, name: "受護幼象 (Calf)" },
      { min: 5, max: 12, name: "活潑少年象 (Juvenile)" },
      { min: 13, max: 25, name: "成年象隊主力 (Young Adult)" },
      { min: 26, max: 50, name: "智慧領航象 (Prime)" },
      { min: 51, max: 70, name: "草原巨木祖母 (Matriarch)" }
    ],
    lookalikeGuide: {
      confusedWith: "亞洲象 (Asian Elephant)、非洲森林象 (African Forest Elephant)",
      differences: "【雙耳尺寸與輪廓】：非洲草原象雙耳極為巨大（長達2公尺），外觀輪廓酷似非洲大陸地圖；亞洲象耳朵顯著較小，輪廓呈三角形。\n【背部線條】：非洲象背部中央凹陷呈馬鞍形，最高點在肩部與臀部；亞洲象背部整體向上拱起隆起呈圓弧冠狀。\n【鼻端指狀突起】：非洲象鼻端上下各有一個「指狀突起」（共2個），可如鑷子般靈巧對捏；亞洲象鼻端僅上方有一個突起。\n【頭頂特徵】：亞洲象頭頂有兩個明顯隆起的肉質額凸（如雙峰）；非洲象頭頂平坦單一。"
    },
    survivalCurve: [100, 68, 62, 55, 48, 38, 25, 12, 3]
  },
  {
    id: "green_sea_turtle",
    name: "綠蠵龜",
    scientificName: "Chelonia mydas",
    category: "reptile",
    isHuman: false,
    weightKg: 130,
    maxAge: 85,
    avgAgeWild: 50,
    unit: "歲",
    infantSurvivalRate: 0.001, // 千分之一！極度真實的海洋生態殘酷率
    biomes: [
      { name: "熱帶珊瑚礁與海草床", climate: "溫暖透亮淺海", prey: "海草、大型藻類與水母" },
      { name: "跨洋遠洋環流帶", climate: "深不可測大洋", prey: "浮游海樽、幼小甲殼類" }
    ],
    socialType: "深海獨行巡航者（產卵季依地磁導航集體返回誕生沙灘）",
    sensoryTraits: "感應地球磁場導航、鹽腺排鹽、能在水下屏氣數小時",
    iucnStatus: "EN (瀕危)",
    wildPopulation: "成熟雌龜約 85,000 隻",
    threats: ["破殼幼龜沙灘狂奔被海鳥螃蟹撕碎", "海中誤食透明塑膠袋窒息", "流刺漁網纏繞溺斃", "人工沙灘光害迷失方向"],
    namingPool: ["碧殼", "浪紋", "青波", "碎沫", "沉潮", "迴游", "翠脊", "古礁", "深沫", "靜海"],
    stages: [
      { min: 0, max: 1, name: "衝灘破殼狂奔者 (Hatchling)" },
      { min: 2, max: 15, name: "遠洋迷蹤少年 (Pelagic Stage)" },
      { min: 16, max: 35, name: "定居近岸青年 (Subadult)" },
      { min: 36, max: 60, name: "成熟返鄉巨龜 (Adult Breeder)" },
      { min: 61, max: 85, name: "百歲滄海長老 (Ancient Navigator)" }
    ],
    lookalikeGuide: {
      confusedWith: "玳瑁 (Hawksbill Sea Turtle)、赤蠵龜 (Loggerhead)",
      differences: "【額前鱗 (Prefrontal Scales)】：綠蠵龜兩眼之間僅有一對（2片）長形額前鱗片；玳瑁與赤蠵龜則具有兩對（4片）額前鱗片。\n【嘴喙輪廓】：綠蠵龜嘴喙短而圓鈍、下顎邊緣帶平滑細齒（食海草與海藻適應）；玳瑁嘴喙細長強烈下彎呈鋒利鷹鉤狀（鷹嘴），用以啄食珊瑚縫隙海綿。\n【背甲盾片覆疊】：綠蠵龜背甲平滑圓潤、盾片並列平接；玳瑁背甲盾片如同屋頂瓦片般「後片覆疊前片」，且甲殼後緣呈尖銳鋸齒狀。"
    },
    survivalCurve: [100, 0.1, 0.08, 0.06, 0.05, 0.04, 0.02, 0.008]
  },
  {
    id: "red_fox",
    name: "赤狐",
    scientificName: "Vulpes vulpes",
    category: "mammal",
    isHuman: false,
    weightKg: 6.8,
    maxAge: 9,
    avgAgeWild: 3.2,
    unit: "歲",
    infantSurvivalRate: 0.42,
    biomes: [
      { name: "溫帶林緣與農耕緩衝帶", climate: "灌木落葉與草甸", prey: "田鼠、野兔、漿果與昆蟲" },
      { name: "都市近郊住宅後院與公園", climate: "路燈與水泥矮牆", prey: "垃圾廚餘、寵物飼料殘渣" }
    ],
    socialType: "機敏獨立獨行俠（成對育雛）",
    sensoryTraits: "能聽見積雪下一尺深田鼠抓扒聲、地磁輔助高跳撲擊、赤紅保護色",
    iucnStatus: "LC (無危)",
    wildPopulation: "全球數百萬隻",
    threats: ["公路怪獸車輛撞擊", "大型猛禽 (金雕) 與郊狼圍捕", "疥癬蟲感染導致全身脫毛失溫", "滅鼠毒餌二次中毒"],
    namingPool: ["紅焰", "火尾", "躍影", "雪撲", "銅鬚", "秋斑", "赤耳", "黠目", "刺林", "夜影"],
    stages: [
      { min: 0, max: 0.8, name: "地穴幼狐 (Kit)" },
      { min: 1, max: 2, name: "離巢獨立青年 (Subadult)" },
      { min: 3, max: 5, name: "頂級獵鼠高手 (Adult)" },
      { min: 6, max: 9, name: "白鬚林隱者 (Veteran)" }
    ],
    lookalikeGuide: {
      confusedWith: "灰狐 (Gray Fox)、柴犬 (Shiba Inu)、郊狼 (Coyote)",
      differences: "【白尾尖（絕對辨識標記）】：赤狐不論毛色變異為何，蓬鬆尾巴末端永遠帶有一撮「純白色毛尖」；灰狐尾部背脊中央有一道黑色硬毛脊線，且尾尖永遠是純黑色。\n【黑襪四足與耳背】：赤狐四肢末端與耳朵背面覆蓋深黑被毛，如同穿著黑襪手套；柴犬四肢內側與胸前必有白毛（裏白），且尾巴捲於背上。\n【瞳孔】：赤狐瞳孔在光線下呈垂直細裂縫；犬類瞳孔收縮時始終為正圓形。"
    },
    survivalCurve: [100, 42, 28, 16, 7, 2, 0.4]
  },
  {
    id: "honeybee_worker",
    name: "義大利蜂（工蜂）",
    scientificName: "Apis mellifera",
    category: "insect",
    isHuman: false,
    weightKg: 0.0001,
    maxAge: 26, // 以週計算
    avgAgeWild: 6,
    unit: "週",
    infantSurvivalRate: 0.72,
    biomes: [
      { name: "野花繁茂之果園與草甸", climate: "陽光晴朗無強雨", prey: "花蜜、百花花粉" },
      { name: "森林邊緣樹洞蜂巢", climate: "溫暖遮蔭樹心", prey: "森林蜜露、樹脂蜂膠" }
    ],
    socialType: "高度真社會性帝國（數萬姊妹侍奉單一蜂王）",
    sensoryTraits: "搖擺舞 (Waggle Dance) 幾何座標傳訊、紫外線複眼、花粉刷毛",
    iucnStatus: "DD (廣泛飼育但受蜂群崩壞症衝擊)",
    wildPopulation: "全球數兆隻",
    threats: ["農藥新類尼古丁神經毒素", "亞洲大虎頭蜂屠巢", "蜂蟹蟎吸血傳播殘翅病毒", "狂風驟雨淋濕力竭落水"],
    namingPool: ["嗡鳴", "金翎", "花露", "晨蜜", "針刺", "柔翅", "晶蠟", "蕊粉", "金曦", "微羽"],
    stages: [
      { min: 0, max: 2, name: "房內清掃與育幼蜂 (Nurse)" },
      { min: 3, max: 4, name: "築脾與守衛兵蜂 (Guard)" },
      { min: 5, max: 8, name: "野外外勤採蜜工蜂 (Forager)" },
      { min: 9, max: 26, name: "越冬存續神祕蜂 (Winter Bee)" }
    ],
    lookalikeGuide: {
      confusedWith: "黃蜂 / 虎頭蜂 (Wasp / Hornet)、食蚜蠅 (Hoverfly)、熊蜂 (Bumblebee)",
      differences: "【羽狀絨毛與花粉籃】：蜜蜂全身覆滿分叉羽狀絨毛，後足特化為具長毛邊緣的凹陷「花粉籃」，採蜜時常攜帶兩顆圓滾滾花粉團；黃蜂全身光滑無絨毛、腹部基部極細（胡蜂腰），後足無花粉籃。\n【翅膀與懸停（vs 食蚜蠅）】：食蚜蠅僅有2片翅膀（雙翅目），能於空中超高速定點懸停，觸角極短如小點；蜜蜂有4片翅膀以翅鉤鎖定（膜翅目），觸角為膝狀長節。\n【螫針構造】：蜜蜂工蜂螫針具微小倒鉤，刺入哺乳類皮膚後內臟撕裂而亡；黃蜂螫針光滑無倒鉤，可反覆連續刺擊。"
    },
    survivalCurve: [100, 85, 70, 45, 18, 5, 1]
  },
  {
    id: "common_raven",
    name: "渡鴉",
    scientificName: "Corvus corax",
    category: "avian",
    isHuman: false,
    weightKg: 1.2,
    maxAge: 23,
    avgAgeWild: 11,
    unit: "歲",
    infantSurvivalRate: 0.52,
    biomes: [
      { name: "峭壁峽谷與苔原林野", climate: "狂風與崇山峻嶺", prey: "腐肉、漿果、小型爬蟲與蛋" },
      { name: "兩腳獸路邊與垃圾掩埋場邊緣", climate: "人造開闊荒地", prey: "路殺殘渣、廢棄物" }
    ],
    socialType: "終身伴侶契約，與狼群維持互惠「狼之眼」夥伴關係",
    sensoryTraits: "超凡工具製作智力、記憶人臉與怨仇、空中翻滾特技特化",
    iucnStatus: "LC (無危)",
    wildPopulation: "全球超過 2,000,000 隻",
    threats: ["巨型猛禽 (雕類) 突襲", "殘留農藥與鉛彈肉塊中毒", "嚴冬冰封飢饉", "高壓電線誤觸"],
    namingPool: ["黑羽", "鐵喙", "啞啼", "暗影", "幽羽", "峭巖", "朔風", "玄曜", "孤鳴", "霜喙"],
    stages: [
      { min: 0, max: 1, name: "懸崖雛鳥 (Fledgling)" },
      { min: 2, max: 3, name: "遊蕩未婚群青鳥 (Juvenile Gang)" },
      { min: 4, max: 12, name: "結盟獵手領空主 (Mated Pair)" },
      { min: 13, max: 23, name: "黑羽古智者 (Ancient Prophet)" }
    ],
    lookalikeGuide: {
      confusedWith: "巨嘴鴉 / 小嘴烏鴉 (Carrion / Jungle Crow)、黑鳶 (Black Kite)",
      differences: "【體型規模】：渡鴉是雀形目最大鳥類，翼展超過1.2公尺、重達1.2公斤，體格相當於猛禽巨鵰，比市區普通烏鴉大上將近一倍。\n【飛行尾羽形狀】：渡鴉在空中滑翔時，尾羽末端呈鮮明的「菱形 / 楔形（三角形凸出）」；普通烏鴉尾羽展開呈平緩的扇形或方圓形。\n【喉羽鬍鬚】：渡鴉喉部與下顎長有一叢蓬鬆粗糙、長矛狀的尖刺「喉羽」，警戒或鳴叫時如鬍鬚般炸開；普通烏鴉喉羽光滑平順。\n【鳴叫聲線】：渡鴉聲音極其深沉渾厚、如木管空腔共鳴的「咯-咯-(Grok)」喉音；普通烏鴉叫聲則是尖銳高亢的「啊-啊-(Caw)」。"
    },
    survivalCurve: [100, 52, 44, 38, 28, 18, 8, 2, 0.4]
  }
];

/**
 * 80億分之1 (1in8b) 核心真實統計資料庫：
 * 涵蓋172個國家與地區之故鄉對比母體、出生機率排行榜、跨時代世界設定、暫停片刻哲思反思題庫與追思館悼詞。
 */

// 故鄉對比母體資料庫 (供玩家選擇自己的出生國並進行一生數據並排比較)
window.HOME_COUNTRIES_LIST = [
  { id: "taiwan", name: "台灣", currency: "NT$", avgLifespan: 81.3, infantMortality: 0.0038, gdpPppUsd: 72490, happiness: 6.5, env: "全民健保、高科技半導體島嶼、教育高度普及" },
  { id: "japan", name: "日本", currency: "¥", avgLifespan: 84.6, infantMortality: 0.0018, gdpPppUsd: 49530, happiness: 6.1, env: "世界最高壽命國家之一、高齡少子化、治安井然" },
  { id: "hongkong", name: "香港", currency: "HK$", avgLifespan: 85.2, infantMortality: 0.0017, gdpPppUsd: 69980, happiness: 5.3, env: "高密度國際金融都會、長壽之城、生活步調緊湊" },
  { id: "china", name: "中國", currency: "¥", avgLifespan: 78.2, infantMortality: 0.0068, gdpPppUsd: 21470, happiness: 5.8, env: "全球製造業重鎮、城鄉發展梯度大、工業化迅速" },
  { id: "usa", name: "美國", currency: "$", avgLifespan: 77.5, infantMortality: 0.0054, gdpPppUsd: 80410, happiness: 6.9, env: "全球最大經濟體、科研創新中心、所得差距顯著" },
  { id: "uk", name: "英國", currency: "£", avgLifespan: 81.0, infantMortality: 0.0037, gdpPppUsd: 56270, happiness: 6.7, env: "歷史悠久、NHS公醫制度、溫帶海洋島國" },
  { id: "korea", name: "南韓", currency: "₩", avgLifespan: 83.6, infantMortality: 0.0024, gdpPppUsd: 50070, happiness: 5.9, env: "尖端數位科技、激烈升學職場體系、都會節奏快" },
  { id: "singapore", name: "新加坡", currency: "S$", avgLifespan: 83.7, infantMortality: 0.0019, gdpPppUsd: 133740, happiness: 6.5, env: "東南亞花園都會、高所得金融航運樞紐" },
  { id: "canada", name: "加拿大", currency: "C$", avgLifespan: 82.6, infantMortality: 0.0044, gdpPppUsd: 58400, happiness: 7.0, env: "遼闊北方自然、全民健保體系、多元包容社會" },
  { id: "australia", name: "澳洲", currency: "A$", avgLifespan: 83.3, infantMortality: 0.0031, gdpPppUsd: 65430, happiness: 7.1, env: "陽光海岸大陸、獨特有袋類物種、高生活滿意度" },
  { id: "germany", name: "德國", currency: "€", avgLifespan: 81.0, infantMortality: 0.0031, gdpPppUsd: 66030, happiness: 6.9, env: "歐洲工業火車頭、社會市場經濟福利、嚴謹工藝" },
  { id: "france", name: "法國", currency: "€", avgLifespan: 82.5, infantMortality: 0.0035, gdpPppUsd: 58760, happiness: 6.6, env: "人文藝術大國、完善產假與育兒補助福利" },
  { id: "india", name: "印度", currency: "₹", avgLifespan: 70.4, infantMortality: 0.0270, gdpPppUsd: 9070, happiness: 4.1, env: "世界人口第一大國、多元宗教語言、高經濟成長" },
  { id: "nigeria", name: "奈及利亞", currency: "₦", avgLifespan: 53.6, infantMortality: 0.0710, gdpPppUsd: 5910, happiness: 4.5, env: "西非第一人口大國、年輕人口眾多、公共醫療緊繃" },
  { id: "kenya", name: "肯亞", currency: "KSh", avgLifespan: 61.4, infantMortality: 0.0310, gdpPppUsd: 5760, happiness: 4.5, env: "東非野生大遷徙樞紐、薩凡納草甸、農業經濟" },
  { id: "brazil", name: "巴西", currency: "R$", avgLifespan: 72.8, infantMortality: 0.0130, gdpPppUsd: 18690, happiness: 6.1, env: "亞馬遜綠色心臟、森巴多元文化、貧富不均" }
];

// 出生機率排行榜 (1in8b 真實聯合國 2024 出生統計 + 十兆生物量比例)
window.GLOBAL_ODDS_DATA = {
  humanOdds: [
    { name: "印度 (India)", pct: "17.5%", code: "IN", lat: 20.59, lng: 78.96 },
    { name: "中國 (China)", pct: "8.8%", code: "CN", lat: 35.86, lng: 104.19 },
    { name: "奈及利亞 (Nigeria)", pct: "5.4%", code: "NG", lat: 9.08, lng: 8.67 },
    { name: "巴基斯坦 (Pakistan)", pct: "4.6%", code: "PK", lat: 30.37, lng: 69.34 },
    { name: "印度尼西亞 (Indonesia)", pct: "3.2%", code: "ID", lat: -0.78, lng: 113.92 },
    { name: "剛果民主共和國 (DR Congo)", pct: "2.8%", code: "CD", lat: -4.03, lng: 21.75 },
    { name: "衣索比亞 (Ethiopia)", pct: "2.7%", code: "ET", lat: 9.14, lng: 40.48 },
    { name: "孟加拉 (Bangladesh)", pct: "2.2%", code: "BD", lat: 23.68, lng: 90.35 },
    { name: "美國 (United States)", pct: "2.0%", code: "US", lat: 37.09, lng: -95.71 },
    { name: "菲律賓 (Philippines)", pct: "1.8%", code: "PH", lat: 12.87, lng: 121.77 },
    { name: "埃及 (Egypt)", pct: "1.7%", code: "EG", lat: 26.82, lng: 30.80 },
    { name: "巴西 (Brazil)", pct: "1.6%", code: "BR", lat: -14.23, lng: -51.92 }
  ],
  speciesOdds: [
    { name: "節肢動物門 (昆蟲/蜘蛛)", pct: "82.4%", icon: "fa-bug" },
    { name: "脊索動物門·魚綱 (海洋/淡水)", pct: "12.1%", icon: "fa-fish" },
    { name: "鳥綱 (禽鳥飛羽)", pct: "3.8%", icon: "fa-crow" },
    { name: "哺乳綱 (野生與家養獸類)", pct: "1.6%", icon: "fa-paw" },
    { name: "智人 (80億人類)", pct: "0.08%", icon: "fa-person", highlight: true }
  ]
};

// 跨時代出生的世界設定
window.HISTORICAL_ERAS = {
  now: {
    id: "now",
    label: "現在的世界",
    hint: "在今天的世界裡過完一生。聯合國與世界銀行的現代統計會一直延續到最後。",
    modifier: "現代文明與棲地破碎化共存"
  },
  past: {
    id: "past",
    label: "過去的世界",
    hint: "回到過去的歷史歲月（1950～2025年）。直面真實歷史中的冷戰、變革與原始廣袤的古老荒野。",
    modifier: "歷史年代統計與未受大規模開發之生境"
  },
  future: {
    id: "future",
    label: "未來的世界",
    hint: "在聯合國等機構對未來的推估中生活。面對氣候變遷、極端生境與次世代科技保護區的考驗。",
    modifier: "未來推估人口結構與環境變遷模型"
  },
  any: {
    id: "any",
    label: "哪個世界都好",
    hint: "由命運盲盒隨機擲骰決定你的降生時空維度。",
    modifier: "隨機時空律動"
  }
};

// 暫停片刻哲思反思問答庫 (5歲、15歲、30歲、50歲、70歲)
window.REFLECTION_QUESTIONS = {
  5: {
    ageLabel: "5 歲 · 幼年探索",
    human: "回顧最初能記住的幾年，你身邊最親近的人是誰？這座世界給你的第一抹感覺是溫暖還是陌生？",
    animal: "第一次離開巢穴的庇護、踏上未知的泥土時，荒野迎面吹來的第一陣風帶給你的是好奇還是戰慄？"
  },
  15: {
    ageLabel: "15 歲 · 少年意氣",
    human: "看著同儕與校園之外廣闊的社會，你最渴望成為什麼樣的人？內心深處最害怕失去什麼？",
    animal: "面對雷擊路上奔馳的鐵皮怪獸與猛禽盤旋的陰影，你心中的本能是驅使你挺身守護同袍，還是靈活潛伏？"
  },
  30: {
    ageLabel: "30 歲 · 青年重擔",
    human: "走過社會的競爭與現實的磨礪，你當初年少時許下的理想，如今還剩下幾成？",
    animal: "當你扛起巡守領地與捕獵撫幼的責任，在嚴冬飢饉面前，你體悟到了怎樣的生存法則？"
  },
  50: {
    ageLabel: "50 歲 · 壯年中流",
    human: "如果可以跨越時空對二十年前迷茫的自己說一句話，你最想叮嚀他/她什麼？",
    animal: "骨骼間積累了獵犬與嚴寒留下的傷痕，看著新一代幼獸在陽光下嬉鬧，你如何理解先祖星族的秩序？"
  },
  70: {
    ageLabel: "70 歲 · 暮年回望",
    human: "走到了人生的黃昏，回顧這一生愛過的人、跨過的檻與走過的長路，你心中最感欣慰的是什麼？",
    animal: "狂風漸漸吹不動你衰老的毛皮，在靈魂即將奔向遼闊獵場之前，你想對這片哺育你的大地留下什麼寄語？"
  }
};

// 荒野追思館預設溫暖悼念寄語
window.MEMORIAL_PRESETS = [
  "願你在群星照耀的遼闊荒原上，無拘無束自由奔跑。",
  "謝謝你曾來到這個世界，留下有溫度的心跳與足跡。",
  "安息吧，無論這條路多艱難，你已經竭盡全力，做得很好了。",
  "風吹過大地的聲音，就是你留給這座世界永恆的回響。",
  "星族的永恆獵場已經為你敞開，寒冷與苦痛將不再降臨。",
  "生命的漣漪永不停息，你所愛過的與守護過的，皆已融入大地。"
];

