/* AskQuran — Surah structural metadata
   Source: Tanzil Quran metadata + Tanzil revelation-order metadata.
   Format per row: [number, arabicName, transliteratedName, ayahCount, place ("Meccan"|"Medinan"), revelationOrder]
   Only structural metadata is included here — no interpretive or thematic content. */
export const AQ_SURAHS = [
  [1,"الفاتحة","Al-Fatihah",7,"Meccan",5],
  [2,"البقرة","Al-Baqarah",286,"Medinan",87],
  [3,"آل عمران","Aal-E-Imran",200,"Medinan",89],
  [4,"النساء","An-Nisa",176,"Medinan",92],
  [5,"المائدة","Al-Ma'idah",120,"Medinan",112],
  [6,"الأنعام","Al-An'am",165,"Meccan",55],
  [7,"الأعراف","Al-A'raf",206,"Meccan",39],
  [8,"الأنفال","Al-Anfal",75,"Medinan",88],
  [9,"التوبة","At-Tawbah",129,"Medinan",113],
  [10,"يونس","Yunus",109,"Meccan",51],
  [11,"هود","Hud",123,"Meccan",52],
  [12,"يوسف","Yusuf",111,"Meccan",53],
  [13,"الرعد","Ar-Ra'd",43,"Medinan",96],
  [14,"إبراهيم","Ibrahim",52,"Meccan",72],
  [15,"الحجر","Al-Hijr",99,"Meccan",54],
  [16,"النحل","An-Nahl",128,"Meccan",70],
  [17,"الإسراء","Al-Isra",111,"Meccan",50],
  [18,"الكهف","Al-Kahf",110,"Meccan",69],
  [19,"مريم","Maryam",98,"Meccan",44],
  [20,"طه","Ta-Ha",135,"Meccan",45],
  [21,"الأنبياء","Al-Anbiya",112,"Meccan",73],
  [22,"الحج","Al-Hajj",78,"Medinan",103],
  [23,"المؤمنون","Al-Mu'minun",118,"Meccan",74],
  [24,"النور","An-Nur",64,"Medinan",102],
  [25,"الفرقان","Al-Furqan",77,"Meccan",42],
  [26,"الشعراء","Ash-Shu'ara",227,"Meccan",47],
  [27,"النمل","An-Naml",93,"Meccan",48],
  [28,"القصص","Al-Qasas",88,"Meccan",49],
  [29,"العنكبوت","Al-Ankabut",69,"Meccan",85],
  [30,"الروم","Ar-Rum",60,"Meccan",84],
  [31,"لقمان","Luqman",34,"Meccan",57],
  [32,"السجدة","As-Sajdah",30,"Meccan",75],
  [33,"الأحزاب","Al-Ahzab",73,"Medinan",90],
  [34,"سبأ","Saba",54,"Meccan",58],
  [35,"فاطر","Fatir",45,"Meccan",43],
  [36,"يس","Ya-Sin",83,"Meccan",41],
  [37,"الصافات","As-Saffat",182,"Meccan",56],
  [38,"ص","Sad",88,"Meccan",38],
  [39,"الزمر","Az-Zumar",75,"Meccan",59],
  [40,"غافر","Ghafir",85,"Meccan",60],
  [41,"فصلت","Fussilat",54,"Meccan",61],
  [42,"الشورى","Ash-Shura",53,"Meccan",62],
  [43,"الزخرف","Az-Zukhruf",89,"Meccan",63],
  [44,"الدخان","Ad-Dukhan",59,"Meccan",64],
  [45,"الجاثية","Al-Jathiyah",37,"Meccan",65],
  [46,"الأحقاف","Al-Ahqaf",35,"Meccan",66],
  [47,"محمد","Muhammad",38,"Medinan",95],
  [48,"الفتح","Al-Fath",29,"Medinan",111],
  [49,"الحجرات","Al-Hujurat",18,"Medinan",106],
  [50,"ق","Qaf",45,"Meccan",34],
  [51,"الذاريات","Adh-Dhariyat",60,"Meccan",67],
  [52,"الطور","At-Tur",49,"Meccan",76],
  [53,"النجم","An-Najm",62,"Meccan",23],
  [54,"القمر","Al-Qamar",55,"Meccan",37],
  [55,"الرحمن","Ar-Rahman",78,"Medinan",97],
  [56,"الواقعة","Al-Waqi'ah",96,"Meccan",46],
  [57,"الحديد","Al-Hadid",29,"Medinan",94],
  [58,"المجادلة","Al-Mujadila",22,"Medinan",105],
  [59,"الحشر","Al-Hashr",24,"Medinan",101],
  [60,"الممتحنة","Al-Mumtahanah",13,"Medinan",91],
  [61,"الصف","As-Saff",14,"Medinan",109],
  [62,"الجمعة","Al-Jumu'ah",11,"Medinan",110],
  [63,"المنافقون","Al-Munafiqun",11,"Medinan",104],
  [64,"التغابن","At-Taghabun",18,"Medinan",108],
  [65,"الطلاق","At-Talaq",12,"Medinan",99],
  [66,"التحريم","At-Tahrim",12,"Medinan",107],
  [67,"الملك","Al-Mulk",30,"Meccan",77],
  [68,"القلم","Al-Qalam",52,"Meccan",2],
  [69,"الحاقة","Al-Haqqah",52,"Meccan",78],
  [70,"المعارج","Al-Ma'arij",44,"Meccan",79],
  [71,"نوح","Nuh",28,"Meccan",71],
  [72,"الجن","Al-Jinn",28,"Meccan",40],
  [73,"المزمل","Al-Muzzammil",20,"Meccan",3],
  [74,"المدثر","Al-Muddaththir",56,"Meccan",4],
  [75,"القيامة","Al-Qiyamah",40,"Meccan",31],
  [76,"الإنسان","Al-Insan",31,"Medinan",98],
  [77,"المرسلات","Al-Mursalat",50,"Meccan",33],
  [78,"النبأ","An-Naba",40,"Meccan",80],
  [79,"النازعات","An-Nazi'at",46,"Meccan",81],
  [80,"عبس","Abasa",42,"Meccan",24],
  [81,"التكوير","At-Takwir",29,"Meccan",7],
  [82,"الانفطار","Al-Infitar",19,"Meccan",82],
  [83,"المطففين","Al-Mutaffifin",36,"Meccan",86],
  [84,"الانشقاق","Al-Inshiqaq",25,"Meccan",83],
  [85,"البروج","Al-Buruj",22,"Meccan",27],
  [86,"الطارق","At-Tariq",17,"Meccan",36],
  [87,"الأعلى","Al-A'la",19,"Meccan",8],
  [88,"الغاشية","Al-Ghashiyah",26,"Meccan",68],
  [89,"الفجر","Al-Fajr",30,"Meccan",10],
  [90,"البلد","Al-Balad",20,"Meccan",35],
  [91,"الشمس","Ash-Shams",15,"Meccan",26],
  [92,"الليل","Al-Layl",21,"Meccan",9],
  [93,"الضحى","Ad-Duha",11,"Meccan",11],
  [94,"الشرح","Ash-Sharh",8,"Meccan",12],
  [95,"التين","At-Tin",8,"Meccan",28],
  [96,"العلق","Al-Alaq",19,"Meccan",1],
  [97,"القدر","Al-Qadr",5,"Meccan",25],
  [98,"البينة","Al-Bayyinah",8,"Medinan",100],
  [99,"الزلزلة","Az-Zalzalah",8,"Medinan",93],
  [100,"العاديات","Al-Adiyat",11,"Meccan",14],
  [101,"القارعة","Al-Qari'ah",11,"Meccan",30],
  [102,"التكاثر","At-Takathur",8,"Meccan",16],
  [103,"العصر","Al-Asr",3,"Meccan",13],
  [104,"الهمزة","Al-Humazah",9,"Meccan",32],
  [105,"الفيل","Al-Fil",5,"Meccan",19],
  [106,"قريش","Quraysh",4,"Meccan",29],
  [107,"الماعون","Al-Ma'un",7,"Meccan",17],
  [108,"الكوثر","Al-Kawthar",3,"Meccan",15],
  [109,"الكافرون","Al-Kafirun",6,"Meccan",18],
  [110,"النصر","An-Nasr",3,"Medinan",114],
  [111,"المسد","Al-Masad",5,"Meccan",6],
  [112,"الإخلاص","Al-Ikhlas",4,"Meccan",22],
  [113,"الفلق","Al-Falaq",5,"Meccan",20],
  [114,"الناس","An-Nas",6,"Meccan",21]
];

