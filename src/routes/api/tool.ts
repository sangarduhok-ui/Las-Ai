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

const BADINI_RULE = `زۆر گرنگ: تە دڤێت هەمی بەرسڤێن خۆ ب زمانێ کوردیا بادینی (بەهدینی/کرمانجیا ژۆرین) بنڤیسی، نە ب سۆرانی. ١٠٠٪ بادینی بێت. بکارهێنانا وشێن بادینی وەکی: (ئەز، تو، ئەو، ئەم، هون، ئەو، یێ، یا، یێن، ئەڤ، ئەو، چەوا، چ، کیژان، چما، ژ بەر هندێ، دگەل، بێژە، هەی، نە، بەلێ، نەخێر، هاریکاری، خواندن، نڤیسین، پەرتوک، مامۆستا، خواندکار، پرسیار، بەرسڤ، چارەسەری، پێنگاڤ، نموونە، ڕوونکرن، پشکنین، رێژە، ئاست، بەرز، نڤی، کێم، باش، خراب، نوو، کەڤن، مەزن، بچویک). ڤێ ڕێزمانا بادینی پاراستن: کاران بێ ب (دکەم، دکەی، دکەت، دکەین، دکەن)، نە ب (دەکەم، دەکات). جینەکر: ئەز/تو/ئەو/ئەم/هون/ئەو. ژ نڤیسێت سۆرانی ب تەواوی دوور بکەڤە. هیچ نیشانا ** بکار نەیینە.`;

const PROMPTS: Record<ToolKey, string> = {
  planner: `تۆ پلاندانەرێکی پسپۆڕی خوێندنیت. لەسەر بنەمای بابەت/ماوەی خوێندن، پلانێکی ڕۆژانەی ڕێکوپێک دروست بکە بە کوردی سۆرانی. بۆ هەر ڕۆژێک: کاتژمێرەکان، بابەتەکان، چاودێری و پشوو. لە کۆتاییدا چەند تێبینیەکی فێرکاری زیاد بکە.

تکایە هیچ کاتێک نیشانەی ** بەکار مەهێنە بۆ بۆڵد. تەنها نوسینی ئاسایی بەکاربێنە لەگەڵ سەردێڕ و لیست بە — یان • .`,

  solver: `تۆ مامۆستای پسپۆڕی بیرکاری و زانستیت. ئەگەر وێنە نێردرابێت، یەکەم پرسیار/پسیارکانی ناو وێنە بخوێنەوە (OCR) و پاشان چارەسەری بکە. پسیارەکە چارەسەر بکە پێنگاڤ بە پێنگاڤ بە کوردی سۆرانی. هەر پێنگاڤێک بە ژمارە. لە کۆتاییدا "وەڵامی کۆتایی:" بنووسە لەگەڵ وەڵامەکە.

تکایە هیچ کاتێک نیشانەی ** بەکار مەهێنە. تەنها نوسینی ئاسایی.`,

  math2word: `تۆ گۆڕەری هاوکێشەی بیرکاریت. ئەگەر وێنە نێردرابێت، هاوکێشەکانی ناو وێنە بخوێنەوە. ئەگەر دەق نێردرابێت، هاوکێشەکانی ناوی دەربێنە.

دەرئەنجامەکەت دەبێت تەنها هاوکێشەکان بێت بە فۆڕماتی Unicode تەمیز کە دەکرێت ڕاستەوخۆ بکرێتە ناو Microsoft Word. هەر هاوکێشە لە دێڕێکی جیادا.

هیچ ڕوونکردنەوە، هیچ سەردێڕ، هیچ ** ، هیچ نوسینی زیادە. تەنها هاوکێشەکان.

نمونە:
∫₀¹ x² dx = 1/3
x = (-b ± √(b²-4ac)) / 2a`,

  tts: `تۆ پوختەکەرێکی پسپۆڕیت. دەقەکە بکە بە پوختەیەکی کورت (٣-٥ ڕستە) بە هەمان زمانی دەقەکە، گونجاو بۆ گوێ گرتن. تەنها پوختەکە بنووسە. هیچ نیشانەی ** بەکار مەهێنە.`,

  grader: `تۆ مامۆستای پێوانکردنی ڕاپۆرتی ئەکادیمیت. ئەگەر فایل نێردرابێت، ناوەڕۆکی بخوێنەوە. ڕاپۆرتەکە بپێوە لەسەر چوار شت:
١) پێکهاتە و ڕێکخستن  ٢) ناوەڕۆک و بیرۆکە  ٣) زمان و ڕێزمان  ٤) سەرچاوە و بەڵگە

هەر بەشێک نمرە بدە لە ١٠، پاشان نمرەی کۆتایی لە ١٠٠. لە کۆتاییدا "ڕاسپاردە بۆ باشتربوون" بنووسە بە لیست.

هیچ نیشانەی ** بەکار مەهێنە.`,

  glossary: `تۆ فەرهەنگی زاراوەی زانستیت. بەکارهێنەر بابەتێک دەنێرێت، تۆ ١٠-١٥ زاراوەی پەیوەندیدار لیست بکە بەم شێوەیە:

زاراوە (ئینگلیزی): پێناسەی کورت بە کوردی.

هیچ نیشانەی ** بەکار مەهێنە. هەر زاراوەیەک لە دێڕی جیادا.`,

  testai: `تۆ شیکارێکی پسپۆڕیت بۆ دۆزینەوەی نوسینی AI. دەقەکە شی بکەرەوە و ڕێژەی نوسینی AI پێشبینی بکە (٠-١٠٠).

دەرئەنجامەکەت دەبێت بەم شێوەیە بێت بەبێ هیچ نیشانەی **:

ڕێژەی AI: XX%
ئاستی متمانە: بەرز / مامناوەند / نزم

هۆکارەکان:
- خاڵی یەکەم
- خاڵی دووەم
- خاڵی سێیەم

ئامۆژگاری: چۆن مرۆیتر بکرێت.

گرنگ: یەکەم دێڕ دەبێت بەم شێوەیە بێت: "ڕێژەی AI: XX%" بۆ ئەوەی بتوانرێت ژمارەکە دەربهێنرێت.`,

  testplagiarism: `تۆ شیکارێکی پسپۆڕی پلاجیاریزمیت. دەقەکە شی بکەرەوە بۆ نیشانەکانی کۆپیکردن.

دەرئەنجامەکەت دەبێت بەم شێوەیە بێت بەبێ هیچ نیشانەی **:

ڕێژەی پلاجیاریزم: XX%
ئاستی متمانە: بەرز / مامناوەند / نزم

بەشە گومانلێکراوەکان:
- "..." — هۆکار
- "..." — هۆکار

ئامۆژگاری: چۆن باشتر بنووسرێتەوە.

گرنگ: یەکەم دێڕ دەبێت بەم شێوەیە بێت: "ڕێژەی پلاجیاریزم: XX%" بۆ ئەوەی بتوانرێت ژمارەکە دەربهێنرێت.`,
};

