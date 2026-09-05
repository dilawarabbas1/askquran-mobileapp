// Content data ported verbatim from the AskQuran mobile design handoff (aq-data.js).
// Ayah text from Tanzil; translations and tafsir summaries carried from the
// AskQuran web build. Icon values are raw inner-SVG markup, rendered via SvgXml.

/* AskQuran Mobile — content data
   Ayah text from Tanzil; translations and tafsir summaries carried over from
   the AskQuran web build. */

export interface Neighbor { ref: string; ar: string; en: string; center?: boolean }
export interface AyahItem {
  surah: string; ref: string; arName: string; juz: number;
  place: "Mecca" | "Madinah"; relevance: string; topics: string[];
  arabic: string; transliteration?: string; ur: string; en: string; tafseer: string;
  surrounding: Neighbor[];
  sources: { arabic: string; translation: string; tafseer: string };
  audio?: { reciter: string; source: string; url: string };
}
export interface Topic { q: string; ar: string; ic: string }
export interface Language { name: string; native: string; code: string }
export interface Metric { n: string; ar: string; lbl: string; desc: string; ic: string }
export interface HierItem { nm: string; ar: string; ds: string; ic: string }
export interface FactTopic { id: string; title: string; ar: string; ic: string; desc: string; refs: string[] }
export interface Source { name: string; ic: string; prov: string; conf: string }