/* The 15 sajdat al-tilawah ayahs (surah:ayah), per standard Tanzil metadata. */
export const AQ_SAJDAH = ["7:206","13:15","16:50","17:109","19:58","22:18","22:77","25:60","27:26","32:15","38:24","41:38","53:62","84:21","96:19"];

/* Surahs that open with disjoint letters (al-huruf al-muqatta'at), as found in the Quran text.
   Format: [surahNumber, lettersArabic, lettersTransliterated]. The text pattern only — meanings are not interpreted. */
export const AQ_MUQATTAAT = [
  [2,"الم","Alif Lam Mim"],
  [3,"الم","Alif Lam Mim"],
  [7,"المص","Alif Lam Mim Sad"],
  [10,"الر","Alif Lam Ra"],
  [11,"الر","Alif Lam Ra"],
  [12,"الر","Alif Lam Ra"],
  [13,"المر","Alif Lam Mim Ra"],
  [14,"الر","Alif Lam Ra"],
  [15,"الر","Alif Lam Ra"],
  [19,"كهيعص","Kaf Ha Ya 'Ayn Sad"],
  [20,"طه","Ta Ha"],
  [26,"طسم","Ta Sin Mim"],
  [27,"طس","Ta Sin"],
  [28,"طسم","Ta Sin Mim"],
  [29,"الم","Alif Lam Mim"],
  [30,"الم","Alif Lam Mim"],
  [31,"الم","Alif Lam Mim"],
  [32,"الم","Alif Lam Mim"],
  [36,"يس","Ya Sin"],
  [38,"ص","Sad"],
  [40,"حم","Ha Mim"],
  [41,"حم","Ha Mim"],
  [42,"حم عسق","Ha Mim · 'Ayn Sin Qaf"],
  [43,"حم","Ha Mim"],
  [44,"حم","Ha Mim"],
  [45,"حم","Ha Mim"],
  [46,"حم","Ha Mim"],
  [50,"ق","Qaf"],
  [68,"ن","Nun"]
];

/* Quran mentions — direct ayah references only, grouped by category.
   No counts, meanings, or interpretive claims. Ranges are kept as passage references. */
