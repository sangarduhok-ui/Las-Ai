import { createFileRoute } from "@tanstack/react-router";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SYSTEM_PROMPT = `تۆ یاریدەدەرێکی زیرەکیت بۆ خوێندکاران بە ناوی "پوختەی AI". بە زمانی کوردی سۆرانی وەڵامی پرسیارەکان بدەرەوە بە شێوەیەکی ڕوون، کورت و بەسوود. ئەگەر پرسیارەکە بە ئینگلیزی یان عەرەبی بوو، بە هەمان زمان وەڵام بدەرەوە. لە کاتی پێویستدا نموونە و ڕوونکردنەوە بدە.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return Response.json({ error: "AI سەرڤیس ئامادە نییە." }, { status: 500 });
          }

          const body = (await request.json()) as {
            messages?: Array<{ role: "user" | "assistant"; content: string }>;
          };

          if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
            return Response.json({ error: "پەیامێک نەنێردراوە." }, { status: 400 });
          }

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
                ...body.messages.slice(-20),
              ],
              stream: true,
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
            console.error("AI chat error:", aiResp.status, t);
            return Response.json({ error: "هەڵە لە سەرڤیسی AI." }, { status: 500 });
          }

          return new Response(aiResp.body, {
            headers: { "Content-Type": "text/event-stream" },
          });
        } catch (e) {
          console.error("chat error:", e);
          return Response.json(
            { error: e instanceof Error ? e.message : "هەڵەیەکی نەزانراو" },
            { status: 500 },
          );
        }
      },
    },
  },
});