export const RESULTS: AyahItem[] = [
    { surah:"Surah Az-Zumar", ref:"39:53", arName:"الزُّمَر", juz:24, place:"Mecca", relevance:"1.81",
      topics:["forgiveness","mercy","repentance","sin","hope"],
      arabic:"قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ",
      ur:"(اے نبیؐ) کہہ دو کہ اے میرے بندو، جنہوں نے اپنی جانوں پر زیادتی کی ہے، اللہ کی رحمت سے مایوس نہ ہو، یقیناً اللہ سارے گناہ معاف کر دیتا ہے، وہ تو غفور و رحیم ہے۔",
      en:"Say, “O My servants who have transgressed against their own souls, do not despair of the mercy of Allah. Indeed, Allah forgives all sins. He is the All-Forgiving, the Most Merciful.”",
      tafseer:"An invitation of hope to those weighed down by sin: however far one has strayed, the door of divine mercy stays open to whoever turns back sincerely. Despair of God’s mercy is itself rebuked; repentance is always within reach.",
      surrounding:[
        { ref:"39:52", ar:"أَوَلَمْ يَعْلَمُوا أَنَّ اللَّهَ يَبْسُطُ الرِّزْقَ لِمَن يَشَاءُ وَيَقْدِرُ", en:"Do they not know that Allah extends provision to whom He wills, and restricts it?" },
        { ref:"39:53", center:true, ar:"قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ", en:"Say, “O My servants… do not despair of the mercy of Allah.”" },
        { ref:"39:54", ar:"وَأَنِيبُوا إِلَىٰ رَبِّكُمْ وَأَسْلِمُوا لَهُ مِن قَبْلِ أَن يَأْتِيَكُمُ الْعَذَابُ", en:"Turn to your Lord and submit to Him before the punishment comes upon you." }
      ],
      sources:{ arabic:"Tanzil", translation:"ابو الاعلیٰ مودودی", tafseer:"Ibn Kathir (English)" } },

    { surah:"Surah Al-Ma'ida", ref:"5:74", arName:"المَائِدَة", juz:6, place:"Madinah", relevance:"1.61",
      topics:["forgiveness","repentance","mercy"],
      arabic:"أَفَلَا يَتُوبُونَ إِلَى اللَّهِ وَيَسْتَغْفِرُونَهُ ۚ وَاللَّهُ غَفُورٌ رَّحِيمٌ",
      ur:"پھر کیا یہ اللہ سے توبہ نہ کریں گے اور اس سے معافی نہ مانگیں گے؟ اللہ بہت درگزر فرمانے والا اور رحم کرنے والا ہے۔",
      en:"Will they not turn to Allah in repentance and seek His forgiveness? For Allah is All-Forgiving, Most Merciful.",
      tafseer:"A gentle rebuke phrased as a question: the way back is simply to repent and ask. The verse closes by naming two of God’s attributes — forgiving and merciful — as reassurance that the appeal will be met.",
      surrounding:[
        { ref:"5:73", ar:"لَّقَدْ كَفَرَ الَّذِينَ قَالُوا إِنَّ اللَّهَ ثَالِثُ ثَلَاثَةٍ", en:"They have certainly disbelieved who say, “Allah is the third of three.”" },
        { ref:"5:74", center:true, ar:"أَفَلَا يَتُوبُونَ إِلَى اللَّهِ وَيَسْتَغْفِرُونَهُ ۚ وَاللَّهُ غَفُورٌ رَّحِيمٌ", en:"Will they not turn to Allah in repentance and seek His forgiveness?" },
        { ref:"5:75", ar:"مَّا الْمَسِيحُ ابْنُ مَرْيَمَ إِلَّا رَسُولٌ قَدْ خَلَتْ مِن قَبْلِهِ الرُّسُلُ", en:"The Messiah, son of Mary, was no more than a messenger; other messengers passed away before him." }
      ],
      sources:{ arabic:"Tanzil", translation:"ابو الاعلیٰ مودودی", tafseer:"Ibn Kathir (English)" } },

    { surah:"Surah Aal-e-Imran", ref:"3:135", arName:"آل عِمران", juz:4, place:"Madinah", relevance:"1.44",
      topics:["forgiveness","repentance","sin"],
      arabic:"وَالَّذِينَ إِذَا فَعَلُوا فَاحِشَةً أَوْ ظَلَمُوا أَنفُسَهُمْ ذَكَرُوا اللَّهَ فَاسْتَغْفَرُوا لِذُنُوبِهِمْ وَمَن يَغْفِرُ الذُّنُوبَ إِلَّا اللَّهُ",
      ur:"اور جن کا حال یہ ہے کہ اگر کبھی کوئی بے حیائی کا کام کر بیٹھتے ہیں یا اپنے نفس پر ظلم کر جاتے ہیں تو فوراً اللہ کو یاد کرتے ہیں اور اپنے گناہوں کی معافی چاہتے ہیں — اور گناہوں کو اللہ کے سوا کون معاف کر سکتا ہے؟",
      en:"And those who, when they commit an immorality or wrong themselves, remember Allah and seek forgiveness for their sins — and who can forgive sins except Allah?",
      tafseer:"Among the qualities of the righteous: when they slip, they do not persist heedlessly but turn at once to remembrance and seeking forgiveness. The rhetorical question affirms that forgiveness belongs to God alone.",
      surrounding:[
        { ref:"3:134", ar:"الَّذِينَ يُنفِقُونَ فِي السَّرَّاءِ وَالضَّرَّاءِ وَالْكَاظِمِينَ الْغَيْظَ", en:"Those who spend in ease and hardship and who restrain anger…" },
        { ref:"3:135", center:true, ar:"وَالَّذِينَ إِذَا فَعَلُوا فَاحِشَةً… ذَكَرُوا اللَّهَ فَاسْتَغْفَرُوا لِذُنُوبِهِمْ", en:"And those who, when they wrong themselves, remember Allah and seek forgiveness…" },
        { ref:"3:136", ar:"أُولَٰئِكَ جَزَاؤُهُم مَّغْفِرَةٌ مِّن رَّبِّهِمْ وَجَنَّاتٌ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ", en:"Their reward is forgiveness from their Lord and gardens beneath which rivers flow." }
      ],
      sources:{ arabic:"Tanzil", translation:"ابو الاعلیٰ مودودی", tafseer:"Ibn Kathir (English)" } },

    { surah:"Surah Al-Baqara", ref:"2:153", arName:"البَقَرَة", juz:2, place:"Madinah", relevance:"1.92",
      topics:["patience","prayer","hardship","perseverance"],
      arabic:"يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
      ur:"اے لوگو جو ایمان لائے ہو، صبر اور نماز سے مدد لو، یقیناً اللہ صبر کرنے والوں کے ساتھ ہے۔",
      en:"O you who believe, seek help through patience and prayer. Indeed, Allah is with the patient.",
      tafseer:"Two pillars are prescribed for facing trial: steadfast patience and turning to prayer. The promise that God is “with” the patient is one of nearness, support, and companionship through difficulty.",
      surrounding:[
        { ref:"2:152", ar:"فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ", en:"So remember Me; I will remember you. And be grateful to Me and do not deny Me." },
        { ref:"2:153", center:true, ar:"يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ", en:"O you who believe, seek help through patience and prayer." },
        { ref:"2:155", ar:"وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ ۗ وَبَشِّرِ الصَّابِرِينَ", en:"We will surely test you with something of fear and hunger… but give good tidings to the patient." }
      ],
      sources:{ arabic:"Tanzil", translation:"ابو الاعلیٰ مودودی", tafseer:"Ibn Kathir (English)" } },

    { surah:"Surah Az-Zumar", ref:"39:10", arName:"الزُّمَر", juz:23, place:"Mecca", relevance:"1.55",
      topics:["patience","reward","perseverance"],
      arabic:"إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ",
      ur:"جو صبر کرنے والے ہیں اُن کو تو بے حساب اجر دیا جائے گا۔",
      en:"Indeed, the patient will be given their reward without measure.",
      tafseer:"Where most deeds are recompensed in proportion, the reward for patience is described as “without measure” — beyond reckoning — signalling its exceptional weight in the sight of God.",
      surrounding:[
        { ref:"39:9", ar:"قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ", en:"Say, “Are those who know equal to those who do not know?”" },
        { ref:"39:10", center:true, ar:"إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ", en:"Indeed, the patient will be given their reward without measure." },
        { ref:"39:11", ar:"قُلْ إِنِّي أُمِرْتُ أَنْ أَعْبُدَ اللَّهَ مُخْلِصًا لَّهُ الدِّينَ", en:"Say, “I have been commanded to worship Allah, sincere to Him in religion.”" }
      ],
      sources:{ arabic:"Tanzil", translation:"ابو الاعلیٰ مودودی", tafseer:"Ibn Kathir (English)" } },

    { surah:"Surah Al-A'raf", ref:"7:156", arName:"الأَعراف", juz:9, place:"Mecca", relevance:"1.73",
      topics:["mercy","forgiveness","rahma"],
      arabic:"وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ ۚ فَسَأَكْتُبُهَا لِلَّذِينَ يَتَّقُونَ وَيُؤْتُونَ الزَّكَاةَ",
      ur:"اور میری رحمت ہر چیز پر چھائی ہوئی ہے، پس میں اسے اُن لوگوں کے لیے لکھ دوں گا جو تقویٰ اختیار کرتے ہیں اور زکوٰۃ دیتے ہیں۔",
      en:"My mercy encompasses all things. I shall ordain it for those who are mindful of Allah and give zakah.",
      tafseer:"A foundational declaration of the breadth of divine mercy — it embraces all of creation — followed by the means through which one is settled within it: God-consciousness and active charity.",
      surrounding:[
        { ref:"7:155", ar:"وَاخْتَارَ مُوسَىٰ قَوْمَهُ سَبْعِينَ رَجُلًا لِّمِيقَاتِنَا", en:"And Moses chose seventy men from his people for Our appointment." },
        { ref:"7:156", center:true, ar:"وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ", en:"My mercy encompasses all things." },
        { ref:"7:157", ar:"الَّذِينَ يَتَّبِعُونَ الرَّسُولَ النَّبِيَّ الْأُمِّيَّ", en:"Those who follow the Messenger, the unlettered Prophet…" }
      ],
      sources:{ arabic:"Tanzil", translation:"ابو الاعلیٰ مودودی", tafseer:"Ibn Kathir (English)" } },

    { surah:"Surah Al-Baqara", ref:"2:261", arName:"البَقَرَة", juz:3, place:"Madinah", relevance:"1.68",
      topics:["charity","spending","sadaqah","zakah"],
      arabic:"مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ فِي كُلِّ سُنبُلَةٍ مِّائَةُ حَبَّةٍ",
      ur:"جو لوگ اپنے مال اللہ کی راہ میں خرچ کرتے ہیں، اُن کے خرچ کی مثال ایسی ہے جیسے ایک دانہ بویا اور اُس سے سات بالیں نکلیں اور ہر بال میں سو دانے ہوں۔",
      en:"The example of those who spend their wealth in the way of Allah is like a seed that sprouts seven ears, in each ear a hundred grains.",
      tafseer:"Charity is portrayed as an investment that multiplies far beyond the sum given — a single seed yielding seven hundredfold — illustrating how generosity in God’s cause is returned in abundance.",
      surrounding:[
        { ref:"2:260", ar:"وَإِذْ قَالَ إِبْرَاهِيمُ رَبِّ أَرِنِي كَيْفَ تُحْيِي الْمَوْتَىٰ", en:"And when Abraham said, “My Lord, show me how You give life to the dead.”" },
        { ref:"2:261", center:true, ar:"مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ", en:"The example of those who spend their wealth in the way of Allah is like a seed…" },
        { ref:"2:262", ar:"الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ ثُمَّ لَا يُتْبِعُونَ مَا أَنفَقُوا مَنًّا", en:"Those who spend their wealth and do not follow it with reminders of generosity…" }
      ],
      sources:{ arabic:"Tanzil", translation:"ابو الاعلیٰ مودودی", tafseer:"Ibn Kathir (English)" } },

    { surah:"Surah Ibrahim", ref:"14:7", arName:"إِبراهِيم", juz:13, place:"Mecca", relevance:"1.70",
      topics:["gratitude","thankfulness","shukr","blessing"],
      arabic:"وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ",
      ur:"اور یاد رکھو، تمہارے رب نے خبردار کر دیا تھا کہ اگر شکر گزار بنو گے تو میں تمہیں اور زیادہ دوں گا، اور اگر ناشکری کرو گے تو میرا عذاب سخت ہے۔",
      en:"And remember when your Lord proclaimed, “If you are grateful, I will surely increase you; but if you are ungrateful, My punishment is severe.”",
      tafseer:"A divine principle is announced: gratitude is met with increase. Thankfulness is not merely a courtesy but a cause for further blessing, while ingratitude is set against a stern warning.",
      surrounding:[
        { ref:"14:6", ar:"وَإِذْ قَالَ مُوسَىٰ لِقَوْمِهِ اذْكُرُوا نِعْمَةَ اللَّهِ عَلَيْكُمْ", en:"And when Moses said to his people, “Remember the favour of Allah upon you.”" },
        { ref:"14:7", center:true, ar:"لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ", en:"If you are grateful, I will surely increase you; but if you are ungrateful, My punishment is severe." },
        { ref:"14:8", ar:"وَقَالَ مُوسَىٰ إِن تَكْفُرُوا أَنتُمْ وَمَن فِي الْأَرْضِ جَمِيعًا فَإِنَّ اللَّهَ لَغَنِيٌّ حَمِيدٌ", en:"And Moses said, “If you and all on earth disbelieve, indeed Allah is Free of need, Praiseworthy.”" }
      ],
      sources:{ arabic:"Tanzil", translation:"ابو الاعلیٰ مودودی", tafseer:"Ibn Kathir (English)" } },

    { surah:"Surah Ta-Ha", ref:"20:114", arName:"طه", juz:16, place:"Mecca", relevance:"1.64",
      topics:["knowledge","learning","ilm","dua"],
      arabic:"وَقُل رَّبِّ زِدْنِي عِلْمًا",
      ur:"اور دعا کرو کہ اے میرے رب، میرے علم میں اضافہ فرما۔",
      en:"And say, “My Lord, increase me in knowledge.”",
      tafseer:"A short, complete prayer the Prophet was taught to make — a model of seeking more understanding from God. It frames the pursuit of knowledge as a continual, humble request rather than a finished achievement.",
      surrounding:[
        { ref:"20:113", ar:"وَكَذَٰلِكَ أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا وَصَرَّفْنَا فِيهِ مِنَ الْوَعِيدِ", en:"And thus We have sent it down as an Arabic Quran and have diversified therein the warnings." },
        { ref:"20:114", center:true, ar:"وَقُل رَّبِّ زِدْنِي عِلْمًا", en:"And say, “My Lord, increase me in knowledge.”" },
        { ref:"20:115", ar:"وَلَقَدْ عَهِدْنَا إِلَىٰ آدَمَ مِن قَبْلُ فَنَسِيَ", en:"And We had already taken a covenant from Adam before, but he forgot." }
      ],
      sources:{ arabic:"Tanzil", translation:"ابو الاعلیٰ مودودی", tafseer:"Ibn Kathir (English)" } }
  ];

  // icon path sets (stroke icons, 24x24)
