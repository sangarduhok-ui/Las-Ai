// ── Types ───────────────────────────────────────────────────────────────────

export interface DailyQuizQuestion {
  id: string;
  question: string;
  category: "Grammar" | "Vocabulary" | "Idiom" | "Common Mistake" | "Conversation" | "Academic";
  difficulty: "سەرەتایی" | "ناڤین" | "پێشکەفتی";
  options: string[];
  correctIndex: number;
  explanationBadini: string;
  englishRule?: string;
  isAiGenerated?: boolean;
}

export interface DailyVocabulary {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  kurdishBadini: string;
  englishDefinition: string;
  examples: Array<{
    en: string;
    ku: string;
  }>;
  synonyms: string[];
  antonyms: string[];
  usageTipBadini: string;
}

export interface DialogueLine {
  speaker: string;
  avatarColor: string;
  textEn: string;
  textKu: string;
}

export interface DailyDialogue {
  titleEn: string;
  titleKu: string;
  scenarioBadini: string;
  lines: DialogueLine[];
  goldenPhrases: Array<{
    phrase: string;
    meaningKu: string;
    usageNote: string;
  }>;
}

export interface CommonMistakeItem {
  wrong: string;
  right: string;
  explanationBadini: string;
}

export interface DailyGrammar {
  titleEn: string;
  titleKu: string;
  ruleSummaryBadini: string;
  formula: string;
  examples: Array<{ en: string; ku: string }>;
  mistakes: CommonMistakeItem[];
  quickTipBadini: string;
}

export interface DayLesson {
  dayId: number; // 0: Sunday, 1: Monday, ..., 6: Saturday
  dayNameKu: string;
  dayNameEn: string;
  themeTitleKu: string;
  themeTitleEn: string;
  vocabulary: DailyVocabulary;
  quiz: DailyQuizQuestion[];
  dialogue: DailyDialogue;
  grammar: DailyGrammar;
}

// ── 7-Day Complete Curriculum Data (Badini + English) ────────────────────────