export const AQ_MENTIONS = {
  prophets: [
    {name:"Adam", refs:["2:31-37","3:33","7:11-27","20:115-123"]},
    {name:"Nuh", refs:["7:59-64","11:25-48","23:23-30","71:1-28"]},
    {name:"Ibrahim", refs:["2:124-132","6:74-83","14:35-41","21:51-73","37:83-113"]},
    {name:"Lut", refs:["7:80-84","11:77-83","26:160-175","29:28-35"]},
    {name:"Ismail", refs:["2:125-129","19:54-55","37:100-107"]},
    {name:"Ishaq", refs:["11:71-73","21:72-73","37:112-113"]},
    {name:"Yaqub", refs:["2:132-133","12:6","12:38","12:84-87"]},
    {name:"Yusuf", refs:["12:4-101"]},
    {name:"Musa", refs:["2:49-61","7:103-137","20:9-98","28:3-46"]},
    {name:"Harun", refs:["20:29-36","20:90-94","25:35","37:114-122"]},
    {name:"Dawud", refs:["2:251","21:78-80","34:10-11","38:17-26"]},
    {name:"Sulayman", refs:["21:78-82","27:15-44","34:12-14","38:30-40"]},
    {name:"Yunus", refs:["10:98","21:87-88","37:139-148"]},
    {name:"Zakariya", refs:["3:37-41","19:2-15","21:89-90"]},
    {name:"Yahya", refs:["3:39","19:7-15"]},
    {name:"Isa", refs:["3:45-55","5:110-118","19:16-36","61:6"]},
    {name:"Muhammad", refs:["3:144","33:40","47:2","48:29"]},
    {name:"Ilyas", refs:["6:85","37:123","37:130"]},
    {name:"Al-Yasa", refs:["6:86","38:48"]}
  ],
  nations: [
    {name:"People of Nuh", refs:["7:59-64","11:25-48","71:1-28"], total:14, forms:[["قوم نوح",14]]},
    {name:"Aad", refs:["7:65-72","11:50-60","26:123-140","41:15-16","69:6-8"], total:24, forms:[["عاد",24]]},
    {name:"Thamud", refs:["7:73-79","11:61-68","26:141-159","91:11-15"], total:26, forms:[["ثمود",26]]},
    {name:"People of Lut", refs:["7:80-84","11:77-83","26:160-175","29:28-35"], total:8, forms:[["قوم لوط",7],["إخوان لوط",1]]},
    {name:"People of Madyan", refs:["7:85-93","11:84-95","26:176-191"], total:6, forms:[["مدين",6]], related:[["أصحاب الأيكة",4,"related form"]]},
    {name:"Pharaoh and his people", refs:["7:103-137","10:75-92","20:43-79","28:3-42"], total:74, totalLabel:"Pharaoh (فرعون) mentions", forms:[["فرعون",74]], related:[["آل فرعون",14,"group phrase"],["قوم فرعون",4,"group phrase"]]},
    {name:"Children of Israel", refs:["2:40-61","5:20-26","17:2-8","20:80-98"], total:40, forms:[["بني إسرائيل",40]], related:[["إسرائيل",3,"standalone form"]]},
    {name:"People of the Cave", refs:["18:9-26"]},
    {name:"People of the Sabbath", refs:["2:65-66","4:154","7:163-166"], total:1, forms:[["أصحاب السبت",1]], related:[["السبت",5,"related form"]]},
    {name:"People of the Garden", refs:["68:17-33"], total:1, forms:[["أصحاب الجنة",1]]},
    {name:"People of Ukhdud", refs:["85:4-10"]},
    {name:"People of Saba", refs:["34:15-19"], total:2, forms:[["سبأ",2]]},
    {name:"Companions of the Elephant", refs:["105:1-5"], total:1, forms:[["أصحاب الفيل",1]]},
    {name:"People of the Town", refs:["36:13-29"], total:1, forms:[["أصحاب القرية",1]]},
    {name:"People of Rass", refs:["25:38-39","50:12-14"], total:2, forms:[["أصحاب الرس",2]]},
    {name:"People of Tubba", refs:["44:37","50:14"], total:2, forms:[["قوم تبع",2]]}
  ],
  angels: [
    {name:"Jibril", refs:["2:97-98","66:4"], total:3, forms:[["جبريل",3]]},
    {name:"Mikail", refs:["2:98"], total:1, forms:[["ميكال",1]]},
    {name:"Malik", refs:["43:77"], total:1, forms:[["مالك",1]]},
    {name:"Harut and Marut", refs:["2:102"], total:2, forms:[["هاروت",1],["ماروت",1]]},
    {name:"Angels generally", refs:["2:30-34","3:39-42","8:9-12","16:2","35:1","66:6"], forms:[["الملائكة",53],["ملائكة",15],["ملك / ملكا",11],["ملكين",1],["الملكين",1]]}
  ],
  scriptures: [
    {name:"Quran", refs:["2:2","2:185","10:37","17:9","56:77-80"], total:68, forms:[["القرآن",50],["قرآن",8],["قرآنًا",10]]},
    {name:"Tawrat", refs:["3:3","5:44","5:68"], total:18, forms:[["التوراة",18]]},
    {name:"Injil", refs:["3:3","5:46","5:68","57:27"], total:12, forms:[["الإنجيل",12]]},
    {name:"Zabur", refs:["4:163","17:55","21:105"], total:3, forms:[["الزبور",1],["زبورًا",2]]},
    {name:"Suhuf of Ibrahim and Musa", refs:["53:36-37","87:18-19"], total:6, forms:[["الصحف",3],["صحف",3]], related:[["صحف إبراهيم",1,"phrase"],["صحف موسى",1,"phrase"]]}
  ],
  places: [
    {name:"Makkah / Bakkah", refs:["3:96","48:24"], total:2, forms:[["مكة",1],["بكة",1]]},
    {name:"Masjid al-Haram", refs:["2:144","2:149-150","2:196","9:28"], total:15, forms:[["المسجد الحرام",15]]},
    {name:"Kaaba / Sacred House", refs:["2:125-127","5:97","22:26-29"], forms:[["الكعبة",2],["البيت الحرام",2],["البيت العتيق",2],["البيت",7]]},
    {name:"Safa and Marwah", refs:["2:158"], total:2, forms:[["الصفا",1],["المروة",1]]},
    {name:"Mount Sinai / Tur", refs:["2:63","7:143","19:52","23:20","95:2"], total:10, forms:[["الطور",8],["طور سيناء",1],["طور سينين",1]]},
    {name:"Badr", refs:["3:123"], total:1, forms:[["بدر",1]]},
    {name:"Hunayn", refs:["9:25"], total:1, forms:[["حنين",1]]},
    {name:"Yathrib", refs:["33:13"], total:1, forms:[["يثرب",1]]},
    {name:"Egypt", refs:["10:87","12:21","12:99"], total:5, forms:[["مصر",5]]},
    {name:"Madyan", refs:["7:85","11:84","28:22-28"], total:10, forms:[["مدين",10]]}
  ]
};