export const IC: Record<string, string> = {
    heart:'<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/>',
    shield:'<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/>',
    book:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v16h5.5A2.5 2.5 0 0 1 20 21.5z"/>',
    seedling:'<path d="M12 22V12"/><path d="M12 12C12 8 9 6 5 6c0 4 3 6 7 6z"/><path d="M12 12c0-3 2.5-5 6-5 0 3-2.5 5-6 5z"/>',
    sun:'<circle cx="12" cy="12" r="4.2"/><line x1="12" y1="2.5" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="21.5"/><line x1="2.5" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="21.5" y2="12"/><line x1="5.2" y1="5.2" x2="7" y2="7"/><line x1="17" y1="17" x2="18.8" y2="18.8"/><line x1="5.2" y1="18.8" x2="7" y2="17"/><line x1="17" y1="7" x2="18.8" y2="5.2"/>',
    lamp:'<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.5 1.1.5 1.6V16h6v-.5c0-.5 0-1.2.5-1.6A6 6 0 0 0 12 3z"/>',
    home:'<path d="M3 9l9-6 9 6"/><path d="M5 9v10h14V9"/><path d="M9 19v-5h6v5"/>',
    scale:'<path d="M12 3v18"/><path d="M5 7h14"/><path d="M7 7l-3 7a3 3 0 0 0 6 0z"/><path d="M17 7l-3 7a3 3 0 0 0 6 0z"/>',
    people:'<circle cx="8" cy="7" r="3"/><circle cx="17" cy="8" r="2.4"/><path d="M3 21v-2a5 5 0 0 1 10 0v2"/><path d="M14 21v-1.5a4 4 0 0 1 7 0V21"/>',
    moon:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  };

  // suggested search topics (chips)
