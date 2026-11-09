import { createFileRoute } from "@tanstack/react-router";
import { fetchGemini } from "@/lib/gemini";
import { parseOffice, SupportedFileType } from "officeparser";
import { checkRateLimit } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `You are an expert educational AI summarizer for "Las AI". Extract the content from the provided document (PDF, Image, or Office file) using OCR if necessary, and create a clean, highly structured educational summary.

🌐 CRITICAL LANGUAGE RULES:
1. When summarizing in Kurdish (default): ALWAYS output in pure Kurdish Badini (کوردیا بادینی / بەهدینی / کرمانجیا ژۆرین). NEVER output in Sorani (سۆرانی). Use Badini terms and grammar (e.g. خاڵێن سەرەکی، زاراوە، پێناسە، ڕێکەوت یان یاسا، ئەڤە، دکەت، نینە).
2. If the document or query is primarily in English: output the JSON content in English.
3. If the document or query is primarily in Arabic: output the JSON content in Arabic.
4. Absolute ban on Kurdish Sorani under any condition.

Always respond ONLY with a valid JSON object matching this structure (no markdown code blocks, no text outside JSON):
{
  "title": "ناڤونیشانێ کورت ب بادینی / Short Title",
  "language_detected": "ku" | "en" | "ar" | "mixed",
  "main_points": ["خالا سەرەکی 1 ب بادینی", "..."],
  "definitions": [{"term": "زاراوە", "definition": "پێناسە ب بادینی"}],
  "dates_formulas": ["ڕێکەوت یان یاسا 1", "..."]
}
Never write anything outside the JSON.`;

export const Route = createFileRoute("/api/summarize")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rate = checkRateLimit(request, 25, 60 * 1000);
        if (!rate.ok) {
          return Response.json(
            { error: "داواکاریێن تە ژ سنوری دەربازبوون. هیڤیە کێمەکێ دی چاڤەڕێ بە." },
            { status: 429 },
          );
        }

        try {
          const body = (await request.json()) as {
            fileBase64?: string;
            mimeType?: string;
            fileName?: string;
          };

          if (!body.fileBase64 || !body.mimeType) {
            return Response.json({ error: "چ فایل نەهاتینە هنارتن." }, { status: 400 });
          }

          const isImage = body.mimeType.startsWith("image/");
          const isPdf = body.mimeType === "application/pdf";
          const isOffice = [
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
          ].includes(body.mimeType) || 
          /\.(docx?|xlsx?|pptx?)$/i.test(body.fileName || "");

          if (!isImage && !isPdf && !isOffice) {
            return Response.json({ error: "بتنێ PDF، وێنە یان فایلی ئۆفیس دهێنە وەرگرتن." }, { status: 400 });
          }

          let userContent: any;

          if (isOffice) {
            let extractedText = "";
            try {
              const buffer = Buffer.from(body.fileBase64, "base64");
              let fileType: SupportedFileType = "docx";
              const ext = body.fileName?.split(".").pop()?.toLowerCase();
              if (ext && ["docx", "doc", "xlsx", "xls", "pptx", "ppt"].includes(ext)) {
                fileType = ext as SupportedFileType;
              }
              const ast = await parseOffice(buffer, { fileType });
              extractedText = (await ast.to("text")).value;
            } catch (parseError) {
              console.error("Office parsing error:", parseError);
              return Response.json({ error: "نەهاتە شیکارکرن دەقێ فایلی." }, { status: 500 });
            }

            userContent = `دەقێ ئەڤی فایلی بخوینە و پوختەیەکا ڕێکخستی بۆ خواندکاری دروست بکە ب JSON (ب کوردیا بادینی ئەگەر کوردی بیت):
---
${extractedText}
---`;
          } else {
            userContent = [
              {
                type: "text",
                text: "ئەڤێ دۆکیۆمێنتێ بخوینە و پوختەیەکا ڕێکخستی بۆ خواندکاری دروست بکە ب JSON (ب کوردیا بادینی ئەگەر کوردی بیت).",
              },
              {
                type: "image_url",
                image_url: { url: `data:${body.mimeType};base64,${body.fileBase64}` },
              },
            ];
          }

          const aiResp = await fetchGemini({
            model: "gemini-3.5-flash-lite",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userContent },
            ],
            response_format: { type: "json_object" },
          });

          if (!aiResp.ok) {
            if (aiResp.status === 429) {
              return Response.json(
                { error: "داواکاری زۆرن، هیڤیە چەند چرکەیا چاڤەڕێ بە." },
                { status: 429 },
              );
            }
            if (aiResp.status === 402) {
              return Response.json(
                { error: "کرێدیتا AI ب دووماهیک هات. هیڤیە پلانەکا پڕۆ (Pro) چالاک بکە." },
                { status: 402 },
              );
            }
            const t = await aiResp.text();
            console.error("AI error:", aiResp.status, t);
            return Response.json({ error: "خەلەتی د سێرڤیسێ AI دا." }, { status: 500 });
          }

          const data = await aiResp.json();
          const raw = (data?.choices?.[0]?.message?.content ?? "")
            .replace(/[٠-٩]/g, (d: string) => String(d.charCodeAt(0) - 0x0660))
            .replace(/[۰-۹]/g, (d: string) => String(d.charCodeAt(0) - 0x06F0));
          let parsed: unknown;
          try {
            parsed = JSON.parse(raw);
          } catch {
            const m = raw.match(/\{[\s\S]*\}/);
            parsed = m ? JSON.parse(m[0]) : null;
          }

          if (!parsed) {
            return Response.json({ error: "نەهاتە دروستکرن پوختە." }, { status: 500 });
          }

          return Response.json({ summary: parsed });
        } catch (e) {
          console.error("summarize error:", e);
          return Response.json(
            { error: e instanceof Error ? e.message : "خەلەتیەکا نەدیار" },
            { status: 500 },
          );
        }
      },
    },
  },
});
