import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import RobotAvatarLive from "./RobotAvatarLive";

export type AssistantLanguage = "ku" | "en" | "ar" | "tr";

export interface ToolRecommendation {
  label: string;
  toolId: string;
  categoryIndex?: number;
}

interface AssistantMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  recommendations?: ToolRecommendation[];
  time: string;
}

const SANGAR_FOUNDER_TEXT =
  "بێ گومان! ب شانازییەکا مەزن ڤە دێ زانیارییان دەربارەی کەسایەتییا هێژا و دامەزرێنەرێ پلاتفۆرمێ **\"Las AI\"** بۆ تە ڕوون کەم:\n\n**مامۆستا سەنگەر محمد حەسەن** دامەزرێنەر، گەشەپێدەر و خودانێ سەرەکیێ پلاتفۆرمێ **\"Las AI\"** یە. ئەو کەسایەتییەکێ ئەکادیمی و پرۆفیشناڵە، خاوەنێ **باوەرنامەیا ماستەرە ب زانستێن بیرکاری (Master's Degree in Mathematical Sciences)**.\n\n**ئارمانج و پەیاما وی یا سەرەکی** پێشخستنا ئاستێ خواندن و فێرکاریێیە، ب هاریکاریا تەکنەلۆژیایێن زیرەکیا دەستکرد (AI). وی دڤێت قوتابی و توێژەرێن کورد یێن هێژا بشێن ب ساناهیترین شێوە و ب بلەزترین دەم پێشبکەڤن و دەرفەتێن باشتر بدەست ڤە بینن، ئەڤ پلاتفۆرمە یا پێشکەفتی و گشتگیرە کو نوکە زێدەتر ژ 50 ئامرازێن زیرەك بخۆڤە دگریت.";

const LOCALIZED_GREETINGS = {
  ku: {
    welcome: "بخێرهاتی 👋",
    intro: "ئەز هاریکارێ تەیێ زیرەکیا دەستکردم چەوا بشێم هاریکاریا تە بکەم ؟",
    prompt: "چەوا بشێم هاریکاریا تە بکەم؟",
    returning: "بخێرهاتیەڤە هەڤالێ هێژا! 👋",
    returningPrompt: "ئامادەی بەردەوام بین؟",
    askAiBtn: "پرسیارێ ژ AI بکە",
    pdfBtn: "ئامرازێن PDF",
    mathBtn: "شیکاریا بیرکاریێ",
    studyBtn: "ئامرازێن خواندنێ",
    researchBtn: "ڤەکۆلینا ئەکادیمی",
    allToolsBtn: "هەمی پشک",
    inputPlaceholder: "پرسیارەکێ بنڤیسە یان داخازا ئامرازەکی بکە...",
    sendBtn: "هنارتن",
    closeChat: "گرتن",
    status: "ئامادەیێ هاریکاریێ یە",
    greeting: "سڵاڤ! 👋",
    thinking: "هاریکارێ AI یێ هزردکەت...",
  },
  en: {
    welcome: "Welcome 👋",
    intro: "I am your AI Study & Productivity Assistant. How can I help you today?",
    prompt: "What do you need help with today? (Math, PDF, AI Tools, Research)",
    returning: "Welcome back! 👋",
    returningPrompt: "Ready to continue where you left off?",
    askAiBtn: "Ask AI Guide",
    pdfBtn: "PDF Suite",
    mathBtn: "Math Solver",
    studyBtn: "Study Tools",
    researchBtn: "Academic Research",
    allToolsBtn: "All Categories",
    inputPlaceholder: "Ask anything or search for a tool...",
    sendBtn: "Send",
    closeChat: "Close Guide",
    status: "Ready to assist",
    greeting: "Hello! 👋",
    thinking: "AI Assistant is thinking...",
  },
  ar: {
    welcome: "أهلاً بك 👋",
    intro: "أنا مساعدك الذكي لمنصة الدراسة والإنتاجية، كيف يمكنني مساعدتك؟",
    prompt: "ما الذي تبحث عنه اليوم؟ (رياضيات، ملفات PDF، أبحاث، دراسة)",
    returning: "أهلاً بعودتك مجدداً! 👋",
    returningPrompt: "هل أنت مستعد لمواصلة الدراسة والتحليل؟",
    askAiBtn: "اسأل الذكاء الاصطناعي",
    pdfBtn: "أدوات PDF",
    mathBtn: "حل المعادلات",
    studyBtn: "أدوات الدراسة",
    researchBtn: "البحث الأكاديمي",
    allToolsBtn: "جميع الأدوات",
    inputPlaceholder: "اكتب سؤالك أو ابحث عن أداة...",
    sendBtn: "إرسال",
    closeChat: "إغلاق",
    status: "جاهز للمساعدة",
    greeting: "مرحباً! 👋",
    thinking: "المساعد الذكي يفكر...",
  },
  tr: {
    welcome: "Hoş geldiniz 👋",
    intro: "Ben sizin yapay zeka asistanınızım, size nasıl yardımcı olabilirim?",
    prompt: "Bugün neye ihtiyacınız var? (Matematik, PDF, Araştırma, Dersler)",
    returning: "Tekrar hoş geldiniz! 👋",
    returningPrompt: "Kaldığınız yerden devam etmeye hazır mısınız?",
    askAiBtn: "Yapay Zekaya Sor",
    pdfBtn: "PDF Araçları",
    mathBtn: "Matematik Çözücü",
    studyBtn: "Ders Araçları",
    researchBtn: "Akademik Araştırma",
    allToolsBtn: "Tüm Kategoriler",
    inputPlaceholder: "Bir soru sorun veya bir araç arayın...",
    sendBtn: "Gönder",
    closeChat: "Kapat",
    status: "Yardıma hazır",
    greeting: "Merhaba! 👋",
    thinking: "Yapay zeka düşünüyor...",
  },
};

function detectUserLanguage(text: string): AssistantLanguage {
  const trimmed = text.trim();
  if (!trimmed) return "ku";
  if (/[çğıöşüÇĞİÖŞÜ]/.test(trimmed)) return "tr";
  if (/[ەێڵڕڤۆژچپگ]/.test(trimmed) || /سڵاڤ|سلاڤ|چەوا|باشی|سوپاس|پوختە|مامۆستا|کورد/.test(trimmed)) return "ku";
  if (/[ىئؤءةثصضطظذ]/.test(trimmed) || /مرحبا|أهلا|شكرا|كيف|ما هو|أريد/.test(trimmed)) return "ar";
  const arabicScriptCount = (trimmed.match(/[\u0600-\u06FF]/g) || []).length;
  const latinCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
  if (latinCount > arabicScriptCount) return "en";
  return "ku";
}