export const WEEKLY_ENGLISH_CURRICULUM: DayLesson[] = [
  // 0: Sunday / ئێکشەمب
  {
    dayId: 0,
    dayNameKu: "ئێکشەمب",
    dayNameEn: "Sunday",
    themeTitleKu: "دەستپێکرنا حەفتیێ و پەیڤێن سەرکەفتنێ",
    themeTitleEn: "Kickstarting the Week & Achievement",
    vocabulary: {
      word: "Perseverance",
      phonetic: "/ˌpɜː.sɪˈvɪə.rəns/",
      partOfSpeech: "Noun (ناڤ)",
      kurdishBadini: "بەردەوامی و خڕابوونا ل سەر ئارمانجێ (کۆڵنەدان)",
      englishDefinition: "Continued effort to do or achieve something despite difficulties, failure, or opposition.",
      examples: [
        {
          en: "Through hard work and perseverance, she mastered English in two years.",
          ku: "ب ڕێکا کارێ گران و بەردەوامیێ، وێ د دوو ساڵان دا فێری ئینگلیزی بوو.",
        },
        {
          en: "Perseverance is essential when facing academic challenges.",
          ku: "بەردەوامی تشتەکێ سەرەکییە دەمێ تو تووشی ئاستەنگێن خواندنێ دبیت.",
        },
      ],
      synonyms: ["Persistence", "Determination", "Tenacity"],
      antonyms: ["Giving up", "Hesitation", "Apathy"],
      usageTipBadini: "ئەڤ پەیڤە زۆر د وتارێن ئەکادیمی و گۆتاربێژیێ دا بکاردێت بۆ نیشاندانا کۆڵنەدانێ.",
    },
    quiz: [
      {
        id: "sun-q1",
        question: "Choose the correct sentence:",
        category: "Common Mistake",
        difficulty: "سەرەتایی",
        options: [
          "I am agree with your opinion.",
          "I agree with your opinion.",
          "I am agreeing with you always.",
          "I agree to your person.",
        ],
        correctIndex: 1,
        explanationBadini:
          "د زمانێ ئینگلیزی دا 'Agree' بخۆ کردارە (Verb) نەکو سیفەت، ژبەر هندێ نابیت بێژی 'I am agree'. شێوازێ دروست 'I agree with...' یە.",
        englishRule: "Never use 'am/is/are' directly before 'agree' in present simple.",
      },
      {
        id: "sun-q2",
        question: "Complete the idiom: 'Actions speak louder than ______.'",
        category: "Idiom",
        difficulty: "ناڤین",
        options: ["Speeches", "Words", "Thoughts", "Promises"],
        correctIndex: 1,
        explanationBadini:
          "پەندێ ئینگلیزی دبێژیت: 'Actions speak louder than words'؛ واتە: کریار ژ گۆتنان دەنگڤەدێرترن (تشتێ تو دکەی گرنگترە ژ تشتێ تو دبێژی).",
      },
      {
        id: "sun-q3",
        question: "Which phrasal verb means 'to cancel an event'?",
        category: "Vocabulary",
        difficulty: "ناڤین",
        options: ["Call off", "Call on", "Call out", "Call back"],
        correctIndex: 0,
        explanationBadini:
          "دەستەواژەیا 'Call off' واتە هەڵوەشاندنەوە یان پاشخستنا ئاهەنگ یان کۆبوونەوەیەکێ. نموونە: The match was called off.",
      },
      {
        id: "sun-q4",
        question: "Select the sentence with correct Present Perfect usage:",
        category: "Grammar",
        difficulty: "پێشکەفتی",
        options: [
          "I have seen him yesterday.",
          "I saw him yesterday.",
          "I have saw him yesterday.",
          "I had seen him yesterday already.",
        ],
        correctIndex: 1,
        explanationBadini:
          "دەمێ دەمێ دەستنیشانکری هەبیت (وەکی yesterday, last week, in 2020)، دەمێ ڕابردوویێ سادە (Past Simple - saw) بکاردێت نەکو Present Perfect.",
      },
    ],
    dialogue: {
      titleEn: "Setting Weekly Study Goals",
      titleKu: "دانانا ئارمانجێن خواندنێ یێن حەفتیانە",
      scenarioBadini: "گفتوگۆیا دوو هەڤالان دەربارەی پلان و فێربوونا زمانی ڕۆژانە",
      lines: [
        {
          speaker: "Sipan",
          avatarColor: "bg-blue-500",
          textEn: "Hey Alan! Are you ready to level up your English skills this week?",
          textKu: "سلاڤ ئالان! ئەرێ تو یێ بەرهەڤی ئاستێ ئینگلیزیێ تە ئەڤ حەفتیە بلندتر لێ بهێت؟",
        },
        {
          speaker: "Alan",
          avatarColor: "bg-emerald-500",
          textEn: "Absolutely! I have decided to practice 20 minutes every single day.",
          textKu: "ب تەمامی! من بڕیار دا ڕۆژانە 20 خولەکان ڕاهێنانێ بکەم.",
        },
        {
          speaker: "Sipan",
          avatarColor: "bg-blue-500",
          textEn: "Consistency is key. Don't worry about making mistakes; that's how we learn.",
          textKu: "بەردەوامی مەرجێ سەرەکییە. خەما شاشیا نەخۆ؛ ئەم ب وی شێوەی فێر دبین.",
        },
        {
          speaker: "Alan",
          avatarColor: "bg-emerald-500",
          textEn: "Thanks for the encouragement. Let's do this together!",
          textKu: "سوپاس بۆ هاندانێ. وەرە با پێکڤە ئەڤێ بکەین!",
        },
      ],
      goldenPhrases: [
        {
          phrase: "Level up",
          meaningKu: "ئاستێ خۆ بلندترکرن و پێشڤەبرن",
          usageNote: "د ژیانا ڕۆژانە و تەکنۆلۆژیادا زۆر بکاردێت بۆ باشتربوونێ.",
        },
        {
          phrase: "Consistency is key",
          meaningKu: "بەردەوامی کلیل و بنیاتێ سەرکەفتنێ یە",
          usageNote: "ڕستەیەکا هاندەرە بۆ فێربوونا هەر کارەکێ نوو.",
        },
      ],
    },
    grammar: {
      titleEn: "Present Simple vs Present Continuous",
      titleKu: "دەمی بەردەستێ سادە بەرامبەر بەردەوامی بەردەست",
      ruleSummaryBadini:
        "Present Simple بۆ نەریتێن ڕۆژانە و ڕاستیێن گشتی یە (I learn English daily). لێ Present Continuous بۆ وی کاری یە کۆ نوکە د ئەڤی خولەکی دا ڕووددەت (I am learning right now).",
      formula: "Simple: Subject + Verb(s)  |  Continuous: Subject + am/is/are + Verb-ing",
      examples: [
        { en: "She drinks coffee every morning.", ku: "ئەو هەر سپێدە قەهویێ ڤەدخۆت (نەریت)." },
        { en: "She is drinking coffee right now.", ku: "ئەو نوکە یا قەهویێ ڤەدخۆت (د ئەڤی دەمی دا)." },
      ],
      mistakes: [
        {
          wrong: "I am living in Duhok since 5 years.",
          right: "I have lived in Duhok for 5 years.",
          explanationBadini: "بۆ کاریگەریا دەمی و ڕابردووی تا نوکە، دەمێ Present Perfect بکاردێت نەکو Continuous.",
        },
        {
          wrong: "Look! It rains outside.",
          right: "Look! It is raining outside.",
          explanationBadini: "ژبەر کۆ پەیڤا 'Look!' هەیە، ڕوودان نوکە ڕووددەت و پێویستی ب continuous هەیە.",
        },
      ],
      quickTipBadini: "کردارێن هەست و بیرکردنەوە وەکی (Know, Believe, Love, Want) گەلەک کێم دبنە Continuous.",
    },
  },

  // 1: Monday / دووشەمب
  {
    dayId: 1,
    dayNameKu: "دووشەمب",
    dayNameEn: "Monday",
    themeTitleKu: "ژیانا ڕۆژانە و دەستەواژەیێن بازاڕیکردنێ",
    themeTitleEn: "Everyday Situations & Shopping",
    vocabulary: {
      word: "Affordable",
      phonetic: "/əˈfɔː.də.bəl/",
      partOfSpeech: "Adjective (سیفەت)",
      kurdishBadini: "گونجای ژ لایێ بهایی ڤە (نە گرانە)",
      englishDefinition: "Reasonably priced; inexpensive and within one's financial means.",
      examples: [
        {
          en: "This local restaurant provides high quality food at affordable prices.",
          ku: "ئەڤ خوارنگەها ناڤخۆیی خوارنەکا ب کواڵیتی ب بهایەکێ گونجای پێشکێش دکەت.",
        },
        {
          en: "Finding affordable housing is a common challenge for university students.",
          ku: "پەیداکرنا خانیەکێ ب بهایەکێ گونجای ئاستەنگەکا بەربەلاڤە بۆ قوتابیێن زانکۆیێ.",
        },
      ],
      synonyms: ["Inexpensive", "Reasonably priced", "Economical"],
      antonyms: ["Exorbitant", "Overpriced", "Costly"],
      usageTipBadini: "د بازاڕ و کڕین و فرۆتنێ دا دەمێ تو دبیژی 'Affordable' واتە بهایێ وێ د دەستێ تە دایە و یێ گران نینە.",
    },
    quiz: [
      {
        id: "mon-q1",
        question: "What is the correct way to ask the price of multiple shirts in a store?",
        category: "Conversation",
        difficulty: "سەرەتایی",
        options: [
          "How much are these shirts?",
          "How much is these shirts?",
          "How many cost these shirts?",
          "How much price of shirts?",
        ],
        correctIndex: 0,
        explanationBadini:
          "ژبەر کۆ 'shirts' کۆیە (Plural)، کرداری یارمەتیدەر 'are' بکاردێت: 'How much are these shirts?'. ئەگەر تەنها ئێک جلک با، دگۆتین 'How much is this shirt?'.",
      },
      {
        id: "mon-q2",
        question: "Choose the correct preposition: 'She is married _____ an engineer.'",
        category: "Common Mistake",
        difficulty: "ناڤین",
        options: ["With", "To", "At", "By"],
        correctIndex: 1,
        explanationBadini:
          "د زمانی ئینگلیزی دا دگەل 'Married' حەرفا جەری 'to' بکاردێت نەکو 'with'. نموونە: She is married to him (نەکو with him).",
      },
      {
        id: "mon-q3",
        question: "What does the idiom 'To hit the nail on the head' mean?",
        category: "Idiom",
        difficulty: "ناڤین",
        options: [
          "To damage something with a hammer",
          "To describe exactly what is causing a situation",
          "To give up early in an argument",
          "To make a sudden loud noise",
        ],
        correctIndex: 1,
        explanationBadini:
          "ئەڤ پەندە بۆ هندێ دهێتە گۆتن دەمێ کەسەک ڕێک و دروست پێکێنیتە سەر خالێ و شیکاریا دروست بدەت (ب کوردی: ڕێک دەست ل سەر برینێ دانا یان پێکئینا ناڤ چاڤا).",
      },
      {
        id: "mon-q4",
        question: "If I _____ harder, I would have passed the IELTS exam.",
        category: "Grammar",
        difficulty: "پێشکەفتی",
        options: ["studied", "had studied", "study", "have studied"],
        correctIndex: 1,
        explanationBadini:
          "ئەڤە Third Conditional (مەرجێ سێیەم)ە بۆ پەشیمانبوونێ ژ ڕابردووی: If + Past Perfect (had studied) -> would have + Past Participle (passed).",
      },
    ],
    dialogue: {
      titleEn: "At a Clothing Store in London",
      titleKu: "ل فرۆشگەها جلان ل لەندەن",
      scenarioBadini: "کڕیارەک پسیارا قەبارە و بهایێ چاکێتەکێ دکەت",
      lines: [
        {
          speaker: "Customer",
          avatarColor: "bg-purple-500",
          textEn: "Excuse me, do you have this black jacket in medium size?",
          textKu: "بێ زەحمەت، ئەرێ ئەڤ چاکێتێ ڕەش ب قەبارەیێ ناڤین (Medium) ل دەف تە هەیە؟",
        },
        {
          speaker: "Clerk",
          avatarColor: "bg-amber-500",
          textEn: "Let me check our stock... Yes, here you go! Would you like to try it on?",
          textKu: "با سەیری کۆگایێ بکەم... بەڵێ فەرموو ئەڤە ل ڤێرەیە! حەز دکەی تاقی بکەی؟",
        },
        {
          speaker: "Customer",
          avatarColor: "bg-purple-500",
          textEn: "Where is the fitting room, please?",
          textKu: "ژ کەرەما خۆ ژوورا تاقیکرنا جلان ل کیڤەیە؟",
        },
        {
          speaker: "Clerk",
          avatarColor: "bg-amber-500",
          textEn: "It is right over there on your left next to the mirror.",
          textKu: "ئەوا ل دەستێ تە یێ چەپێ ل تەنیشت نەینۆکێ یە.",
        },
      ],
      goldenPhrases: [
        {
          phrase: "Try it on",
          meaningKu: "تاقیکرنا جلان بۆ دیتنا قەبارەیی",
          usageNote: "د فرۆشگەهان دا دەمێ دخوازی جلکەکی لەبەر بکەی دبیژی: Can I try it on?",
        },
        {
          phrase: "Fitting room",
          meaningKu: "ژوورا تاقیکرن و گۆڕینا جلان د دوکانێ دا",
          usageNote: "هەروەسا ب (Dressing room) ژی دهێتە نیاسین.",
        },
      ],
    },
    grammar: {
      titleEn: "Prepositions of Place: In, On, At",
      titleKu: "حەرفێن جەری یێن جهی (In, On, At)",
      ruleSummaryBadini:
        "AT بۆ جهێن دیاریکری و خاڵانە (at the station, at home). ON بۆ سەر ڕوو و جاددە و نهۆمانە (on the table, on the 2nd floor). IN بۆ ناڤبەرا جهێن گرتری، باژێر و دەوڵەتانە (in Duhok, in Kurdistan, in the room).",
      formula: "At (Specific Point) -> On (Surface / Street) -> In (Enclosed Space / City / Country)",
      examples: [
        { en: "I am meeting him at the cafe on Main Street.", ku: "ئەز دێ وی ل کافێیا سەر جاددەیا سەرەکی بینم." },
        { en: "He lives in Zakho on the third floor.", ku: "ئەو ل زاخۆ ل نهۆما سێیەم دژیت." },
      ],
      mistakes: [
        {
          wrong: "I will meet you in the bus stop.",
          right: "I will meet you at the bus stop.",
          explanationBadini: "ژبەر کۆ 'bus stop' خاڵەکا دیاریکری یە (Point)، حەرفا 'at' دروستە.",
        },
        {
          wrong: "He is in the phone right now.",
          right: "He is on the phone right now.",
          explanationBadini: "بۆ ئامێرێن پەیوەندی و مۆبایلێ، دەستەواژەیا 'on the phone' بکاردێت.",
        },
      ],
      quickTipBadini: "بۆ هۆکارێن گواستنەوە: دەمێ تو بشێی تێدا ڕاوەستی (On the bus, On the train, On the plane). دەمێ تەنگ بیت (In the car, In the taxi).",
    },
  },

  // 2: Tuesday / سێشەمب
  {
    dayId: 2,
    dayNameKu: "سێشەمب",
    dayNameEn: "Tuesday",
    themeTitleKu: "پەیوەندیێن کار و چاوپێکەوتن (Job Interview)",
    themeTitleEn: "Business English & Job Interviews",
    vocabulary: {
      word: "Meticulous",
      phonetic: "/məˈtɪk.jə.ləs/",
      partOfSpeech: "Adjective (سیفەت)",
      kurdishBadini: "وردبین و سەرنجدەر ل سەر وردەکارییان (دروستکار)",
      englishDefinition: "Showing great attention to detail; very careful and precise.",
      examples: [
        {
          en: "He is a meticulous researcher who never overlooks any factual error.",
          ku: "ئەو ڤەکۆلەرەکێ گەلەک وردبینە کۆ چ جاران چ خەلەتیەکا زانیاری پشتگوێ ناهاڤێژیت.",
        },
        {
          en: "Her meticulous planning ensured the university conference succeeded.",
          ku: "پلانڕێژیا وێ یا ورد بوو ئەگەرێ سەرکەفتنا کۆنفرانسا زانکۆیێ.",
        },
      ],
      synonyms: ["Thorough", "Diligent", "Scrupulous", "Precise"],
      antonyms: ["Careless", "Sloppy", "Negligent"],
      usageTipBadini: "د CV و چاوپێکەوتنا کار دا سیفەتەکێ زۆر بەهێزە دەمێ بێژی: 'I have a meticulous approach to work'.",
    },
    quiz: [
      {
        id: "tue-q1",
        question: "Which phrase is most formal for starting a business email to an unknown recipient?",
        category: "Academic",
        difficulty: "ناڤین",
        options: ["Hey guys,", "Dear Sir/Madam,", "What's up,", "Hello there,"],
        correctIndex: 1,
        explanationBadini:
          "د ئیمەیڵێن فەرمی دا دەمێ ناڤێ وەرگری نەزانی، 'Dear Sir/Madam,' یان 'To Whom It May Concern,' بەکاردێت.",
      },
      {
        id: "tue-q2",
        question: "Choose the correct preposition: 'I look forward to _____ from you soon.'",
        category: "Common Mistake",
        difficulty: "ناڤین",
        options: ["hear", "hearing", "heard", "be heard"],
        correctIndex: 1,
        explanationBadini:
          "د دەستەواژەیا 'Look forward to' دا، پەیڤا 'to' حەرفا جەڕە و دەبێت دوای ئەو 'Gerund (Verb-ing)' بێت: 'Look forward to hearing'.",
      },
      {
        id: "tue-q3",
        question: "Which modal verb expresses strong obligation from the speaker?",
        category: "Grammar",
        difficulty: "سەرەتایی",
        options: ["Might", "Could", "Must", "May"],
        correctIndex: 2,
        explanationBadini:
          "کردارا 'Must' نیشاندەرا پێویستی و نەچاریەکا زۆر بەهێزە (Strong Obligation)، نموونە: You must wear a seatbelt.",
      },
      {
        id: "tue-q4",
        question: "What does 'To touch base' mean in a business context?",
        category: "Idiom",
        difficulty: "پێشکەفتی",
        options: [
          "To briefly contact someone for an update",
          "To play a game of baseball",
          "To build a strong foundation",
          "To end a project immediately",
        ],
        correctIndex: 0,
        explanationBadini:
          "د دەستەواژەیێن کار و بازرگانی دا 'Touch base' واتە پەیوەندی کرنەکا کورت دگەل کەسەکێ بۆ پێزانینا دوماهیک پێشهات و زانیاریان.",
      },
    ],
    dialogue: {
      titleEn: "Answering 'Tell me about yourself' in an Interview",
      titleKu: "بەرسڤدانا پرسیارا 'بەحسا خۆ بکە' د چاوپێکەوتنا کار دا",
      scenarioBadini: "بەرسڤدانا پسیارەکا سەرەکی یا چاوپێکەوتنا کاری ب شێوازەکێ پڕۆفێشناڵ",
      lines: [
        {
          speaker: "Interviewer",
          avatarColor: "bg-slate-700",
          textEn: "Welcome Azad. To start off, could you tell us a bit about your professional background?",
          textKu: "بخێر بێی ئازاد. بۆ دەستپێکێ، ئەرێ دشێی ب کورتی بەحسا پاشخانا کارێ خۆ بکەی؟",
        },
        {
          speaker: "Azad",
          avatarColor: "bg-blue-600",
          textEn: "Certainly! Over the past three years, I have worked as a frontend developer specializing in React.",
          textKu: "ب دڵنیایی ڤە! د درێژاهیا سێ ساڵێن بووری دا، ئەز وەک دروستکەرێ ڕووکارێ وێبسایتان (Frontend) کار دکەم.",
        },
        {
          speaker: "Interviewer",
          avatarColor: "bg-slate-700",
          textEn: "What motivated you to apply for this specific role at our company?",
          textKu: "چی تە هان دا کۆ داواکاری پێشکێشی ئەڤی کاری بکەی ل کۆمپانیا مە؟",
        },
        {
          speaker: "Azad",
          avatarColor: "bg-blue-600",
          textEn: "Your focus on AI technology aligns perfectly with my long-term career aspirations.",
          textKu: "گرنگیدانا هەوە ب ژیریێ دەستکرد ب تەمامی دگەل ئارمانجێن داهاتوویێ من یێن کاری دا دگونجیت.",
        },
      ],
      goldenPhrases: [
        {
          phrase: "Aligns with my career aspirations",
          meaningKu: "دگەل ئارمانجێن داهاتوویێ من یێن پیشەیی دا دگونجیت",
          usageNote: "ڕستەیەکا گەلەک ئەکادیمی و جوانە بۆ چاوپێکەوتنا کاران.",
        },
        {
          phrase: "To start off",
          meaningKu: "بۆ دەستپێکێ / وەک دەستپێک",
          usageNote: "بکاردێت بۆ دەستپێکرنا کۆبوونەوە یان پێشکێشکاریەکێ.",
        },
      ],
    },
    grammar: {
      titleEn: "Past Simple vs Present Perfect",
      titleKu: "جوداهیا دەمی ڕابردوویێ سادە و تەواو",
      ruleSummaryBadini:
        "Past Simple دەمەکە دەمێ وێ ب تەمامی ب دووماهی هاتیە و دەمێ وێ دیارە (yesterday, in 2021). لێ Present Perfect گرنگیێ ددەتە ئەنجام و ئەزموونێ بێ دیارکرنا دەمێ تەمام یان دەمێ ئەزموون تێدا بەردەوام بیت (I have visited London three times).",
      formula: "Past Simple: Verb-ed (or Irregular)  |  Present Perfect: have/has + Past Participle (V3)",
      examples: [
        { en: "I finished my report an hour ago.", ku: "من ڕاپۆرتا خۆ بەری دەمژمێرەکێ تەواو کر (دەمێ دیار)." },
        { en: "I have already finished my report.", ku: "من ئیتر ڕاپۆرتا خۆ تەواو کریە (ئەنجامێ گرنگ نوکە هەیە)." },
      ],
      mistakes: [
        {
          wrong: "I have seen that movie last night.",
          right: "I saw that movie last night.",
          explanationBadini: "ژبەر کۆ پەیڤا 'last night' هەیە، دەمێ ڕابردوویێ سادە (Past Simple) دروستە.",
        },
        {
          wrong: "Did you ever be in Germany?",
          right: "Have you ever been to Germany?",
          explanationBadini: "بۆ پرسیارکرن دەربارەی ئەزموونا ژیانێ پەیڤا 'Have you ever been to...?' بکاردێت.",
        },
      ],
      quickTipBadini: "ئەگەر پرسیارێ (When / What time) هەبیت، هەردەم Past Simple بەکاردێت نەکو Present Perfect.",
    },
  },

  // 3: Wednesday / چوارشەمب
  {
    dayId: 3,
    dayNameKu: "چوارشەمب",
    dayNameEn: "Wednesday",
    themeTitleKu: "گەشتوگوزار، فڕۆکەخانە و ئوتێل",
    themeTitleEn: "Travel, Airports & Hotel Booking",
    vocabulary: {
      word: "Itinerary",
      phonetic: "/aɪˈtɪn.ər.ər.i/",
      partOfSpeech: "Noun (ناڤ)",
      kurdishBadini: "بەرنامە و خشتەیێ گەشتێ (کۆیلەیا دەم و جهێن گەشتێ)",
      englishDefinition: "A planned route or journey; a detailed list or timetable of a trip.",
      examples: [
        {
          en: "We need to finalize our travel itinerary before booking the flights.",
          ku: "پێویستە ئەم بەرنامەیێ گەشتێ دیار بکەین بەری بلیتێن فڕۆکەی ببڕین.",
        },
        {
          en: "The guided tour includes visits to several historical landmarks in the itinerary.",
          ku: "گەشتا ڕێبەریا گەشتیاری سەردانا چەندین جهێن مێژوویی بخۆڤە دگریت د بەرنامەیێ گەشتێ دا.",
        },
      ],
      synonyms: ["Schedule", "Travel plan", "Route", "Timetable"],
      antonyms: ["Spontaneity", "Improvisation"],
      usageTipBadini: "ل فڕۆکەخانە و کۆمپانیێن فڕۆکەڤانی دبیژن: 'Here is your flight itinerary' واتە خشتەیێ فڕینێ تە.",
    },
    quiz: [
      {
        id: "wed-q1",
        question: "At airport check-in, what is the bag you carry with you onto the airplane called?",
        category: "Conversation",
        difficulty: "سەرەتایی",
        options: ["Checked baggage", "Carry-on luggage", "Cargo bag", "Heavy freight"],
        correctIndex: 1,
        explanationBadini:
          "ئەو جانتایێ تو دگەل خۆ دبەیە د ناڤ فڕۆکەی دا دبێژنێ 'Carry-on luggage' یان 'Hand luggage'. لێ جانتایێ گەورە یێ دچیتە بەشی بار دبێژنێ 'Checked luggage'.",
      },
      {
        id: "wed-q2",
        question: "Which phrasal verb means 'to depart / leave the ground' for an airplane?",
        category: "Vocabulary",
        difficulty: "سەرەتایی",
        options: ["Take off", "Take in", "Take over", "Take up"],
        correctIndex: 0,
        explanationBadini:
          "کردارا لێکدراوی 'Take off' بۆ فڕۆکەی واتە فڕین و بڵندبوون ژ عەردی. نموونە: The flight took off on time.",
      },
      {
        id: "wed-q3",
        question: "Select the correctly formatted reported speech: Direct: 'I am tired,' he said.",
        category: "Grammar",
        difficulty: "پێشکەفتی",
        options: [
          "He said that he is tired.",
          "He said that he was tired.",
          "He said that he had been tired.",
          "He says that he was tired.",
        ],
        correctIndex: 1,
        explanationBadini:
          "د گواستنەوەی قسەدا (Reported Speech)، دەمی Present Simple (am) دەگۆڕێت بۆ Past Simple (was): 'He said that he was tired'.",
      },
      {
        id: "wed-q4",
        question: "What does 'To travel on a shoestring' mean?",
        category: "Idiom",
        difficulty: "ناڤین",
        options: [
          "To travel with very little money",
          "To travel by walking only",
          "To buy luxury brand shoes while traveling",
          "To travel without any shoes",
        ],
        correctIndex: 0,
        explanationBadini:
          "ئەڤ پەندە واتە گەشتکردن ب بودجەیەکا زۆر کەم و پارەیەکێ کێم (گەشتا هەرزان).",
      },
    ],
    dialogue: {
      titleEn: "Checking into a Hotel in Istanbul",
      titleKu: "وەرگرتنا ژوورێ ل ئوتێلەکا ئەستەنبۆڵێ",
      scenarioBadini: "گەشتیارەک دچیتە لایێ کارمەندێ ئوتێلێ بۆ وەرگرتنا کلیلا ژوورێ",
      lines: [
        {
          speaker: "Guest",
          avatarColor: "bg-teal-600",
          textEn: "Hello, I have a reservation under the name of Shvan Karim for three nights.",
          textKu: "سلاڤ، من ژوورەک حجز کریە ب ناڤێ شڤان کەریم بۆ سێ شەڤان.",
        },
        {
          speaker: "Receptionist",
          avatarColor: "bg-indigo-600",
          textEn: "Welcome Mr. Karim! May I have your passport and a credit card for the deposit?",
          textKu: "بخێر بێی کاک شڤان! ئەرێ دشێم پاسپۆرت و کارتا تە ببینم؟",
        },
        {
          speaker: "Guest",
          avatarColor: "bg-teal-600",
          textEn: "Here you are. Does the room include complimentary breakfast and Wi-Fi?",
          textKu: "فەرموو ئەڤەیە. ئەرێ ژوور خوارنا سپێدێ (تاشتێ) و ئینتەرنێت ب بێ بەرامبەر بخۆڤە دگریت؟",
        },
        {
          speaker: "Receptionist",
          avatarColor: "bg-indigo-600",
          textEn: "Yes, breakfast is served on the rooftop from 7 to 10 AM. Here is your room keycard.",
          textKu: "بەڵێ، تاشتێ ل سەر بانی دهێتە پێشکێشکرن ژ دەمژمێر 7 تا 10. فەرموو ئەڤە کارتا ژوورا تە یە.",
        },
      ],
      goldenPhrases: [
        {
          phrase: "Complimentary breakfast",
          meaningKu: "خوارنا سپێدێ ب بێ بەرامبەر (خۆڕایی)",
          usageNote: "پەیڤا 'Complimentary' ل ئوتێل و فڕۆکەخانان واتە ب بێ پارەیە.",
        },
        {
          phrase: "Under the name of",
          meaningKu: "ب ناڤێ (کەسەکێ)",
          usageNote: "دەمێ حجزێ دکەی دبیژی: I have a reservation under the name of...",
        },
      ],
    },
    grammar: {
      titleEn: "Modal Verbs for Politeness: Could, Would, May",
      titleKu: "کردارێن یارمەتیدەر بۆ داواکاریێن ڕێزدار",
      ruleSummaryBadini:
        "دەمێ دخوازی ب ڕێز و ئەدەب داواکاریەکێ بکەی، لە جێگەی 'Can' یان فەرماندان، پەیڤێن 'Could you please...?' یان 'Would you mind...?' یان 'May I...?' بەکاردێن.",
      formula: "Could you + Verb (Base)?  |  Would you mind + Verb-ing?  |  May I + Verb?",
      examples: [
        { en: "Could you please pass the water?", ku: "بێ زەحمەت دشێی ئاڤێ بدەیە من؟" },
        { en: "Would you mind closing the window?", ku: "ئەگەر زەحمەت نەبیت پەنجەرێ بگری؟" },
      ],
      mistakes: [
        {
          wrong: "Would you mind to open the door?",
          right: "Would you mind opening the door?",
          explanationBadini: "دوای 'Would you mind' پێویستە کریار 'Verb-ing' بێت.",
        },
        {
          wrong: "Give me that menu.",
          right: "Could I have the menu, please?",
          explanationBadini: "فەرماندان د چێشتخانەدا نەشیاوە، داواکاری ڕێزدار بەکاردێت.",
        },
      ],
      quickTipBadini: "دەمێ کەسەک دبێژیت: 'Would you mind...?' ئەگەر ڕازی بی دەبێ بێژی 'Not at all!' (واتە نەخێر قەت زەحمەت نینە).",
    },
  },

  // 4: Thursday / پێنجشەمب
  {
    dayId: 4,
    dayNameKu: "پێنجشەمب",
    dayNameEn: "Thursday",
    themeTitleKu: "تەندروستی، نەخۆشخانە و دکتۆر",
    themeTitleEn: "Health, Doctor Visits & Wellness",
    vocabulary: {
      word: "Prescription",
      phonetic: "/prɪˈskrɪp.ʃən/",
      partOfSpeech: "Noun (ناڤ)",
      kurdishBadini: "ڕەچەتەیا دەرمانی یا دکتۆری",
      englishDefinition: "An official instruction written by a medical doctor authorizing a patient to be provided a medicine.",
      examples: [
        {
          en: "You must take this prescription to the pharmacy to get your antibiotics.",
          ku: "پێویستە ئەڤێ ڕەچەتەیێ ببەیە دەرمانخانێ بۆ وەرگرتنا دەرمانێ دژەبەکتیریا.",
        },
        {
          en: "The doctor gave her a prescription for painkillers after the dental surgery.",
          ku: "دکتۆری ڕەچەتەیەکا هێورکەرێن ئازارێ بۆ نڤیسی پشتی نشته‌گه‌ریا ددانی.",
        },
      ],
      synonyms: ["Medical order", "Rx", "Medicine script"],
      antonyms: ["Over-the-counter"],
      usageTipBadini: "دەرمانێن پێویستی ب نڤیسینا دکتۆری هەبیت دبێژنێ (Prescription drugs)، لێ ئەوێن ب بێ ڕەچەتە بفرۆشن دبێژنێ (Over-the-counter - OTC).",
    },
    quiz: [
      {
        id: "thu-q1",
        question: "What is the common expression used when you feel slightly sick or tired?",
        category: "Idiom",
        difficulty: "سەرەتایی",
        options: ["Under the weather", "Over the moon", "In the clouds", "Out of the blue"],
        correctIndex: 0,
        explanationBadini:
          "دەستەواژەیا 'Under the weather' واتە هەستکرن ب نەخۆشیەکا کەم یان مانسیبوون. نموونە: I am feeling a bit under the weather today.",
      },
      {
        id: "thu-q2",
        question: "Choose the correct sentence regarding symptoms:",
        category: "Common Mistake",
        difficulty: "ناڤین",
        options: [
          "I have a headache.",
          "I have headache.",
          "I am having head hurting.",
          "My head has pains.",
        ],
        correctIndex: 0,
        explanationBadini:
          "د زمانێ ئینگلیزی دا دگەل سەرئێشانێ پێویستە ئامرازی ناساندن 'a' بەکاربهێت: 'I have a headache'.",
      },
      {
        id: "thu-q3",
        question: "Which connective word expresses contrast between two ideas?",
        category: "Academic",
        difficulty: "ناڤین",
        options: ["Furthermore", "Nevertheless", "Consequently", "In addition"],
        correctIndex: 1,
        explanationBadini:
          "پەیڤا 'Nevertheless' (سەرەڕای هندێ / لەگەڵ ئەوەشدا) بۆ نیشاندانا جیاوازی و دژبەریێ یە (Contrast)، لە کاتێکدا 'Furthermore' و 'In addition' بۆ زیادکردنی زانیارینە.",
      },
      {
        id: "thu-q4",
        question: "Neither the doctor nor the nurses _____ available right now.",
        category: "Grammar",
        difficulty: "پێشکەفتی",
        options: ["is", "are", "was", "be"],
        correctIndex: 1,
        explanationBadini:
          "د یاسایا 'Neither... nor...' دا کردار شوێن بکەری دووەم دکەوێت. ژبەر کۆ 'nurses' کۆیە، کرداری کۆ 'are' بەکاردێت.",
      },
    ],
    dialogue: {
      titleEn: "Consulting a Doctor About Symptoms",
      titleKu: "سەردانا نۆژداری دەربارەی نیشانێن نەخۆشیێ",
      scenarioBadini: "نەخۆشەک بەحسا نیشانێن پەسیو و ئازارا قورگی دکەت ل جەم دکتۆری",
      lines: [
        {
          speaker: "Doctor",
          avatarColor: "bg-cyan-600",
          textEn: "Good morning. What seems to be the problem today?",
          textKu: "سپێدە باش. کێشە چییە و تو چەوا هەست ب نەخۆشیێ دکەی؟",
        },
        {
          speaker: "Patient",
          avatarColor: "bg-rose-500",
          textEn: "I have had a severe sore throat and a high fever since yesterday evening.",
          textKu: "ژ دوهی ئێڤارێ ڤە قورگێ من ب دژواری دئێشیت و تایەکا بەرز ل دەف من هەیە.",
        },
        {
          speaker: "Doctor",
          avatarColor: "bg-cyan-600",
          textEn: "Let me examine your throat. Please open your mouth and say 'Ah'.",
          textKu: "با سەیری قورگێ تە بکەم. بێ زەحمەت دەڤێ خۆ ڤەکە و بێژە 'ئا'.",
        },
        {
          speaker: "Patient",
          avatarColor: "bg-rose-500",
          textEn: "Is it a serious infection, Doctor?",
          textKu: "ئەرێ هەوکردنەکا مەترسیدارە، دکتۆر؟",
        },
      ],
      goldenPhrases: [
        {
          phrase: "What seems to be the problem?",
          meaningKu: "کێشە چییە؟ چ گازندەیەک تە هەیە؟",
          usageNote: "ڕستەیا سەرەکی یا پزیشکانە دەمێ نەخۆش دچیتە ژوورڤە.",
        },
        {
          phrase: "Sore throat",
          meaningKu: "ئازار و برینداربوونا قورگی",
          usageNote: "نیشانەیەکی سەرەکی یا هەڵامەت و سەرماخواردنێ یە.",
        },
      ],
    },
    grammar: {
      titleEn: "First Conditional vs Second Conditional",
      titleKu: "مەرجی یەکەم (ڕاستەقینە) بەرامبەر مەرجی دووەم (خەیاڵی)",
      ruleSummaryBadini:
        "First Conditional بۆ ئەگەرەکێ ڕاستەقینەیە د داهاتوودا (If it rains, I will stay home). لێ Second Conditional بۆ بارودۆخەکێ خەیاڵی یان نەگونجایە نوکە (If I were a doctor, I would help everyone).",
      formula: "1st: If + Present Simple -> will + Verb  |  2nd: If + Past Simple -> would + Verb",
      examples: [
        { en: "If you take this medicine, you will get better.", ku: "ئەگەر ئەڤی دەرمانی بخۆی، دێ باشتر بی (ڕاستەقینە)." },
        { en: "If I had a million dollars, I would travel the world.", ku: "ئەگەر ملیۆنەک دۆلار هەبانە، دێ گەشتێ کەم بۆ جیهانێ (خەیاڵی)." },
      ],
      mistakes: [
        {
          wrong: "If I will see him, I will tell him.",
          right: "If I see him, I will tell him.",
          explanationBadini: "د بەشی 'If' دا چ جاران 'will' بەکارناهێت.",
        },
        {
          wrong: "If I was you, I would rest.",
          right: "If I were you, I would rest.",
          explanationBadini: "د یاسای Second Conditional دا بۆ هەموو کەسەکان (If I were, If he were) جوانترە.",
        },
      ],
      quickTipBadini: "بۆ ئامۆژگاریکرن هەردەم بێژە: 'If I were you, I would...'.",
    },
  },

  // 5: Friday / ئەینی
  {
    dayId: 5,
    dayNameKu: "ئەینی",
    dayNameEn: "Friday",
    themeTitleKu: "تەکنۆلۆژیا، ژیریێ دەستکرد و زانست",
    themeTitleEn: "Technology, AI & Modern Science",
    vocabulary: {
      word: "Cutting-edge",
      phonetic: "/ˌkʌt.ɪŋ ˈedʒ/",
      partOfSpeech: "Adjective (سیفەت)",
      kurdishBadini: "پێشکەفتیترین و تازەترین تەکنۆلۆژیا (سەردەمیانە)",
      englishDefinition: "Highly advanced; innovative; at the latest or most advanced stage of development.",
      examples: [
        {
          en: "Our university laboratory is equipped with cutting-edge artificial intelligence tools.",
          ku: "تاقیگەها زانکۆیا مە ب پێشکەفتیترین ئامرازێن ژیریێ دەستکرد هاتیە ئامادەکرن.",
        },
        {
          en: "She works for a tech company creating cutting-edge medical software.",
          ku: "ئەو د کۆمپانیایەکا تەکنەلۆژی دا کار دکەت کۆ بەرنامەیێن پێشکەفتی یێن نوژداری دروست دکەت.",
        },
      ],
      synonyms: ["State-of-the-art", "Groundbreaking", "Innovative", "Advanced"],
      antonyms: ["Outdated", "Obsolete", "Archaic"],
      usageTipBadini: "بۆ وەسفکرنا مۆبایل، کۆمپیۆتەر و سۆفتوێری نوێ زۆر بەکاردێت: 'Cutting-edge technology'.",
    },
    quiz: [
      {
        id: "fri-q1",
        question: "Which word means 'the ability of a computer program to learn and think'?",
        category: "Vocabulary",
        difficulty: "سەرەتایی",
        options: ["Cloud Computing", "Artificial Intelligence", "Cyber Security", "Data Mining"],
        correctIndex: 1,
        explanationBadini:
          "دەستەواژەیا 'Artificial Intelligence (AI)' واتە ژیریێ دەستکرد؛ توانایا کۆمپیۆتەر و بەرنامەیان بۆ فێربوون و بیرکردنەوە وەک مرۆڤی.",
      },
      {
        id: "fri-q2",
        question: "Select the sentence with correct Passive Voice:",
        category: "Grammar",
        difficulty: "ناڤین",
        options: [
          "The smartphone was invented in the 21st century.",
          "The smartphone invented in the 21st century.",
          "The smartphone had invented in the 21st century.",
          "The smartphone was invent in the 21st century.",
        ],
        correctIndex: 0,
        explanationBadini:
          "د Passive Voice دا پێویستە (was/were + Verb 3) هەبێت: 'The smartphone was invented'.",
      },
      {
        id: "fri-q3",
        question: "What does the idiom 'To keep an eye on' mean?",
        category: "Idiom",
        difficulty: "سەرەتایی",
        options: [
          "To watch or monitor carefully",
          "To wear special eyeglasses",
          "To ignore someone completely",
          "To close one eye while aiming",
        ],
        correctIndex: 0,
        explanationBadini:
          "ئەڤ پەندە واتە چاودێریکردن و ئاگەهداریبوون ژ تشتەکی ب شێوازەکێ هویر. نموونە: Please keep an eye on my laptop.",
      },
      {
        id: "fri-q4",
        question: "By the end of this decade, scientists _____ a complete cure for this illness.",
        category: "Grammar",
        difficulty: "پێشکەفتی",
        options: ["will discover", "will have discovered", "discover", "are discovering"],
        correctIndex: 1,
        explanationBadini:
          "دەمێ دەستەواژەیا 'By + future time' (وەکی By the end of this decade) هەبێت، دەمی Future Perfect (will have + V3) بەکاردێت.",
      },
    ],
    dialogue: {
      titleEn: "Discussing AI Tools in Education",
      titleKu: "گفتوگۆ دەربارەی ئامرازێن ژیریێ دەستکرد د خواندنێ دا",
      scenarioBadini: "دوو قوتابیێن زانکۆیێ بەحسا سودێن ChatGPT و ئامرازێن AI دکەن",
      lines: [
        {
          speaker: "Danyar",
          avatarColor: "bg-indigo-600",
          textEn: "Have you tried using AI assistants to practice your English pronunciation?",
          textKu: "ئەرێ تە ژیریێ دەستکرد تاقی کریە بۆ ڕاهێنانا دەنگ و دەربڕینا ئینگلیزیێ تە؟",
        },
        {
          speaker: "Renas",
          avatarColor: "bg-emerald-600",
          textEn: "Yes! It gives instant feedback and corrects my grammatical mistakes seamlessly.",
          textKu: "بەڵێ! دەستبەجێ بەرسڤێ ددەت و خەلەتیێن من یێن ڕێزمانی ب شێوەیەکێ بێ کەموکوڕی ڕاستڤە دکەت.",
        },
        {
          speaker: "Danyar",
          avatarColor: "bg-indigo-600",
          textEn: "It is a game-changer for independent language learners worldwide.",
          textKu: "ئەڤە شۆڕشەکا مەزن و گۆڕانکاریەکە بۆ هەر کەسەکێ بخۆ فێری زمانی ببیت ل جیهانێ.",
        },
        {
          speaker: "Renas",
          avatarColor: "bg-emerald-600",
          textEn: "I agree, as long as we use it responsibly to boost our own thinking.",
          textKu: "ڕازیمە دگەل تە، ب مەرجەکێ ب هۆشیاری بکاربینین بۆ بەهێزکرنا هزرێن خۆ.",
        },
      ],
      goldenPhrases: [
        {
          phrase: "Game-changer",
          meaningKu: "ڕوودان یان داهێنانەک کۆ هەموو شتان دەگۆڕێت",
          usageNote: "د تەکنۆلۆژیا و زانست دا بۆ داهێنانە مەزنەکان دەوترێت.",
        },
        {
          phrase: "Instant feedback",
          meaningKu: "بەرسڤ و هەڵسەنگاندنا دەستبەجێ",
          usageNote: "د پرۆگرام و فێربوون دا زۆر بەکاردێت.",
        },
      ],
    },
    grammar: {
      titleEn: "Passive Voice in Academic Writing",
      titleKu: "ڕستەیا نەدیار (Passive Voice) د نڤیسینا ئەکادیمی دا",
      ruleSummaryBadini:
        "د نڤیسین و ڕاپۆرتێن زانستی دا، ژبەر کۆ کارێ کراو گرنگترە ژ بکەرێ وی، Passive Voice بەکاردێت (Object + be + Verb 3).",
      formula: "Present: is/are + V3  |  Past: was/were + V3  |  Future: will be + V3",
      examples: [
        { en: "The research paper was published in a prestigious journal.", ku: "توێژینەوەکە لە گۆڤارێکی بەناوبانگدا بڵاوکرایەوە." },
        { en: "Data is collected through online surveys.", ku: "داتاکان لە ڕێگەی ڕاپرسی ئۆنلاینەوە کۆدەکرێنەوە." },
      ],
      mistakes: [
        {
          wrong: "The experiment was fail.",
          right: "The experiment failed. / The experiment was considered a failure.",
          explanationBadini: "کردارێن Intransitive (وەک fail, happen, occur) نابنە Passive.",
        },
        {
          wrong: "The software was create by him.",
          right: "The software was created by him.",
          explanationBadini: "د Passive پێویستە کرداری سەرەکی Past Participle (created) بێت.",
        },
      ],
      quickTipBadini: "ئەگەر نەتزانی کێ کارەکەی کردووە، یان کارەکە گرنگتر بوو لە بکەر، هەمیشە Passive بەکاربهێنە.",
    },
  },

  // 6: Saturday / شەمب
  {
    dayId: 6,
    dayNameKu: "شەمب",
    dayNameEn: "Saturday",
    themeTitleKu: "کولتوور، گەشت و پێداچوونەوەیا حەفتیانە",
    themeTitleEn: "Culture, Entertainment & Weekly Review",
    vocabulary: {
      word: "Fascinating",
      phonetic: "/ˈfæs.ən.eɪ.tɪŋ/",
      partOfSpeech: "Adjective (سیفەت)",
      kurdishBadini: "سەرنجڕاکێش و سەرنجبڕ (زۆر جوان و سەرنجڕاکێش)",
      englishDefinition: "Extremely interesting, captivating, or charming.",
      examples: [
        {
          en: "Kurdish cultural folklore and history are truly fascinating to international visitors.",
          ku: "فۆلکلۆر و مێژووا کولتوورێ کوردی ب ڕاستی گەلەک سەرنجڕاکێشە بۆ مێڤانێن بیانی.",
        },
        {
          en: "She gave a fascinating lecture on ancient Mesopotamian civilizations.",
          ku: "وێ وانەیەکی زۆر سەرنجڕاکێش پێشکێش کرد دەربارەی شارستانیەتەکانی میسۆپۆتامیا.",
        },
      ],
      synonyms: ["Captivating", "Intriguing", "Enthralling", "Engaging"],
      antonyms: ["Boring", "Dull", "Monotonous", "Tedious"],
      usageTipBadini: "دەمێ تشتەک گەلەک خۆش و سەرنجڕاکێش بیت لە جێگەی 'Very interesting' بێژە 'Fascinating'.",
    },
    quiz: [
      {
        id: "sat-q1",
        question: "Which word is the exact opposite (antonym) of 'Ancient'?",
        category: "Vocabulary",
        difficulty: "سەرەتایی",
        options: ["Historic", "Contemporary / Modern", "Traditional", "Antique"],
        correctIndex: 1,
        explanationBadini:
          "پەیڤا 'Ancient' واتە دێرین و کەڤنار. دژواتایا (Antonym) وێ دبیتە 'Modern' یان 'Contemporary' (هاوچەرخ و مۆدێرن).",
      },
      {
        id: "sat-q2",
        question: "Choose the correct question tag: 'You have been to Erbil Citadel, _____?'",
        category: "Grammar",
        difficulty: "ناڤین",
        options: ["haven't you?", "did you?", "have you?", "weren't you?"],
        correctIndex: 0,
        explanationBadini:
          "د Question Tags دا، ئەگەر ڕستە ئەرێنی بوو (You have been)، پرسیارەکە دەبێت نەرێنی بێت بە هەمان کرداری یارمەتیدەر: 'haven't you?'.",
      },
      {
        id: "sat-q3",
        question: "What does the idiom 'Once in a blue moon' mean?",
        category: "Idiom",
        difficulty: "سەرەتایی",
        options: ["Very frequently", "Very rarely", "During a night storm", "Every full moon"],
        correctIndex: 1,
        explanationBadini:
          "پەندێ 'Once in a blue moon' واتە تشتەکێ گەلەک دەگمەن کۆ زۆر کێم ڕووددەت. نموونە: He travels abroad once in a blue moon.",
      },
      {
        id: "sat-q4",
        question: "Select the sentence with correct subject-verb agreement:",
        category: "Grammar",
        difficulty: "پێشکەفتی",
        options: [
          "Every student and teacher are in the hall.",
          "Every student and teacher is in the hall.",
          "Every student and teacher were in the hall.",
          "Every student and teacher have been in the hall.",
        ],
        correctIndex: 1,
        explanationBadini:
          "دەمێ پەیڤا 'Every' یان 'Each' هەبێت، کرداری دوای ئەو دەبێت تاک (Singular) بێت: 'Every student and teacher is...'.",
      },
    ],
    dialogue: {
      titleEn: "Recommending Tourist Destinations in Kurdistan",
      titleKu: "پێشنیارکرنا جهێن گەشتیاری ل کوردستانێ",
      scenarioBadini: "هاوڵاتیەکێ کوردی پێشنیارا جهێن دڵڕفێن دکەت بۆ گەشتیارەکێ بیانی",
      lines: [
        {
          speaker: "Tourist",
          avatarColor: "bg-orange-500",
          textEn: "I have two days free in Duhok and Erbil. What places should I not miss?",
          textKu: "دوو ڕۆژێن بەتاڵ ل دەف من هەنە ل دهۆک و هەولێرێ. چ جه هەنە کۆ نابیت ژ دەست بدەم؟",
        },
        {
          speaker: "Local Guide",
          avatarColor: "bg-emerald-600",
          textEn: "You must visit the ancient Citadel of Erbil, and in Duhok, head up to the Lalish Temple and Gali Sherana.",
          textKu: "پێویستە قەڵایا کەڤنارا هەولێرێ ببینی، و ل دهۆکێ ژی سەرەدانا پەرستگەها لالش و گەلیێ شێرانە بکە.",
        },
        {
          speaker: "Tourist",
          avatarColor: "bg-orange-500",
          textEn: "That sounds amazing! How is the traditional food in the bazaar?",
          textKu: "گەلەک خۆش دیارە! خوارنا کەلەپوری د بازاڕی دا چەوایە؟",
        },
        {
          speaker: "Local Guide",
          avatarColor: "bg-emerald-600",
          textEn: "Unbeatable! Make sure you try local Dolma, Kebab, and Kurdish tea.",
          textKu: "بێ هاوتایە! دڵنیابە دۆڵمەیا ناڤخۆیی، کەباب و چایا کوردی تاقی بکەی.",
        },
      ],
      goldenPhrases: [
        {
          phrase: "Unbeatable",
          meaningKu: "بێ هاوتا و بێ وێنە (چ تشت ناگەهیتێ)",
          usageNote: "بۆ وەسفکردنی چێژ یان بەهایەکی زۆر بەرز بەکاردێت.",
        },
        {
          phrase: "Should not miss",
          meaningKu: "نابێت لە دەست بدەیت / پێویستە حەتمەن بیبینیت",
          usageNote: "ڕستەیەکە بۆ پێشنیارکردنی باشترین ئەزموونەکان.",
        },
      ],
    },
    grammar: {
      titleEn: "Question Tags for Engaging Conversations",
      titleKu: "پرسیارێن کلکدار (Question Tags) بۆ دەستپێکرنا گفتوگۆیێ",
      ruleSummaryBadini:
        "Question Tags پرسیارێن کورتن ل دوماهیا ڕستەیێ بۆ دڵنیابوونەوە یان ڕاکێشانا بەرامبەر. ئەگەر ڕستە ئەرێنی بوو، تاگ دەبێت نەرێنی بێت، و بەپێچەوانەوە.",
      formula: "Positive Sentence, Negative Tag?  |  Negative Sentence, Positive Tag?",
      examples: [
        { en: "It is a beautiful sunny day, isn't it?", ku: "ڕۆژەکا خۆش و هەتاوییە، وانییە؟" },
        { en: "You don't speak French, do you?", ku: "تۆ بە فەڕەنسی قسە ناکەیت، وایە؟" },
      ],
      mistakes: [
        {
          wrong: "You are coming tomorrow, no?",
          right: "You are coming tomorrow, aren't you?",
          explanationBadini: "لە زمانی ئینگلیزیدا نابێت تەنها 'no?' بەکاربهێنیت لە کۆتایی ڕستەدا.",
        },
        {
          wrong: "She likes ice cream, isn't she?",
          right: "She likes ice cream, doesn't she?",
          explanationBadini: "ژبەر کۆ کردار Present Simpleە (likes)، دەبێت 'doesn't she?' بەکاربهێنرێت.",
        },
      ],
      quickTipBadini: "بۆ 'I am' استثنا هەیە و دەبێتە: 'I am right, aren't I?'.",
    },
  },
];