export const TOPICS: Topic[] = [
    { q:"Forgiveness", ar:"المغفرة", ic:IC.heart },
    { q:"Patience",    ar:"الصبر",  ic:IC.shield },
    { q:"Mercy",       ar:"الرحمة", ic:IC.seedling },
    { q:"Charity",     ar:"الصدقة", ic:IC.seedling },
    { q:"Gratitude",   ar:"الشكر",  ic:IC.sun },
    { q:"Knowledge",   ar:"العلم",  ic:IC.lamp },
  ];

export const RECENT: string[] = ["Forgiveness", "Patience in hardship", "Mercy"];

  // 44 supported translation languages (native name + code)
export const LANGUAGES: Language[] = [
    { name:"Albanian", native:"Shqip", code:"sq" },
    { name:"Amazigh", native:"Tamaziɣt", code:"ber" },
    { name:"Amharic", native:"አማርኛ", code:"am" },
    { name:"Arabic", native:"العربية", code:"ar" },
    { name:"Azerbaijani", native:"Azərbaycan", code:"az" },
    { name:"Bengali", native:"বাংলা", code:"bn" },
    { name:"Bosnian", native:"Bosanski", code:"bs" },
    { name:"Bulgarian", native:"Български", code:"bg" },
    { name:"Chinese", native:"中文", code:"zh" },
    { name:"Czech", native:"Čeština", code:"cs" },
    { name:"Divehi", native:"ދިވެހި", code:"dv" },
    { name:"Dutch", native:"Nederlands", code:"nl" },
    { name:"English", native:"English", code:"en" },
    { name:"French", native:"Français", code:"fr" },
    { name:"German", native:"Deutsch", code:"de" },
    { name:"Hausa", native:"Hausa", code:"ha" },
    { name:"Hindi", native:"हिन्दी", code:"hi" },
    { name:"Indonesian", native:"Bahasa Indonesia", code:"id" },
    { name:"Italian", native:"Italiano", code:"it" },
    { name:"Japanese", native:"日本語", code:"ja" },
    { name:"Korean", native:"한국어", code:"ko" },
    { name:"Kurdish", native:"Kurdî", code:"ku" },
    { name:"Malay", native:"Bahasa Melayu", code:"ms" },
    { name:"Malayalam", native:"മലയാളം", code:"ml" },
    { name:"Norwegian", native:"Norsk", code:"no" },
    { name:"Pashto", native:"پښتو", code:"ps" },
    { name:"Persian", native:"فارسی", code:"fa" },
    { name:"Polish", native:"Polski", code:"pl" },
    { name:"Portuguese", native:"Português", code:"pt" },
    { name:"Romanian", native:"Română", code:"ro" },
    { name:"Russian", native:"Русский", code:"ru" },
    { name:"Sindhi", native:"سنڌي", code:"sd" },
    { name:"Somali", native:"Soomaali", code:"so" },
    { name:"Spanish", native:"Español", code:"es" },
    { name:"Swahili", native:"Kiswahili", code:"sw" },
    { name:"Swedish", native:"Svenska", code:"sv" },
    { name:"Tajik", native:"Тоҷикӣ", code:"tg" },
    { name:"Tamil", native:"தமிழ்", code:"ta" },
    { name:"Tatar", native:"Татарча", code:"tt" },
    { name:"Thai", native:"ไทย", code:"th" },
    { name:"Turkish", native:"Türkçe", code:"tr" },
    { name:"Urdu", native:"اردو", code:"ur" },
    { name:"Uyghur", native:"ئۇيغۇرچە", code:"ug" },
    { name:"Uzbek", native:"Oʻzbek", code:"uz" },
  ];

