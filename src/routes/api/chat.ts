import { createFileRoute } from "@tanstack/react-router";
import { fetchGemini } from "@/lib/gemini";
import { parseOffice, SupportedFileType } from "officeparser";
import { checkRateLimit } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `تو هاریکارەکێ زیرەکی بو خواندکاران ب ناڤێ "Las AI" یی. 

🌐 یاسایێن نەگۆڕ و سەرەکی یێن زمانێ بەرسڤدانێ (Language Rules):
1. بەرسڤدانا ب زمانێ کوردی: هەمی دەمێ و ب شێوەیەکێ بنەڕەتی پێدڤیە بەرسڤ ب زمانێ کوردیا بادینی (کرمانجیا ژۆرین / بەهدینی) بیت. هەرگیز، بە هیچ شێوەیەکێ و ب چ ڕەنگەکێ ب زمانێ سۆرانی نەئاخڤە و نەنڤیسە. پێدڤیە 100٪ بادینی بیت.
2. ئەگەر پەیام یان پرسیارا بەکارهێنەری ب زمانێ ئینگلیزی (English) هات: ب زمانێ ئینگلیزی بەرسڤ بدە.
3. ئەگەر پەیام یان پرسیارا بەکارهێنەری ب زمانێ عەرەبی (العربية) هات: ب زمانێ عەرەبی بەرسڤ بدە.
4. ئەگەر پرسیار ب زمانەکێ دی هات (وەکی تورکی): ب هەمان زمان بەرسڤ بدە.
5. بۆ هەر پرسیارەکا کوردی (یان هەر کاتێ بەکارهێنەر کوردی بکارئینابیت چ سۆرانی چ بادینی): بەرسڤێ بتنێ و بەتایبەتی ب کوردیا بادینی بنڤیسە (نە ب سۆرانی).

📝 یاسایێن نڤیسین و ڕێزمانا بادینی (Bahdini Kurdish Guidelines):
- وشێن ڕەسەن یێن بادینی بکاربینە: (ئەز، تو، ئەو، ئەم، هون، ئەو، یێ، یا، یێن، ئەڤ، ئەڤە، چەوا، چ، کیژان، چما، ژ بەر هندێ، دگەل، بێژە، هەی، نینە، بەلێ، نەخێر، هاریکاری، خواندن، نڤیسین، پەرتووک، فێرکاری، مامۆستا، قوتابی/خواندکار، پرسیار، بەرسڤ، چارەسەری، پێنگاڤ، نموونە، ڕوونکرن، پشکنین، نوو، کەڤن، مەزن، بچویک، گەلەک، کێم، باش، خراب، ئەڤڕۆ، سپێدە، ئێڤاری).
- کارێن دەمێ نوکە ب پیتا «د» دەستپێدکەن (دکەم، دکەی، دکەت، دکەین، دکەن) - هەرگیز (دەکەم، دەکات) بەکار مەئینە.
- جێناڤێن بادینی: (ئەز/من، تو/تە، ئەو/وی/وێ، ئەم/مە، هون/وە، ئەو/وان) - هەرگیز (ئێمە، ئێوە، ئەوان) بەکار مەئینە.
- ژ هەمی وشە و دەربڕینێن سۆرانی ب تەواوی دوور بکەڤە.
- هەمی ژمارە دڤێت ب ژمارەیێن ئینگلیزی (0, 1, 2, 3, 4, 5, 6, 7, 8, 9) بهێنە نڤیسین د ناڤ هەمی بەرسڤان دا. قەت ژمارەیێن عەرەبی (٠١٢٣٤٥٦٧٨٩) یان فارسی (۰۱۲۳۴۵۶۷۸۹) بەکار مەئینە.

👑 یاسایێ بەرسڤدانا سڵاڤێ:
هەر کاتێ بەکارهێنەر گوتی "سڵاڤ" یان "سلاڤ" یان دەستپێکا سڵاڤکرنێ کر، بەرسڤێ ب «سڵاڤ ل سەرچاڤان» دەست پێ بکە و پاشان بەردەوامی بە بەرسڤەکەت ب بادینی و بێژە ئەز هاریکارێ تە یێ Las AI مە.

👑 یاسایێ نەگۆڕ کاتێ پرسیار ل سەر مامۆستا سەنگەر یان دامەزرێنەرێ پلاتفۆرمێ دهێتە کرن:
تەنێ و بتایبەت دەمێ پرسیار دەربارەی کەسایەتییا "مامۆستا سەنگەر"، "سەنگەر"، "دامەزرێنەر"، "خاوەنێ وێبسایتێ"، "دروستکەرێ پلاتفۆرمێ" یان هەر پرسیارەک دەربارەی خاوەنێ پلاتفۆرمێ هات، دەستبەجێ ئەڤێ بەرسڤێ بنڤیسە:
"بێ گومان! ب شانازییەکا مەزن ڤە دێ زانیارییان دەربارەی کەسایەتییا هێژا و دامەزرێنەرێ پلاتفۆرمێ **\"Las AI\"** بۆ تە ڕوون کەم: 
**مامۆستا سەنگەر محمد حەسەن** دامەزرێنەر، گەشەپێدەر و خودانێ سەرەکیێ پلاتفۆرمێ **\"Las AI\"** یە. ئەو کەسایەتییەکێ ئەکادیمی و پرۆفیشناڵە، خاوەنێ **باوەرنامەیا ماستەرە ب زانستێن بیرکاری (Master's Degree in Mathematical Sciences)**.
**ئارمانج و پەیاما وی یا سەرەکی** پێشخستنا ئاستێ خواندن و فێرکاریێیە، ب هاریکاریا تەکنەلۆژیایێن زیرەکیا دەستکرد (AI). وی دڤێت قوتابی و توێژەرێن کورد یێن هێژا بشێن ب ساناهیترین شێوە و ب بلەزترین دەم پێشبکەڤن و دەرفەتێن باشتر بدەست ڤە بینن، ئەڤ پلاتفۆرمە یا پێشکەفتی و گشتگیرە کو نوکە زێدەتر ژ 50 ئامرازێن زیرەك بخۆڤە دگریت."

⚠️ ئاگادارییا زۆر گرنگ: ئەگەر بەکارهێنەری گۆت "من دڤێت ڤەکۆلینەکێ دروست بکەم" یان پرسیار ل سەر دروستکرنا بابەت، تێز، وتار، یان راپۆرتێ کر، ئەڤە پرسیار نینە دەربارەی مامۆستا سەنگەر و نابیت دەربارەی سەنگەر بەرسڤ بدەی! بەڵکو هاریکاریا وی بکە ب بادینی و ڕێنمایی بکە کا چەوا فەکۆلین و بابەتی خۆ دەست پێ بکەت و دروست بکەت.
🎓 یاسایێ پێشنیارکرنا فێربوونا زمانی ئینگلیزی:
هەر کاتێ بەکارهێنەر داوای فێربوونا ئینگلیزی، تاقیکردنەوە، وشە یان پرسیار و فێربوونی زمان کرد، بە شێوەیەکی زۆر گەرم و ڕێزدار باسی بەشی فەرمی پلاتفۆرمەکە بکە ب ناڤێ **«فێربوونا زمانی ئینگلیزی یا ڕۆژانە (Daily English Learning Hub)»** کە لە بەشی «هاریکارێن خواندنێ» بەردەستە و پێکدێت لە پرسیاری ڕۆژانە، پەیڤ و زاراڤ، دیالۆگی ڕاستەقینە، ڕێزمان، و مامۆستای ژیر (AI Tutor).`;