// ── MASTER QUESTION POOL (60+ Varied & Dynamic Questions) ───────────────────

export const MASTER_QUESTION_POOL: DailyQuizQuestion[] = [
  // ── GRAMMAR ─────────────────────────────────────────────────────────────
  {
    id: "mq-g1",
    question: "Choose the correct sentence in the Present Perfect Continuous:",
    category: "Grammar",
    difficulty: "ناڤین",
    options: [
      "I have been studying English for two hours.",
      "I am studying English since two hours.",
      "I have studying English for two hours.",
      "I had study English since two hours.",
    ],
    correctIndex: 0,
    explanationBadini:
      "بۆ کارەکێ کۆ ل ڕابردووی دەستپێکریە و تا نوکە یێ بەردەوامە دگەل ماوەی (for two hours)، یاسایا 'have/has been + Verb-ing' دروستە.",
    englishRule: "Present Perfect Continuous: Subject + have/has + been + Verb-ing.",
  },
  {
    id: "mq-g2",
    question: "Select the sentence with the correct Conditional Type 2 structure:",
    category: "Grammar",
    difficulty: "ناڤین",
    options: [
      "If I have time, I would call you.",
      "If I had time, I would call you.",
      "If I will have time, I would call you.",
      "If I had had time, I would call you.",
    ],
    correctIndex: 1,
    explanationBadini:
      "Second Conditional بۆ خەیاڵ و بارودۆخێ نەگونجایێ نوکەیە: If + Past Simple (had) -> would + Base Verb (call).",
  },
  {
    id: "mq-g3",
    question: "Hardly _____ when the phone began to ring.",
    category: "Grammar",
    difficulty: "پێشکەفتی",
    options: [
      "had I entered the room",
      "I had entered the room",
      "did I entered the room",
      "I entered the room",
    ],
    correctIndex: 0,
    explanationBadini:
      "د یاسایا Inversion (پێچەوانەکردنی فەرمی) دا، کاتێک ڕستە بە 'Hardly / Scarcely' دەست پێدەکات، کرداری یارمەتیدەر دەکەوێتە پێش بکەر: 'Hardly had I entered...'.",
    englishRule: "Inversion: Hardly + had + Subject + V3 + when...",
  },
  {
    id: "mq-g4",
    question: "Which sentence contains the correct preposition of time?",
    category: "Grammar",
    difficulty: "سەرەتایی",
    options: [
      "The exam starts at Monday on 9:00 AM.",
      "The exam starts on Monday at 9:00 AM.",
      "The exam starts in Monday at 9:00 AM.",
      "The exam starts at Monday in 9:00 AM.",
    ],
    correctIndex: 1,
    explanationBadini:
      "بۆ ڕۆژێن حەفتیێ (Monday, Friday) حەرفا 'ON' بکاردێت، و بۆ کاتژمێر و کاتی دیاریکراو (9:00 AM) حەرفا 'AT' بکاردێت.",
  },
  {
    id: "mq-g5",
    question: "Choose the correct sentence using 'Used to':",
    category: "Grammar",
    difficulty: "سەرەتایی",
    options: [
      "I used to playing football when I was young.",
      "I used to play football when I was young.",
      "I use to play football when I was young.",
      "I was used to play football when I was young.",
    ],
    correctIndex: 1,
    explanationBadini:
      "بۆ نەریتێکی ڕابردوو کە ئێستا نەماوە، 'used to + Base Verb' بەکاردێت: 'I used to play'.",
  },
  {
    id: "mq-g6",
    question: "The new bridge _____ by the international construction company next year.",
    category: "Grammar",
    difficulty: "ناڤین",
    options: [
      "will build",
      "will be built",
      "is building",
      "will been built",
    ],
    correctIndex: 1,
    explanationBadini:
      "ئەڤە Passive Voiceە بۆ داهاتوو: (will be + Past Participle): 'will be built'.",
  },
  {
    id: "mq-g7",
    question: "She avoided _____ him because she did not want an argument.",
    category: "Grammar",
    difficulty: "ناڤین",
    options: ["to meet", "meeting", "meet", "for meeting"],
    correctIndex: 1,
    explanationBadini:
      "کردارا 'Avoid' دەبێت بە Gerund (Verb-ing) دوای بێت: 'avoided meeting'.",
  },
  {
    id: "mq-g8",
    question: "He asked me where _____ .",
    category: "Grammar",
    difficulty: "پێشکەفتی",
    options: [
      "did I live",
      "I lived",
      "do I live",
      "was I living",
    ],
    correctIndex: 1,
    explanationBadini:
      "د Embedded Question و Reported Speech دا، ڕێزبەندی ڕستە دەبێتەوە ئاسایی (Subject + Verb) نەک پرسیاری: 'where I lived'.",
  },

  // ── VOCABULARY & PHRASAL VERBS ──────────────────────────────────────────
  {
    id: "mq-v1",
    question: "Which phrasal verb means 'to tolerate or endure an unpleasant situation'?",
    category: "Vocabulary",
    difficulty: "پێشکەفتی",
    options: ["Put up with", "Put out", "Put off", "Put down"],
    correctIndex: 0,
    explanationBadini:
      "دەستەواژەیا 'Put up with' واتە تەحەمولکردن و سەبرگرتن ل سەر تشتەکێ نەخۆش. نموونە: I cannot put up with this noise anymore.",
  },
  {
    id: "mq-v2",
    question: "What is the synonym of the word 'Ubiquitous'?",
    category: "Vocabulary",
    difficulty: "پێشکەفتی",
    options: ["Extremely rare", "Found everywhere", "Very ancient", "Unpredictable"],
    correctIndex: 1,
    explanationBadini:
      "پەیڤا 'Ubiquitous' پەیڤەکا زانستی و ئەکادیمیە واتە تشتەک کۆ ل هەموو جهەکی دەست دکەوێت و بەربەلاڤە (Found everywhere). نموونە: Smartphones are ubiquitous today.",
  },
  {
    id: "mq-v3",
    question: "Which word correctly completes the collocation: 'To _____ a decision'?",
    category: "Vocabulary",
    difficulty: "سەرەتایی",
    options: ["Do", "Make", "Create", "Form"],
    correctIndex: 1,
    explanationBadini:
      "د زمانێ ئینگلیزی دا دگەل بڕیاردانێ دەستەواژەیا 'Make a decision' دروستە، نەک 'Do a decision'.",
  },
  {
    id: "mq-v4",
    question: "What does the phrasal verb 'Figure out' mean?",
    category: "Vocabulary",
    difficulty: "ناڤین",
    options: [
      "To understand or find a solution to a problem",
      "To calculate numbers only",
      "To paint a portrait",
      "To give up completely",
    ],
    correctIndex: 0,
    explanationBadini:
      "دەستەواژەیا 'Figure out' واتە تێگەهشتن یان پەیداکرنا چارەسەریێ بۆ کێشەیەکێ. نموونە: We need to figure out how this works.",
  },
  {
    id: "mq-v5",
    question: "Which adjective means 'able to recover quickly from difficult conditions'?",
    category: "Vocabulary",
    difficulty: "پێشکەفتی",
    options: ["Fragile", "Resilient", "Vulnerable", "Reluctant"],
    correctIndex: 1,
    explanationBadini:
      "پەیڤا 'Resilient' سیفەتەکێ بەهێزە واتە کەسێک یان کۆمەڵگەیەک کۆ بەرگەی ناڕەحەتی بگرێت و زوو بگەڕێتەوە سەر دۆخی ئاسایی (بەڕەنگاربوو و خۆڕاگر).",
  },
  {
    id: "mq-v6",
    question: "Choose the correct phrasal verb: 'We have _____ petrol; we need to find a gas station.'",
    category: "Vocabulary",
    difficulty: "ناڤین",
    options: ["run out of", "run into", "run over", "run through"],
    correctIndex: 0,
    explanationBadini:
      "'Run out of' واتە تەواوبوون و لێبڕانی تشتێک. نموونە: We ran out of time (کاتمان لێ بڕا).",
  },
  {
    id: "mq-v7",
    question: "What is the antonym of 'Generous'?",
    category: "Vocabulary",
    difficulty: "سەرەتایی",
    options: ["Selfish / Stingy", "Kind", "Helpful", "Wealthy"],
    correctIndex: 0,
    explanationBadini:
      "پەیڤا 'Generous' واتە بەخشندە و دەستڤەکری. پێچەوانەکەی دەبێتە 'Stingy' یان 'Selfish' (چەپەڵ / ڕەزیل).",
  },

  // ── IDIOMS & SLANG ──────────────────────────────────────────────────────
  {
    id: "mq-i1",
    question: "What does the idiom 'Bite the bullet' mean?",
    category: "Idiom",
    difficulty: "ناڤین",
    options: [
      "To eat something dangerous",
      "To face a difficult situation with courage and get it over with",
      "To buy weapons",
      "To lose one's temper in public",
    ],
    correctIndex: 1,
    explanationBadini:
      "پەندێ 'Bite the bullet' واتە دانانی ددان بە ددان و ڕووبەڕووبوونەوەی کارێکی ناخۆش بە ئازایەتی چونکە چار نییە.",
  },
  {
    id: "mq-i2",
    question: "Complete the idiom: 'Don't cry over spilt ______.'",
    category: "Idiom",
    difficulty: "سەرەتایی",
    options: ["Water", "Milk", "Tea", "Juice"],
    correctIndex: 1,
    explanationBadini:
      "پەندێ ئینگلیزی دەڵێت: 'Don't cry over spilt milk'؛ واتە پەشیمانی لە شتێک کە ڕوویداوە و ناگەڕێتەوە بێ سوودە (خەم لە شیری ڕژاو مەخۆ).",
  },
  {
    id: "mq-i3",
    question: "If an item costs 'an arm and a leg', it is:",
    category: "Idiom",
    difficulty: "سەرەتایی",
    options: ["Very cheap", "Extremely expensive", "Free of charge", "Damaged"],
    correctIndex: 1,
    explanationBadini:
      "پەندێ 'Costs an arm and a leg' واتە شتەکە زۆر زۆر گرانە. نموونە: That luxury car costs an arm and a leg.",
  },
  {
    id: "mq-i4",
    question: "What does 'Break a leg' mean when said to a performer before a show?",
    category: "Idiom",
    difficulty: "سەرەتایی",
    options: [
      "Good luck!",
      "Be careful not to fall!",
      "You will fail!",
      "Stop performing immediately!",
    ],
    correctIndex: 0,
    explanationBadini:
      "د زمانی ئینگلیزی دا 'Break a leg' شێوازێکی تەقلیدیە بۆ هیوای سەرکەوتن خواستن (Good luck) پێش دەستپێکردنی نمایش یان تاقیکردنەوە.",
  },
  {
    id: "mq-i5",
    question: "What does 'To see eye to eye' with someone mean?",
    category: "Idiom",
    difficulty: "ناڤین",
    options: [
      "To look directly into their eyes",
      "To agree fully with them",
      "To argue aggressively",
      "To observe someone from afar",
    ],
    correctIndex: 1,
    explanationBadini:
      "پەندێ 'See eye to eye' واتە ڕێککەوتن و هاوڕابوون بە تەواوی لەسەر بابەتێک.",
  },
  {
    id: "mq-i6",
    question: "If you 'Call it a day', you:",
    category: "Idiom",
    difficulty: "سەرەتایی",
    options: [
      "Decide to stop working for the rest of the day",
      "Give a name to the day",
      "Start a new shift",
      "Celebrate a birthday",
    ],
    correctIndex: 0,
    explanationBadini:
      "دەستەواژەیا 'Let's call it a day' واتە بەسە ئیتر با کاری ئەمڕۆ کۆتایی پێ بهێنین و پشوو بدەین.",
  },

  // ── COMMON MISTAKES FOR KURDISH SPEAKERS ────────────────────────────────
  {
    id: "mq-cm1",
    question: "Which of the following is correct?",
    category: "Common Mistake",
    difficulty: "سەرەتایی",
    options: [
      "Can you explain me this rule?",
      "Can you explain this rule to me?",
      "Can you explain for me this rule?",
      "Can you explain with me this rule?",
    ],
    correctIndex: 1,
    explanationBadini:
      "کردارا 'Explain' پێویستی بە حەرفی جەری 'to' هەیە پێش کەسەکە: 'Explain something TO someone' (نابێ بێژی explain me).",
  },
  {
    id: "mq-cm2",
    question: "Choose the correct sentence regarding language ability:",
    category: "Common Mistake",
    difficulty: "سەرەتایی",
    options: [
      "She is very good in English.",
      "She is very good at English.",
      "She is very good with English.",
      "She is very good on English.",
    ],
    correctIndex: 1,
    explanationBadini:
      "دگەل شارەزایی و بەهرەدا، دەستەواژەیا 'Good at...' ڕاستە نەک 'Good in...'. نموونە: He is good at mathematics.",
  },
  {
    id: "mq-cm3",
    question: "Choose the correct sentence:",
    category: "Common Mistake",
    difficulty: "ناڤین",
    options: [
      "We need to discuss about the project.",
      "We need to discuss the project.",
      "We need to discuss on the project.",
      "We need to discuss with the project.",
    ],
    correctIndex: 1,
    explanationBadini:
      "کردارا 'Discuss' ڕاستەوخۆ دەست پێدەکات و پێویستی بە 'about' نییە: 'Discuss the project'. بەڵام بۆ 'Talk' دەڵێین 'Talk about'.",
  },
  {
    id: "mq-cm4",
    question: "Which sentence correctly expresses listening?",
    category: "Common Mistake",
    difficulty: "سەرەتایی",
    options: [
      "Please listen me carefully.",
      "Please listen to me carefully.",
      "Please listen with me carefully.",
      "Please listen at me carefully.",
    ],
    correctIndex: 1,
    explanationBadini:
      "کردارا 'Listen' هەمیشە پێویستی بە 'to' هەیە دەمێ کەسێک یان دەنگێک هەبێت: 'Listen TO me'.",
  },
  {
    id: "mq-cm5",
    question: "Select the sentence with correct advice usage:",
    category: "Common Mistake",
    difficulty: "ناڤین",
    options: [
      "He gave me an advice.",
      "He gave me a piece of advice.",
      "He gave me many advices.",
      "He gave me two advices.",
    ],
    correctIndex: 1,
    explanationBadini:
      "پەیڤا 'Advice' ژمارەیی نییە (Uncountable)، نە کۆ دەبێتەوە و نە 'an' وەردەگرێت. بۆ یەک ئامۆژگاری دەڵێین 'a piece of advice'.",
  },
  {
    id: "mq-cm6",
    question: "Choose the correct sentence about marriage:",
    category: "Common Mistake",
    difficulty: "سەرەتایی",
    options: [
      "He married with Sara last year.",
      "He married Sara last year.",
      "He married to Sara last year.",
      "He was married with Sara last year.",
    ],
    correctIndex: 1,
    explanationBadini:
      "وەک کرداری ڕابردوو دەڵێین: 'He married Sara' بێ هیچ حەرفێکی جەڕ. بەڵام وەک سیفەت دەڵێین: 'He is married to Sara'.",
  },

  // ── CONVERSATION & SITUATIONAL ──────────────────────────────────────────
  {
    id: "mq-c1",
    question: "At a restaurant, how do you politely ask for the bill?",
    category: "Conversation",
    difficulty: "سەرەتایی",
    options: [
      "Could we have the check/bill, please?",
      "Give me the price now!",
      "I want to pay right here!",
      "How much money do you want from me?",
    ],
    correctIndex: 0,
    explanationBadini:
      "شێوازی جوان و ستاندارد بۆ داواکردنی پسوولەی خواردن: 'Could we have the check/bill, please?'.",
  },
  {
    id: "mq-c2",
    question: "When someone says 'Thank you so much!', what is the most natural reply?",
    category: "Conversation",
    difficulty: "سەرەتایی",
    options: [
      "You're welcome! / Don't mention it!",
      "No thanks!",
      "Yes of course thank me!",
      "It is my price!",
    ],
    correctIndex: 0,
    explanationBadini:
      "بەرسڤا دروست و باو بۆ سوپاسگوزاری: 'You are welcome' یان 'My pleasure' یان 'Don't mention it' یە.",
  },
  {
    id: "mq-c3",
    question: "On a professional phone call, how do you ask someone to wait for a moment?",
    category: "Conversation",
    difficulty: "ناڤین",
    options: [
      "Stop talking for five minutes.",
      "Could you please hold on for a moment?",
      "Wait there right now!",
      "Hang up immediately!",
    ],
    correctIndex: 1,
    explanationBadini:
      "د پەیوەندی تەلەفۆنی دا 'Hold on' واتە ڕاوەستانێکی کورت لەسەر خەت بە ڕێزەوە: 'Could you please hold on a moment?'.",
  },
  {
    id: "mq-c4",
    question: "What is the polite way to ask for directions to the train station?",
    category: "Conversation",
    difficulty: "سەرەتایی",
    options: [
      "Excuse me, could you tell me how to get to the train station?",
      "Where is train station now?",
      "Show me the train quickly!",
      "Take me to train station please.",
    ],
    correctIndex: 0,
    explanationBadini:
      "داواکردنی ڕێگا بە شێوەیەکی ڕێزدار: 'Excuse me, could you tell me how to get to...?' بەکاردێت.",
  },

  // ── ACADEMIC & BUSINESS ENGLISH ─────────────────────────────────────────
  {
    id: "mq-a1",
    question: "Which linking word indicates a logical consequence / result?",
    category: "Academic",
    difficulty: "پێشکەفتی",
    options: ["Consequently", "Nevertheless", "Although", "In contrast"],
    correctIndex: 0,
    explanationBadini:
      "پەیڤا 'Consequently' واتە 'لە ئەنجامدا / کەواتە' بۆ نیشاندانی ئەنجامی لۆجیکی ڕووداوێک لە نووسینی ئەکادیمیدا.",
  },
  {
    id: "mq-a2",
    question: "When writing a formal business letter to a specific named person (e.g. Dear Mr. Smith), how should you sign off?",
    category: "Academic",
    difficulty: "ناڤین",
    options: [
      "Yours sincerely,",
      "Yours faithfully,",
      "Cheers,",
      "Later bro,",
    ],
    correctIndex: 0,
    explanationBadini:
      "ئەگەر ناوی کەسەکە بزانی (Dear Mr. Smith) لە کۆتاییدا دەنوسیت 'Yours sincerely,'. ئەگەر ناوی نەزانی (Dear Sir/Madam) دەنوسیت 'Yours faithfully,'.",
  },
  {
    id: "mq-a3",
    question: "Select the sentence with the most formal academic tone:",
    category: "Academic",
    difficulty: "پێشکەفتی",
    options: [
      "The results show lots of cool stuff about the economy.",
      "The findings demonstrate a significant correlation between the variables.",
      "The data gives us a bunch of nice hints.",
      "Things are looking pretty great according to our test.",
    ],
    correctIndex: 1,
    explanationBadini:
      "نووسینی ئەکادیمی پێویستی بە وشەی فەرمی و زانستی هەیە (findings, demonstrate, correlation, variables) لە جێگەی وشەی سادەی ڕۆژانە.",
  },
  {
    id: "mq-a4",
    question: "Which expression is best for introducing a counter-argument in an essay?",
    category: "Academic",
    difficulty: "پێشکەفتی",
    options: [
      "On the other hand, proponents argue that...",
      "Also another cool thing is...",
      "By the way I think...",
      "Plus let me tell you...",
    ],
    correctIndex: 0,
    explanationBadini:
      "دەستەواژەیا 'On the other hand, proponents argue that...' شێوازێکی ستانداردی زانکۆییە بۆ هێنانی ڕای پێچەوانە لە وتاری ئەکادیمی (IELTS/TOEFL).",
  },
];
