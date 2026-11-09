import { createFileRoute } from "@tanstack/react-router";
import { fetchGemini } from "@/lib/gemini";
import { parseOffice, SupportedFileType } from "officeparser";
import { checkRateLimit } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `You are an expert educational assessment creator for "Las AI". From the provided document (PDF, Image, or Office file), extract text using OCR if needed, and generate a high quality multiple-choice quiz (8 to 10 questions). Each question must have 4 options and exactly one correct answer index (0, 1, 2, or 3).

🌐 CRITICAL LANGUAGE RULES:
1. IF THE DOCUMENT IS IN ENGLISH (or primarily English):
   - Every question must be accessible in BOTH English and Kurdish!
   - "question": Write the question clearly and accurately in English.
   - "question_ku": Write the fluent Kurdish Badini (کوردیا بادینی / بەهدینی) translation directly below it so students see both languages.
   - "title": English quiz title.
   - "title_ku": Kurdish Badini quiz title.
   - "options": 4 options in English.
   - "options_ku": 4 corresponding translations in pure Kurdish Badini.
   - "explanation": Brief explanation in English.
   - "explanation_ku": Brief explanation in Kurdish Badini.
2. IF THE DOCUMENT IS IN KURDISH:
   - Output purely in pure Kurdish Badini (کوردیا بادینی / بەهدینی / کرمانجیا ژۆرین).
   - Absolute ban on Kurdish Sorani (سۆرانی) under any circumstance.
3. IF THE DOCUMENT IS IN ARABIC:
   - Output questions, options, and explanations in Arabic, with Kurdish Badini in question_ku.

Always respond ONLY with a valid JSON object matching this structure (no markdown fences, no text outside JSON):
{
  "title": "Quiz Title / ناڤونیشان",
  "title_ku": "ناڤونیشانێ تاقیکرنێ ب کوردیا بادینی",
  "questions": [
    {
      "question": "English question text",
      "question_ku": "دەقێ پرسیارێ ب کوردیا بادینی",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "options_ku": ["هەڵبژارتنا 1 ب بادینی", "هەڵبژارتنا 2 ب بادینی", "هەڵبژارتنا 3 ب بادینی", "هەڵبژارتنا 4 ب بادینی"],
      "answer_index": 0,
      "explanation": "Brief explanation in English",
      "explanation_ku": "ڕوونکرنا کورت ب کوردیا بادینی"
    }
  ]
}
Never write anything outside the JSON.`;

export const Route = createFileRoute("/api/quiz")({
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

            userContent = `ئەڤی دەقی بخوینە و تاقیکرنەکا هەڵبژارتنا فرە دروست بکە ب شێوازێ JSON. ئەگەر فایل ب ئینگلیزی بیت پێدڤیە پرسیار ب ئینگلیزی بیت و ژێر وێ ب کوردیا بادینی ل question_ku بهێتە نڤیسین:
---
${extractedText}
---`;
          } else {
            userContent = [
              {
                type: "text",
                text: "ئەڤێ دۆکیۆمێنتێ بخوینە و تاقیکرنەکا هەڵبژارتنا فرە دروست بکە ب شێوازێ JSON. ئەگەر فایل ب ئینگلیزی بیت پێدڤیە پرسیار ب ئینگلیزی بیت و ژێر وێ ب کوردیا بادینی ل question_ku بهێتە نڤیسین.",
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
            console.error("AI quiz error:", aiResp.status, t);
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
            return Response.json({ error: "نەهاتە دروستکرن تاقیکرن." }, { status: 500 });
          }

          return Response.json({ quiz: parsed });
        } catch (e) {
          console.error("quiz error:", e);
          return Response.json(
            { error: e instanceof Error ? e.message : "خەلەتیەکا نەدیار" },
            { status: 500 },
          );
        }
      },
    },
  },
});