export const Route = createFileRoute("/api/tool")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) return Response.json({ error: "AI سەرڤیس ئامادە نییە." }, { status: 500 });

          const { tool, input, fileBase64, mimeType } = (await request.json()) as {
            tool?: ToolKey;
            input?: string;
            fileBase64?: string;
            mimeType?: string;
          };
          if (!tool || !PROMPTS[tool]) {
            return Response.json({ error: "ئامرازی نادروست." }, { status: 400 });
          }
          const hasFile = !!(fileBase64 && mimeType);
          if (!hasFile && (!input || !input.trim())) {
            return Response.json({ error: "دەقێک بنووسە یان فایلێک هەڵبژێرە." }, { status: 400 });
          }
          if (input && input.length > 10000) {
            return Response.json({ error: "دەقەکە زۆر درێژە." }, { status: 400 });
          }

          const userContent: unknown[] = [];
          if (input && input.trim()) userContent.push({ type: "text", text: input });
          if (hasFile) {
            userContent.push({ type: "text", text: "ناوەڕۆکی ئەم فایلە بەکاربێنە:" });
            userContent.push({
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${fileBase64}` },
            });
          }

          const aiResp = await fetch(GATEWAY_URL, {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: BADINI_RULE + "\n\n" + PROMPTS[tool] },
                { role: "user", content: userContent.length === 1 && typeof userContent[0] === "object" && "text" in (userContent[0] as Record<string, unknown>) ? input! : userContent },
              ],
            }),
          });

          if (!aiResp.ok) {
            if (aiResp.status === 429) return Response.json({ error: "داواکاریەکان زۆرن، چاوەڕێبە." }, { status: 429 });
            if (aiResp.status === 402) return Response.json({ error: "کرێدیتی AI تەواوبوو." }, { status: 402 });
            return Response.json({ error: "هەڵە لە سەرڤیسی AI." }, { status: 500 });
          }

          const data = await aiResp.json();
          let output: string = data?.choices?.[0]?.message?.content ?? "";
          // Strip markdown bold/italic markers
          output = output.replace(/\*\*/g, "").replace(/(^|\s)\*(\S[^*]*\S|\S)\*/g, "$1$2").replace(/^#+\s*/gm, "");
          return Response.json({ output });
        } catch (e) {
          console.error("tool error:", e);
          return Response.json({ error: e instanceof Error ? e.message : "هەڵە" }, { status: 500 });
        }
      },
    },
  },
});
