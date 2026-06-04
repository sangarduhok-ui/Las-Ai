import { createFileRoute } from "@tanstack/react-router";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

type ToolKey =
  | "planner"
  | "solver"
  | "math2word"
  | "tts"
  | "grader"
  | "glossary"
  | "testai"
  | "testplagiarism";

const PROMPTS: Record<ToolKey, string> = {
  planner: `تۆ پلاندانەرێکی پسپۆڕی خوێندنیت. لەسەر بنەمای بابەت/ماوەی خوێندن کە بەکارهێنەر دەینێرێت، پلانێکی ڕۆژانەی ڕێکوپێک دروست بکە بە کوردی سۆرانی. بۆ هەر ڕۆژێک: کاتژمێرەکان، بابەتەکان، چاودێری، و پشوو. لە کۆتاییدا چەند تێبینیەکی فێرکاری زیاد بکە. وەڵامەکە بە Markdown ڕێکبخە (سەردێڕ، لیست).`,
  solver: `تۆ مامۆستای پسپۆڕی بیرکاری و زانستیت. مەسەلەکە چارەسەر بکە **هەنگاو بە هەنگاو** بە کوردی سۆرانی. هەر هەنگاوێک بە ژمارە و ڕوونکردنەوەی کورت. لە کۆتاییدا "وەڵامی کۆتایی" بە بۆڵد بنووسە. فۆرمولەکان بە LaTeX-style ($...$) بنووسە.`,
  math2word: `تۆ یاریدەدەری گۆڕینی هاوکێشەی بیرکاریت بۆ فۆڕماتی Microsoft Word Equation (Unicode/LaTeX). بەکارهێنەر وەسفی هاوکێشە یان هاوکێشە بە دەق دەنێرێت، تۆ سێ شت بدەرەوە:

1. **Unicode (بۆ Word):** نوسینێک کە دەکرێت ڕاستەوخۆ بکرێتە ناو Word.
2. **LaTeX:** بۆ ئەو کەسانەی پێویستیان پێیە.
3. **ڕێنمایی Word:** چۆن بیخەیتە ناو Word (Insert > Equation > Linear, paste, Enter).

بە کوردی ڕوونی بکەرەوە.`,
  tts: `تۆ پوختەکەرێکی پسپۆڕیت. دەقی بەکارهێنەر بکە بە پوختەیەکی کورت (٣-٥ ڕستە) بە هەمان زمانی دەقەکە، گونجاو بۆ گوێ گرتن. تەنها پوختەکە بنووسە، بێ سەردێڕ و بێ ڕوونکردنەوە.`,
  grader: `تۆ مامۆستایەکی پسپۆڕی پێوانکردنی ڕاپۆرت و وتاری ئەکادیمیت. ڕاپۆرتەکە بپێوە لەسەر ئەم چوار شت: ١) پێکهاتە و ڕێکخستن  ٢) ناوەڕۆک و بیرۆکە  ٣) زمان و ڕێزمان  ٤) سەرچاوە و بەڵگە. هەر بەشێک نمرە بدە لە ١٠، پاشان نمرەی کۆتایی لە ١٠٠. لە کۆتاییدا "ڕاسپاردە بۆ باشتربوون" بنووسە. وەڵامەکە بە Markdown.`,
  glossary: `تۆ فەرهەنگی زاراوەی زانستیت. بەکارهێنەر بابەتێک یان زاراوەیەک دەنێرێت، تۆ ١٠-١٥ زاراوەی پەیوەندیدار لیست بکە بەم شێوەیە: **زاراوە (ئینگلیزی):** پێناسەی کورت بە کوردی. وەڵامەکە بە Markdown.`,
  testai: `تۆ شیکارێکی پسپۆڕیت بۆ دۆزینەوەی نوسینی AI. دەقی بەکارهێنەر شی بکەرەوە و ڕێژەی نوسینی AI پێشبینی بکە (٠-١٠٠٪). وەڵامەکە بەم شێوەیە:

**ڕێژەی AI:** XX٪
**ئاستی متمانە:** بەرز/مامناوەند/نزم
**هۆکارەکان:**
- خاڵی ١
- خاڵی ٢
- خاڵی ٣

**ئامۆژگاری:** چۆن مرۆیتر بکرێت.

بە کوردی وەڵام بدەرەوە.`,
  testplagiarism: `تۆ شیکارێکی پسپۆڕی پلاجیاریزمیت. دەقی بەکارهێنەر شی بکەرەوە بۆ نیشانەکانی کۆپیکردن (ستایلی نائاسایی، گۆڕانی تۆن، زاراوەی نائاسایی). وەڵامەکە بەم شێوەیە:

**ڕێژەی پلاجیاریزمی گومانلێکراو:** XX٪
**ئاستی متمانە:** بەرز/مامناوەند/نزم
**بەشە گومانلێکراوەکان:**
- "..." — هۆکار
- "..." — هۆکار

**ئامۆژگاری:** چۆن باشتر بنووسرێتەوە.

تێبینی: ئەمە شیکاری ستایلیە، نەک گەڕانی فەرمی لە ئینتەرنێت.

بە کوردی وەڵام بدەرەوە.`,
};

export const Route = createFileRoute("/api/tool")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) return Response.json({ error: "AI سەرڤیس ئامادە نییە." }, { status: 500 });

          const { tool, input } = (await request.json()) as { tool?: ToolKey; input?: string };
          if (!tool || !PROMPTS[tool]) {
            return Response.json({ error: "ئامرازی نادروست." }, { status: 400 });
          }
          if (!input || typeof input !== "string" || !input.trim()) {
            return Response.json({ error: "دەقێک بنووسە." }, { status: 400 });
          }
          if (input.length > 10000) {
            return Response.json({ error: "دەقەکە زۆر درێژە (١٠٠٠٠ پیت زۆرترین)." }, { status: 400 });
          }

          const aiResp = await fetch(GATEWAY_URL, {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: PROMPTS[tool] },
                { role: "user", content: input },
              ],
            }),
          });

          if (!aiResp.ok) {
            if (aiResp.status === 429) return Response.json({ error: "داواکاریەکان زۆرن، چاوەڕێبە." }, { status: 429 });
            if (aiResp.status === 402) return Response.json({ error: "کرێدیتی AI تەواوبوو." }, { status: 402 });
            return Response.json({ error: "هەڵە لە سەرڤیسی AI." }, { status: 500 });
          }

          const data = await aiResp.json();
          const output = data?.choices?.[0]?.message?.content ?? "";
          return Response.json({ output });
        } catch (e) {
          console.error("tool error:", e);
          return Response.json({ error: e instanceof Error ? e.message : "هەڵە" }, { status: 500 });
        }
      },
    },
  },
});