/* Prophets — direct-name mention model (Quran Mentions → Prophets).
   Counts generated from explicit Arabic forms in the Quran text; combined names/titles are
   NOT double-counted in the direct-name total. Per-prophet:
     n  = English display name (matches AQ_MENTIONS.prophets for passage refs where available)
     ar = Arabic display name
     total = direct-name mention count
     direct = [[arabicForm, count], …]  (forms that make up the direct-name total)
     related = [[arabicForm, count, kind], …]  kind ∈ phrase|standalone|related|variant
     combinedNote = show the "not double-counted" note */
export const AQ_PROPHETS = [
  {n:"Adam", ar:"آدم", total:25, direct:[["آدم",25]], related:[]},
  {n:"Idris", ar:"إدريس", total:2, direct:[["إدريس",2]], related:[]},
  {n:"Nuh", ar:"نوح", total:43, direct:[["نوح",43]], related:[]},
  {n:"Hud", ar:"هود", total:7, direct:[["هود",7]], related:[]},
  {n:"Salih", ar:"صالح", total:9, direct:[["صالح",9]], related:[]},
  {n:"Ibrahim", ar:"إبراهيم", total:69, direct:[["إبراهيم",69]], related:[]},
  {n:"Lut", ar:"لوط", total:27, direct:[["لوط",27]], related:[]},
  {n:"Ismail", ar:"إسماعيل", total:12, direct:[["إسماعيل",12]], related:[]},
  {n:"Ishaq", ar:"إسحاق", total:17, direct:[["إسحاق",17]], related:[]},
  {n:"Yaqub", ar:"يعقوب", total:16, direct:[["يعقوب",16]], related:[]},
  {n:"Yusuf", ar:"يوسف", total:27, direct:[["يوسف",27]], related:[]},
  {n:"Ayyub", ar:"أيوب", total:4, direct:[["أيوب",4]], related:[]},
  {n:"Shuayb", ar:"شعيب", total:11, direct:[["شعيب",11]], related:[]},
  {n:"Musa", ar:"موسى", total:136, direct:[["موسى",136]], related:[]},
  {n:"Harun", ar:"هارون", total:20, direct:[["هارون",20]], related:[]},
  {n:"Dhul-Kifl", ar:"ذا الكفل", total:2, direct:[["ذا الكفل",2]], related:[]},
  {n:"Dawud", ar:"داوود", total:16, direct:[["داوود",16]], related:[]},
  {n:"Sulayman", ar:"سليمان", total:17, direct:[["سليمان",17]], related:[]},
  {n:"Ilyas", ar:"إلياس", total:2, direct:[["إلياس",2]], related:[["إل ياسين",1,"variant"]]},
  {n:"Al-Yasa", ar:"اليسع", total:2, direct:[["اليسع",2]], related:[]},
  {n:"Yunus", ar:"يونس", total:4, direct:[["يونس",4]], related:[["ذا النون",1,"related"],["صاحب الحوت",1,"related"]]},
  {n:"Zakariya", ar:"زكريا", total:7, direct:[["زكريا",7]], related:[]},
  {n:"Yahya", ar:"يحيى", total:5, direct:[["يحيى",5]], related:[]},
  {n:"Isa", ar:"عيسى", total:25, direct:[["عيسى",25]], related:[["عيسى ابن مريم",16,"phrase"],["ابن مريم",6,"standalone"],["المسيح",9,"related"]], combinedNote:true},
  {n:"Muhammad", ar:"محمد", total:5, direct:[["محمد",4],["أحمد",1]], related:[]}
];

/* Divine Punishment — Quran-backed reasons first, then the communities under each reason.
   Only reasons directly supported by ayah references / translation wording. No tafsir or speculation.
   tags map each community to the top-level filter keys. */
