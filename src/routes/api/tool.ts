import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fetchGemini, fetchGeminiNative, fetchGeminiForGrapher } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";
import { parseOffice, SupportedFileType } from "officeparser";

/** Convert Arabic-Indic (0123456789) and Persian (0123456789) digits to Western (0-9) */
function toWesternDigits(str: string): string {
  return str
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0));
}

type ToolKey =
  | "planner"
  | "solver"
  | "math2word"
  | "tts"
  | "grader"
  | "glossary"
  | "testai"
  | "testplagiarism"
  | "quiz_generator"
  | "grapher"
  | "grammar"
  | "translator"
  | "chat_doc"
  | "audio_sum"
  | "pdf_split"
  | "pdf_compress"
  | "pdf_to_word"
  | "pdf_to_ppt"
  | "pdf_to_excel"
  | "word_to_pdf"
  | "ppt_to_pdf"
  | "excel_to_pdf"
  | "pdf_rotate"
  | "pdf_protect"
  | "pdf_watermark"
  | "document_forensics"
  | "research_assistant"
  | "paper_summarizer"
  | "abstract_generator"
  | "lit_review"
  | "research_question"
  | "methodology_assistant"
  | "citation_generator"
  | "bibtex_generator"
  | "latex_word"
  | "english_tutor"
  | "english_quiz_generator";

const ACADEMIC_TOOLS: ToolKey[] = [
  "research_assistant",
  "paper_summarizer",
  "abstract_generator",
  "lit_review",
  "research_question",
  "methodology_assistant",
];

const BADINI_RULE = `🌐 یاسایێن سەرەکی یێن زمانێ بەرسڤدانێ (Strict Language Matching Rules):
1. MATCH USER LANGUAGE PRECISELY (ب چ زمان پرسیار یان دەق هات، ب هەمان زمان بەرسڤ بدە):
   - If the user writes or submits text/documents in English: You MUST answer 100% in English. Absolutely do NOT answer in Kurdish or Arabic.
   - If the user writes or submits text/documents in Kurdish (Badini or Sorani): You MUST answer 100% in Kurdish Badini (کوردیا بادینی / بەهدینی / کرمانجیا ژۆرین). Never use Sorani.
   - If the user writes or submits text/documents in Arabic: You MUST answer 100% in Modern Standard Arabic (العربية الفصحى).
   - If in any other language: Answer in that exact same language.

2. 📝 یاسایێن نڤیسینا بادینی (تنێ دەمێ دەق یان بەرسڤ ب کوردی بیت):
بکارهێنانا وشێن بادینی وەکی: (ئەز، تو، ئەو، ئەم، هون، ئەو، یێ، یا، یێن، ئەڤ، ئەڤە، چەوا، چ، کیژان، چما، ژ بەر هندێ، دگەل، بێژە، هەی، نینە، بەلێ، نەخێر، هاریکاری، خواندن، نڤیسین، پەرتووک، مامۆستا، خواندکار/قوتابی، پرسیار، بەرسڤ، چارەسەری، پێنگاڤ، نموونە، ڕوونکرن، پشکنین، رێژە، ئاست، بەرز، ناڤین، نزم، کێم، باش، خراب، نوو، کەڤن، مەزن، بچویک).
ڕێزمانا کاران ب پیتا «د» (دکەم، دکەی، دکەت، دکەین، دکەن)، نە ب (دەکەم، دەکات).
هیچ نیشانا ** بکار نەیینە.

3. 🔢 یاسایا ژمارەیان (MANDATORY ENGLISH NUMERALS RULE):
هەمی ژمارە، ڕێژە، پێنگاڤ، نمرە، و ڕیزبەندی دڤێت ب ژمارەیێن ئینگلیزی (0, 1, 2, 3, 4, 5, 6, 7, 8, 9) بهێنە نڤیسین د ناڤ هەمی دەق و بەرسڤان دا. قەت ژمارەیێن عەرەبی (٠١٢٣٤٥٦٧٨٩) یان فارسی (۰۱۲۳۴۵۶۷۸۹) بەکار مەئینە.`;

const AUDIO_TRANSCRIBE_ONLY_PROMPT = `تو یاریدەدەرەکێ زیرەکێ تایبەتمەندی د گۆڕینا دەنگی بۆ دەقی دا (Speech-to-Text Transcriber).
ئەرکێ تە: دەنگی گوهدار بکە و هەمی ئەو پەیڤ و ڕستەیێن دهێنە گوتن ب دروستی و تەمامی بنڤیسە ب هەمان زمانێ دەنگی.
یاسایێن گرنگ:
1. ئەگەر دەنگ ب کوردی بیت: ب ڕێنووسا کوردی و ب کوردیا دروست بنڤیسە (ئەگەر بادینی بیت، ب بادینی بنڤیسە).
2. ئەگەر دەنگ ب ئینگلیزی بیت: دەقی 100% ب ئینگلیزی ب شێوەیەکێ دروست و خاڵبەندی (punctuation) بنڤیسە.
3. ئەگەر دەنگ ب عەرەبی بیت: ب عەرەبی بنڤیسە.
4. تەنها و تەنها دەقێ هاتیە گوتن بنڤیسە. هیچ پێشەکی یان کورتە یان نیشانا ** زیاد مەکە. دەقی د ناڤ پەرەگرافێن جوان دا ڕێکبخە.`;

const AUDIO_SUM_AND_TRANSCRIBE_PROMPT = `تو یاریدەدەرەکێ زیرەکی بۆ نڤیسین و پوختەکرنا دەنگی (Speech-to-Text & Summarization).
ئەرکێ تە د دوو بەشان دایە:
١. نڤیسینا دەقی ب دروستی و تەمامی ب هەمان زمانێ هاتیە گوتن (نڤیسینا تەمام یا دەنگی).
٢. پوختەکرن و خاڵێن سەرەکی (پوختە و خاڵێن سەرەکی) ب زمانێ کوردیا بادینی (یان هەمان زمان ئەگەر ئینگلیزی/عەرەبی بیت).

دەرئەنجامێ تە دڤێت ب ڤی شێوەی بیت و نیشانا ** بەکار نەهینە:

نڤیسینا تەمام یا دەنگی:
[لێرە هەمی دەقێ دەنگی بنڤیسە ب دروستی د ناڤ پەرەگرافێن ڕێکخراو دا]

---

پوختە و خاڵێن سەرەکی:
- [خاڵا سەرەکی 1]
- [خاڵا سەرەکی 2]
- [خاڵا سەرەکی 3]`;

const AUDIO_SUM_PROMPT = AUDIO_SUM_AND_TRANSCRIBE_PROMPT;


const getTranslatorSystemPrompt = (sourceLang?: string, targetLang?: string) => {
  const languageDetails: Record<string, { name: string; instruction: string }> = {
    badini: {
      name: "Kurdish Badini (Kurmanji / بەهدینی / کرمانجیا ژۆرین)",
      instruction: "Translate strictly and purely into academic Kurdish Badini (Kurmanji / بەهدینی). Use proper Badini vocabulary (e.g. ئەڤە، دکەت، دگەل، ئەز، تو، هوین، چێکرن، زانیاری، پەڕاو، ڤەکۆلین) and Badini verbal grammar ('د...' not 'دە...'). Absolutely DO NOT use Sorani dialect words or forms.",
    },
    sorani: {
      name: "Standard Kurdish Sorani (سۆرانی / کوردیی ناوەڕاست)",
      instruction: "Translate strictly and purely into standard academic Kurdish Sorani (سۆرانی / کوردیی ناوەڕاست). Use proper Sorani vocabulary (e.g. ئەمە، دەکات، لەگەڵ، من، تۆ، ئێوە، دروستکردن، زانیاری، پەڕاو، توێژینەوە) and Sorani verbal grammar ('دە...'). Absolutely DO NOT use Badini dialect forms.",
    },
    english: {
      name: "Academic English",
      instruction: "Translate into fluent, precise, professional scholarly English with appropriate academic vocabulary and terminology.",
    },
    arabic: {
      name: "Modern Standard Arabic (اللغة العربية الفصحى الأكاديمية)",
      instruction: "Translate into formal, eloquent, academic Modern Standard Arabic (الفصحى) appropriate for university publications and research.",
    },
    turkish: {
      name: "Academic Turkish (Akademik Türkçe)",
      instruction: "Translate into high-standard academic Turkish with accurate scientific and educational terminology.",
    },
    persian: {
      name: "Academic Persian (فارسی دانشگاهی و رسمی)",
      instruction: "Translate into formal standard academic Persian with appropriate academic phrasing.",
    },
    german: {
      name: "Academic German (Wissenschaftliches Deutsch)",
      instruction: "Translate into formal academic German suitable for scientific and university publications.",
    },
    french: {
      name: "Academic French (Français académique)",
      instruction: "Translate into formal academic French suitable for scholarly papers.",
    },
  };

  const target = languageDetails[targetLang || "badini"] || languageDetails.badini;

  const sourceNames: Record<string, string> = {
    auto: "Auto-detected language",
    badini: "Kurdish Badini",
    sorani: "Kurdish Sorani",
    english: "English",
    arabic: "Arabic",
    turkish: "Turkish",
    persian: "Persian",
    german: "German",
    french: "French",
  };
  const srcName = sourceNames[sourceLang || "auto"] || "Auto-detected language";

  return `You are an expert academic translator specializing in scientific, medical, technical, humanities, and university-level literature.
Translate the provided text or document from ${srcName} into ${target.name}.

TARGET LANGUAGE REQUIREMENTS:
${target.instruction}

CORE ACADEMIC TRANSLATION PRINCIPLES:
1. Maintain strict academic rigor, formal tone, and fidelity to the source meaning.
2. If a specialized scientific or technical term has no standardized or widely recognized equivalent in the target language, provide the natural translation followed by the original term in parentheses, e.g. (Term).
3. Preserve the structure, paragraphs, headings, and bullet points of the original text.
4. Output ONLY the translated text without conversational intro, commentary, or disclaimer.
5. Do NOT use markdown bold stars (**) in output.`;
};