const WELCOME_NAVIGATOR_SYSTEM_PROMPT = `تو ڕێبەر، ناسێنەر و یاریدەدەرێ زیرەک و فەرمیێ پلاتفۆرمی "Las AI" (لاس AI) یە.
ئەرکێ تە ئەوە کو بەرسڤا هەمی پرسیارێن بەکارهێنەران بدەی ب شێوەیەکێ زۆر جوان، ڕێزدار، هاندەرانە و پڕ لە زانیاری، و ئامراز و خزمەتگوزاریێن "Las AI" بۆ بەکارهێنەران پێناسە و ڕوون بکەی.

🌐 یاسایێ زمانێ بەرسڤدانا (زۆر گرنگ و بنەڕەتی):
- هەمی دەمێ و ب شێوەیەکێ بنەڕەتی ب زمانێ کوردیا بادینی (کرمانجیا ژۆرین/بەهدینی) بەرسڤ بدە. هەرگیز ب سۆرانی نەنڤیسە.
- ئەگەر پرسیار ب ئینگلیزی هاتبێت، ئینگلیزی وەلام بدە.
- ئەگەر پرسیار ب عەرەبی هاتبێت، عەرەبی وەلام بدە.
- ئەگەر پرسیار ب تورکی هاتبێت، تورکی وەلام بدە.
- بۆ هەر زمانێکی دیکەی یان هەر پرسیارەکا کوردی، ب کوردیا بادینی بەرسڤ بدە (نە ب سۆرانی).

📝 یاسایێ نڤیسینا بادینی:
بکارهێنانا وشێن بادینی وەکی (هەی، نینە، ئەڤە، ئەو، چەوا، چ، کیژان، چما، ژ بەر هندێ، دگەل، بێژە، دکەم، دکەی، دکەت، نڤیسین، خواندن، هاریکاری، فێرکاری، قوتابی/خواندکار، مامۆستا، ئەز، تو، ئەو، ئەم، هون) پێشخستن بکە. ژ سۆرانی ب تەواوی دوور بکەڤە.

👑 یاسایێ بەرسڤدانا سڵاڤێ:
هەر کاتێ بەکارهێنەر گوتی "سڵاڤ" یان "سلاڤ" یان دەستپێکا سڵاڤکرنێ کر، بەرسڤێ ب «سڵاڤ ل سەرچاڤان» (ب وشەیا ل سەرچاڤان) دەست پێ بکە و پاشان بە شێوەیەکی زۆر دۆستانە تەواوی بکە و بێژە ئەز هاریکارێ تە یێ Las AI مە.

👑 یاسایێ نەگۆڕ و ڕەهایێ وەڵامدانەوە دەربارەی مامۆستا سەنگەر یان دامەزرێنەر:
تەنێ و بتایبەت کاتێ پرسیار ڕاستەوخۆ دەربارەی کەسایەتییا "مامۆستا سەنگەر"، "سەنگەر"، "دامەزرێنەر"، "خاوەنێ وێبسایتێ/پلاتفۆرمێ"، "دروستکەرێ پلاتفۆرمێ"، یان "کێ ئەڤ وێبسایتە دروستکریە" هاتە کرن، دەستبەجێ و ڕاستەوخۆ دەقا خوارەوە وەکی خۆ بنڤیسە:
"${SANGAR_FOUNDER_TEXT}"

⚠️ ئاگادارییا زۆر گرنگ: ئەگەر بەکارهێنەری گۆت "من دڤێت ڤەکۆلینەکێ دروست بکەم" یان پرسیار ل سەر دروستکرنا راپۆرتێ، تێزێ، هاوکێشەیێ، ئەکاونتێ یان هەر بابەتەکێ دی کر، ئەڤە بەرسڤا مامۆستا سەنگەر نینە! بەڵکو ب کوردییا بادینی ڕێنمایی و هاریکاریا وی بکە کا چەوا بابەتێ خۆ دەست پێ بکەت و ئامرازێن فەکۆلین و نڤیسینێ بۆ پێشنیار بکە.

یاسایێن گرنگ یێن پێشنیارکرنا ئامرازەکان بەپێی داواکاریی بەکارهێنەر:
1. ئەگەر بەکارهێنەر داوای فێربوونا ئینگلیزی، زمانی ئینگلیزی، ڕاهێنان یان پرسیار و فێربوون کرد: دەستبەجێ و ب شێوەیەکێ گەرم پێشنیارا پشکا تایبەت و فەرمی بکە د بەشێ «هاریکارێن خواندنێ» دا ب ناڤێ (فێربوونا زمانی ئینگلیزی یا ڕۆژانە / Daily English Learning Hub) کو پێکدهێت ژ پرسیار و تاقیکرنێن ئاست بەرز، پەیڤ و زاراڤێن نوو، ئاخافتن و دیالۆگ، ڕێزمان، و مامۆستایێ ژیر (AI Tutor)، و بێژە دشێی ڕاستەوخۆ ل خوارێ کلیک ل سەر دوگمەیێ "فێربوونا زمانی ئینگلیزی" بکەی!
2. ئەگەر بەکارهێنەر داوای تێست، پشکنین، چێککرنی ڤەکۆلین یان دەق کرد: دەستبەجێ باسی ئامرازەکانی (پشکنینا نڤیسینا AI / Test AI) و (پشکنینا دزیکرنا ئەدەبی / Plagiarism) و (مرۆڤایەتیکرن / Humanizer) بکە.
3. ئەگەر داوای سەرچاوە و سایتەیشن کرد: باسی (سایتەیشنا ڤەکۆلینێ Citation Generator) و (سایتەیشن ب DOI) بکە.
4. ئەگەر داوای کورتکردنەوە و پوختەکردن کرد: باسی (پوختەکرنا مەلزەما Summarizer) یان (پوختەکرنا پەڕاوێ زانستی Paper Summarizer) بکە.
5. ئەگەر داوای بیرکاری، هاوکێشە یان شیکاری کرد: باسی (شیکارکەرێ بیرکاریێ Math Solver) و (دەستکاریکەرێ LaTeX) بکە.
6. ئەگەر داوای ڤیدیۆ یان داگرتن کرد: باسی (داگرتنا ڤیدیۆیا Video Downloader) یان (گۆڕینا فۆرماتێ ڤیدیۆیێ) بکە.
7. ئەگەر داوای PDF کرد: باسی (گۆڕینا PDF بۆ Word) و (پێکڤە بەستنا PDF) بکە.

بەرسڤێن خۆ کورت، گەرم، ڕێزدار، زمانپاراو و هاندەرانە بدە!`;

interface ToolMeta {
  id: string;
  labels: Record<AssistantLanguage, string>;
}