export const AQ_PUNISHMENT = [
  { title:"Rejecting Messengers and Warnings",
    desc:"Communities are repeatedly shown rejecting messengers, denying warnings, or refusing clear reminders.",
    items:[
      {name:"People of Nuh", context:"Nuh", summary:"They denied Nuh and rejected the warning.",
        refs:["7:59-64","11:25-49","26:105-122","54:9-16","71:1-28"], chips:["Denied messenger","Rejected warning"], tags:["rejected-messengers"]},
      {name:"People of the Town", context:"Messengers sent to a town", summary:"They rejected the messengers sent to them and were seized by a single blast.",
        refs:["36:13-29"], chips:["Rejected messengers","Denied warning"], tags:["rejected-messengers"]},
      {name:"People of Rass", context:"Mentioned among destroyed peoples", summary:"The Quran mentions them among peoples who denied messengers. Details are not expanded in the Quran.",
        refs:["25:38-39","50:12-14"], chips:["Denied messengers","Details not expanded"], tags:["rejected-messengers"]},
      {name:"People of Tubba", context:"Mentioned among past peoples", summary:"The Quran mentions them among past peoples who denied.",
        refs:["44:37","50:14"], chips:["Denied warning","Details not expanded"], tags:["rejected-messengers"]}
    ]},
  { title:"Rejecting Signs and Disobeying Messengers",
    desc:"The Quran links punishment to rejecting Allah's signs and disobeying messengers after guidance was made clear.",
    items:[
      {name:"Aad", context:"Hud", summary:"They rejected the signs of their Lord, disobeyed His messengers, and followed arrogant tyrants.",
        refs:["7:65-72","11:50-60","26:123-140","41:15-16","69:6-8"], chips:["Rejected signs","Disobeyed messengers","Arrogance"], tags:["rejected-signs","rejected-messengers","arrogance"]},
      {name:"Thamud", context:"Salih", summary:"They denied Salih, rejected the sign of the she-camel, and transgressed.",
        refs:["7:73-79","11:61-68","26:141-159","54:23-31","91:11-15"], chips:["Denied messenger","Rejected sign","Transgressed"], tags:["rejected-messengers","rejected-signs","transgression"]}
    ]},
  { title:"Corruption and Social Wrongdoing",
    desc:"The Quran mentions communities warned against corruption, cheating, and depriving people of their rights.",
    items:[
      {name:"People of Madyan", context:"Shuayb", summary:"They were warned not to decrease measure and scale, not to deprive people of their due, and not to spread corruption.",
        refs:["7:85-93","11:84-95","26:176-191","29:36-37"], chips:["Cheating in measure","Depriving people of rights","Corruption"], tags:["corruption"]},
      {name:"People of the Garden", context:"Surah Al-Qalam", summary:"They planned to harvest privately while withholding from the poor, then their garden was destroyed.",
        refs:["68:17-33"], chips:["Withholding from poor","Greed","Tested through loss"], tags:["corruption"]}
    ]},
  { title:"Oppression and Arrogance",
    desc:"The Quran shows punishment for oppressive power, arrogance, and denial of clear signs.",
    items:[
      {name:"Pharaoh and his people", context:"Musa", summary:"They were arrogant, denied the signs, oppressed the Children of Israel, killed sons, and kept women alive.",
        refs:["7:103-137","10:75-92","20:43-79","28:3-42","43:46-56"], chips:["Arrogance","Denied signs","Oppression","Killing sons"], tags:["arrogance","rejected-signs","oppression"]},
      {name:"Companions of the Elephant", context:"Army against the Sacred House", summary:"The Quran says Allah made their plot go astray.",
        refs:["105:1-5"], chips:["Plot against the Sacred House","Their plan was destroyed"], tags:["oppression"]}
    ]},
  { title:"Open Indecency and Transgression",
    desc:"The Quran mentions communities punished after open indecency and transgression.",
    items:[
      {name:"People of Lut", context:"Lut", summary:"They committed open indecency and approached men with desire instead of women.",
        refs:["7:80-84","11:77-83","26:160-175","27:54-58","29:28-35"], chips:["Open indecency","Sexual wrongdoing","Corruption"], tags:["transgression","corruption"]}
    ]},
  { title:"Ingratitude After Blessings",
    desc:"The Quran mentions people who were given blessings but turned away.",
    items:[
      {name:"People of Saba", context:"Saba", summary:"They turned away after blessings were given to them.",
        refs:["34:15-19"], chips:["Turned away","Ingratitude after blessings"], tags:["ingratitude"]}
    ]},
  { title:"Breaking Command After Warning",
    desc:"The Quran mentions groups punished after knowingly transgressing a command.",
    items:[
      {name:"People of the Sabbath", context:"A group from Children of Israel", summary:"They transgressed concerning the Sabbath after being tested.",
        refs:["2:65-66","4:154","7:163-166"], chips:["Sabbath transgression","Disobedience after warning"], tags:["transgression"]}
    ]}
];