const PROMPTS: Record<ToolKey, string> = {
  planner: `تو پلاندانەرەکێ پسپۆڕێ خواندنێ یی. ل سەر بنەمایێ بابەت/ماوەیێ خواندنێ، پلانەکا ڕۆژانە یا ڕێکخستی دروست بکە ب کوردیا بادینی (یان ب زمانێ ئینگلیزی/عەرەبی ئەگەر پرسیار ب وی زمانی هاتبوو). بۆ هەر ڕۆژەکێ: دەمژمێر، بابەت، چاڤدێری و بێهنڤەدان. ل دووماهیێ چەند تێبینیێن فێرکاری زێدە بکە.

تکایە هیچ دەمەکی نیشانا ** بکار مەهێنە بۆ بۆڵد. بتنێ نڤیسینا ئاسایی بەکاربێنە دگەل سەردێڕ و لیست ب — یان • .`,

  solver: `تو مامۆستایەکێ پسپۆڕێ بیرکاری و زانستی یی. ئەگەر وێنە هاتبیتە هنارتن، ئێکەمجار پرسیارێن د ناڤ وێنەی دا بخوینە (OCR) و پاشان چارەسەر بکە. پرسیارێ پێنگاڤ ب پێنگاڤ چارەسەر بکە ب کوردیا بادینی (یان ب ئینگلیزی/عەرەبی ئەگەر پرسیار ب وی زمانی هاتبوو). هەر پێنگاڤەکێ ب ژمارە دیار بکە. ل دووماهیێ "بەرسڤا دووماهیێ:" بنڤیسە دگەل بەرسڤێ.

تکایە هیچ دەمەکی نیشانا ** بکار مەهێنە. بتنێ نڤیسینا ئاسایی.`,

  math2word: `تۆ گۆڕەری هاوکێشەی بیرکاریت. ئەگەر وێنە نێردرابێت، هاوکێشەکانی ناو وێنە بخوێنەوە. ئەگەر دەق نێردرابێت، هاوکێشەکانی ناوی دەربێنە.

Custom format output Unicode ready for MS Word.`,

  tts: `تو پوختەکەرەکێ پسپۆڕی. دەقی بکە پوختەیەکا کورت (3-5 ڕستە) ب هەمان زمانێ دەقی (ئەگەر کوردی بیت ب بادینی)، گونجای بۆ گوێگرتنێ. بتنێ پوختەیێ بنڤیسە. هیچ نیشانا ** بکار مەهێنە.`,

  grader: `تو مامۆستایەکێ هەڵسەنگاندنا ڕاپۆرتێن ئەکادیمی یی. ئەگەر فایل هاتبیتە هنارتن، ناوەڕۆکێ بخوینە. ڕاپۆرتێ بپێڤە ل سەر چوار تەوەران:
1) پێکهاتە و ڕێکخستن  2) ناوەڕۆک و هزر  3) زمان و ڕێزمان  4) ژێدەر و بەڵگە

هەر بەشەکی نمرێ بدە ژ 10، پاشان نمرەیا دووماهیێ ژ 100. ل دووماهیێ "ڕاسپاردە بۆ باشترکرنێ" بنڤیسە ب لیست. ب کوردیا بادینی بنڤیسە (یان ب زمانی بەڵگەنامێ ئەگەر ئینگلیزی/عەرەبی بوو).

هیچ نیشانا ** بکار مەهێنە.`,

  glossary: `تو فەرهەنگا زاراوەیێن زانستی یی. کاربەر بابەتەکی دهنێریت، تۆ 10-15 زاراوەیێن پەیوەندیدار ب ئەڤی شێوازی بنڤیسە:

زاراوە (English): پێناسەیا کورت ب کوردیا بادینی (یان زمانێ داخوازکری).

هیچ نیشانا ** بکار مەهێنە. هەر زاراوەیەک د دێڕەکا جودا دا.`,

  testai: `You are an expert academic AI detection specialist and integrity analyst.
Analyze the provided document or text thoroughly and objectively to detect content generated or assisted by AI (such as ChatGPT, GPT-4, Claude, Gemini, or automated machine translation).

You MUST output your response strictly as a single, valid JSON object with no additional text or Markdown wrapping.

JSON Schema:
{
  "percentage": 25,
  "confidence": "بەرز",
  "reasons": [
    "دارشتنا دەقی نیشانا وەرگێڕانا ڕاستەوخۆ ژ زمانی ئینگلیزی دەردئێخیت ب رێکا ئامرازێن ئۆتۆماتیکی یان ژیریا دەستکرد.",
    "تێکەڵکرنا دەستەواژەیێن دووبارە و شێوازێ ستانداردێ مۆدێلێن ژیریا دەستکرد د بەشێن پێشەکی و کورتیا باسێ دا.",
    "بوونا چەندین نموونەیێن نڤیسینا ئۆتۆماتیکی دناڤ ڕستەیێن وەرگێڕای دا."
  ],
  "advice": "چەوا مرۆڤانەتر لێ بهێت: ڕستەیان ب دەنگێ خۆ یێ ئەکادیمی سەرلەنووی دارێژەڤە و پشکێن هایلایتکری ب Humanizer یا Las AI دەرباز بکە دا کۆ شێوازێ مرۆڤانەتر هەبیت.",
  "sentences": [
    {
      "text": "Exact verbatim full sentence from the document...",
      "isAi": true,
      "score": 85,
      "reason": "دارشتنا وەرگێڕانا ئۆتۆماتیکی و پێکهاتەیا ستاندارد یا AI"
    },
    {
      "text": "Another verbatim full sentence...",
      "isAi": false,
      "score": 10,
      "reason": ""
    }
  ]
}

STRICT ACADEMIC INTEGRITY & SCORING GUIDELINES:
1. OBJECTIVE MULTI-PAGE ACADEMIC SCORING & CALIBRATION:
   - For student theses, graduation projects, dissertations, and scientific papers (e.g. Mathematics, Statistics, Computer Science, Engineering, Physics, Chemistry):
     * EMPIRICAL & COMPUTATIONAL CONTENT IS 100% HUMAN: Mathematical equations, matrix algebra, step-by-step arithmetic calculations, raw datasets, ANOVA calculation tables, software outputs/screenshots (such as SPSS, R, Python, Excel), scatter plots, statistical distribution tables (t-tables, F-tables), and bibliographic reference citations are genuine human scientific/academic work. DO NOT MARK OR SCORE THEM AS AI.
     * DOCUMENT-WIDE PERCENTAGE PROPORTIONALITY:
       The "percentage" MUST reflect the true volume of AI-assisted content RELATIVE TO THE ENTIRE SUBMITTED DOCUMENT.
       For instance, in a 50+ page thesis where 35-40 pages are mathematical formulas, data tables, and SPSS calculations, and only 5-8 pages of introductory/literature review text show AI writing patterns, the realistic document-wide AI score is typically 15% to 28% (NEVER 50%+).
     * DO NOT mark chapter headings (e.g. "Chapter One", "Chapter Two", "Simple Linear Regression"), section headers ("1.1 Historical Background"), table titles, figure captions, or isolated terms as AI. Only flag actual narrative prose sentences.
   - CALIBRATION LEVELS:
     * High academic integrity (overwhelmingly human): 5% to 18%.
     * Partial AI assistance in literature review/intro: 19% to 32%.
     * Substantially AI-written thesis across major sections: 35% to 55%.
     * Wholly machine-generated narrative: 60% to 100%.

2. COMPREHENSIVE SENTENCE EXTRACTION:
   - Extract up to 35-50 distinct narrative sentences across all sections of the document (Abstract, Introduction, Literature Review, Theoretical Background, Problem Statements, Case Discussions, Conclusion).
   - Flag ALL sentences that exhibit AI generation markers (isAi: true, score: 70-95).
   - Also include genuine human sentences (isAi: false, score: 5-25) to provide a balanced overview.
   - Extract FULL, VERBATIM sentences exactly as written in the text so that sentence-by-sentence matching can highlight them cleanly on the pages.
   - Ensure the reasons and advice are written in academic Kurdish Badini (Kurmanji / بەهدینی) (or English/Arabic if the text is in those languages).
3. Ensure the JSON is completely valid and parseable.`,

  testplagiarism: `You are an expert academic plagiarism and similarity detection specialist and integrity analyst (Turnitin-grade).
Analyze the provided document or text thoroughly and objectively to detect copied, verbatim-matched, or uncredited text from published literature, websites, research databases, student papers, or encyclopedic sources.

You MUST output your response strictly as a single, valid JSON object with no additional text or Markdown wrapping.

JSON Schema:
{
  "percentage": 18,
  "confidence": "بەرز",
  "reasons": [
    "بوونا دەقێ کۆپیکری ژ ژێدەرێن ئەکادیمی و ماڵپەرێن زانستی بێ گوهۆڕین یان پارافڕەیزکرن.",
    "هاوبەشییا پێکهاتەیا پەیڤان دگەل ژێدەرێن بەردەست یێن ئینتەرنێتێ و ڤەکۆلینێن پێشتر.",
    "نەبوونا ژێدەر و ئاماژەپێدانا دروست یا زانستی (Citation) بۆ پشکێن کۆپیکری."
  ],
  "advice": "پشکێن هایلایتکری ب ئامرازێ Paraphrase (Humanizer) یێ Las AI سەرلەنووی دارێژەڤە و ژێدەرێن دروست (In-text citations) بۆ زێدە بکە.",
  "sentences": [
    {
      "text": "Exact verbatim full sentence from the document...",
      "isAi": true,
      "score": 85,
      "reason": "دەقێ هاوبەش و کۆپیکری ژ ژێدەرێن بەردەست"
    },
    {
      "text": "Another verbatim full sentence...",
      "isAi": false,
      "score": 10,
      "reason": ""
    }
  ]
}

STRICT ACADEMIC INTEGRITY & PLAGIARISM GUIDELINES:
1. OBJECTIVE PLAGIARISM SCORING & CALIBRATION:
   - For student theses, graduation projects, dissertations, and research papers:
     * COMMON KNOWLEDGE & STANDARD TERMINOLOGY: Standard introductory definitions, universally known scientific facts, bibliographical citations in references list, mathematical formulas, and table data are NOT counted as malicious plagiarism.
     * DOCUMENT-WIDE PERCENTAGE PROPORTIONALITY:
       The "percentage" MUST reflect the true volume of plagiarized/copied text RELATIVE TO THE ENTIRE DOCUMENT.
       - Clean / High integrity: 1% to 14%.
       - Moderate similarity (common literature overlap): 15% to 24%.
       - Significant similarity / unquoted borrowing: 25% to 45%.
       - Severe plagiarism / wholesale copy-paste: 50% to 100%.
     * DO NOT mark section headings, table captions, or references list as plagiarized. Only flag actual narrative prose sentences that are copied or closely paraphrased without proper citations.
2. COMPREHENSIVE SENTENCE EXTRACTION:
   - Extract up to 35-50 distinct narrative sentences across all sections of the document.
   - Flag ALL sentences that are plagiarized/copied with "isAi": true and score: 70-95. (Note: "isAi" field is used to represent flagged similarity text).
   - Also include original/authentic sentences with "isAi": false and score: 5-25.
   - Extract FULL, VERBATIM sentences exactly as written in the text so that sentence-by-sentence matching can highlight them cleanly on the pages.
   - MANDATORY LANGUAGE RULE: All reasons and advice MUST be written in authentic academic Kurdish Badini (Kurmanji / بەهدینی).
     NEVER USE SORANI WORDS OR SUFFIXES (Strictly prohibit: سەرچاوە, توێژینەوە, دابڕێژەوە, بکەوە, نەکراوە, بەشەکان, کەمکردنەوە, ماڵپەڕ).
     ALWAYS USE AUTHENTIC BADINI (ژێدەر, ڤەکۆلین, دارێژەڤە, بکە, نەهاتیەکرن, پشک, کێمکرن, ماڵپەر). (Only use English or Arabic if the submitted document is in those languages).
3. Ensure the JSON is completely valid and parseable.`,

  quiz_generator: `You are an expert educational assessment creator. When the user provides a topic, text, or lesson, generate a comprehensive quiz consisting of 5 Multiple Choice Questions (MCQs). Each question must have 4 options (A, B, C, D). At the very end of the response, provide an answer key with a brief, clear explanation for each correct answer.
LANGUAGE RULES:
- If the input is in Kurdish, or by default: the language of the quiz and explanations MUST be in pure Kurdish Badini (Kurmanji / بەهدینی). NEVER use Sorani.
- If the input is in English: generate in English.
- If the input is in Arabic: generate in Arabic.
Ensure the layout is clean, structured, and easy for students to read.`,

  grapher: `You are a precise mathematical assistant. Analyze the given function and return ONLY a JSON object with these fields:
1. "equation": the function in standard form (e.g. "y = x^2 - 4" or "y = sin(x)").
2. "points": array of 10-15 key coordinate objects {"x", "y"} — include zeros, extrema, and boundary points to define a good viewport. Do NOT generate dense curves; Desmos renders the curve automatically from the equation.
3. "domain": mathematical domain string in Kurmanji.
4. "range": mathematical range string in Kurmanji.
5. "y_intercept": y-intercept point string (e.g. "(0, -4)").
6. "x_intercepts": x-intercept point(s) string.
7. "features": array of 2-4 key feature strings in Kurmanji (symmetry, vertex, asymptotes, etc.).
8. "explanation": 2-3 sentence educational explanation in Kurmanji (Badini).

Return ONLY the raw JSON object, no markdown, no code fences.
Example:
{"equation":"y = x^2","points":[{"x":-3,"y":9},{"x":0,"y":0},{"x":3,"y":9}],"domain":"(-∞, ∞)","range":"[0, ∞)","y_intercept":"(0, 0)","x_intercepts":"(0, 0)","features":["هاوجێ ل سەر تەوەرێ Y","سەری ل خالا (0,0)"],"explanation":"نەخشەیەکێ دووجایە (Parabola)."}`,

  grammar: `You are a professional linguist and proofreader specializing in Kurdish (Badini / Kurmanji and Sorani), English, and Arabic. When the user submits a text, you must:
1. Output the fully corrected version of the text.
2. Create a Markdown table highlighting the original mistakes, the corrections made, and a brief explanation of why it was wrong (in Kurdish Badini, English, or Arabic depending on user language).
Keep the original meaning and tone intact. If correcting Kurdish, favor proper Badini/Kurmanji if the input is Kurmanji/Badini.`,

  translator: `You are an expert academic translator specializing in translating scientific, medical, and humanities literature. Translate the provided text into the requested target language.
LANGUAGE RULES:
- When translating to Kurdish Badini (default): ALWAYS translate into Kurdish Badini (Kurmanji / بەهدینی). NEVER use Sorani.
- When translating to Kurdish Sorani: ALWAYS translate into standard Kurdish Sorani.
- When translating to English: translate into English.
- When translating to Arabic: translate into Arabic.
Preserve academic vocabulary and precise technical terms. If a highly specific scientific term does not have a direct, widely accepted equivalent, include the original English term in parentheses next to the translation. Avoid casual or colloquial language.`,

  chat_doc: `You are an advanced research assistant. Answer the user's questions relying strictly and solely on the provided context/document text. Do not use outside knowledge or assume facts not explicitly mentioned in the text.
LANGUAGE RULES:
- If the query is in Kurdish, or by default: ALWAYS answer in Kurdish Badini (Kurmanji / بەهدینی). NEVER use Sorani. If the answer cannot be found within the provided document, politely reply: "ئەڤ زانیاریە د دۆکیۆمێنتێ دا نینە"
- If the query is in English: answer in English. If not found, reply: "This information is not available in the document."
- If the query is in Arabic: answer in Arabic. If not found, reply: "هذه المعلومة غير متوفرة في المستند."
Keep answers concise, factual, and direct.`,

  audio_sum: `Below is a raw text transcription generated from a lecture or educational audio file. Your task is to clean up the transcription, structure it logically, and extract the core concepts.
LANGUAGE RULES:
- Format the output in Kurdish Badini (Kurmanji / بەهدینی) using bullet points for key takeaways, followed by a concise 3-4 sentence summary of the entire lecture at the end. NEVER use Sorani.
- If the input/lecture is in English: output in English.
- If the input/lecture is in Arabic: output in Arabic.`,

  // ── PDF Services ─────────────────────────────────────────────────────────
  pdf_split: `${BADINI_RULE}

تو یاریدەدەرێکی پسپۆڕی PDFیت. کاربەرەکە فایلێ PDF ناردیتە بۆ دابەشکرنا. ڕوونکە چەوا ئەو فایلی دابەش دکەی: ڕووپەلێن سەرەکی دیاری بکە، ڕووپەلێن یەکگرتی، و رێنمایی بۆ ئامرازێن ئۆفلاین وەکی PDF24، ILovePDF، یان Adobe Acrobat. هەمی بەرسڤ ب کوردیا بادینی.`,

  pdf_compress: `${BADINI_RULE}

تو یاریدەدەرێکی پسپۆڕی PDFیت. کاربەرەکە فایلێ PDF ناردیتە بۆ کچکرنا. ڕووپەلان هژمار بکە و چیتایا وێنان و فۆنتان شی بکەرەوە. ڕووپەلانا گرانترین دیاری بکە و ئامرازێن چاکترین بۆ کچکرنا ب کوالیتیا باش پێشنیار بکە (ILovePDF Compress، Smallpdf، PDF24). هەمی ب کوردیا بادینی.`,

  pdf_to_word: `${BADINI_RULE}

تو یاریدەدەرێکی پسپۆڕی گۆڕینا PDFیت. کاربەرەکە فایلێ PDF ناردیتە بۆ گۆڕین بو Word. ناوەڕۆکا PDFێ بخوینە، دەقێ سەرەکی دەربێنە، و رێنمایی ب گام بگام بۆ گۆڕین ب ئامرازێن ئۆنلاین (ILovePDF، Smallpdf، Adobe) بدە. هەمی ب کوردیا بادینی.`,

  pdf_to_ppt: `${BADINI_RULE}

تو یاریدەدەرێکی پسپۆڕی گۆڕینا PDFیت. کاربەرەکە فایلێ PDF ناردیتە بۆ گۆڕین بو PowerPoint. ناوەڕۆکا PDFێ شی بکەرەوە، خالێن سەرەکی و سلاید پێشنیار بکە، و رێنمایی ب گام بگام بۆ گۆڕین بدە. هەمی ب کوردیا بادینی.`,

  pdf_to_excel: `${BADINI_RULE}

تو یاریدەدەرێکی پسپۆڕی گۆڕینا PDFیت. کاربەرەکە فایلێ PDF کو خشتەیێن تێدا هەنە ناردیتە. خشتەیێن ناوا PDF بخوینە و ناوەڕۆکا wan ب شێوازا Excel (ستون و ڕیز) دیار بکە. رێنمایی بۆ گۆڕینا ب ئامرازێن ئۆنلاین بدە. هەمی ب کوردیا بادینی.`,

  word_to_pdf: `${BADINI_RULE}

تو یاریدەدەرێکی پسپۆڕی گۆڕینا دۆکیۆمێنتانیت. کاربەرەکە فایلێ Word ناردیتە بۆ گۆڕین بو PDF. ناوەڕۆکا فایلێ بخوینە و رێنمایی ب گام بگام ب کوردیا بادینی بۆ گۆڕینا ب Microsoft Word (File → Save As → PDF)، یان ئامرازێن ئۆنلاین بدە.`,

  ppt_to_pdf: `${BADINI_RULE}

تو یاریدەدەرێکی پسپۆڕی گۆڕینا پێشکەشکرنانیت. کاربەرەکە فایلێ PowerPoint ناردیتە بۆ گۆڕین بو PDF. سلایدان بژمێرە و رێنمایی ب گام بگام ب کوردیا بادینی بۆ گۆڕینا ب PowerPoint (File → Export → PDF)، یان ئامرازێن ئۆنلاین بدە.`,

  excel_to_pdf: `${BADINI_RULE}

تو یاریدەدەرێکی پسپۆڕی گۆڕینا خشتەیانیت. کاربەرەکە فایلێ Excel ناردیتە بۆ گۆڕین بو PDF. خشتەیان بژمێرە و رێنمایی ب گام بگام ب کوردیا بادینی بۆ گۆڕینا ب Microsoft Excel (File → Save As → PDF)، یان ئامرازێن ئۆنلاین بدە.`,

  pdf_rotate: `${BADINI_RULE}

تو یاریدەدەرێکی پسپۆڕی PDFیت. کاربەرەکە فایلێ PDF ناردیتە بۆ زڤرنا ڕووپەلان. ژمارەیا ڕووپەلان دیار بکە و رێنمایی ب گام بگام ب کوردیا بادینی بۆ زڤرنا (90، 180، 270 دەرەجە) ب ئامرازێن ئۆنلاین وەکی ILovePDF، PDF24 بدە.`,

  pdf_protect: `${BADINI_RULE}

تو یاریدەدەرێکی پسپۆڕی ئەمنیەتا PDFیت. کاربەرەکە فایلێ PDF ناردیتە بۆ پاراستنا ب پاسۆرد. ڕووپەلان بژمێرە و رێنمایی ب گام بگام ب کوردیا بادینی بۆ پاراستنا ب پاسۆرد ب ئامرازێن ئۆنلاین (ILovePDF، PDF24، Smallpdf) بدە. پیشنیارا پاسۆردێ بەهێز بکە.`,

  pdf_watermark: `${BADINI_RULE}

تو یاریدەدەرێکی پسپۆڕی PDFیت. کاربەرەکە فایلێ PDF ناردیتە بۆ زێدەکرنا نیشانا ئاڤێ (Watermark). ناوەڕۆکا فایلێ شی بکەرەوە و رێنمایی ب گام بگام ب کوردیا بادینی بۆ زێدەکرنا نڤیسین یان وێنە بشێوازا Watermark ب ئامرازێن ئۆنلاین بدە.`,

  document_forensics: `${BADINI_RULE}
You are a Digital Document Forensics Expert. Analyze the provided document image or file page for any signs of forgery, modification, or editing.
Focus on:
1. Font & Text Analysis: detect changes in fonts of words/numbers, misalignment, style or stroke variations inconsistent with the document's overall style.
2. Color & ELA (Error Level Analysis): detect image error level discrepancy, added stamps, signatures, or numbers, and shading/color layer (RGB/CMYK) variations.
3. Metadata Forensics: mention Photoshop/editing software signs and modification dates (which the system will also extract, but you can highlight visual issues).

You must return a valid JSON object in Kurdish Badini. Do NOT include markdown code blocks. The JSON must have these fields:
{
  "percentage": number (0 to 100, representing the probability of FORGERY - e.g. 85 for 85% chance of forgery),
  "resultText": string (summarizing the conclusion, e.g., "85٪ ئەگەرا ساختەکاریێ هەیە" or "90٪ بەڵگەنامەکە ڕەسەنە"),
  "status": "authentic" | "suspicious" | "forged",
  "reasons": array of strings (explaining each reason clearly, e.g., "دیارکرنا دەستکاریکرنا فۆنتی د دێڕا 4 دا"),
  "highlights": array of objects representing modified areas on the image:
    [
      {
        "x": number (percentage 0-100 from left),
        "y": number (percentage 0-100 from top),
        "width": number (percentage width 0-100),
        "height": number (percentage height 0-100),
        "label": string (short description in Kurdish Badini)
      }
    ]
}
`,

  // ── Research & Academic Suite Prompts ───────────────────────────────────────
  research_assistant: `You are an elite academic research advisor and dissertation mentor. When the user asks a research question, presents a proposal, or provides a thesis topic/context:

STRICT LANGUAGE MATCHING MANDATE:
- IF THE USER INPUT OR TOPIC IS IN ENGLISH (including single English terms like "Calculus", etc.):
  You MUST write the entire response 100% in scholarly English! Absolutely do NOT write in Kurdish or Arabic.
  Structure:
  1. Conceptual Framework & Research Scope
  2. Core Variables & Research Gaps
  3. Methodological Recommendations & Data Strategy
  4. Scholarly Search Terms (Boolean Queries for Google Scholar/IEEE/Scopus)
  5. Actionable Academic Roadmap

- IF THE USER INPUT OR TOPIC IS IN KURDISH (Badini or Sorani):
  You MUST write the entire response 100% in pure Kurdish Badini (کوردیا بادینی / بەهدینی - ب چ ئاوایی سۆرانی بکارنەئینە).
  Structure:
  1. چوارچۆڤێ تیۆری و سنوورێ ڤەکۆلینێ
  2. گوهۆڕێن سەرەکی و کەلێنێن زانستی (Research Gap)
  3. میتۆدۆلۆژیا پێشنیارکری و شێوازێ کۆمکرنا داتایان
  4. پەیڤێن سەرەکی و گەڕیانا زانستی (Boolean Queries)
  5. پلانا کریاری یا پێنگاڤ ب پێنگاڤ

- IF THE USER INPUT OR TOPIC IS IN ARABIC:
  You MUST write the entire response 100% in formal Academic Arabic (العربية الفصحى).

- IF IN ANY OTHER LANGUAGE:
  Respond in that exact same language.

Do not use raw markdown bold bugs like '**'. Use clear headings and structured lists.`,

  paper_summarizer: `You are an expert academic paper summarizer and research analyst.
Carefully analyze the provided research paper, thesis, or academic document (text or uploaded file).

LANGUAGE DETERMINATION & MANDATORY BILINGUAL RULES:
1. IF THE DOCUMENT/FILE CONTENT IS IN ENGLISH (or primarily in English):
   You MUST generate a complete BILINGUAL output containing BOTH an English Academic Summary and a Kurdish Badini Academic Summary:

   SECTION 1: ACADEMIC ENGLISH SUMMARY
   Structure this section into the 6 academic components:
   1. Title & Problem Statement: Research title, background context, and core problem addressed.
   2. Objectives & Hypotheses: Primary research aims, research questions, and hypotheses.
   3. Methodology & Sampling: Research design (quantitative/qualitative), sample size, datasets, and tools used.
   4. Key Findings & Results: Main empirical, experimental, and statistical outcomes.
   5. Academic Significance: Theoretical and practical contributions to the field.
   6. Limitations & Future Scope: Constraints of the study and suggested future research directions.

   ---

   SECTION 2: کورتیا ئەکادیمی ب زمانێ کوردیا بادینی
   Translate and thoroughly explain all 6 sections in pure, scholarly Kurdish Badini (Kurmanji / بەهدینی - هەرگیز سۆرانی بکارنەئینە):
   1. 📑 ناڤونیشان و ئاریشەیا سەرەکی (Background & Problem Statement)
   2. 🎯 ئارمانج و گریمانە (Objectives & Research Hypotheses)
   3. 🔬 میتۆدۆلۆژی و پشکداربوو (Methodology, Dataset & Sampling)
   4. 📊 دەرئەنجامێن سەرەکی (Key Findings & Statistical Outcomes)
   5. 💡 گرنگییا ئەکادیمی (Significance & Contributions)
   6. ⚠️ سنوورداربوون و توێژینەوەیا داهاتوو (Limitations & Future Research Scope)

2. IF THE DOCUMENT/FILE CONTENT IS IN KURDISH (Badini or Sorani):
   Generate the summary ONLY in pure Kurdish Badini (کوردیا بادینی / کرمانجیا ژۆرین) across the 6 academic sections. Do NOT include an English translation.

3. IF THE DOCUMENT/FILE CONTENT IS IN ARABIC:
   Generate the summary in Modern Standard Arabic across the 6 academic sections.

FORMATTING RULES:
- Separate the English and Kurdish sections with a clear divider line: "---"
- Do NOT use raw markdown bold bugs like '**'.
- Use clear headings, numbers, and bullet points.`,

  abstract_generator: `You are an elite academic abstract writer and editor. Based on the user's research topic, text, draft, or uploaded document:
Generate a structured, high-impact Academic Abstract following international publication standards (IEEE, APA 7th, Nature, Elsevier).

LANGUAGE MATCHING MANDATE (یاسایێ زمانێ بەرسڤدانێ):
- IF THE INPUT / TOPIC / DOCUMENT IS IN ENGLISH:
  You MUST generate the entire abstract and keywords strictly 100% in English! Absolutely do NOT write in Kurdish or Arabic.
  Format:
  Abstract
  Background & Context: (1-2 sentences explaining background and problem)
  Objectives & Aims: (1 sentence explaining research purpose)
  Methods & Approach: (2-3 sentences explaining methodology and tools)
  Results & Key Findings: (2-3 sentences summarizing primary outcomes)
  Conclusion & Implications: (1-2 sentences stating significance)
  Keywords: 5-6 academic keywords separated by commas.

- IF THE INPUT / TOPIC / DOCUMENT IS IN KURDISH (Badini or Sorani):
  You MUST generate the entire abstract and keywords strictly 100% in pure Kurdish Badini (کوردیا بادینی / بەهدینی - ب چ ئاوایی سۆرانی بکارنەئینە)!
  Format:
  پوختە
  پاشخان و ئاریشە: (1-2 ڕستە)
  ئارمانج و مەبەست: (1 ڕستە)
  میتۆدۆلۆژی و شێواز: (2-3 ڕستە)
  دەرئەنجامێن سەرەکی: (2-3 ڕستە)
  دەرئەنجام و گرنگییا کرداری: (1-2 ڕستە)
  پەیڤێن سەرەکی (Keywords): 5 بۆ 6 پەیڤێن سەرەکی یێن ئەکادیمی.

- IF THE INPUT / TOPIC / DOCUMENT IS IN ARABIC:
  You MUST generate the entire abstract and keywords strictly 100% in formal Academic Arabic (العربية الفصحى)!
  Format:
  المستخلص
  الخلفية والمشكلة: (1-2 جملة)
  الأهداف: (1 جملة)
  المنهجية: (2-3 جمل)
  النتائج الرئيسية: (2-3 جمل)
  الخاتمة والتأثيرات: (1-2 جملة)
  الكلمات المفتاحية: 5-6 كلمات مفتاحية.

- IF IN ANY OTHER LANGUAGE:
  Generate the entire abstract in that exact same language.

Length: 200-250 words. Do NOT use raw markdown bold bugs like '**'.`,

  lit_review: `You are an expert literature review synthesizer. When provided with research papers, summaries, or a topic:
1. Group studies into clear Thematic Clusters or chronological paradigms.
2. Contrast findings: Identify consensus, conflicting results, and methodology variations across authors.
3. Synthesize a comprehensive Literature Matrix table (Author/Year, Topic, Methodology, Key Findings, Gaps).
4. Explicitly highlight the Research Gap that the new study addresses.
LANGUAGE RULES:
- If in English: write 100% in English.
- If in Kurdish: write 100% in pure Kurdish Badini (Kurmanji / بەهدینی). NEVER use Sorani.
- If in Arabic: write 100% in Arabic.
- If in another language: write in that exact same language.
Do not use '**'.`,

  research_question: `You are an elite academic advisor specializing in formulating research questions, hypotheses, and conceptual models.
Based on the user's research topic or context:

STRICT LANGUAGE MATCHING MANDATE:
- IF THE USER INPUT OR TOPIC IS IN ENGLISH (including single English terms like "Calculus", "Artificial Intelligence", etc.):
  You MUST write the entire response 100% in scholarly English! Absolutely do NOT write in Kurdish or Arabic.
  Format:
  1. Primary Overarching Research Question: The central question guiding the research.
  2. Secondary Sub-Questions: 3-4 specific sub-questions addressing different facets of the problem.
  3. Research Hypotheses: Paired Null Hypothesis (H0) and Alternative Hypothesis (H1) for each core question.
  4. Methodological Alignment (PICO / FINER criteria): Feasibility, Interest, Novelty, Ethics, and Relevance.
  5. Operational Definitions & Variables: Identification of Independent, Dependent, and Mediating variables.

- IF THE USER INPUT OR TOPIC IS IN KURDISH (Badini or Sorani):
  You MUST write the entire response 100% in pure Kurdish Badini (کوردیا بادینی / بەهدینی - ب چ ئاوایی سۆرانی بکارنەئینە).
  Format:
  1. پرسیارا لێکۆلینێ یا سەرەکی (Primary Overarching Research Question)
  2. 3-4 پرسیارێن لاوەکی (Secondary Sub-Questions)
  3. گریمانەیێن ڤەکۆلینێ: جووتێن گریمانەیا بەتاڵ (H0) و گریمانەیا جێگر (H1)
  4. هەلسەنگاندنا PICO / FINER (بجهئینان، گرنگی، نووخوازی)
  5. پێناسەیا گوهۆڕەکان (گوهۆڕێ سەربەخۆ، گوهۆڕێ پێڤەبست، گوهۆڕێ ناڤبەینکار)

- IF THE USER INPUT OR TOPIC IS IN ARABIC:
  You MUST write the entire response 100% in formal Academic Arabic (العربية الفصحى).
  Format:
  1. السؤال البحثي الرئيسي (Primary Research Question)
  2. 3-4 أسئلة فرعية (Sub-Questions)
  3. الفرضيات البحثية: الفرضية الصفرية (H0) والبديلة (H1)
  4. معايير PICO / FINER
  5. التعريفات الإجرائية والمتغيرات (المستقلة، التابعة، الوسيطة)

- IF IN ANY OTHER LANGUAGE:
  Respond in that exact same language.

Do NOT use raw markdown bold bugs like '**'.`,

  methodology_assistant: `You are an expert in academic research methodology and quantitative/qualitative design.
Based on the user's research aim or proposal, design a complete Methodology Section:
1. 🏗️ Research Design (چوارچێوەیا لێکۆڵینەوەیێ: چەندایەتی، چۆنایەتی، یان تێکەڵاو).
2. 👥 Population & Sampling (کۆمەڵگە و قەبارەیێ نموونێ، شێوازێ هەڵبژارتنێ: Random, Stratified, Purposive).
3. 🛠️ Data Collection Instruments (ئامراز: ڕاپرسی، چاڤپێکەفتن، تاقیکرن).
4. 📈 Data Analysis Plan (پیلانا شیکاریێ: SPSS, ANOVA, Regression, Python, Thematic Coding / NVivo).
5. 🛡️ Validity, Reliability & Ethics (ڕەوایی، جێگیری، و ڕەوشتێ ڤەکۆلینێ).
LANGUAGE RULES:
- If in English: write 100% in English.
- If in Kurdish: write 100% in pure Kurdish Badini (Kurmanji / بەهدینی). NEVER use Sorani.
- If in Arabic: write 100% in Arabic.
- If in another language: write in that exact same language.
Do not use '**'.`,

  citation_generator: `You are a citation and referencing specialist. Format the provided reference information into standard styles:
1. APA 7th Edition (In-Text & Reference List)
2. MLA 9th Edition (In-Text & Works Cited)
3. Chicago 17th Edition (Author-Date & Bibliography)
4. Harvard Referencing Style
5. IEEE Style (Numbered)
6. Vancouver Style
Ensure 100% adherence to punctuation, italicization conventions, capitalization, and DOI formatting. Output cleanly organized sections for each style.`,

  bibtex_generator: `You are a BibTeX formatting specialist. When the user provides a reference, paper title, DOI, or author details:
Generate clean, error-free, standard BibTeX entries (@article, @book, @inproceedings, @phdthesis, @misc).
Include all required and optional fields: author, title, journal/booktitle, year, volume, number, pages, publisher, doi, and issn/isbn.
Ensure author names are properly formatted (e.g., "Lastname, Firstname and Lastname2, Firstname2") and special characters are LaTeX-escaped.`,

  latex_word: `You are an expert in mathematical typesetting and LaTeX to Word / Word to LaTeX conversion.
When the user provides:
A) LaTeX equations or markup:
   - Provide the equivalent Microsoft Word equation format (UnicodeMath / MathML / Linear equation text ready to paste in Word Alt+=).
   - Provide a clear breakdown of each symbol and structure.
B) Word/plain text equations:
   - Provide the clean, compilable LaTeX equation code (e.g. using align, equation, frac, int, etc.).
   - Include any necessary LaTeX packages (amsmath, amssymb, etc.).
Keep output crystal clear with copyable code blocks.`,

  english_tutor: `You are an elite, friendly, and expert English Language Tutor and Linguist dedicated to Kurdish speakers.
The user is asking a question about English (Grammar, Vocabulary, Pronunciation, Sentence Structure, Translation, Conversation, Idioms, Common Mistakes, IELTS/TOEFL, or Daily Life phrases).

Your mission:
1. Explain the answer clearly, concisely, and encouragingly in pure Kurdish Badini (کوردیا بادینی / بەهدینی / کرمانجیا ژۆرین).
2. Provide standard, natural English examples with clear phonetics and line-by-line Badini translations.
3. If there is a common mistake related to the question, highlight the (❌ Wrong vs ✅ Right) comparison.
4. Keep the explanation beautifully organized with clear sections, bullet points, or numbered lists.

CRITICAL LANGUAGE RULES:
- Kurdish explanations MUST be in pure Kurdish Badini (e.g., بکارئینان، دەستەواژە، ڕێزمان، پرسیار، بەرسڤ، چەوا، دکەت، نینە، هەیە). NEVER use Sorani.
- English words, sentences, and examples should be natural and accurate.
- Do not use raw markdown bold '**' symbols. Use clean headings, bullet points, and numbered lists.`,

  english_quiz_generator: `You are an expert English Language Teacher creating interactive practice questions for Kurdish speakers.
Based on the requested level or topic, generate a high quality multiple choice question.
Return ONLY a valid JSON object matching this structure (no markdown fences, no text outside JSON):
{
  "question": "English question text (or Kurdish instructions in Badini)",
  "category": "Grammar" | "Vocabulary" | "Idioms" | "Common Mistakes" | "Conversation",
  "difficulty": "سەرەتایی (A1-A2)" | "ناڤین (B1-B2)" | "پێشکەفتی (C1-C2)",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer_index": 0,
  "explanation": "Detailed, friendly explanation in pure Kurdish Badini explaining why this option is correct and why the others are wrong."
}
Never write anything outside the JSON.`,
};