export const VOD = {
    ref:"2:286", surah:"Surah Al-Baqara", arName:"البَقَرَة",
    arabic:"لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    en:"Allah does not burden a soul beyond that it can bear.",
    ur:"اللہ کسی متنفس پر اُس کی طاقت سے بڑھ کر ذمہ داری کا بوجھ نہیں ڈالتا۔"
  };

  // ---- Quran Facts ----
export const METRICS: Metric[] = [
    { n:"114", ar:"١١٤", lbl:"Surahs", desc:"Chapters of the Quran", ic:IC.book },
    { n:"6,236", ar:"", lbl:"Ayahs", desc:"Verses across all surahs", ic:'<line x1="8" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="8" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.4" fill="currentColor"/><circle cx="4" cy="12" r="1.4" fill="currentColor"/><circle cx="4" cy="18" r="1.4" fill="currentColor"/>' },
    { n:"30", ar:"٣٠", lbl:"Juz", desc:"Traditional 30-part division", ic:'<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="9" y1="4" x2="9" y2="20"/><line x1="15" y1="4" x2="15" y2="20"/>' },
    { n:"60", ar:"٦٠", lbl:"Hizb", desc:"Two per juz", ic:'<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="3" y1="12" x2="21" y2="12"/>' },
    { n:"86", ar:"", lbl:"Meccan Surahs", desc:"Revealed in the Meccan period", ic:'<path d="M3 21h18"/><path d="M5 21V10l7-5 7 5v11"/><path d="M9 21v-5a3 3 0 0 1 6 0v5"/>' },
    { n:"28", ar:"", lbl:"Medinan Surahs", desc:"Revealed in the Medinan period", ic:'<path d="M3 21h18"/><path d="M6 21V8l6-4 6 4v13"/><path d="M12 4V2"/><path d="M9 12h6M9 16h6"/>' },
  ];