/* ---- Structure metrics (base 6; Meccan/Medinan computed from AQ_SURAHS) ---- */
export interface Metric { n: string; ar: string; lbl: string; desc: string }
export const METRICS: Metric[] = [
  { n: "114", ar: "١١٤", lbl: "Surahs", desc: "Chapters of the Quran" },
  { n: "6,236", ar: "", lbl: "Ayahs", desc: "Verses across all surahs" },
  { n: "30", ar: "٣٠", lbl: "Juz", desc: "Traditional 30-part division" },
  { n: "60", ar: "٦٠", lbl: "Hizb", desc: "Each juz splits into two hizb" },
  { n: "240", ar: "", lbl: "Rubʿ al-Hizb", desc: "Quarter-hizb divisions" },
  { n: "15", ar: "١٥", lbl: "Sajdah Ayahs", desc: "Verses of prostration" },
];

/* ---- Structure hierarchy ---- */
export interface HierNode { nm: string; ar: string; ds: string; lvl: number }
export const HIER: HierNode[] = [
  { nm: "Quran", ar: "القرآن", ds: "The complete revealed text", lvl: 0 },
  { nm: "Surah", ar: "سورة", ds: "114 chapters", lvl: 1 },
  { nm: "Ayah", ar: "آية", ds: "6,236 verses", lvl: 2 },
  { nm: "Juz", ar: "جزء", ds: "30 equal parts for recitation", lvl: 1 },
  { nm: "Hizb", ar: "حزب", ds: "60 — two per juz", lvl: 2 },
  { nm: "Rubʿ al-Hizb", ar: "ربع الحزب", ds: "240 — four per hizb", lvl: 3 },
];

/* ---- External structural-metadata sources ---- */
export interface SourceItem { name: string; prov: string; url: string }
export const SOURCES: SourceItem[] = [
  { name: "Tanzil Quran Metadata", prov: "Surah names, ayah counts, and the core structural divisions of the Quran text.", url: "https://tanzil.net" },
  { name: "Tanzil Revelation Order", prov: "The traditional chronological order in which surahs were revealed.", url: "https://tanzil.net" },
  { name: "Quranic Arabic Corpus", prov: "Word-level Arabic data, morphology, and verse references for the Quran text.", url: "https://corpus.quran.com" },
  { name: "Quran Foundation / Quran.com", prov: "Verse, translation, and tafsir metadata used to display content with attribution.", url: "https://quran.com" },
];

/* ---- Quran-guided topics (each anchored to ayah references) ----
   Every topic is backed directly by Quran ayah references. Descriptions are
   neutral and source-backed: no scientific-miracle, hadith-only, speculative,
   or generated-ruling claims. `cat` groups topics into the categories below. */
export interface Topic { id: string; title: string; desc: string; refs: string[]; cat: string }

/** Topic categories, in display order. Labels are localised via facts.topicCat.<id>. */
export const TOPIC_CATEGORIES: { id: string; title: string }[] = [
  { id: "worship", title: "Worship" },
  { id: "family", title: "Family & Society" },
  { id: "wealth", title: "Wealth & Justice" },
  { id: "character", title: "Character" },
  { id: "prohibitions", title: "Prohibitions" },
  { id: "afterlife", title: "Afterlife & Accountability" },
];

