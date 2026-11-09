import { createFileRoute } from "@tanstack/react-router";
import { fetchGemini } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `You are an expert academic editor, humanizer, and paraphrase specialist.
Rewrite the user's provided text (whether AI-generated or copied/flagged for plagiarism) so it reads completely naturally, authentically, and scholarly as if written by a real human author.
GUIDELINES:
1. Preserve the original language and core academic meaning:
   - If the input is in Kurdish (Badini / Kurmanji or Sorani): Output strictly in pure, authentic Kurdish Badini (Kurmanji / بەهدینی). NEVER use Sorani.
   - If the input is in English: Output in polished, natural academic English.
   - If the input is in Arabic: Output in fluent, authentic Arabic.
2. Vary sentence structures, rhythm, and transitions to eliminate robotic phrasing, verbatim plagiarism similarity, and AI clichés.
3. Keep terminology and scientific facts intact.
4. Output ONLY the rewritten text, with no preamble, no markdown asterisks (**), and no commentary.`;

export const Route = createFileRoute("/api/humanize")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rate = checkRateLimit(request, 25, 60 * 1000);
        if (!rate.ok) {
          return Response.json(
            { error: "داواکاریێن تە ژ سنوری دەربازبوون. هیڤیە کێمەکێ چاڤەڕێ بە." },
            { status: 429 },
          );
        }

        try {
          const { text } = (await request.json()) as { text?: string };
          if (!text || typeof text !== "string" || text.trim().length === 0) {
            return Response.json({ error: "دەقەکی بنڤیسە." }, { status: 400 });
          }
          if (text.length > 8000) {
            return Response.json(
              { error: "دەق گەلەک درێژە (8000 پیت زۆرترینە)." },
              { status: 400 },
            );
          }

          const aiResp = await fetchGemini({
            model: "gemini-2.5-flash",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: text },
            ],
          });

          if (!aiResp.ok) {
            if (aiResp.status === 429)
              return Response.json(
                { error: "داواکاری زۆرن، هیڤیە چاڤەڕێ بە." },
                { status: 429 },
              );
            if (aiResp.status === 402)
              return Response.json({ error: "کرێدیتا AI ب دوماهیک هات." }, { status: 402 });
            return Response.json({ error: "خەلەتیەک د مۆدێلا AI دا چێبوو." }, { status: 500 });
          }

          const data = await aiResp.json();
          const raw = data?.choices?.[0]?.message?.content ?? "";
          const output = raw
            .replace(/[٠-٩]/g, (d: string) => String(d.charCodeAt(0) - 0x0660))
            .replace(/[۰-۹]/g, (d: string) => String(d.charCodeAt(0) - 0x06F0));
          return Response.json({ output });
        } catch (e) {
          console.error("humanize error:", e);
          return Response.json(
            { error: e instanceof Error ? e.message : "Unknown" },
            { status: 500 },
          );
        }
      },
    },
  },
});