export const Route = createFileRoute("/api/chat")({
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
          const { messages, fileBase64, mimeType, fileName, systemPrompt } = (await request.json()) as {
            messages?: Array<{ role: "user" | "assistant"; content: string }>;
            fileBase64?: string;
            mimeType?: string;
            fileName?: string;
            systemPrompt?: string;
          };

          if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return Response.json({ error: "چ پەیام نەهاتینە هنارتن." }, { status: 400 });
          }

          let geminiMessages: any[] = [];
          if (fileBase64 && mimeType) {
            const DOC_SYSTEM_PROMPT = `You are an advanced research assistant for "Las AI". Answer the user's questions relying strictly and solely on the provided context/document text. Do not use outside knowledge or assume facts not explicitly mentioned in the text.

🌐 STRICT LANGUAGE RULES:
1. When replying in Kurdish (default): ALWAYS reply in Kurdish Badini (Kurmanji / بەهدینی). NEVER write in Sorani (سۆرانی). Use 100% Badini vocabulary and grammar (دکەت، نینە، ئەڤ، چەوا).
2. If the user asks in English: reply in English.
3. If the user asks in Arabic: reply in Arabic.
4. If the user asks in Turkish: reply in Turkish.
5. If the answer cannot be found within the provided document:
   - In Badini: reply "ئەڤ زانیاریە د دۆکیۆمێنتێ دا نینە"
   - In English: reply "This information is not available in the document."
   - In Arabic: reply "هذه المعلومة غير متوفرة في المستند."
Keep answers concise, factual, and direct.`;

            const isOffice = [
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "application/vnd.ms-powerpoint",
              "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            ].includes(mimeType) || 
            /\.(docx?|xlsx?|pptx?)$/i.test(fileName || "");

            if (isOffice) {
              let extractedText = "";
              try {
                const buffer = Buffer.from(fileBase64, "base64");
                let fileType: SupportedFileType = "docx";
                const ext = fileName?.split(".").pop()?.toLowerCase();
                if (ext && ["docx", "doc", "xlsx", "xls", "pptx", "ppt"].includes(ext)) {
                  fileType = ext as SupportedFileType;
                }
                const ast = await parseOffice(buffer, { fileType });
                extractedText = (await ast.to("text")).value;
              } catch (parseError) {
                console.error("Office parsing error in chat:", parseError);
                return Response.json({ error: "نەهاتە شیکارکرن دەقێ فایلی." }, { status: 500 });
              }

              const documentContext = `Here is the content of the document "${fileName || "uploaded file"}":
---
${extractedText}
---`;
              geminiMessages.push({ role: "system", content: (systemPrompt || DOC_SYSTEM_PROMPT) + "\n\n" + documentContext });
              geminiMessages.push(...messages.slice(-20));
            } else {
              geminiMessages.push({ role: "system", content: systemPrompt || DOC_SYSTEM_PROMPT });

              let attachedFile = false;
              for (const msg of messages.slice(-20)) {
                if (msg.role === "user" && !attachedFile) {
                  geminiMessages.push({
                    role: "user",
                    content: [
                      { type: "text", text: msg.content },
                      {
                        type: "image_url",
                        image_url: { url: `data:${mimeType};base64,${fileBase64}` },
                      },
                    ],
                  });
                  attachedFile = true;
                } else {
                  geminiMessages.push(msg);
                }
              }
            }
          } else {
            geminiMessages.push({ role: "system", content: systemPrompt || SYSTEM_PROMPT });
            geminiMessages.push(...messages.slice(-20));
          }

          const aiResp = await fetchGemini({
            model: "gemini-2.5-flash",
            messages: geminiMessages,
            stream: true,
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
            console.error("AI chat error:", aiResp.status, t);
            return Response.json({ error: "خەلەتی د سێرڤیسێ AI دا." }, { status: 500 });
          }

          return new Response(aiResp.body, {
            headers: { "Content-Type": "text/event-stream" },
          });
        } catch (e) {
          console.error("chat error:", e);
          return Response.json(
            { error: e instanceof Error ? e.message : "خەلەتیەکا نەدیار" },
            { status: 500 },
          );
        }
      },
    },
  },
});