const TOOL_META_MAP: Record<string, ToolMeta> = {
  // English Learning Hub
  english_learning: {
    id: "english_learning",
    labels: {
      ku: "فێربوونا زمانی ئینگلیزی (English Learning)",
      en: "Daily English Learning",
      ar: "تعلم اللغة الإنجليزية اليومي",
      tr: "Günlük İngilizce Öğrenimi",
    },
  },

  // Video tools
  video_downloader: {
    id: "video_downloader",
    labels: {
      ku: "داگرتنا ڤیدیۆیا (Video Downloader)",
      en: "Video Downloader",
      ar: "تحميل الفيديو (Video Downloader)",
      tr: "Video İndirici (Video Downloader)",
    },
  },
  video_converter: {
    id: "video_converter",
    labels: {
      ku: "گۆڕینا فۆرماتێ ڤیدیۆیێ (Video Converter)",
      en: "Video Converter",
      ar: "محول صيغ الفيديو (Video Converter)",
      tr: "Video Dönüştürücü (Video Converter)",
    },
  },
  video_compressor: {
    id: "video_compressor",
    labels: {
      ku: "کێمکرنا قەبارێ ڤیدیۆیێ (Video Compressor)",
      en: "Video Compressor",
      ar: "ضغط حجم الفيديو (Video Compressor)",
      tr: "Video Sıkıştırıcı (Video Compressor)",
    },
  },


  // Study planner & university
  planner: {
    id: "planner",
    labels: {
      ku: "پلاندانەرێ خواندنێ (Study Planner)",
      en: "Study Planner",
      ar: "مخطط الدراسة (Study Planner)",
      tr: "Çalışma Planlayıcı (Study Planner)",
    },
  },
  study_group: {
    id: "study_group",
    labels: {
      ku: "ژوورا خواندنا ب کۆم (Study Room)",
      en: "Study Group Room",
      ar: "غرفة الدراسة الجماعية",
      tr: "Çalışma Odası (Study Room)",
    },
  },

  // Math & LaTeX
  solver: {
    id: "solver",
    labels: {
      ku: "شیکارکەرێ بیرکاریێ (Math Solver)",
      en: "Math Solver",
      ar: "حل المعادلات الرياضية (Math Solver)",
      tr: "Matematik Çözücü (Math Solver)",
    },
  },
  latex_editor: {
    id: "latex_editor",
    labels: {
      ku: "دەستکاریکەرێ LaTeX (LaTeX Editor)",
      en: "LaTeX Editor",
      ar: "محرر لاتكس (LaTeX Editor)",
      tr: "LaTeX Editörü (LaTeX Editor)",
    },
  },
  math2word: {
    id: "math2word",
    labels: {
      ku: "هاوکێشەی بیرکاری بۆ Word",
      en: "Math to Word",
      ar: "تحويل الرياضيات إلى Word",
      tr: "Matematik ➔ Word",
    },
  },

  // Summarizer
  summary: {
    id: "summary",
    labels: {
      ku: "کورتکرنا مەلزەما (Summarizer)",
      en: "Study Summarizer",
      ar: "تلخيص المحاضرات (Summarizer)",
      tr: "Ders Özeti Çıkarıcı (Summarizer)",
    },
  },
  paper_summarizer: {
    id: "paper_summarizer",
    labels: {
      ku: "پوختەکرنا ڤەکۆلینێن زانستی (Paper Summarizer)",
      en: "Research Paper Summarizer",
      ar: "تلخيص الأوراق العلمية (Paper Summarizer)",
      tr: "Makale Özeti (Paper Summarizer)",
    },
  },

  // PDF Suite
  pdf_to_word: {
    id: "pdf_to_word",
    labels: {
      ku: "گوهۆڕینا PDF بۆ Word",
      en: "PDF ➔ Word",
      ar: "تحويل PDF إلى Word",
      tr: "PDF ➔ Word",
    },
  },
  word_to_pdf: {
    id: "word_to_pdf",
    labels: {
      ku: "گوهۆڕینا Word بۆ PDF",
      en: "Word ➔ PDF",
      ar: "تحويل Word إلى PDF",
      tr: "Word ➔ PDF",
    },
  },
  pdf_merge: {
    id: "pdf_merge",
    labels: {
      ku: "پێکڤە گرێدانا PDF (PDF Merge)",
      en: "Merge PDF",
      ar: "دمج ملفات PDF (Merge)",
      tr: "PDF Birleştir (Merge)",
    },
  },
  pdf_protect: {
    id: "pdf_protect",
    labels: {
      ku: "پاراستنا PDF (Password)",
      en: "Protect PDF",
      ar: "حماية PDF بكلمة سر",
      tr: "PDF Kilitle",
    },
  },
  pdf_compress: {
    id: "pdf_compress",
    labels: {
      ku: "کێمکرنا قەبارێ PDF (Compress)",
      en: "Compress PDF",
      ar: "ضغط حجم PDF",
      tr: "PDF Sıkıştır",
    },
  },
  pdf_split: {
    id: "pdf_split",
    labels: {
      ku: "پارچەکرنا PDF (PDF Split)",
      en: "Split PDF",
      ar: "تقسيم ملفات PDF",
      tr: "PDF Ayır",
    },
  },

  // OCR & Handwriting
  ocr: {
    id: "ocr",
    labels: {
      ku: "دەرئینانا دەقی ژ وێنەی (OCR)",
      en: "OCR Text Extractor",
      ar: "استخراج النصوص من الصور (OCR)",
      tr: "OCR Metin Çıkarıcı",
    },
  },
  handwriting: {
    id: "handwriting",
    labels: {
      ku: "نڤیسینا دەستی (Handwriting)",
      en: "Handwriting Generator",
      ar: "تحويل إلى خط يد (Handwriting)",
      tr: "El Yazısı Dönüştürücü",
    },
  },

  // AI detector & Plagiarism
  humanize: {
    id: "humanize",
    labels: {
      ku: "مرۆڤایەتیکرن (Humanizer AI)",
      en: "AI Humanizer",
      ar: "أنسنة نصوص الذكاء الاصطناعي",
      tr: "Yapay Zeka İnsancıllaştırıcı",
    },
  },
  testai: {
    id: "testai",
    labels: {
      ku: "ئاشکراکەرێ AI (AI Detector)",
      en: "AI Content Detector",
      ar: "كاشف الذكاء الاصطناعي (AI Detector)",
      tr: "Yapay Zeka Tespit Edici",
    },
  },
  testplagiarism: {
    id: "testplagiarism",
    labels: {
      ku: "پشکنینا دزیکرنا ئەدەبی (Plagiarism)",
      en: "Plagiarism Checker",
      ar: "فحص الانتحال الأدبي (Plagiarism)",
      tr: "İntihal Denetleyici (Plagiarism)",
    },
  },

  // Research & Citations
  citation_generator: {
    id: "citation_generator",
    labels: {
      ku: "سایتەیشنا ڤەکۆلینێ (Citation)",
      en: "Citation Generator",
      ar: "توليد المراجع الأكاديمية (Citation)",
      tr: "Kaynak Gösterici (Citation)",
    },
  },
  doi_citation: {
    id: "doi_citation",
    labels: {
      ku: "سایتەیشن ب DOI (DOI Citation)",
      en: "DOI ➔ Citation",
      ar: "توليد المراجع بواسطة DOI",
      tr: "DOI ➔ Kaynak",
    },
  },
  research_assistant: {
    id: "research_assistant",
    labels: {
      ku: "هاریکارێ ڤەکۆلینێن ئەکادیمی",
      en: "Research Assistant",
      ar: "مساعد البحث الأكاديمي",
      tr: "Araştırma Asistanı",
    },
  },

  // Statistics
  statistics_lab: {
    id: "statistics_lab",
    labels: {
      ku: "تاقیگەها ئامارێ (Statistics Lab)",
      en: "Statistics Lab",
      ar: "مختبر الإحصاء (Statistics Lab)",
      tr: "İstatistik Laboratuvarı (Statistics Lab)",
    },
  },

  // Translation & Grammar
  translator: {
    id: "translator",
    labels: {
      ku: "وەرگێڕێ زیرەک (Translator)",
      en: "Smart Translator",
      ar: "المترجم الذكي (Translator)",
      tr: "Akıllı Çevirmen (Translator)",
    },
  },
  grammar: {
    id: "grammar",
    labels: {
      ku: "ڕاستڤەکەرێ ڕێزمانی (Grammar)",
      en: "Grammar Corrector",
      ar: "التدقيق اللغوي والإملائي (Grammar)",
      tr: "Dilbilgisi Düzeltici (Grammar)",
    },
  },

  // Business
  invoice_tool: {
    id: "invoice_tool",
    labels: {
      ku: "دروستکەرێ فاکتورا (Invoice)",
      en: "Invoice Generator",
      ar: "إنشاء الفواتير (Invoice)",
      tr: "Fatura Oluşturucu (Invoice)",
    },
  },
  profit_calc: {
    id: "profit_calc",
    labels: {
      ku: "ژمێریارێ مووچە و قازانجی",
      en: "Salary & Profit Calculator",
      ar: "حاسبة الرواتب والأرباح",
      tr: "Maaş ve Kâr Hesaplayıcı",
    },
  },
  currency_calc: {
    id: "currency_calc",
    labels: {
      ku: "گۆڕەرێ دراڤی (Currency)",
      en: "Currency Converter",
      ar: "محول العملات (Currency)",
      tr: "Döviz Çevirici (Currency)",
    },
  },
  document_forensics: {
    id: "document_forensics",
    labels: {
      ku: "دادوەرییا بەڵگەناما (Document Forensics)",
      en: "Document Forensics",
      ar: "التحقيق الجنائي للمستندات",
      tr: "Belge Adli Analiz",
    },
  },
  abstract_generator: {
    id: "abstract_generator",
    labels: {
      ku: "دروستکەرێ Abstract (پوختەیا توێژینەوە)",
      en: "Abstract Generator",
      ar: "إنشاء الملخص الأكاديمي (Abstract)",
      tr: "Özet Oluşturucu (Abstract)",
    },
  },
  lit_review: {
    id: "lit_review",
    labels: {
      ku: "پێداچوونەڤەیا ئەدەبیات (Literature Review)",
      en: "Literature Review Assistant",
      ar: "مراجعة الأدبيات السابقة (Lit Review)",
      tr: "Literatür Taraması (Lit Review)",
    },
  },
  research_question: {
    id: "research_question",
    labels: {
      ku: "پرسیار و گریمانێن توێژینەوەیێ",
      en: "Research Questions & Hypotheses",
      ar: "أسئلة وفرضيات البحث",
      tr: "Araştırma Soruları ve Hipotezler",
    },
  },
  methodology_assistant: {
    id: "methodology_assistant",
    labels: {
      ku: "مێتۆدۆلۆژیایا توێژینەوەیێ (Methodology)",
      en: "Methodology Assistant",
      ar: "منهجية البحث العلمي (Methodology)",
      tr: "Metodoloji Asistanı",
    },
  },
  bibtex_generator: {
    id: "bibtex_generator",
    labels: {
      ku: "دروستکەرێ BibTeX",
      en: "BibTeX Generator",
      ar: "إنشاء مراجع BibTeX",
      tr: "BibTeX Oluşturucu",
    },
  },
  latex_word: {
    id: "latex_word",
    labels: {
      ku: "LaTeX ➔ Word Converter",
      en: "LaTeX to Word",
      ar: "تحويل LaTeX إلى Word",
      tr: "LaTeX ➔ Word",
    },
  },
  grapher: {
    id: "grapher",
    labels: {
      ku: "وێنەکێشێ نەخشەیان (Grapher)",
      en: "Function & Graph Plotter",
      ar: "رسم الدوال البيانية (Grapher)",
      tr: "Grafik Çizici (Grapher)",
    },
  },
  grader: {
    id: "grader",
    labels: {
      ku: "نمرەدانا نڤیسینێ و ڕاپۆرتێ (Essay Grader)",
      en: "Essay & Paper Grader",
      ar: "تقييم المقالات والبحوث",
      tr: "Makale Puanlayıcı",
    },
  },
  audio_sum: {
    id: "audio_sum",
    labels: {
      ku: "دەنگ بۆ نڤیسین (Voice to Text)",
      en: "Voice to Text & Summarizer",
      ar: "تلخيص التسجيلات الصوتية",
      tr: "Ses Özeti Çıkarıcı",
    },
  },
  qr_generator: {
    id: "qr_generator",
    labels: {
      ku: "دروستکەرێ بارکۆد و QR Code",
      en: "QR Code Generator",
      ar: "إنشاء رمز QR والباركود",
      tr: "QR Kod Oluşturucu",
    },
  },
  about: {
    id: "about",
    labels: {
      ku: "دەربارەی مە",
      en: "About Us",
      ar: "من نحن (دەربارەی مە)",
      tr: "Hakkımızda",
    },
  },
};