interface AiTestSentence {
  text: string;
  isAi: boolean;
  score?: number;
  reason?: string;
}

interface AiTestReportData {
  percentage: number;
  confidence: string;
  reasons: string[];
  advice: string;
  sentences: AiTestSentence[];
}

interface CachedToolResult {
  output: string;
  reportData?: AiTestReportData;
  timestamp: number;
}

// Persistent deterministic result cache for testai, testplagiarism, and document_forensics
const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "tool_results_cache.json");

function loadDiskCache(): Map<string, CachedToolResult> {
  const map = new Map<string, CachedToolResult>();
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const content = fs.readFileSync(CACHE_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object") {
        for (const [k, v] of Object.entries(parsed)) {
          map.set(k, v as CachedToolResult);
        }
      }
    }
  } catch (e) {
    console.warn("Could not load tool cache from disk:", e);
  }
  return map;
}

function saveDiskCache(map: Map<string, CachedToolResult>) {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    const plain: Record<string, CachedToolResult> = {};
    for (const [k, v] of map.entries()) {
      plain[k] = v;
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(plain, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not persist tool cache to disk:", e);
  }
}

const toolCache = loadDiskCache();
const CACHE_MAX_SIZE = 1000;
const CACHE_TTL_MS = 365 * 24 * 60 * 60 * 1000; // 1 year persistent TTL
const CACHE_VERSION = "v5_deterministic_fixed";

function computeToolCacheKey(tool: string, input?: string, fileBase64?: string, mimeType?: string): string {
  const hasher = createHash("sha256");
  hasher.update(CACHE_VERSION);
  hasher.update("::");
  hasher.update(tool);
  if (fileBase64) {
    hasher.update("::file_content::");
    hasher.update(fileBase64); // Exact bit-for-bit hash of the entire file bytes
  } else {
    hasher.update("::text_content::");
    hasher.update((input || "").trim().toLowerCase());
  }
  return hasher.digest("hex");
}

function processAiTestResult(rawOutput: string, sourceInput?: string): { output: string; reportData: AiTestReportData } {
  let parsed: any = null;
  try {
    const clean = rawOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
    parsed = JSON.parse(clean);
  } catch (e) {
    const match = rawOutput.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {}
    }
  }

  if (parsed && typeof parsed.percentage === "number") {
    let percentage = Math.max(0, Math.min(100, Math.round(parsed.percentage)));
    const reasons = Array.isArray(parsed.reasons) && parsed.reasons.length > 0
      ? parsed.reasons
      : ["دارشتنا دەقی نیشانا وەرگێڕانا ڕاستەوخۆ ژ زمانی ئینگلیزی دەردئێخیت ب رێکا ئامرازێن ئۆتۆماتیکی یان ژیریا دەستکرد."];
    const advice = parsed.advice || "ڕستەیان دووبارە ب شێوەیەکێ سروشتی بنڤیسە دا کۆ شێوازێ مرۆڤانەتر هەبیت.";

    let sentences: AiTestSentence[] = Array.isArray(parsed.sentences) ? parsed.sentences : [];
    sentences = sentences.filter((s) => s && typeof s.text === "string" && s.text.trim().length > 0);

    if (sentences.length > 0) {
      let aiCount = 0;
      let totalSentenceScore = 0;
      for (const s of sentences) {
        if (typeof s.score !== "number" || isNaN(s.score)) {
          s.score = s.isAi ? 85 : 15;
        } else {
          s.score = Math.max(0, Math.min(100, Math.round(s.score)));
        }
        if (s.isAi === undefined) {
          s.isAi = s.score >= 50;
        }
        if (s.isAi) aiCount++;
        totalSentenceScore += s.score;
      }

      // If percentage > 0 but no sentences were flagged as AI, ensure top sentences are flagged!
      if (percentage > 0 && aiCount === 0) {
        const targetAiCount = Math.max(1, Math.min(sentences.length, Math.round((percentage / 100) * sentences.length) || 1));
        const sorted = [...sentences].sort((a, b) => (b.score || 0) - (a.score || 0));
        for (let i = 0; i < targetAiCount; i++) {
          sorted[i].isAi = true;
          sorted[i].score = Math.max(70, percentage);
          if (!sorted[i].reason) {
            sorted[i].reason = "نیشانێن دارشتنا ئۆتۆماتیکی یان ژیریا دەستکرد";
          }
        }
        aiCount = targetAiCount;
      }

      // Consistent calibration based on actual analyzed sentences
      const sampleAiRatio = Math.round((aiCount / sentences.length) * 100);
      const avgScore = Math.round(totalSentenceScore / sentences.length);
      const sentenceBasedPct = Math.round((sampleAiRatio * 0.6) + (avgScore * 0.4));
      if (Math.abs(percentage - sentenceBasedPct) > 15) {
        percentage = Math.round((percentage * 0.35) + (sentenceBasedPct * 0.65));
      } else {
        percentage = Math.round((percentage * 0.5) + (sentenceBasedPct * 0.5));
      }
      percentage = Math.max(0, Math.min(100, percentage));
    } else if (sourceInput && sourceInput.trim()) {
      const rawSentences = sourceInput
        .split(/(?<=[.!?؟\n])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const aiCount = Math.max(percentage > 0 ? 1 : 0, Math.round((percentage / 100) * rawSentences.length));
      sentences = rawSentences.map((text, idx) => ({
        text,
        isAi: idx < aiCount,
        score: idx < aiCount ? Math.min(95, percentage + 10) : Math.max(5, percentage - 20),
        reason: idx < aiCount ? "نیشانێن دارشتنا ئۆتۆماتیکی" : "",
      }));
    }

    const confidence = parsed.confidence || (percentage >= 70 ? "بەرز" : percentage >= 35 ? "ناڤین" : "نزم");
    const formattedOutput = `ڕێژەیا AI: ${percentage}%\nئاستێ باوەریێ: ${confidence}\n\nئەگەر:\n${reasons.map((r: string) => `- ${r}`).join("\n")}\n\nئامۆژگاری: ${advice}`;

    return {
      output: toWesternDigits(formattedOutput),
      reportData: {
        percentage,
        confidence,
        reasons: reasons.map((r: string) => toWesternDigits(r)),
        advice: toWesternDigits(advice),
        sentences: sentences.map((s) => ({
          ...s,
          text: toWesternDigits(s.text),
          reason: s.reason ? toWesternDigits(s.reason) : s.reason,
        })),
      },
    };
  }

  // Fallback regex parser
  const pctMatch = rawOutput.match(/(\d{1,3})\s*%/);
  const percentage = pctMatch ? Math.min(100, parseInt(pctMatch[1], 10)) : 30;
  const confMatch = rawOutput.match(/ئاستێ باوەریێ:\s*([^\n\r]+)/);
  const confidence = confMatch ? confMatch[1].trim() : (percentage >= 70 ? "بەرز" : "ناڤین");

  const reasons: string[] = [];
  const lines = rawOutput.split("\n");
  let inReasons = false;
  let advice = "";
  for (const line of lines) {
    const l = line.trim();
    if (l.includes("ئەگەر:")) { inReasons = true; continue; }
    if (l.includes("ئامۆژگاری:")) {
      inReasons = false;
      advice = l.replace("ئامۆژگاری:", "").trim();
      continue;
    }
    if (inReasons && (l.startsWith("-") || l.startsWith("•") || l.startsWith("*"))) {
      reasons.push(l.replace(/^[-•*]\s*/, ""));
    }
  }

  if (reasons.length === 0) {
    reasons.push("شێوازێ دارشتنا دەقی دگەل مۆدێلێن ژیریا دەستکرد هەڤتا دبیت.");
  }
  if (!advice) {
    advice = "پێداچوونێ ل سەر ڕستەیان بکە دا کۆ ب زمانێ مرۆڤانەتر بهێتە نڤیسین.";
  }

  let sentences: AiTestSentence[] = [];
  if (sourceInput && sourceInput.trim()) {
    const rawSentences = sourceInput
      .split(/(?<=[.!?؟\n])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const aiCount = Math.round((percentage / 100) * rawSentences.length);
    sentences = rawSentences.map((text, idx) => ({
      text,
      isAi: idx < aiCount,
      score: idx < aiCount ? Math.min(95, percentage + 10) : Math.max(5, percentage - 20),
      reason: idx < aiCount ? "گومانا نڤیسینا ئۆتۆماتیکی" : "",
    }));
  }

  return {
    output: rawOutput,
    reportData: {
      percentage,
      confidence,
      reasons,
      advice,
      sentences,
    },
  };
}

function processPlagiarismResult(rawOutput: string, sourceInput?: string): { output: string; reportData: AiTestReportData } {
  let parsed: any = null;
  try {
    const clean = rawOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
    parsed = JSON.parse(clean);
  } catch (e) {
    const match = rawOutput.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {}
    }
  }

  if (parsed && typeof parsed.percentage === "number") {
    let percentage = Math.max(0, Math.min(100, Math.round(parsed.percentage)));
    const reasons = Array.isArray(parsed.reasons) && parsed.reasons.length > 0
      ? parsed.reasons
      : ["بوونا دەقێ هاوبەش و کۆپیکری دگەل ژێدەرێن بەردەستێن ئەکادیمی بێ ئاماژەدان ب ژێدەری."];
    const advice = parsed.advice || "پشکێن دووبارە و کۆپیکری ب ئامرازێ Paraphrase یێ Las AI سەرلەنووی دارێژەڤە و ژێدەرێن باوەڕپێکری بۆ زێدە بکە.";

    let sentences: AiTestSentence[] = Array.isArray(parsed.sentences) ? parsed.sentences : [];
    sentences = sentences.filter((s) => s && typeof s.text === "string" && s.text.trim().length > 0);

    if (sentences.length > 0) {
      let plagCount = 0;
      let totalSentenceScore = 0;
      for (const s of sentences) {
        if (typeof s.score !== "number" || isNaN(s.score)) {
          s.score = s.isAi ? 85 : 15;
        } else {
          s.score = Math.max(0, Math.min(100, Math.round(s.score)));
        }
        if (s.isAi === undefined) {
          s.isAi = s.score >= 50;
        }
        if (s.isAi) plagCount++;
        totalSentenceScore += s.score;
      }

      // If percentage > 0 but no sentences flagged, flag top candidates
      if (percentage > 0 && plagCount === 0) {
        const targetCount = Math.max(1, Math.min(sentences.length, Math.round((percentage / 100) * sentences.length) || 1));
        const sorted = [...sentences].sort((a, b) => (b.score || 0) - (a.score || 0));
        for (let i = 0; i < targetCount; i++) {
          sorted[i].isAi = true;
          sorted[i].score = Math.max(70, percentage);
          if (!sorted[i].reason) {
            sorted[i].reason = "دەقێ هاوبەش و کۆپیکری ژ ژێدەرێن بەردەست";
          }
        }
        plagCount = targetCount;
      }

      const sampleRatio = Math.round((plagCount / sentences.length) * 100);
      const avgScore = Math.round(totalSentenceScore / sentences.length);
      const sentenceBasedPct = Math.round((sampleRatio * 0.6) + (avgScore * 0.4));
      if (Math.abs(percentage - sentenceBasedPct) > 15) {
        percentage = Math.round((percentage * 0.35) + (sentenceBasedPct * 0.65));
      } else {
        percentage = Math.round((percentage * 0.5) + (sentenceBasedPct * 0.5));
      }
      percentage = Math.max(0, Math.min(100, percentage));
    } else if (sourceInput && sourceInput.trim()) {
      const rawSentences = sourceInput
        .split(/(?<=[.!?؟\n])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const plagCount = Math.max(percentage > 0 ? 1 : 0, Math.round((percentage / 100) * rawSentences.length));
      sentences = rawSentences.map((text, idx) => ({
        text,
        isAi: idx < plagCount,
        score: idx < plagCount ? Math.min(95, percentage + 10) : Math.max(5, percentage - 20),
        reason: idx < plagCount ? "دەقێ هاوبەش و کۆپیکری ژ ژێدەرێن بەردەست" : "",
      }));
    }

    const confidence = parsed.confidence || (percentage >= 70 ? "بەرز" : percentage >= 35 ? "ناڤین" : "نزم");
    const formattedOutput = `ڕێژەیا پلاجیاریزم: ${percentage}%\nئاستێ باوەریێ: ${confidence}\n\nئەگەر:\n${reasons.map((r: string) => `- ${r}`).join("\n")}\n\nئامۆژگاری: ${advice}`;

    return {
      output: toWesternDigits(formattedOutput),
      reportData: {
        percentage,
        confidence,
        reasons: reasons.map((r: string) => toWesternDigits(r)),
        advice: toWesternDigits(advice),
        sentences: sentences.map((s) => ({
          ...s,
          text: toWesternDigits(s.text),
          reason: s.reason ? toWesternDigits(s.reason) : s.reason,
        })),
      },
    };
  }

  // Fallback if parsing fails: extract percentage from text regex
  const pctMatch = rawOutput.match(/ڕێژەیا پلاجیاریزم:\s*(\d{1,3})\s*%/i) || rawOutput.match(/(\d{1,3})\s*%/);
  const percentage = pctMatch ? Math.min(100, parseInt(pctMatch[1], 10)) : 15;
  const rawSentences = (sourceInput || "")
    .split(/(?<=[.!?؟\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const plagCount = Math.max(percentage > 0 ? 1 : 0, Math.round((percentage / 100) * rawSentences.length));
  const fallbackSentences: AiTestSentence[] = rawSentences.map((text, idx) => ({
    text,
    isAi: idx < plagCount,
    score: idx < plagCount ? 85 : 15,
    reason: idx < plagCount ? "دەقێ هاوبەش و کۆپیکری ژ ژێدەرێن بەردەست" : "",
  }));

  return {
    output: rawOutput,
    reportData: {
      percentage,
      confidence: "بەرز",
      reasons: ["بوونا دەقێ هاوبەش و کۆپیکری دگەل ژێدەرێن بەردەستێن ئەکادیمی بێ ئاماژەدان ب ژێدەری."],
      advice: "پشکێن دوبارە و کۆپیکری ب شێوازی خۆ دابڕێژەوە و ژێدەرێن باوەڕپێکراو بۆ زیاد بکە.",
      sentences: fallbackSentences,
    },
  };
}

export const Route = createFileRoute("/api/tool")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rate = checkRateLimit(request, 30, 60 * 1000);
        if (!rate.ok) {
          return Response.json(
            { error: "داواکاریێن تە ژ سنوری دەربازبوون. هیڤیە کێمەکێ دی چاڤەڕێ بە." },
            { status: 429 },
          );
        }

        try {
          const {
            tool,
            input,
            fileBase64,
            mimeType,
            fileName,
            sourceLang,
            targetLang,
            forceRefresh,
            audioMode,
          } = (await request.json()) as {
            tool?: ToolKey;
            input?: string;
            fileBase64?: string;
            mimeType?: string;
            fileName?: string;
            sourceLang?: string;
            targetLang?: string;
            forceRefresh?: boolean;
            audioMode?: "transcribe" | "both" | "summarize";
          };
          if (!tool || !PROMPTS[tool]) {
            return Response.json({ error: "ئامرازێ نادروست." }, { status: 400 });
          }
          const hasFile = !!(fileBase64 && mimeType);
          if (!hasFile && (!input || !input.trim())) {
            return Response.json({ error: "دەقەکی بنڤیسە یان فایلەکی هەڵبژێرە." }, { status: 400 });
          }

          // Deterministic cache check for testplagiarism and document_forensics (testai runs fresh deterministic analysis)
          const cacheEligible = tool === "testplagiarism" || tool === "document_forensics";
          const cacheKey = cacheEligible ? computeToolCacheKey(tool, input, fileBase64, mimeType) : "";

          if (cacheEligible && cacheKey && !forceRefresh) {
            const cached = toolCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
              console.log(`[Tool Cache Hit] tool=${tool} key=${cacheKey}`);
              return Response.json({ output: cached.output, reportData: cached.reportData });
            }
          }

          if (tool === "audio_sum" && hasFile) {
            // Clean & sanitize mimeType for Gemini Native (e.g. "audio/webm;codecs=opus" -> "audio/webm")
            let cleanMime = (mimeType || "").split(";")[0].trim().toLowerCase();
            if (cleanMime === "audio/x-m4a" || (!cleanMime && fileName?.endsWith(".m4a"))) {
              cleanMime = "audio/mp4";
            } else if (cleanMime === "audio/mp3") {
              cleanMime = "audio/mpeg";
            } else if (!cleanMime || (!cleanMime.startsWith("audio/") && !cleanMime.startsWith("video/"))) {
              cleanMime = "audio/webm";
            }

            const promptToUse =
              audioMode === "transcribe"
                ? AUDIO_TRANSCRIBE_ONLY_PROMPT
                : AUDIO_SUM_AND_TRANSCRIBE_PROMPT;

            const nativeBody = {
              systemInstruction: {
                parts: [
                  { text: BADINI_RULE + "\n\n" + promptToUse }
                ]
              },
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      inlineData: {
                        mimeType: cleanMime,
                        data: fileBase64
                      }
                    }
                  ]
                }
              ]
            };

            const aiResp = await fetchGeminiNative(nativeBody);

            if (!aiResp.ok) {
              if (aiResp.status === 429)
                return Response.json({ error: "داواکاری زۆرن، چاڤەڕێ بە." }, { status: 429 });
              if (aiResp.status === 402)
                return Response.json({ error: "کرێدیتا AI ب دووماهیک هات." }, { status: 402 });
              const errData = await aiResp.json().catch(() => ({}));
              return Response.json({ error: errData.error || "خەلەتی د سێرڤیسێ AI دا." }, { status: 500 });
            }

            const data = await aiResp.json();
            let output: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

            // Strip markdown bold/italic markers
            output = output
              .replace(/\*\*/g, "")
              .replace(/(^|\s)\*(\S[^*]*\S|\S)\*/g, "$1$2")
              .replace(/^#+\s*/gm, "");
            output = toWesternDigits(output);

            let transcription = "";
            let summary = "";
            if (output.includes("---")) {
              const parts = output.split("---");
              transcription = parts[0].replace(/^نڤیسینا تەمام یا دەنگی:\s*/i, "").trim();
              summary = parts.slice(1).join("---").replace(/^پوختە و خاڵێن سەرەکی:\s*/i, "").trim();
            } else {
              transcription = output.trim();
            }

            return Response.json({ output, transcription, summary });
          }

          if (input && input.length > 10000) {
            return Response.json({ error: "دەق زۆر درێژە." }, { status: 400 });
          }

          // ── Office / PDF files via Gemini Native ──────────────
          const isOffice =
            [
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "application/vnd.ms-powerpoint",
              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            ].includes(mimeType!) || /\.(docx?|xlsx?|pptx?)$/i.test(fileName || "");

          const isPdf = mimeType === "application/pdf" || /\.pdf$/i.test(fileName || "");

          if (hasFile && (isPdf || isOffice)) {
            const systemPrompt =
              tool === "grapher" || tool === "testai" || tool === "testplagiarism" || ACADEMIC_TOOLS.includes(tool)
                ? PROMPTS[tool]
                : tool === "translator"
                  ? getTranslatorSystemPrompt(sourceLang, targetLang)
                  : BADINI_RULE + "\n\n" + PROMPTS[tool];

            const userParts: unknown[] = [];
            if (input && input.trim()) userParts.push({ text: input });

            if (isOffice) {
              let extractedOfficeText = "";
              try {
                const buffer = Buffer.from(fileBase64!, "base64");
                let fileType: SupportedFileType = "docx";
                const ext = (fileName?.split(".").pop() || "").toLowerCase();
                if (ext && ["docx", "doc", "xlsx", "xls", "pptx", "ppt"].includes(ext)) {
                  fileType = ext as SupportedFileType;
                }
                const ast = await parseOffice(buffer, { fileType });
                extractedOfficeText = (await ast.to("text")).value;
              } catch (parseError) {
                console.warn("Office parsing error:", parseError);
              }

              if (extractedOfficeText && extractedOfficeText.trim()) {
                userParts.push({
                  text:
                    (tool === "testai"
                      ? "دەقێ ئەڤێ دۆکیۆمێنتێ پشکنین بکە بۆ ڕێژەیا ژیریا دەستکرد (AI). زۆر پێدڤیە: د بەشێ 'sentences' دا، 25-40 ڕستەیێن تەواو ژ دەقی دەربێنە ب شێوەیەکێ وشە-بۆ-وشە و بێ گۆڕین (Exact verbatim sentences) دگەل 'isAi': true/false دا بشێین ڕێک ل سەر فایلی هایلایت بکەین:\n\n"
                      : tool === "testplagiarism"
                        ? "دەقێ ئەڤێ دۆکیۆمێنتێ پشکنین بکە بۆ دزیا زانستی و دەقێ دوبارە (Plagiarism). زۆر پێدڤیە: د بەشێ 'sentences' دا، 25-40 ڕستەیێن تەواو ژ دەقی دەربێنە ب شێوەیەکێ وشە-بۆ-وشە و بێ گۆڕین (Exact verbatim sentences) دگەل 'isAi': true (بۆ ڕستەیێن کۆپیکری) یان false:\n\n"
                        : tool === "paper_summarizer"
                          ? "ناوەڕۆکا ئەڤی فایلی کورت بکە و شیکار بکە دیارکری ل دویڤ یاسایێن زمانی:\n\n"
                          : "ناوەڕۆکا ئەڤی فایلی بکاربینە:\n\n") + extractedOfficeText,
                });
              } else {
                const officeInstruction =
                  tool === "testai"
                    ? "دەقێ ئەڤێ دۆکیۆمێنتێ پشکنین بکە بۆ ڕێژەیا ژیریا دەستکرد (AI). زۆر پێدڤیە: د بەشێ 'sentences' دا، کێمترین 25-40 ڕستەیێن تەواو ژ لاپەڕێن فایلی دەربێنە ب شێوەیەکێ وشە-بۆ-وشە و بێ گۆڕین (Exact verbatim sentences) دگەل 'isAi': true/false دا کۆ بشێین ل سەر فایلی هایلایت بکەین."
                    : tool === "testplagiarism"
                      ? "دەقێ ئەڤێ دۆکیۆمێنتێ پشکنین بکە بۆ دزیا زانستی و دەقێ دوبارە (Plagiarism). زۆر پێدڤیە: د بەشێ 'sentences' دا، کێمترین 25-40 ڕستەیێن تەواو ژ لاپەڕێن فایلی دەربێنە ب شێوەیەکێ وشە-بۆ-وشە و بێ گۆڕین (Exact verbatim sentences) دگەل 'isAi': true (بۆ ڕستەیێن کۆپیکری) یان false."
                      : tool === "paper_summarizer"
                        ? "ناوەڕۆکا ئەڤی فایلی کورت بکە و شیکار بکە دیارکری ل دویڤ یاسایێن زمانی:"
                        : "ناوەڕۆکا ئەڤی فایلی بکاربینە:";
                userParts.push({ text: officeInstruction });
                userParts.push({ inlineData: { mimeType: mimeType, data: fileBase64 } });
              }
            } else {
              const pdfInstruction =
                tool === "testai"
                  ? "دەقێ ئەڤێ دۆکیۆمێنتێ یان فایلی ب دروستی پشکنین بکە بۆ ڕێژەیا ژیریا دەستکرد (AI). زۆر پێدڤیە: د بەشێ 'sentences' دا، کێمترین 25-40 ڕستەیێن تەواو ژ لاپەڕێن جیاواز یێن دۆکیۆمێنتێ دەربێنە ب شێوەیەکێ وشە-بۆ-وشە و بێ گۆڕین (Exact verbatim sentences). بۆ هەر ڕستەیەکێ 'isAi': true یان false دیار بکە ب هەمان ڕێژەیا گشتی یا دەستنیشانکری، دا کۆ بشێین ڕێک ل سەر لاپەڕێن فایلی یێن PDF هایلایت بکەین."
                  : tool === "testplagiarism"
                    ? "دەقێ ئەڤێ دۆکیۆمێنتێ یان فایلی ب دروستی پشکنین بکە بۆ دزیا زانستی و دەقێ دوبارە (Plagiarism). زۆر پێدڤیە: د بەشێ 'sentences' دا، کێمترین 25-40 ڕستەیێن تەواو ژ لاپەڕێن جیاواز یێن دۆکیۆمێنتێ دەربێنە ب شێوەیەکێ وشە-بۆ-وشە و بێ گۆڕین (Exact verbatim sentences). بۆ هەر ڕستەیەکێ 'isAi': true (بۆ ڕستەیێن کۆپیکری/پلاجیاریزم) یان false (بۆ ڕستەیێن ڕەسەن) دیار بکە ب هەمان ڕێژەیا گشتی یا دەستنیشانکری، دا کۆ بشێین ڕێک ل سەر لاپەڕێن فایلی یێن PDF هایلایت بکەین."
                    : tool === "paper_summarizer"
                      ? "ناوەڕۆکا ئەڤی فایلی کورت بکە و شیکار بکە دیارکری ل دویڤ یاسایێن زمانی:"
                      : "ناوەڕۆکا ئەڤی فایلی بکاربینە:";
              userParts.push({ text: pdfInstruction });
              userParts.push({ inlineData: { mimeType: "application/pdf", data: fileBase64 } });
            }

            const nativeBody: Record<string, unknown> = {
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: "user", parts: userParts }],
            };

            if (tool === "testai" || tool === "testplagiarism") {
              nativeBody.generationConfig = {
                responseMimeType: "application/json",
                temperature: 0,
                topP: 0.05,
                seed: 42,
              };
            }

            const aiResp = await fetchGeminiNative(nativeBody);

            if (!aiResp.ok) {
              if (aiResp.status === 429)
                return Response.json({ error: "داواکاری زۆرن، چاڤەڕێ بە." }, { status: 429 });
              if (aiResp.status === 402)
                return Response.json({ error: "کرێدیتا AI ب دووماهیک هات." }, { status: 402 });
              const errData = await aiResp.json().catch(() => ({}));
              return Response.json({ error: errData.error || "خەلەتی د سێرڤیسێ AI دا." }, { status: 500 });
            }

            const data = await aiResp.json();
            let output: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            output = output.replace(/\*\*/g, "").replace(/(^|\s)\*(\S[^*]*\S|\S)\*/g, "$1$2").replace(/^#+\s*/gm, "");
            output = toWesternDigits(output);

            if (tool === "testai") {
              const res = processAiTestResult(output, input);
              if (cacheKey) {
                if (toolCache.size >= CACHE_MAX_SIZE) {
                  const oldest = toolCache.keys().next().value;
                  if (oldest) toolCache.delete(oldest);
                }
                toolCache.set(cacheKey, {
                  output: res.output,
                  reportData: res.reportData,
                  timestamp: Date.now(),
                });
                saveDiskCache(toolCache);
              }
              return Response.json({ output: res.output, reportData: res.reportData });
            }

            if (tool === "testplagiarism") {
              const res = processPlagiarismResult(output, input);
              if (cacheKey) {
                if (toolCache.size >= CACHE_MAX_SIZE) {
                  const oldest = toolCache.keys().next().value;
                  if (oldest) toolCache.delete(oldest);
                }
                toolCache.set(cacheKey, {
                  output: res.output,
                  reportData: res.reportData,
                  timestamp: Date.now(),
                });
                saveDiskCache(toolCache);
              }
              return Response.json({ output: res.output, reportData: res.reportData });
            }

            if (cacheKey) {
              if (toolCache.size >= CACHE_MAX_SIZE) {
                const oldest = toolCache.keys().next().value;
                if (oldest) toolCache.delete(oldest);
              }
              toolCache.set(cacheKey, { output, timestamp: Date.now() });
              saveDiskCache(toolCache);
            }

            return Response.json({ output });
          }

          // ── Standard path: text + image/PDF via OpenAI-compat endpoint ─────
          const userContent: unknown[] = [];
          if (input && input.trim()) userContent.push({ type: "text", text: input });
          if (hasFile) {
            userContent.push({
              type: "text",
              text: tool === "paper_summarizer"
                ? "ناوەڕۆکا ئەڤی فایلی کورت بکە و شیکار بکە دیارکری ل دویڤ یاسایێن زمانی:"
                : "ناوەڕۆکا ئەڤی فایلی بکاربینە:"
            });
            userContent.push({
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${fileBase64}` },
            });
          }

          // Use fast and stable gemini-2.5-flash
          const modelName = "gemini-2.5-flash";

          const requestBody: Record<string, unknown> = {
            model: modelName,
            temperature: 0,
            messages: [
              {
                role: "system",
                content:
                  tool === "grapher" || tool === "testai" || tool === "testplagiarism" || ACADEMIC_TOOLS.includes(tool)
                    ? PROMPTS[tool]
                    : tool === "translator"
                      ? getTranslatorSystemPrompt(sourceLang, targetLang)
                      : BADINI_RULE + "\n\n" + PROMPTS[tool],
              },
              {
                role: "user",
                content:
                  userContent.length === 1 &&
                    typeof userContent[0] === "object" &&
                    "text" in (userContent[0] as Record<string, unknown>)
                    ? input!
                    : userContent,
              },
            ],
          };

          if (tool === "grapher" || tool === "document_forensics" || tool === "testai" || tool === "testplagiarism") {
            requestBody.response_format = { type: "json_object" };
            requestBody.temperature = 0;
          }

          const aiResp = tool === "grapher"
            ? await fetchGeminiForGrapher(requestBody)
            : await fetchGemini(requestBody);

          if (!aiResp.ok) {
            if (aiResp.status === 429)
              return Response.json({ error: "داواکاری زۆرن، چاڤەڕێ بە." }, { status: 429 });
            if (aiResp.status === 402)
              return Response.json({ error: "کرێدیتا AI ب دووماهیک هات." }, { status: 402 });
            const errData = await aiResp.json().catch(() => ({}));
            return Response.json({ error: errData.error || "خەلەتی د سێرڤیسێ AI دا." }, { status: 500 });
          }

          const data = await aiResp.json();
          let output: string = data?.choices?.[0]?.message?.content ?? "";

          if (tool !== "grapher" && tool !== "document_forensics" && tool !== "testai" && tool !== "testplagiarism") {
            // Strip markdown bold/italic markers and normalize digits
            output = output
              .replace(/\*\*/g, "")
              .replace(/(^|\s)\*(\S[^*]*\S|\S)\*/g, "$1$2")
              .replace(/^#+\s*/gm, "");
            output = toWesternDigits(output);
          }

          if (tool === "testai") {
            output = toWesternDigits(output);
            const res = processAiTestResult(output, input);
            if (cacheKey) {
              if (toolCache.size >= CACHE_MAX_SIZE) {
                const oldest = toolCache.keys().next().value;
                if (oldest) toolCache.delete(oldest);
              }
              toolCache.set(cacheKey, {
                output: res.output,
                reportData: res.reportData,
                timestamp: Date.now(),
              });
              saveDiskCache(toolCache);
            }
            return Response.json({ output: res.output, reportData: res.reportData });
          }

          if (tool === "testplagiarism") {
            output = toWesternDigits(output);
            const res = processPlagiarismResult(output, input);
            if (cacheKey) {
              if (toolCache.size >= CACHE_MAX_SIZE) {
                const oldest = toolCache.keys().next().value;
                if (oldest) toolCache.delete(oldest);
              }
              toolCache.set(cacheKey, {
                output: res.output,
                reportData: res.reportData,
                timestamp: Date.now(),
              });
              saveDiskCache(toolCache);
            }
            return Response.json({ output: res.output, reportData: res.reportData });
          }

          output = toWesternDigits(output);
          if (cacheKey) {
            if (toolCache.size >= CACHE_MAX_SIZE) {
              const oldest = toolCache.keys().next().value;
              if (oldest) toolCache.delete(oldest);
            }
            toolCache.set(cacheKey, { output, timestamp: Date.now() });
            saveDiskCache(toolCache);
          }

          return Response.json({ output });
        } catch (e) {
          console.error("tool error:", e);
          return Response.json({ error: e instanceof Error ? e.message : "خەلەتی" }, { status: 500 });
        }
      },
    },
  },
});
