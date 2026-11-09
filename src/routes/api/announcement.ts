import { createFileRoute } from "@tanstack/react-router";
import fs from "node:fs";
import path from "node:path";

export interface PlatformAnnouncement {
  text: string;
  active: boolean;
  type: "info" | "warning" | "success" | "promo";
  updatedAt?: string;
}

const DEFAULT_ANNOUNCEMENT: PlatformAnnouncement = {
  text: "ب خێر بێن بۆ پلاتفۆڕما Las AI! نووکاری بۆ پشکا بیرکاری و زانست هاتنە چالاککرن.",
  active: true,
  type: "promo",
  updatedAt: new Date().toISOString(),
};

// In-memory cache
let memoryAnnouncement: PlatformAnnouncement = { ...DEFAULT_ANNOUNCEMENT };

function getDataFilePath(): string {
  return path.resolve(process.cwd(), "src", "data", "announcement.json");
}

function loadAnnouncement(): PlatformAnnouncement {
  try {
    const filePath = getDataFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed.text === "string") {
        memoryAnnouncement = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to read announcement from file, using memory cache:", err);
  }
  return memoryAnnouncement;
}

function saveAnnouncement(ann: PlatformAnnouncement): boolean {
  try {
    memoryAnnouncement = { ...ann, updatedAt: new Date().toISOString() };
    const filePath = getDataFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(memoryAnnouncement, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to save announcement to file:", err);
    return false;
  }
}

// Initial load
loadAnnouncement();

export const Route = createFileRoute("/api/announcement")({
  server: {
    handlers: {
      GET: async () => {
        const current = loadAnnouncement();
        return new Response(JSON.stringify({ success: true, data: current }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });
      },
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as Partial<PlatformAnnouncement>;
          if (!body || typeof body.text !== "string") {
            return Response.json({ error: "دەقی ڕاگەیاندن نادروستە" }, { status: 400 });
          }

          const newAnn: PlatformAnnouncement = {
            text: body.text.trim(),
            active: body.active !== false,
            type:
              body.type && ["info", "warning", "success", "promo"].includes(body.type)
                ? body.type
                : "promo",
            updatedAt: new Date().toISOString(),
          };

          saveAnnouncement(newAnn);

          return new Response(JSON.stringify({ success: true, data: newAnn }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store, no-cache, must-revalidate",
            },
          });
        } catch (err: any) {
          console.error("Error updating announcement:", err);
          return Response.json(
            { error: "هەڵەیەک لە نوێکردنەوەی ڕاگەیاندن ڕوویدا: " + (err.message || "Unknown") },
            { status: 500 }
          );
        }
      },
    },
  },
});