export const HIER: HierItem[] = [
    { nm:"Quran", ar:"القرآن", ds:"The complete text", ic:IC.book },
    { nm:"Juz", ar:"جزء", ds:"30 parts", ic:'<rect x="4" y="5" width="16" height="14" rx="2"/><line x1="12" y1="5" x2="12" y2="19"/>' },
    { nm:"Surah", ar:"سورة", ds:"114 chapters", ic:'<path d="M5 4h11l3 3v13H5z"/><path d="M9 9h6M9 13h6"/>' },
    { nm:"Ayah", ar:"آية", ds:"6,236 verses", ic:'<line x1="6" y1="7" x2="18" y2="7"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="6" y1="17" x2="13" y2="17"/>' },
  ];

export const FACT_TOPICS: FactTopic[] = [
    { id:"inheritance", title:"Inheritance", ar:"الميراث", ic:IC.home, desc:"Quranic guidance on inheritance shares and family rights.", refs:["4:7","4:11","4:12","4:176"] },
    { id:"fasting", title:"Fasting", ar:"الصيام", ic:IC.moon, desc:"Guidance on fasting, Ramadan, exemptions, and related rulings.", refs:["2:183-187"] },
    { id:"divorce", title:"Divorce", ar:"الطلاق", ic:IC.people, desc:"Waiting periods, fairness, and family responsibility.", refs:["2:226-232","65:1-7"] },
    { id:"parents", title:"Parents", ar:"الوالدين", ic:IC.people, desc:"Kindness, respect, gratitude, and boundaries with parents.", refs:["17:23-24","31:14-15"] },
    { id:"justice", title:"Justice", ar:"العدل", ic:IC.scale, desc:"Standing firmly for justice, even against oneself.", refs:["4:135","5:8"] },
    { id:"charity", title:"Charity & Zakat", ar:"الزكاة", ic:IC.heart, desc:"Giving, purification of wealth, and social responsibility.", refs:["2:110","2:267","2:271","9:60"] },
  ];

  // sajdah ayahs (surah:ayah)
