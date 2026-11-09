import { createFileRoute } from "@tanstack/react-router";
import { convertOfficeToPdf } from "@/lib/office-to-pdf";
import path from "node:path";

export const Route = createFileRoute("/api/convert-to-pdf")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const contentType = request.headers.get("content-type") || "";
          let fileBuffer: Buffer | null = null;
          let filename = "document.pdf";
          let ext = "";

          if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
            const formData = await request.formData();
            const uploaded = formData.get("file");

            if (!uploaded || typeof uploaded === "string") {
              return new Response(JSON.stringify({ error: "چ فایلەک دیاریکری نینە." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
              });
            }

            const file = uploaded as File;
            filename = file.name || "document";
            ext = path.extname(filename).toLowerCase().replace(".", "");
            fileBuffer = Buffer.from(await file.arrayBuffer());
          } else {
            return new Response(JSON.stringify({ error: "فۆرماتا داواکاریێ نەیا دروستە." }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          if (!fileBuffer || fileBuffer.byteLength === 0) {
            return new Response(JSON.stringify({ error: "فایلا هاتیە بارکرن بەتاڵە." }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // If already PDF, return directly
          if (ext === "pdf") {
            const safePdfName = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;
            const asciiName = safePdfName.replace(/[^\w.-]/g, "_");
            return new Response(new Uint8Array(fileBuffer), {
              status: 200,
              headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(safePdfName)}`,
                "Content-Length": fileBuffer.byteLength.toString(),
              },
            });
          }

          // Office document conversion
          const pdfBuffer = await convertOfficeToPdf(fileBuffer, filename, ext);

          const outputBaseName = filename.replace(/\.[^.]+$/, "");
          const pdfFilename = `${outputBaseName}.pdf`;
          const asciiFilename = pdfFilename.replace(/[^\w.-]/g, "_");

          return new Response(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(pdfFilename)}`,
              "Content-Length": pdfBuffer.byteLength.toString(),
              "Cache-Control": "no-cache, no-store, must-revalidate",
            },
          });
        } catch (err: any) {
          console.error("Error in /api/convert-to-pdf:", err);
          return new Response(
            JSON.stringify({
              error:
                err?.message ||
                "کێشەیەک لە کاتی گۆڕینی فایل بۆ PDF دروست بوو. تکایە دڵنیابە لە دروستی فایلەکە.",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      },
    },
  },
});