function normalizeText(text: string): string {
  return (text || "")
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/ك/g, "ک")
    .replace(/ي/g, "ی")
    .replace(/ى/g, "ی")
    .replace(/ھ/g, "ه")
    .replace(/ە/g, "ه")
    .replace(/ۆ/g, "و")
    .replace(/ێ/g, "ی")
    .replace(/ڤ/g, "ف");
}

function matchKeywords(normText: string, rawText: string, keywords: string[]): boolean {
  for (const kw of keywords) {
    if (!kw) continue;
    const lowerKw = kw.toLowerCase();
    if (rawText.includes(lowerKw)) return true;
    const normKw = normalizeText(kw);
    if (normKw && normText.includes(normKw)) return true;
  }
  return false;
}

function extractToolRecommendations(
  combinedText: string,
  lang: AssistantLanguage,
  includeDefaultFallback = true
): ToolRecommendation[] {
  const norm = normalizeText(combinedText);
  const rawLower = (combinedText || "").toLowerCase();

  // If the query/message is about Mamosta Sangar or founder, only recommend "دەربارەی مە"
  if (isFounderQuery(combinedText)) {
    return [{ label: "دەربارەی مە", toolId: "about" }];
  }

  const recs: ToolRecommendation[] = [];
  const added = new Set<string>();

  const add = (toolId: string) => {
    if (!added.has(toolId)) {
      added.add(toolId);
      const meta = TOOL_META_MAP[toolId];
      if (meta) {
        const label = meta.labels[lang] || meta.labels.ku || toolId;
        recs.push({ label, toolId });
      }
    }
  };

  // 0. Top-Priority Intent: English Learning, English Practice, Grammar, Vocabulary, IELTS, Daily Lessons
  const isEnglishLearning =
    norm.includes("ئینگلیز") ||
    norm.includes("ئنگلیز") ||
    norm.includes("فێربوونا ئینگلیز") ||
    norm.includes("فێربوونی ئینگلیز") ||
    norm.includes("فێری ئینگلیزی") ||
    norm.includes("فێری ئنگلیزی") ||
    norm.includes("زمانێ ئینگلیزی") ||
    norm.includes("زمانی ئینگلیزی") ||
    norm.includes("فێربوون") ||
    norm.includes("فێربوونا زمان") ||
    rawLower.includes("english") ||
    rawLower.includes("learn english") ||
    rawLower.includes("ielts") ||
    rawLower.includes("toefl") ||
    norm.includes("انجلیزی") ||
    norm.includes("إنجلیزی") ||
    norm.includes("انجلیزیة") ||
    norm.includes("إنجلیزیة") ||
    rawLower.includes("ingilizce") ||
    norm.includes("پەیڤێن ئینگلیزی") ||
    norm.includes("زاراڤێن ئینگلیزی") ||
    norm.includes("تاقیکرنا ئینگلیزی");

  if (isEnglishLearning) {
    add("english_learning");
    add("grammar");
    add("translator");
    add("audio_sum");
    return recs.slice(0, 4);
  }

  // 1. High-Priority Intent: AI Testing, Plagiarism, Detection, Humanizer
  const isTestingOrPlag =
    norm.includes("تیست") ||
    norm.includes("تێست") ||
    norm.includes("پشکنی") ||
    norm.includes("پشکنین") ||
    norm.includes("چیک") ||
    norm.includes("چێک") ||
    rawLower.includes("test") ||
    rawLower.includes("check") ||
    rawLower.includes("detect") ||
    norm.includes("اشکرا") ||
    norm.includes("ئاشکرا") ||
    norm.includes("فحص") ||
    norm.includes("پلاجیار") ||
    rawLower.includes("plagiarism") ||
    norm.includes("دزیکرن") ||
    norm.includes("دزینی") ||
    norm.includes("انتحال") ||
    norm.includes("مروف") ||
    norm.includes("مرۆڤ") ||
    rawLower.includes("humanize") ||
    norm.includes("هومانایز") ||
    norm.includes("هۆمانایز");

  if (isTestingOrPlag) {
    if (norm.includes("پلاجیار") || rawLower.includes("plagiarism") || norm.includes("دزی") || norm.includes("انتحال")) {
      add("testplagiarism");
      add("testai");
      add("humanize");
      add("document_forensics");
    } else if (norm.includes("مروف") || norm.includes("مرۆڤ") || rawLower.includes("humanize") || norm.includes("هومانایز") || norm.includes("هۆمانایز")) {
      add("humanize");
      add("testai");
      add("testplagiarism");
    } else {
      // General testing/checking for research, thesis, text or AI content
      add("testai");
      add("testplagiarism");
      add("humanize");
      if (norm.includes("فەکولین") || norm.includes("تویژین") || rawLower.includes("research") || rawLower.includes("paper") || rawLower.includes("thesis")) {
        add("paper_summarizer");
      } else {
        add("document_forensics");
      }
    }
    return recs.slice(0, 4);
  }

  // 2. Citation / References / DOI
  const isCitation =
    norm.includes("سایتەیش") ||
    rawLower.includes("citation") ||
    rawLower.includes("doi") ||
    norm.includes("سەرچاوە") ||
    norm.includes("سەرچاوەی") ||
    rawLower.includes("bibtex") ||
    rawLower.includes("apa") ||
    norm.includes("مراجع") ||
    norm.includes("توثيق");

  if (isCitation) {
    add("citation_generator");
    add("doi_citation");
    add("bibtex_generator");
    add("research_assistant");
    return recs.slice(0, 4);
  }

  // 3. Abstract / Methodology / Literature Review
  if (norm.includes("ابستراکت") || norm.includes("ئەبستراکت") || rawLower.includes("abstract")) {
    add("abstract_generator");
    add("paper_summarizer");
    add("research_assistant");
    return recs.slice(0, 4);
  }
  if (norm.includes("میتود") || norm.includes("مێتۆد") || rawLower.includes("methodology") || norm.includes("گریمانە") || rawLower.includes("hypothesis")) {
    add("methodology_assistant");
    add("research_question");
    add("research_assistant");
    return recs.slice(0, 4);
  }
  if (norm.includes("ادبیات") || norm.includes("ئەدەبیات") || rawLower.includes("lit review") || rawLower.includes("literature")) {
    add("lit_review");
    add("paper_summarizer");
    add("research_assistant");
    return recs.slice(0, 4);
  }

  // 4. Video Downloader / Converter / Compressor / Quiz
  const isVideo =
    norm.includes("فیدیو") ||
    norm.includes("ڤیدیو") ||
    rawLower.includes("video") ||
    norm.includes("یوتوب") ||
    rawLower.includes("youtube") ||
    norm.includes("تیکتوک") ||
    rawLower.includes("tiktok") ||
    rawLower.includes("mp4");

  if (isVideo) {
    if (norm.includes("داگرت") || rawLower.includes("download") || norm.includes("تحمیل")) {
      add("video_downloader");
      add("video_converter");
      add("video_compressor");
    } else if (norm.includes("فورمات") || norm.includes("گورین") || norm.includes("گوهورین") || rawLower.includes("convert")) {
      add("video_converter");
      add("video_compressor");
      add("video_downloader");
    } else if (norm.includes("قەبار") || norm.includes("کیمکرن") || rawLower.includes("compress")) {
      add("video_compressor");
      add("video_converter");
      add("video_downloader");
    } else {
      add("video_downloader");
      add("video_converter");
      add("video_compressor");
    }
    return recs.slice(0, 3);
  }

  // 5. PDF Tools
  const isPdf =
    norm.includes("pdf") ||
    norm.includes("پیداف") ||
    norm.includes("پی دی ایف") ||
    norm.includes("پی دی ئیف");

  if (isPdf) {
    if (norm.includes("word") || norm.includes("وۆرد") || norm.includes("وورد")) {
      add("pdf_to_word");
      add("pdf_merge");
      add("pdf_compress");
    } else if (norm.includes("پیکفە") || norm.includes("کومکرن") || rawLower.includes("merge")) {
      add("pdf_merge");
      add("pdf_split");
      add("pdf_compress");
    } else if (norm.includes("پاراستن") || norm.includes("قفل") || rawLower.includes("protect") || rawLower.includes("password")) {
      add("pdf_protect");
      add("pdf_merge");
    } else if (norm.includes("قەبار") || norm.includes("کیمکرن") || rawLower.includes("compress")) {
      add("pdf_compress");
      add("pdf_split");
      add("pdf_to_word");
    } else if (norm.includes("پارچە") || rawLower.includes("split")) {
      add("pdf_split");
      add("pdf_merge");
      add("pdf_to_word");
    } else {
      add("pdf_to_word");
      add("pdf_merge");
      add("pdf_compress");
      add("pdf_protect");
    }
    return recs.slice(0, 4);
  }

  // 6. Math & Equation Tools
  const isMath =
    norm.includes("بیرکاری") ||
    rawLower.includes("math") ||
    norm.includes("هاوکیشە") ||
    norm.includes("هاوکێشە") ||
    norm.includes("معادلة") ||
    norm.includes("شیکار") ||
    rawLower.includes("solver") ||
    norm.includes("تەواوکاری") ||
    rawLower.includes("integral") ||
    norm.includes("داتاشین") ||
    rawLower.includes("derivative") ||
    rawLower.includes("latex") ||
    norm.includes("لاتیکس") ||
    norm.includes("لاتێکس") ||
    norm.includes("نەخشە") ||
    rawLower.includes("graph");

  if (isMath) {
    if (rawLower.includes("latex") || norm.includes("لاتیکس") || norm.includes("لاتێکس")) {
      add("latex_editor");
      add("latex_word");
      add("solver");
    } else if (norm.includes("word") || norm.includes("وۆرد")) {
      add("math2word");
      add("latex_word");
      add("solver");
    } else if (norm.includes("گراف") || norm.includes("نەخشە") || rawLower.includes("graph")) {
      add("grapher");
      add("solver");
      add("latex_editor");
    } else {
      add("solver");
      add("latex_editor");
      add("math2word");
      add("grapher");
    }
    return recs.slice(0, 4);
  }

  // 7. Translation & Grammar
  const isTranslate = norm.includes("وەرگیر") || norm.includes("وەرگێڕ") || norm.includes("ترجمە") || rawLower.includes("translate") || rawLower.includes("translation");
  const isGrammar = norm.includes("ریزمان") || norm.includes("ڕێزمان") || norm.includes("ڕاستنفیس") || norm.includes("ڕاستنڤیس") || rawLower.includes("grammar") || norm.includes("هەلە") || norm.includes("هەڵە") || norm.includes("شاشی");

  if (isTranslate || isGrammar) {
    if (isTranslate) {
      add("translator");
      add("grammar");
      add("humanize");
    } else {
      add("grammar");
      add("translator");
      add("grader");
      add("humanize");
    }
    return recs.slice(0, 4);
  }

  // 8. OCR / Handwriting / Audio
  if (norm.includes("دەنگ") || rawLower.includes("audio") || rawLower.includes("voice") || norm.includes("صوت")) {
    add("audio_sum");
    add("summary");
    add("chat");
    return recs.slice(0, 4);
  }

  if (norm.includes("ocr") || norm.includes("دەستنووس") || norm.includes("دەستنڤیس") || norm.includes("خەتی دەست") || norm.includes("وێنە بۆ دەق")) {
    add("ocr");
    add("handwriting");
    add("summary");
    return recs.slice(0, 4);
  }

  // 9. Statistics
  if (norm.includes("ئامار") || rawLower.includes("statistics") || rawLower.includes("spss") || rawLower.includes("regression") || rawLower.includes("correlation") || norm.includes("احصاء")) {
    add("statistics_lab");
    add("research_assistant");
    add("grapher");
    return recs.slice(0, 4);
  }

  // 10. Business & Financial
  if (norm.includes("فاکتور") || norm.includes("فاکتوور") || norm.includes("فاتور") || rawLower.includes("invoice") || norm.includes("مووچە") || norm.includes("قازانج") || rawLower.includes("profit") || norm.includes("دراف") || norm.includes("دراو") || rawLower.includes("currency")) {
    add("invoice_tool");
    add("profit_calc");
    add("currency_calc");
    add("salary_calc");
    return recs.slice(0, 4);
  }

  // 11. Forensics & QR
  if (norm.includes("ساختە") || norm.includes("تزویر") || norm.includes("بەلگەنام") || norm.includes("بەڵگەنام") || rawLower.includes("forensic") || rawLower.includes("tamper") || rawLower.includes("qr") || norm.includes("کیوئار")) {
    add("document_forensics");
    add("qr_generator");
    add("testai");
    return recs.slice(0, 4);
  }

  // 12. University & Study Planning
  if (norm.includes("زانکو") || norm.includes("زانکۆ") || rawLower.includes("zanko") || norm.includes("پلان") || rawLower.includes("planner")) {
    add("planner");
    add("study_group");
    add("summary");
    return recs.slice(0, 4);
  }

  // 13. General Study & Lecture Summary
  if (norm.includes("مەلزەم") || norm.includes("کورتکردنەوە") || norm.includes("کورتکرن") || norm.includes("پوختەی وانە")) {
    add("summary");
    add("paper_summarizer");
    add("audio_sum");
    return recs.slice(0, 4);
  }

  // 14. General Research / Thesis
  const isResearch = matchKeywords(norm, rawLower, [
    "فەکولین",
    "فەکۆلین",
    "ڤەکۆلین",
    "ڤەکولین",
    "تویژین",
    "توێژین",
    "تۆژینەوە",
    "تویژینەوە",
    "بحث",
    "بحوث",
    "دراسة",
    "تێز",
    "تیز",
    "اطروحة",
    "رسالة",
    "research",
    "thesis",
    "dissertation",
    "paper",
  ]);

  if (isResearch) {
    add("research_assistant");
    add("paper_summarizer");
    add("citation_generator");
    add("testplagiarism");
    return recs.slice(0, 4);
  }

  // Default Fallback
  if (!includeDefaultFallback) {
    return [];
  }
  add("solver");
  add("summary");
  add("pdf_to_word");
  add("testai");
  return recs.slice(0, 4);
}