export const SAJDAH: string[] = ["7:206","13:15","16:50","17:109","19:58","22:18","22:77","25:60","27:26","32:15","38:24","41:38","53:62","84:21","96:19"];
export const SAJDAH_SURAH: Record<number, string> = { 7:"Al-A'raf", 13:"Ar-Ra'd", 16:"An-Nahl", 17:"Al-Isra", 19:"Maryam", 22:"Al-Hajj", 25:"Al-Furqan", 27:"An-Naml", 32:"As-Sajdah", 38:"Sad", 41:"Fussilat", 53:"An-Najm", 84:"Al-Inshiqaq", 96:"Al-Alaq" };

export const SOURCES: Source[] = [
    { name:"Quran Text", ic:IC.book, prov:"The verbatim Arabic Uthmani text, shown unchanged for every result.", conf:"Primary source" },
    { name:"Translations", ic:IC.book, prov:"Verified translations across 44 languages, presented unaltered.", conf:"Verified" },
    { name:"Tafsir & Commentary", ic:IC.lamp, prov:"Classical commentary, shown as-is with no edits or additions.", conf:"Unaltered" },
  ];

// 114-surah structural metadata: [number, arabicName, name, ayahCount, place, revelationOrder]
export const SURAHS: [number, string, string, number, "Meccan" | "Medinan", number][] = [
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
