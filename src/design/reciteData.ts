// Recite data ported from the AskQuran mobile design handoff (aq-recite-data.js).
// Complete short surahs with verbatim Uthmani Arabic + English & Urdu per ayah.
// Per-ayah recitation audio (Mishary Rashid Alafasy, 64kbps) from a public CDN.

export interface ReciteAyah { n: number; ar: string; en: string; ur: string }
export interface ReciteSurah { bismillah: boolean; ayahs: ReciteAyah[] }

export const RECITE: Record<number, ReciteSurah> = {
  "1": {
    "bismillah": false,
    "ayahs": [
      {
        "n": 1,
        "ar": "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        "en": "In the name of Allah, the Most Gracious, the Most Merciful.",
        "ur": "اللہ کے نام سے جو نہایت مہربان رحم والا ہے۔"
      },
      {
        "n": 2,
        "ar": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
        "en": "All praise is due to Allah, Lord of all the worlds.",
        "ur": "تمام تعریفیں اللہ کے لیے ہیں جو سارے جہانوں کا رب ہے۔"
      },
      {
        "n": 3,
        "ar": "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        "en": "The Most Gracious, the Most Merciful.",
        "ur": "نہایت مہربان، رحم والا۔"
      },
      {
        "n": 4,
        "ar": "مَٰلِكِ يَوْمِ ٱلدِّينِ",
        "en": "Master of the Day of Judgment.",
        "ur": "روزِ جزا کا مالک۔"
      },
      {
        "n": 5,
        "ar": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        "en": "You alone we worship, and You alone we ask for help.",
        "ur": "ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں۔"
      },
      {
        "n": 6,
        "ar": "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
        "en": "Guide us to the straight path.",
        "ur": "ہمیں سیدھا راستہ دکھا۔"
      },
      {
        "n": 7,
        "ar": "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
        "en": "The path of those You have blessed — not of those who earned Your anger, nor of those who went astray.",
        "ur": "اُن لوگوں کا راستہ جن پر تو نے انعام کیا، نہ اُن کا جن پر غضب ہوا اور نہ گمراہوں کا۔"
      }
    ]
  },
  "103": {
    "bismillah": true,
    "ayahs": [
      {
        "n": 1,
        "ar": "وَٱلْعَصْرِ",
        "en": "By time,",
        "ur": "زمانے کی قسم،"
      },
      {
        "n": 2,
        "ar": "إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ",
        "en": "indeed mankind is in loss,",
        "ur": "بے شک انسان خسارے میں ہے،"
      },
      {
        "n": 3,
        "ar": "إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ",
        "en": "except those who believe, do righteous deeds, and advise one another to truth and to patience.",
        "ur": "سوائے اُن لوگوں کے جو ایمان لائے اور نیک عمل کیے اور ایک دوسرے کو حق اور صبر کی تلقین کرتے رہے۔"
      }
    ]
  },
  "105": {
    "bismillah": true,
    "ayahs": [
      {
        "n": 1,
        "ar": "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَٰبِ ٱلْفِيلِ",
        "en": "Have you not considered how your Lord dealt with the companions of the elephant?",
        "ur": "کیا تم نے نہیں دیکھا کہ تمہارے رب نے ہاتھی والوں کے ساتھ کیا کیا؟"
      },
      {
        "n": 2,
        "ar": "أَلَمْ يَجْعَلْ كَيْدَهُمْ فِى تَضْلِيلٍ",
        "en": "Did He not make their plan go astray?",
        "ur": "کیا اُس نے اُن کی تدبیر کو اکارت نہیں کر دیا؟"
      },
      {
        "n": 3,
        "ar": "وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ",
        "en": "And He sent against them birds in flocks,",
        "ur": "اور اُن پر پرندوں کے جھنڈ بھیجے،"
      },
      {
        "n": 4,
        "ar": "تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ",
        "en": "striking them with stones of hard clay,",
        "ur": "جو اُن پر کنکر کے پتھر پھینک رہے تھے،"
      },
      {
        "n": 5,
        "ar": "فَجَعَلَهُمْ كَعَصْفٍ مَّأْكُولٍۭ",
        "en": "and He made them like eaten straw.",
        "ur": "پھر اُنہیں کھائے ہوئے بھوسے کی طرح کر دیا۔"
      }
    ]
  },
  "106": {
    "bismillah": true,
    "ayahs": [
      {
        "n": 1,
        "ar": "لِإِيلَٰفِ قُرَيْشٍ",
        "en": "For the accustomed security of the Quraysh —",
        "ur": "قریش کے مانوس کرنے کے سبب،"
      },
      {
        "n": 2,
        "ar": "إِۦلَٰفِهِمْ رِحْلَةَ ٱلشِّتَآءِ وَٱلصَّيْفِ",
        "en": "their accustomed security in the journey of winter and summer —",
        "ur": "اُن کو سردی اور گرمی کے سفر سے مانوس کرنے کے سبب،"
      },
      {
        "n": 3,
        "ar": "فَلْيَعْبُدُوا۟ رَبَّ هَٰذَا ٱلْبَيْتِ",
        "en": "let them worship the Lord of this House,",
        "ur": "پس اُنہیں اِس گھر کے رب کی عبادت کرنی چاہیے،"
      },
      {
        "n": 4,
        "ar": "ٱلَّذِىٓ أَطْعَمَهُم مِّن جُوعٍ وَءَامَنَهُم مِّنْ خَوْفٍۭ",
        "en": "who has fed them against hunger and made them safe from fear.",
        "ur": "جس نے اُنہیں بھوک میں کھانا دیا اور خوف سے امن بخشا۔"
      }
    ]
  },
  "107": {
    "bismillah": true,
    "ayahs": [
      {
        "n": 1,
        "ar": "أَرَءَيْتَ ٱلَّذِى يُكَذِّبُ بِٱلدِّينِ",
        "en": "Have you seen the one who denies the Recompense?",
        "ur": "کیا تم نے اُس شخص کو دیکھا جو جزا و سزا کو جھٹلاتا ہے؟"
      },
      {
        "n": 2,
        "ar": "فَذَٰلِكَ ٱلَّذِى يَدُعُّ ٱلْيَتِيمَ",
        "en": "That is the one who drives away the orphan,",
        "ur": "یہ وہی ہے جو یتیم کو دھکے دیتا ہے،"
      },
      {
        "n": 3,
        "ar": "وَلَا يَحُضُّ عَلَىٰ طَعَامِ ٱلْمِسْكِينِ",
        "en": "and does not encourage the feeding of the poor.",
        "ur": "اور مسکین کو کھانا کھلانے کی ترغیب نہیں دیتا۔"
      },
      {
        "n": 4,
        "ar": "فَوَيْلٌ لِّلْمُصَلِّينَ",
        "en": "So woe to those who pray,",
        "ur": "پس تباہی ہے اُن نمازیوں کے لیے،"
      },
      {
        "n": 5,
        "ar": "ٱلَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ",
        "en": "who are heedless of their prayer,",
        "ur": "جو اپنی نماز سے غافل ہیں،"
      },
      {
        "n": 6,
        "ar": "ٱلَّذِينَ هُمْ يُرَآءُونَ",
        "en": "those who make a show,",
        "ur": "جو دکھاوا کرتے ہیں،"
      },
      {
        "n": 7,
        "ar": "وَيَمْنَعُونَ ٱلْمَاعُونَ",
        "en": "and withhold simple assistance.",
        "ur": "اور معمولی ضرورت کی چیزیں دینے سے بھی انکار کرتے ہیں۔"
      }
    ]
  },
  "108": {
    "bismillah": true,
    "ayahs": [
      {
        "n": 1,
        "ar": "إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ",
        "en": "Indeed, We have granted you al-Kawthar.",
        "ur": "بے شک ہم نے تمہیں کوثر عطا کی۔"
      },
      {
        "n": 2,
        "ar": "فَصَلِّ لِرَبِّكَ وَٱنْحَرْ",
        "en": "So pray to your Lord and sacrifice.",
        "ur": "پس اپنے رب کے لیے نماز پڑھو اور قربانی کرو۔"
      },
      {
        "n": 3,
        "ar": "إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ",
        "en": "Indeed, your enemy is the one cut off.",
        "ur": "یقیناً تمہارا دشمن ہی بے نام و نشان ہے۔"
      }
    ]
  },
  "109": {
    "bismillah": true,
    "ayahs": [
      {
        "n": 1,
        "ar": "قُلْ يَٰٓأَيُّهَا ٱلْكَٰفِرُونَ",
        "en": "Say, “O disbelievers,",
        "ur": "کہو، اے کافرو،"
      },
      {
        "n": 2,
        "ar": "لَآ أَعْبُدُ مَا تَعْبُدُونَ",
        "en": "I do not worship what you worship,",
        "ur": "میں اُن کی عبادت نہیں کرتا جن کی تم عبادت کرتے ہو،"
      },
      {
        "n": 3,
        "ar": "وَلَآ أَنتُمْ عَٰبِدُونَ مَآ أَعْبُدُ",
        "en": "nor are you worshippers of what I worship.",
        "ur": "اور نہ تم اُس کی عبادت کرنے والے ہو جس کی میں عبادت کرتا ہوں۔"
      },
      {
        "n": 4,
        "ar": "وَلَآ أَنَا۠ عَابِدٌ مَّا عَبَدتُّمْ",
        "en": "Nor will I be a worshipper of what you worship,",
        "ur": "اور نہ میں اُن کی عبادت کرنے والا ہوں جن کی تم نے عبادت کی،"
      },
      {
        "n": 5,
        "ar": "وَلَآ أَنتُمْ عَٰبِدُونَ مَآ أَعْبُدُ",
        "en": "nor will you be worshippers of what I worship.",
        "ur": "اور نہ تم اُس کی عبادت کرنے والے ہو جس کی میں عبادت کرتا ہوں۔"
      },
      {
        "n": 6,
        "ar": "لَكُمْ دِينُكُمْ وَلِىَ دِينِ",
        "en": "For you is your religion, and for me is my religion.”",
        "ur": "تمہارے لیے تمہارا دین اور میرے لیے میرا دین۔"
      }
    ]
  },
  "110": {
    "bismillah": true,
    "ayahs": [
      {
        "n": 1,
        "ar": "إِذَا جَآءَ نَصْرُ ٱللَّهِ وَٱلْفَتْحُ",
        "en": "When the victory of Allah has come and the conquest,",
        "ur": "جب اللہ کی مدد اور فتح آ پہنچے،"
      },
      {
        "n": 2,
        "ar": "وَرَأَيْتَ ٱلنَّاسَ يَدْخُلُونَ فِى دِينِ ٱللَّهِ أَفْوَاجًا",
        "en": "and you see the people entering the religion of Allah in multitudes,",
        "ur": "اور تم لوگوں کو دیکھو کہ فوج در فوج اللہ کے دین میں داخل ہو رہے ہیں،"
      },
      {
        "n": 3,
        "ar": "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَٱسْتَغْفِرْهُ ۚ إِنَّهُۥ كَانَ تَوَّابًۢا",
        "en": "then exalt with praise of your Lord and ask His forgiveness. Indeed, He is ever Accepting of repentance.",
        "ur": "تو اپنے رب کی حمد کے ساتھ تسبیح کرو اور اُس سے مغفرت مانگو، بے شک وہ بہت توبہ قبول کرنے والا ہے۔"
      }
    ]
  },
  "111": {
    "bismillah": true,
    "ayahs": [
      {
        "n": 1,
        "ar": "تَبَّتْ يَدَآ أَبِى لَهَبٍ وَتَبَّ",
        "en": "May the hands of Abu Lahab be ruined, and ruined is he.",
        "ur": "ابو لہب کے دونوں ہاتھ ٹوٹ گئے اور وہ ہلاک ہو گیا۔"
      },
      {
        "n": 2,
        "ar": "مَآ أَغْنَىٰ عَنْهُ مَالُهُۥ وَمَا كَسَبَ",
        "en": "His wealth will not avail him, nor what he gained.",
        "ur": "اُس کا مال اور جو کچھ اُس نے کمایا، کام نہ آیا۔"
      },
      {
        "n": 3,
        "ar": "سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ",
        "en": "He will burn in a Fire of blazing flame,",
        "ur": "وہ عنقریب بھڑکتی ہوئی آگ میں جائے گا،"
      },
      {
        "n": 4,
        "ar": "وَٱمْرَأَتُهُۥ حَمَّالَةَ ٱلْحَطَبِ",
        "en": "and his wife, the carrier of firewood.",
        "ur": "اور اُس کی بیوی بھی، جو لکڑیاں ڈھونے والی ہے۔"
      },
      {
        "n": 5,
        "ar": "فِى جِيدِهَا حَبْلٌ مِّن مَّسَدٍۭ",
        "en": "Around her neck is a rope of palm fiber.",
        "ur": "اُس کے گلے میں مونج کی رسی ہوگی۔"
      }
    ]
  },
  "112": {
    "bismillah": true,
    "ayahs": [
      {
        "n": 1,
        "ar": "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
        "en": "Say, “He is Allah, the One,",
        "ur": "کہو، وہ اللہ ایک ہے،"
      },
      {
        "n": 2,
        "ar": "ٱللَّهُ ٱلصَّمَدُ",
        "en": "Allah, the Eternal Refuge.",
        "ur": "اللہ بے نیاز ہے۔"
      },
      {
        "n": 3,
        "ar": "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        "en": "He neither begets nor is born,",
        "ur": "نہ اُس کی کوئی اولاد ہے اور نہ وہ کسی کی اولاد،"
      },
      {
        "n": 4,
        "ar": "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
        "en": "nor is there to Him any equivalent.”",
        "ur": "اور کوئی اُس کا ہمسر نہیں۔"
      }
    ]
  },
  "113": {
    "bismillah": true,
    "ayahs": [
      {
        "n": 1,
        "ar": "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ",
        "en": "Say, “I seek refuge in the Lord of daybreak,",
        "ur": "کہو، میں پناہ مانگتا ہوں صبح کے رب کی،"
      },
      {
        "n": 2,
        "ar": "مِن شَرِّ مَا خَلَقَ",
        "en": "from the evil of that which He created,",
        "ur": "ہر اُس چیز کے شر سے جو اُس نے پیدا کی،"
      },
      {
        "n": 3,
        "ar": "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
        "en": "and from the evil of darkness when it settles,",
        "ur": "اور اندھیرے کے شر سے جب وہ چھا جائے،"
      },
      {
        "n": 4,
        "ar": "وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ",
        "en": "and from the evil of the blowers in knots,",
        "ur": "اور گرہوں میں پھونک مارنے والیوں کے شر سے،"
      },
      {
        "n": 5,
        "ar": "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
        "en": "and from the evil of an envier when he envies.”",
        "ur": "اور حاسد کے شر سے جب وہ حسد کرے۔"
      }
    ]
  },
  "114": {
    "bismillah": true,
    "ayahs": [
      {
        "n": 1,
        "ar": "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ",
        "en": "Say, “I seek refuge in the Lord of mankind,",
        "ur": "کہو، میں پناہ مانگتا ہوں لوگوں کے رب کی،"
      },
      {
        "n": 2,
        "ar": "مَلِكِ ٱلنَّاسِ",
        "en": "the Sovereign of mankind,",
        "ur": "لوگوں کے بادشاہ کی،"
      },
      {
        "n": 3,
        "ar": "إِلَٰهِ ٱلنَّاسِ",
        "en": "the God of mankind,",
        "ur": "لوگوں کے معبود کی،"
      },
      {
        "n": 4,
        "ar": "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ",
        "en": "from the evil of the retreating whisperer,",
        "ur": "وسوسہ ڈالنے والے، پیچھے ہٹ جانے والے کے شر سے،"
      },
      {
        "n": 5,
        "ar": "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ",
        "en": "who whispers in the breasts of mankind,",
        "ur": "جو لوگوں کے دلوں میں وسوسے ڈالتا ہے،"
      },
      {
        "n": 6,
        "ar": "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
        "en": "from among the jinn and mankind.”",
        "ur": "خواہ وہ جنوں میں سے ہو یا انسانوں میں سے۔"
      }
    ]
  }
};

/** Bismillah recited as a header before every surah except At-Tawbah (9). */
export const BISMILLAH = {
  ar: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
  en: "In the name of Allah, the Most Gracious, the Most Merciful.",
  ur: "اللہ کے نام سے جو نہایت مہربان رحم والا ہے۔",
};

export const AUDIO_BASE = "https://everyayah.com/data/Alafasy_64kbps/";

/** Per-ayah recitation MP3 URL. */
export function ayahAudioUrl(surah: number, ayah: number): string {
  const s = String(surah).padStart(3, "0");
  const a = String(ayah).padStart(3, "0");
  return AUDIO_BASE + s + a + ".mp3";
}

/** True when bundled recitation exists for this surah. */
export function hasRecitation(surah: number): boolean {
  return Object.prototype.hasOwnProperty.call(RECITE, surah);
}