function buildSmartFallbackReply(
  query: string,
  lang: AssistantLanguage,
  matchedRecs: ToolRecommendation[],
  errorReason?: string
): { text: string; recommendations: ToolRecommendation[] } {
  const raw = (query || "").trim().toLowerCase();
  const norm = normalizeText(query);

  const isGreeting =
    /^(سلاڤ|سڵاڤ|سلام|slaw|slav|hi|hello|hey|مرحبا|أهلا|اهلا|merhaba|selam)[\s!?.،؟]*$/i.test(
      raw
    ) ||
    raw === "سلاڤ" ||
    raw === "سڵاڤ";

  const isHowAreYou =
    norm.includes("چدکەی") ||
    norm.includes("چاوانی") ||
    norm.includes("چۆنی") ||
    norm.includes("چەوایی") ||
    norm.includes("باشی") ||
    raw.includes("how are you") ||
    raw.includes("كيف حالك") ||
    raw.includes("شلونك") ||
    raw.includes("nasılsın");

  if (isGreeting) {
    const text =
      lang === "en"
        ? "Hello! 👋 Welcome to Las AI. Tell me what you're working on (math, PDF, research, translation, or studying) and I'll help you right away."
        : lang === "ar"
        ? "مرحباً بك في Las AI! 👋 كيف يمكنني مساعدتك اليوم؟ يمكنك طرح سؤالك أو اختيار إحدى الأدوات أدناه."
        : lang === "tr"
        ? "Merhaba! 👋 Las AI'ye hoş geldiniz. Size nasıl yardımcı olabilirim?"
        : "سڵاڤ ل سەرچاڤان! 👋 ب خێر بێی بۆ پلاتفۆرما Las AI. تە دڤێت چ بکەی یان چ پرسیار ل سەر خواندن و فەکۆلینێ هەیە؟";
    return {
      text,
      recommendations: matchedRecs.length > 0 ? matchedRecs : extractToolRecommendations("", lang, true),
    };
  }

  if (isHowAreYou) {
    const text =
      lang === "en"
        ? "I'm doing great and ready to help you! 😊 What task or question would you like help with today?"
        : lang === "ar"
        ? "أنا بخير تماماً ومستعد لمساعدتك! 😊 ما الذي ترغب في العمل عليه اليوم؟"
        : lang === "tr"
        ? "Harikayım, size yardımcı olmaya hazırım! 😊 Bugün ne üzerinde çalışmak istersiniz?"
        : "سوپاس، ئەز گەلەک باشم و ئامادەمە هاریکاریا تە بکەم! 😊 تە دڤێت ئەڤڕۆ چ کار یان خواندنێ ب ڕێڤە ببەین؟";
    return { text, recommendations: matchedRecs };
  }

  if (matchedRecs.length > 0) {
    const names = matchedRecs.map((r) => r.label).join("، ");
    const text =
      lang === "en"
        ? `For "${query}", these tools on Las AI match best: ${names}. Click any tool below to open it directly.`
        : lang === "ar"
        ? `بخصوص طلبك، هذه أنسب الأدوات المتوفرة في المنصة: ${names}. اضغط على أي أداة لفتحها مباشرة.`
        : lang === "tr"
        ? `İsteğiniz için en uygun araçlar şunlardır: ${names}. Açmak için aşağıdan bir araca tıklayın.`
        : `بۆ داخوازییا تە («${query}»)، ئەڤ ئامرازێن ژێر د گونجاینە: ${names}. کلیک ل سەر هەر ئامرازەکێ بکە دا ڕاستەوخۆ ڤەبیت:`;
    return { text, recommendations: matchedRecs };
  }

  const reasonNote = errorReason ? ` (${errorReason})` : "";
  const text =
    lang === "en"
      ? `The AI chat service is currently unavailable${reasonNote}. Please make sure a valid GEMINI_API_KEY_1 is configured in Cloudflare environment variables, or choose a tool below.`
      : lang === "ar"
      ? `خدمة المحادثة بالذكاء الاصطناعي غير متوفرة حالياً${reasonNote}. يرجى التأكد من إضافة مفتاح GEMINI_API_KEY_1 صالح في إعدادات Cloudflare، أو استخدام الأدوات مباشرة.`
      : lang === "tr"
      ? `Yapay zeka sohbet servisi şu anda kullanılamıyor${reasonNote}. Lütfen Cloudflare ayarlarında geçerli bir GEMINI_API_KEY_1 tanımlı olduğundan emin olun.`
      : `ببورە، خزمەتگوزاریا بەرسڤدانا ڕاستەوخۆ یا AI نۆکە بێ کلیلێ دروست کار ناکەت${reasonNote}. تکایە د ڕێکخستنێن Cloudflare (Variables) دا GEMINI_API_KEY_1 یا نوێ زێدە بکە، یان ئامرازەکێ ژ ژێر هەلبژێرە:`;
  return { text, recommendations: extractToolRecommendations("", lang, true) };
}