export const TOPICS: Topic[] = [
  // ---- Worship ----
  { id: "prayer", cat: "worship", title: "Prayer / Salah", desc: "Quranic guidance on establishing prayer, its times, and steadfastness in it.", refs: ["2:238", "4:103", "17:78", "29:45"] },
  { id: "hajj", cat: "worship", title: "Hajj / Pilgrimage", desc: "Quranic guidance on pilgrimage to the Sacred House and its rites.", refs: ["3:96-97", "2:196-203", "22:27-29"] },
  { id: "fasting", cat: "worship", title: "Fasting", desc: "Quranic guidance on fasting, Ramadan, exemptions, and related rulings.", refs: ["2:183-187"] },
  { id: "repentance", cat: "worship", title: "Repentance", desc: "Quranic guidance on turning back to Allah and not despairing of His mercy.", refs: ["39:53-55", "25:70-71", "66:8"] },
  { id: "mercy", cat: "worship", title: "Mercy of Allah", desc: "Quran verses on the vastness of Allah's mercy, which He has prescribed for Himself.", refs: ["7:156", "6:54", "39:53"] },

  // ---- Family & Society ----
  { id: "marriage", cat: "family", title: "Marriage", desc: "Quranic guidance on marriage, mutual rights, and tranquility between spouses.", refs: ["4:19-21", "30:21", "24:32"] },
  { id: "marriageDegrees", cat: "family", title: "Forbidden marriage degrees", desc: "Quran verses naming the relatives a person may not marry.", refs: ["4:22-24"] },
  { id: "womensRights", cat: "family", title: "Women's rights", desc: "Quranic guidance on the rights of women in family and property.", refs: ["4:19", "4:32", "2:228"] },
  { id: "children", cat: "family", title: "Children and provision", desc: "Quranic guidance on caring for children and not killing them out of fear of poverty.", refs: ["17:31", "6:151"] },
  { id: "kinship", cat: "family", title: "Relatives / kinship", desc: "Quranic guidance on upholding ties of kinship and giving relatives their due.", refs: ["4:36", "16:90", "17:26"] },
  { id: "orphans", cat: "family", title: "Orphans and their property", desc: "Quranic guidance on protecting orphans and safeguarding their property.", refs: ["4:2-6", "4:10", "2:220"] },
  { id: "inheritance", cat: "family", title: "Inheritance", desc: "Quranic guidance on inheritance shares and family rights.", refs: ["4:7", "4:11", "4:12", "4:176"] },
  { id: "divorce", cat: "family", title: "Divorce", desc: "Quranic guidance on divorce, waiting periods, fairness, and family responsibility.", refs: ["2:226-232", "65:1-7"] },
  { id: "parents", cat: "family", title: "Parents", desc: "Quranic guidance on kindness, respect, gratitude, and boundaries with parents.", refs: ["17:23-24", "31:14-15"] },

  // ---- Wealth & Justice ----
  { id: "wealthRights", cat: "wealth", title: "Wealth and property rights", desc: "Quranic guidance against consuming others' wealth unjustly.", refs: ["2:188", "4:29"] },
  { id: "debt", cat: "wealth", title: "Debt and contracts", desc: "Quranic guidance on recording debts and honouring contracts.", refs: ["2:282-283"] },
  { id: "fairTrade", cat: "wealth", title: "Fair trade / weights and measures", desc: "Quranic guidance on honest weights, measures, and fair dealing.", refs: ["83:1-6", "11:84-85", "26:181-183"] },
  { id: "riba", cat: "wealth", title: "Riba / usury", desc: "Quran verses prohibiting riba (usury/interest).", refs: ["2:275-281", "3:130"] },
  { id: "theft", cat: "wealth", title: "Theft and robbery", desc: "Quran verses on theft, unlawful taking, and corruption in the land.", refs: ["5:38-39", "5:33-34"] },
  { id: "charity", cat: "wealth", title: "Charity & Zakat", desc: "Quranic guidance on giving, purification of wealth, helping the needy, and social responsibility.", refs: ["2:110", "2:261-274", "2:267", "2:271", "9:60", "9:103"] },
  { id: "justice", cat: "wealth", title: "Justice", desc: "Quranic guidance on standing firmly for justice, even against oneself or one's own group.", refs: ["4:58", "4:135", "5:8"] },

  // ---- Character ----
  { id: "moralConduct", cat: "character", title: "Moral conduct", desc: "Quranic guidance gathering core commands of upright conduct.", refs: ["17:23-39", "31:12-19"] },
  { id: "backbiting", cat: "character", title: "Backbiting, mockery, suspicion", desc: "Quran verses against mockery, backbiting, and suspicion.", refs: ["49:11-12"] },
  { id: "truthfulSpeech", cat: "character", title: "Truthful speech", desc: "Quranic guidance on being truthful and standing with the truthful.", refs: ["9:119", "33:70-71"] },
  { id: "patience", cat: "character", title: "Patience", desc: "Quranic guidance on patience and perseverance through trials.", refs: ["2:153-157", "3:200", "103:1-3"] },
  { id: "forgiveness", cat: "character", title: "Forgiveness and pardoning", desc: "Quranic guidance on pardoning others and restraining anger.", refs: ["3:134", "42:40", "24:22"] },
  { id: "gratitude", cat: "character", title: "Gratitude", desc: "Quranic guidance on gratitude to Allah for His blessings.", refs: ["14:7", "31:12", "2:152"] },
  { id: "tawakkul", cat: "character", title: "Tawakkul / reliance on Allah", desc: "Quranic guidance on placing trust and reliance in Allah.", refs: ["3:159", "65:3", "11:123"] },

  // ---- Prohibitions ----
  { id: "intoxicants", cat: "prohibitions", title: "Intoxicants and gambling", desc: "Quran verses on intoxicants and gambling.", refs: ["2:219", "5:90-91"] },
  { id: "sanctityOfLife", cat: "prohibitions", title: "Sanctity of life", desc: "Quran verses on the sanctity of human life.", refs: ["5:32", "6:151", "17:31-33", "25:68"] },
  { id: "zina", cat: "prohibitions", title: "Zina / unlawful relations", desc: "Quran verses prohibiting unlawful sexual relations.", refs: ["17:32", "24:2"] },
  { id: "oppression", cat: "prohibitions", title: "Oppression and wrongdoing", desc: "Quran verses warning against oppression and wrongdoing.", refs: ["14:42", "42:39-43", "11:18"] },

  // ---- Afterlife & Accountability ----
  { id: "hereafter", cat: "afterlife", title: "Hereafter and resurrection", desc: "Quran verses on resurrection and the life to come.", refs: ["75:1-15", "99:1-8", "22:5-7"] },
  { id: "dayOfJudgement", cat: "afterlife", title: "Day of Judgement", desc: "Quran verses on the Day of Judgement and accountability.", refs: ["1:4", "82:17-19", "99:6-8"] },
  { id: "paradise", cat: "afterlife", title: "Paradise", desc: "Quran verses describing Paradise and its people.", refs: ["3:133-136", "47:15", "56:10-40"] },
  { id: "hellfire", cat: "afterlife", title: "Hellfire", desc: "Quran verses warning of the Fire and its causes.", refs: ["4:56", "67:6-11", "74:26-31"] },
];

/** Count ayahs across refs, expanding "x-y" ranges (e.g. "2:183-187" = 5). */
export function refAyahCount(refs: string[]): number {
  return refs.reduce((t, r) => {
    const a = r.split(":")[1];
    if (a && a.includes("-")) { const [x, y] = a.split("-").map(Number); return t + (y - x + 1); }
    return t + 1;
  }, 0);
}

/* ---- Fruits, Trees and Plants mentioned in the Quran ----
   Generated from direct Arabic term matches in the local Tanzil Quran text.
   Only direct ayah references — no botanical/health/symbolic claims, no
   tafsir-based identification. Arabic terms are verbatim; the English name and
   note are localised (facts.plant.<id> / facts.plant.<id>N). */
