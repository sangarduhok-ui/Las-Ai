import { createFileRoute } from "@tanstack/react-router";
import fs from "node:fs";
import path from "node:path";

export interface BroadcastNotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  read: boolean;
  type: "system" | "pro" | "feature" | "tip";
  actionLabel?: string;
  actionSection?: string;
  targetAudience?: "all" | "free" | "pro";
}

function getDataFilePath(): string {
  return path.resolve(process.cwd(), "src", "data", "notifications.json");
}

function loadNotifications(): BroadcastNotificationItem[] {
  try {
    const filePath = getDataFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to read notifications file:", err);
  }
  return [];
}

function saveNotifications(items: BroadcastNotificationItem[]): boolean {
  try {
    const filePath = getDataFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to save notifications:", err);
    return false;
  }
}

export const Route = createFileRoute("/api/notifications")({
  server: {
    handlers: {
      GET: async () => {
        const items = loadNotifications();
        return new Response(JSON.stringify({ success: true, data: items }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, no-cache, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const items = loadNotifications();

          if (body.action === "delete" && body.id) {
            const updated = items.filter((n) => n.id !== body.id);
            saveNotifications(updated);
            return Response.json({ success: true, data: updated });
          }

          if (!body.title || !body.message) {
            return Response.json({ error: "ناونیشان و دەقی ئاگاداری پێویستن." }, { status: 400 });
          }

          const newNotif: BroadcastNotificationItem = {
            id: "notif_bc_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(7),
            title: body.title.trim(),
            message: body.message.trim(),
            time: "نوکە",
            timestamp: Date.now(),
            read: false,
            type: body.type || "feature",
            actionLabel: body.actionLabel?.trim() || undefined,
            actionSection: body.actionSection || undefined,
            targetAudience: body.targetAudience || "all",
          };

          const updated = [newNotif, ...items].slice(0, 50);
          saveNotifications(updated);

          return Response.json({ success: true, data: updated, item: newNotif });
        } catch (err: any) {
          console.error("Error managing notifications:", err);
          return Response.json({ error: err.message || "هەڵەیەک ڕوویدا" }, { status: 500 });
        }
      },
    },
  },
});
