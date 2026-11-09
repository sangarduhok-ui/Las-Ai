import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/download-pdf")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const contentType = request.headers.get("content-type") || "";
          let pdfBase64 = "";
          let filename = "LasAI-AI-Report.pdf";

          if (contentType.includes("application/json")) {
            const body = await request.json();
            pdfBase64 = body.pdfBase64 || "";
            filename = body.filename || filename;
          } else if (
            contentType.includes("application/x-www-form-urlencoded") ||
            contentType.includes("multipart/form-data")
          ) {
            const formData = await request.formData();
            pdfBase64 = (formData.get("pdfBase64") as string) || "";
            filename = (formData.get("filename") as string) || filename;
          } else {
            // Raw text or fallback
            pdfBase64 = await request.text();
          }

          if (!pdfBase64) {
            return new Response("No PDF content provided", { status: 400 });
          }

          // Strip data URI prefix if present (handles jsPDF with filename=... as well)
          let cleanBase64 = pdfBase64.trim();
          const base64Marker = ";base64,";
          const markerIdx = cleanBase64.indexOf(base64Marker);
          if (markerIdx !== -1) {
            cleanBase64 = cleanBase64.slice(markerIdx + base64Marker.length).trim();
          } else if (cleanBase64.startsWith("data:")) {
            const commaIdx = cleanBase64.indexOf(",");
            if (commaIdx !== -1) {
              cleanBase64 = cleanBase64.slice(commaIdx + 1).trim();
            }
          }

          const buffer = Buffer.from(cleanBase64, "base64");

          if (!filename.toLowerCase().endsWith(".pdf")) {
            filename += ".pdf";
          }

          const asciiFilename = filename.replace(/[^\w.-]/g, "_");

          return new Response(buffer, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
              "Content-Length": buffer.byteLength.toString(),
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Pragma": "no-cache",
              "Expires": "0",
            },
          });
        } catch (err: any) {
          console.error("Error in /api/download-pdf:", err);
          return new Response("Failed to generate download: " + (err.message || "Unknown error"), {
            status: 500,
          });
        }
      },
    },
  },
});
