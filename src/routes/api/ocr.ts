import { createFileRoute } from "@tanstack/react-router";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SYSTEM_PROMPT = `تو ئامرازەکێ OCR یێ زیرەکی بو خواندنا دەستنڤیسێ مرۆڤی. وێنێ ببینە و هەمی دەقێ وی بخوینە ب دڵنیایی. ئەگەر دەق ب کوردی بیت ب کوردیا بادینی (بەهدینی) دەربێخە، ئەگەر ب ئینگلیزی یان عەرەبی بیت ب هەمان زمانی. هیچ شیکاری یان پێشەکی زێدە نەکە — تنێ دەقێ دەرهێنایی بنڤیسە، ڕێزبەندیا پاراگراف و دێران وەکی خۆ بپارێزە.`;

export const Route = createFileRoute("/api/ocr")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) return Response.json({ error: "AI service unavailable." }, { status: 500 });

          const { image } = (await request.json()) as { image?: string };
          if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
            return Response.json({ error: "وێنەیەکی دروست هەڵبژێرە." }, { status: 400 });
          }

          const aiResp = await fetch(GATEWAY_URL, {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                  role: "user",
                  content: [
                    { type: "text", text: "ئەم وێنە دەستنووسە بخوێنەوە و دەقەکەی دەربهێنە." },
                    { type: "image_url", image_url: { url: image } },
                  ],
                },
              ],
            }),
          });

          if (!aiResp.ok) {
            if (aiResp.status === 429) return Response.json({ error: "داواکاریەکان زۆرن، تکایە چاوەڕێبە." }, { status: 429 });
            if (aiResp.status === 402) return Response.json({ error: "کرێدیتی AI تەواوبوو." }, { status: 402 });
            return Response.json({ error: "هەڵە لە AI." }, { status: 500 });
          }

          const data = await aiResp.json();
          const output = data?.choices?.[0]?.message?.content ?? "";
          return Response.json({ output });
        } catch (e) {
          console.error("ocr error:", e);
          return Response.json({ error: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
        }
      },
    },
  },
});
