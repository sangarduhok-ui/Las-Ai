import { createFileRoute } from "@tanstack/react-router";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SYSTEM_PROMPT = `تۆ یاریدەدەرێکی پەروەردەیی زیرەکیت. لە بەڵگەنامەی پێشکەشکراو (PDF یان وێنە) دەقەکە دەردەهێنیت بە OCR ئەگەر پێویست بێت، پاشان پوختەیەکی ڕێکوپێک دروست دەکەیت بە زمانی کوردی سۆرانی.
هەمیشە بە شێوەی JSON تەنیا وەڵام بدەرەوە بەم پێکهاتەیە (بێ هیچ markdown):
{
  "title": "ناونیشانی کورت",
  "language_detected": "ku" | "en" | "mixed",
  "main_points": ["خاڵی سەرەکی ١", "..."],
  "definitions": [{"term": "زاراوە", "definition": "پێناسە"}],
  "dates_formulas": ["ڕێکەوت یان فۆرمول ١", "..."]
}
هەرگیز هیچ شتێک لە دەرەوەی JSON مەنوسە.`;

export const Route = createFileRoute("/api/summarize")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return Response.json({ error: "AI سەرڤیس ئامادە نییە." }, { status: 500 });
          }

          const body = (await request.json()) as {
            fileBase64?: string;
            mimeType?: string;
            fileName?: string;
          };

          if (!body.fileBase64 || !body.mimeType) {
            return Response.json({ error: "فایل نەنێردراوە." }, { status: 400 });
          }

          const isImage = body.mimeType.startsWith("image/");
          const isPdf = body.mimeType === "application/pdf";
          if (!isImage && !isPdf) {
            return Response.json({ error: "تەنیا PDF یان وێنە قبوڵە." }, { status: 400 });
          }

          const userContent = [
            {
              type: "text",
              text: "ئەم بەڵگەنامەیە بخوێنەوە و پوختەیەکی ڕێکوپێک بۆ خوێندکار دروست بکە بە JSON.",
            },
            {
              type: "image_url",
              image_url: { url: `data:${body.mimeType};base64,${body.fileBase64}` },
            },
          ];

          const aiResp = await fetch(GATEWAY_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userContent },
              ],
              response_format: { type: "json_object" },
            }),
          });

          if (!aiResp.ok) {
            if (aiResp.status === 429) {
              return Response.json(
                { error: "داواکاریەکان زۆرن، تکایە چەند چرکەیەک چاوەڕێبە." },
                { status: 429 },
              );
            }
            if (aiResp.status === 402) {
              return Response.json(
                { error: "کرێدیتی AI تەواوبوو. تکایە پلانێکی VIP چالاک بکە." },
                { status: 402 },
              );
            }
            const t = await aiResp.text();
            console.error("AI error:", aiResp.status, t);
            return Response.json({ error: "هەڵە لە سەرڤیسی AI." }, { status: 500 });
          }

          const data = await aiResp.json();
          const raw = data?.choices?.[0]?.message?.content ?? "";
          let parsed: unknown;
          try {
            parsed = JSON.parse(raw);
          } catch {
            const m = raw.match(/\{[\s\S]*\}/);
            parsed = m ? JSON.parse(m[0]) : null;
          }

          if (!parsed) {
            return Response.json({ error: "نەتوانرا پوختە دروست بکرێت." }, { status: 500 });
          }

          return Response.json({ summary: parsed });
        } catch (e) {
          console.error("summarize error:", e);
          return Response.json(
            { error: e instanceof Error ? e.message : "هەڵەیەکی نەزانراو" },
            { status: 500 },
          );
        }
      },
    },
  },
});