export interface QuranPlantMention {
  id: string;
  name: string;
  arabicTerms: string[];
  group: "fruits" | "trees" | "plantFoods";
  refs: string[];
  note?: string;
}
export const QURAN_PLANTS: QuranPlantMention[] = [
  // Fruits
  { id: "dates", name: "Dates / date-palm fruit", group: "fruits", arabicTerms: ["نخل", "نخيل", "نخلة"], refs: ["2:266", "6:99", "6:141", "13:4", "16:11", "16:67", "17:91", "18:32", "19:23", "19:25", "23:19", "36:34", "50:10", "55:11", "55:68"], note: "Some references mention the date-palm tree, its fruit, or date-palms in gardens." },
  { id: "grapes", name: "Grapes", group: "fruits", arabicTerms: ["أعناب", "عنب"], refs: ["2:266", "6:99", "13:4", "16:11", "16:67", "17:91", "18:32", "23:19", "36:34"] },
  { id: "olives", name: "Olives", group: "fruits", arabicTerms: ["زيتون", "زيتونة"], refs: ["6:99", "6:141", "16:11", "24:35", "95:1"], note: "24:35 mentions a blessed olive tree in the parable of light." },
  { id: "pomegranate", name: "Pomegranate", group: "fruits", arabicTerms: ["رمان"], refs: ["6:99", "6:141", "55:68"] },
  { id: "fig", name: "Fig", group: "fruits", arabicTerms: ["تين"], refs: ["95:1"] },
  { id: "fruitGeneral", name: "General fruit / fruits", group: "fruits", arabicTerms: ["فاكهة", "فواكه"], refs: ["23:19", "36:57", "37:42", "38:51", "43:73", "44:55", "52:22", "55:11", "55:52", "55:68", "56:20", "56:32", "77:42", "80:31"], note: "These references use general fruit wording rather than a specific named fruit." },
  // Trees
  { id: "datePalmTree", name: "Date palm", group: "trees", arabicTerms: ["نخل", "نخيل", "نخلة"], refs: ["2:266", "6:99", "6:141", "13:4", "16:11", "16:67", "17:91", "18:32", "19:23", "19:25", "20:71", "23:19", "26:148", "36:34", "50:10", "54:20", "55:11", "55:68", "69:7"], note: "This overlaps with dates because the Quran mentions date-palms as trees and in fruit/garden contexts." },
  { id: "oliveTree", name: "Olive tree", group: "trees", arabicTerms: ["زيتونة", "زيتون"], refs: ["6:99", "6:141", "16:11", "24:35", "95:1"] },
  { id: "lote", name: "Lote tree / Sidr", group: "trees", arabicTerms: ["سدر", "سدرة"], refs: ["34:16", "53:14", "53:16", "56:28"] },
  { id: "talh", name: "Talh", group: "trees", arabicTerms: ["طلح"], refs: ["56:29"], note: "Translations differ; some render it as layered banana, others as acacia or a thornless lote-like tree. No single botanical identification is forced." },
  { id: "gourd", name: "Gourd / Yaqtin", group: "trees", arabicTerms: ["يقطين"], refs: ["37:146"] },
  { id: "tamarisk", name: "Tamarisk / Athl", group: "trees", arabicTerms: ["أثل"], refs: ["34:16"] },
  { id: "khamt", name: "Khamt", group: "trees", arabicTerms: ["خمط"], refs: ["34:16"], note: "Often translated as bitter fruit/tree. The label is kept cautious." },
  { id: "zaqqum", name: "Zaqqum tree", group: "trees", arabicTerms: ["زقوم"], refs: ["37:62", "44:43", "56:52"] },
  { id: "treeGeneric", name: "Generic tree / trees", group: "trees", arabicTerms: ["شجرة", "شجر"], refs: ["2:35", "7:19", "7:20", "7:22", "14:24", "14:26", "16:10", "16:68", "20:120", "24:35", "27:60", "28:30", "31:27", "36:80", "37:62", "37:64", "37:146", "48:18", "56:52"], note: "These references use general tree wording or specific Quranic tree contexts." },
  // Other Plant Foods
  { id: "cucumber", name: "Cucumber", group: "plantFoods", arabicTerms: ["قثاء"], refs: ["2:61"] },
  { id: "fum", name: "Fum", group: "plantFoods", arabicTerms: ["فوم"], refs: ["2:61"], note: "Translations differ; often rendered garlic, wheat, or grain. The label is kept cautious as “Fum”." },
  { id: "lentils", name: "Lentils", group: "plantFoods", arabicTerms: ["عدس"], refs: ["2:61"] },
  { id: "onions", name: "Onions", group: "plantFoods", arabicTerms: ["بصل"], refs: ["2:61"] },
  { id: "grain", name: "Grain / crops", group: "plantFoods", arabicTerms: ["حب", "زرع"], refs: ["6:99", "16:11", "18:32", "32:27", "36:33", "39:21", "50:9", "55:12", "78:15", "80:27"] },
  { id: "rayhan", name: "Rayhan / sweet plant", group: "plantFoods", arabicTerms: ["ريحان"], refs: ["55:12", "56:89"], note: "Often translated as basil, fragrant plant, or sweet-scented plant. The label is kept cautious." },
];
