import { createFileRoute } from "@tanstack/react-router";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SYSTEM_PROMPT = `You are an expert English editor. Rewrite the user's AI-generated text so it reads naturally as if written by a real human. Keep the meaning identical, vary sentence length and rhythm, remove robotic phrasing and clichés, use contractions where natural, and keep a clear, professional but warm tone. Output ONLY the rewritten English text, with no preface, no explanation, no markdown.`;

export const Route = createFileRoute("/api/humanize")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) return Response.json({ error: "AI service unavailable." }, { status: 500 });

          const { text } = (await request.json()) as { text?: string };
          if (!text || typeof text !== "string" || text.trim().length === 0) {
            return Response.json({ error: "دەقێک بنووسە." }, { status: 400 });
          }
          if (text.length > 8000) {
            return Response.json({ error: "دەقەکە زۆر درێژە (٨٠٠٠ پیت زۆرترین)." }, { status: 400 });
          }

          const aiResp = await fetch(GATEWAY_URL, {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: text },
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
          console.error("humanize error:", e);
          return Response.json({ error: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
        }
      },
    },
  },
});