function isFounderQuery(q: string): boolean {
  if (!q) return false;
  const raw = q.toLowerCase().trim();
  const normalized = normalizeText(q);

  // 1. Direct mention of Teacher Sangar
  if (
    raw.includes("سەنگەر") ||
    raw.includes("سه‌نگه‌ر") ||
    raw.includes("sangar") ||
    raw.includes("مامۆستا سەنگەر") ||
    raw.includes("ماموستا سەنگەر") ||
    raw.includes("سەنگەر محمد") ||
    raw.includes("سەنگەر محەمەد") ||
    raw.includes("دەربارەی سەنگەر") ||
    raw.includes("دەربارەی مامۆستا") ||
    normalized.includes("سه نگه ر") ||
    normalized.includes("سهنگهر")
  ) {
    return true;
  }

  // 2. Direct mention of Founder / About Us
  if (
    raw.includes("دامەزرێنەر") ||
    raw.includes("دامەزرینەر") ||
    raw.includes("دامەزرێنەری") ||
    raw.includes("دامەزرێنەرێ") ||
    raw.includes("دامەزرێنەران") ||
    raw.includes("founder") ||
    raw === "دەربارەی مە" ||
    raw === "دەربارەی ماڵپەڕ" ||
    raw === "دەربارەی وێبسایت" ||
    raw === "دەربارەی پلاتفۆرم" ||
    raw === "about" ||
    raw === "about us"
  ) {
    return true;
  }

  // 3. Owner / Creator / Developer of the website/platform/app
  if (
    raw.includes("خاوەنێ وێبسایت") ||
    raw.includes("خاوەنی وێبسایت") ||
    raw.includes("خاوەنێ پلاتفۆرم") ||
    raw.includes("خاوەنی پلاتفۆرم") ||
    raw.includes("خاوەنێ ماڵپەڕ") ||
    raw.includes("خاوەنێ مالپەر") ||
    raw.includes("خاوەنی ماڵپەڕ") ||
    raw.includes("خاوەنی مالپەر") ||
    raw.includes("خاوەنێ ئەپ") ||
    raw.includes("خاوەنی ئەپ") ||
    raw.includes("خاوەنێ ئەم وێبسایتە") ||
    raw.includes("خاوەنی ئەم وێبسایتە") ||
    raw.includes("خاوەنێ ئەم پلاتفۆرمە") ||
    raw.includes("خاوەنی ئەم پلاتفۆرمە") ||
    raw.includes("دروستکەرێ پلاتفۆرم") ||
    raw.includes("دروستکەری پلاتفۆرم") ||
    raw.includes("دروستکەرێ وێبسایت") ||
    raw.includes("دروستکەری وێبسایت") ||
    raw.includes("دروستکەرێ ماڵپەڕ") ||
    raw.includes("دروستکەرێ مالپەر") ||
    raw.includes("دروستکەری ماڵپەڕ") ||
    raw.includes("دروستکەری مالپەر") ||
    raw.includes("دروستکەرێ ئەپ") ||
    raw.includes("دروستکەری ئەپ") ||
    raw.includes("دروستکەرێ بەرنامە") ||
    raw.includes("دروستکەری بەرنامە") ||
    raw.includes("دروستکەرێ لاس") ||
    raw.includes("دروستکەری لاس") ||
    raw.includes("چێکەرێ پلاتفۆرم") ||
    raw.includes("چێکەری پلاتفۆرم") ||
    raw.includes("چێکەرێ وێبسایت") ||
    raw.includes("چێکەری وێبسایت") ||
    raw.includes("گەشەپێدەرێ پلاتفۆرم") ||
    raw.includes("گەشەپێدەری پلاتفۆرم") ||
    raw.includes("گەشەپێدەرێ وێبسایت") ||
    raw.includes("گەشەپێدەری وێبسایت")
  ) {
    return true;
  }

  // 4. Questions like "Who made/created this website/platform?"
  // Must have standalone question word "کێ" or "کی" or "who"
  // and must NOT be a user stating an action ("بکەم", "دڤێت", "دکەم", etc.)
  const tokens = raw.split(/[\s,?.!،؟\(\)\[\]{}":;]+/);
  const hasStandaloneWho = tokens.some((w) => w === "کێ" || w === "کی" || w === "who");

  if (hasStandaloneWho) {
    const isUserAction =
      raw.includes("بکەم") ||
      raw.includes("کەم") ||
      raw.includes("دکەم") ||
      raw.includes("دڤێت") ||
      raw.includes("دڤێ") ||
      raw.includes("بکەی") ||
      raw.includes("بکەن") ||
      raw.includes("دکەی") ||
      raw.includes("دکەن") ||
      raw.includes("بکەین") ||
      raw.includes("دکەین");

    if (!isUserAction) {
      const hasCreatedTarget =
        raw.includes("دروستکریە") ||
        raw.includes("دروست کریە") ||
        raw.includes("دروست کری") ||
        raw.includes("دروستکردووە") ||
        raw.includes("چێکریە") ||
        raw.includes("چێ کریە") ||
        raw.includes("چێ کری") ||
        raw.includes("چێکردووە") ||
        raw.includes("made this") ||
        raw.includes("created this") ||
        raw.includes("built this");

      if (hasCreatedTarget) {
        return true;
      }
    }
  }

  return false;
}

export function AiWelcomeAssistant({
  onSelectTool,
  onSelectCategory: _onSelectCategory,
}: {
  onSelectTool: (toolId: string) => void;
  onSelectCategory: (categoryIndex: number) => void;
}) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [lang, _setLang] = useState<AssistantLanguage>("ku");
  const [typedStage, setTypedStage] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [lastUsedTool, setLastUsedTool] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<AssistantMessage[]>([]);

  const [robotAction, setRobotAction] = useState<"intro" | "idle" | "wave">("intro");

  // Handle Initial Entrance Wave -> Idle Float Transition
  useEffect(() => {
    const waveTimer = setTimeout(() => {
      setRobotAction("idle");
    }, 2400);

    return () => clearTimeout(waveTimer);
  }, []);

  const triggerRobotWave = () => {
    if (robotAction === "idle") {
      setRobotAction("wave");
      setTimeout(() => {
        setRobotAction("idle");
      }, 1500);
    }
  };

  const t = LOCALIZED_GREETINGS[lang] || LOCALIZED_GREETINGS.ku;

  // Check returning user state & staged typing entrance
  useEffect(() => {
    try {
      const storedLast = localStorage.getItem("ai_study_last_tool");
      if (storedLast) setLastUsedTool(storedLast);
    } catch (_) {}

    // Staged entrance animation sequence
    const timer1 = setTimeout(() => setTypedStage(1), 350);
    const timer2 = setTimeout(() => setTypedStage(2), 1200);
    const timer3 = setTimeout(() => setTypedStage(3), 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  useEffect(() => {
    if (isChatOpen && chatMessages.length === 0) {
      setChatMessages([
        {
          id: "init_1",
          sender: "ai",
          text:
            lang === "ku"
              ? "سڵاڤ! ئەز دشێم هاریکاریا تە بکەم باشترین ئامراز ببینی ل دویڤ پێدڤیا تە. تە دڤێت چ بکەی یان چ پرسیار هەیە؟"
              : lang === "ar"
              ? "مرحباً! يمكنني مساعدتك في العثور على الأداة المناسبة أو الإجابة على أي سؤال فوراً. ما الذي تريد القيام به؟"
              : lang === "tr"
              ? "Merhaba! İhtiyacınıza en uygun aracı bulmanıza ve tüm sorularınızı yanıtlamaya hazırım. Ne yapmak istiyorsunuz?"
              : "Hello! I can answer your questions and recommend the exact tools you need. What would you like to accomplish today?",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          recommendations: [
            { label: "شیکارکەرێ بیرکاریێ (Math Solver)", toolId: "solver" },
            { label: "کورتکرنا مەلزەما (Summarizer)", toolId: "summary" },
            { label: "گوهۆڕینا PDF بۆ Word", toolId: "pdf_to_word" },
            { label: "تاقیگەها ئامارێ (Statistics Lab)", toolId: "statistics_lab" },
          ],
        },
      ]);
    }
  }, [isChatOpen, lang, chatMessages.length]);

  // Multilingual Dynamic AI Response Handler
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isThinking) return;

    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    const query = userInput.trim();
    const detectedLang = detectUserLanguage(query);
    const matchedRecs = extractToolRecommendations(query, detectedLang, false);
    const initialRecs =
      matchedRecs.length > 0
        ? matchedRecs
        : extractToolRecommendations(query, detectedLang, true);

    const userMsg: AssistantMessage = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setUserInput("");
    setIsThinking(true);
    setIsChatOpen(true);

    // 100% Reliable Exact Founder Info Delivery with Typing Animation
    if (isFounderQuery(query)) {
      const aiMsgId = `ai_${Date.now()}`;
      const founderRecs = extractToolRecommendations(
        query + "\n" + SANGAR_FOUNDER_TEXT,
        detectedLang
      );
      setChatMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          sender: "ai",
          text: "",
          recommendations: founderRecs,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      const words = SANGAR_FOUNDER_TEXT.split(" ");
      let cur = "";
      for (let i = 0; i < words.length; i++) {
        cur += (i === 0 ? "" : " ") + words[i];
        const currentText = cur;
        setChatMessages((prev) =>
          prev.map((msg) => (msg.id === aiMsgId ? { ...msg, text: currentText } : msg))
        );
        await new Promise((r) => setTimeout(r, 16));
      }
      setIsThinking(false);
      return;
    }

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: WELCOME_NAVIGATOR_SYSTEM_PROMPT,
          messages: [
            ...chatMessages.slice(-6).map((m) => ({
              role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
              content: m.text,
            })),
            { role: "user", content: query },
          ],
        }),
      });

      if (resp.ok && resp.body) {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let acc = "";
        const aiMsgId = `ai_${Date.now()}`;

        setChatMessages((prev) => [
          ...prev,
          {
            id: aiMsgId,
            sender: "ai",
            text: "",
            recommendations: initialRecs,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let nl: number;
          while ((nl = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, nl);
            buffer = buffer.slice(nl + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed?.choices?.[0]?.delta?.content;
              if (delta) {
                acc += delta;
                setChatMessages((prev) =>
                  prev.map((msg) => (msg.id === aiMsgId ? { ...msg, text: acc } : msg))
                );
              }
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }

        if (!acc.trim()) {
          setChatMessages((prev) => prev.filter((msg) => msg.id !== aiMsgId));
          throw new Error("Empty AI response");
        }

        // Once the AI streaming response is finished, re-extract recommendations dynamically
        // prioritizing the category intent of the request
        const finalRecs = extractToolRecommendations(query + "\n" + acc, detectedLang);
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId
              ? { ...msg, text: acc, recommendations: finalRecs }
              : msg
          )
        );
      } else {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody?.error || `HTTP ${resp.status}`);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : undefined;
      const fallback = buildSmartFallbackReply(query, detectedLang, matchedRecs, errMsg);

      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: "ai",
          text: fallback.text,
          recommendations: fallback.recommendations,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="w-full relative rounded-3xl overflow-hidden border border-emerald-500/30 dark:border-emerald-500/20 bg-linear-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 backdrop-blur-xl shadow-xl shadow-emerald-500/5 p-5 md:p-7 transition-all duration-300">
      {/* Ambient background glow & soft animated orb */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Layout: Speech Bubble (Right) + Character Avatar (Left) */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* 1. Unified Clean Glassmorphic Speech Bubble & Conversational Box (Right Side in RTL) */}
        <div className="flex-1 min-w-0 space-y-4 text-right md:text-right w-full">
          <div className="p-4 sm:p-5 rounded-3xl bg-card/90 dark:bg-card/80 border border-emerald-500/25 shadow-lg space-y-3 relative backdrop-blur-md">
            {/* Bubble Tail pointing to Left towards Avatar */}
            <div className="hidden md:block absolute top-6 -left-2.5 w-4 h-4 bg-card/90 border-b border-l border-emerald-500/25 rotate-45" />

            {/* Stage 1: Welcome Greeting (Right Aligned) */}
            <div className="transition-opacity duration-300">
              <h3 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2 justify-start text-right">
                <span>{lastUsedTool ? t.returning : t.welcome}</span>
              </h3>
            </div>

            {/* Stage 2: Kurdish Intro */}
            {typedStage >= 1 && (
              <p className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed animate-in fade-in-0 slide-in-from-bottom-2 duration-300 text-right">
                {t.intro}
              </p>
            )}

            {/* Stage 3: Unified Conversation Stream (Naturally Expands Downwards) */}
            {chatMessages.length > 0 && (
              <div className="space-y-3 pt-3 pb-1 border-t border-emerald-500/15 animate-in fade-in-0 duration-300">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-start" : "items-end"
                    } space-y-1.5`}
                  >
                    {/* Message Bubble Body */}
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[95%] sm:max-w-[92%] ${
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground font-medium rounded-tl-xs"
                          : "bg-secondary/90 border border-emerald-500/20 text-foreground font-normal rounded-tr-xs shadow-xs"
                      }`}
                    >
                      {msg.text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong
                            key={i}
                            className="font-black text-emerald-600 dark:text-emerald-400 text-[13px] sm:text-[15px] inline"
                          >
                            {part.slice(2, -2)}
                          </strong>
                        ) : (
                          part
                        )
                      )}
                    </div>

                    {/* Direct Action Recommendations Buttons (Centered, Radiant Emerald/Teal/Cyan Gradient) */}
                    {msg.sender === "ai" &&
                      msg.recommendations &&
                      msg.recommendations.length > 0 && (
                        <div className="w-full flex flex-wrap justify-center items-center gap-1.5 pt-1.5 pb-0.5 animate-in zoom-in-95 duration-200">
                          {msg.recommendations.map((rec, idx) => (
                            <button
                              key={idx}
                              onClick={() => onSelectTool(rec.toolId)}
                              className="group py-1 px-2.5 sm:px-3 rounded-lg bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white text-[10px] sm:text-[11px] font-bold shadow-xs border border-white/20 transition-all duration-150 transform hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-amber-300 shrink-0" />
                              <span className="tracking-normal font-bold">
                                {rec.label}
                              </span>
                              <ArrowRight className="w-2.5 h-2.5 shrink-0 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                ))}

                {isThinking && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-1 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                    <span>{t.thinking}</span>
                  </div>
                )}
              </div>
            )}

            {/* Stage 4: Single Interactive Input Form */}
            <form onSubmit={handleUserSubmit} className="pt-1 flex items-center gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="flex-1 h-11 px-4 rounded-2xl bg-secondary/50 dark:bg-secondary/30 border border-emerald-500/30 focus:border-emerald-500 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground/60 shadow-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-right"
              />
              <button
                type="submit"
                disabled={isThinking || !userInput.trim()}
                className="w-11 h-11 shrink-0 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.05] active:scale-[0.95]"
                title={t.sendBtn}
                aria-label={t.sendBtn}
              >
                <Send className="w-4 h-4 rtl:rotate-180" />
              </button>
            </form>
          </div>
        </div>

        {/* 2. 3D Animated AI Character Avatar (Left Side in RTL) */}
        <div
          onMouseEnter={() => {
            setIsHovered(true);
            triggerRobotWave();
          }}
          onMouseLeave={() => setIsHovered(false)}
          className="relative shrink-0 flex flex-col items-center group cursor-pointer select-none pt-4 md:pt-6"
          onClick={() => {
            triggerRobotWave();
            setIsChatOpen(!isChatOpen);
          }}
          title="کرتە بکە بۆ گفتوگۆ و پرسیار لە یاریدەدەری زیرەک"
        >
          {/* Ambient Glow Aura */}
          <div
            className={`absolute -inset-2 rounded-full bg-linear-to-r from-emerald-500 via-teal-400 to-cyan-500 blur-xl transition-all duration-700 pointer-events-none ${
              isHovered ? "opacity-70 scale-110" : "opacity-30"
            }`}
          />

          {/* Interactive Speech / Greeting Mini Bubble (Floating comfortably above robot head) */}
          <div
            className={`absolute -top-3 sm:-top-4 z-20 transition-all duration-300 transform pointer-events-none ${
              robotAction !== "idle" || isHovered
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-75 translate-y-2"
            }`}
          >
            <div className="px-2.5 py-1 rounded-full bg-card/95 dark:bg-card/90 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-[11px] font-black shadow-lg backdrop-blur-md flex items-center gap-1 whitespace-nowrap">
              <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
              <span>{t.greeting}</span>
            </div>
          </div>

          {/* 3D Robot Image Container with Animations */}
          <div
            className={`relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 z-10 flex items-center justify-center ${
              robotAction === "intro"
                ? "animate-robot-wave"
                : robotAction === "wave"
                ? "animate-robot-interactive-wave"
                : "animate-robot-idle"
            }`}
          >
            <RobotAvatarLive
              action={robotAction}
              thinking={isThinking}
              className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(16,185,129,0.28)] transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Dynamic 3D Ground Shadow that pulses in sync with floating */}
          <div className="w-20 sm:w-24 h-2.5 rounded-full bg-emerald-950/20 dark:bg-emerald-400/10 blur-xs -mt-1 pointer-events-none animate-robot-shadow" />

          {/* Assistant Online Status Badge */}
          <div className="mt-2 px-3 py-0.5 rounded-full bg-card/90 border border-emerald-500/30 shadow-xs flex items-center gap-1.5 text-[11px] font-bold text-foreground transition-colors group-hover:border-emerald-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
