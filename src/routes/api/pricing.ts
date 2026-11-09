import { createFileRoute } from "@tanstack/react-router";
import fs from "node:fs";
import path from "node:path";

export interface PricingPlanDuration {
  id: "1m" | "3m" | "6m" | "1y";
  label: string;
  price: number;
  originalPrice?: number | null;
  discountLabel?: string | null;
  isActive: boolean;
}

export const DEFAULT_PRICING_CONFIG: PricingPlanDuration[] = [
  { id: "1m", label: "1 هەیڤ", price: 5000, originalPrice: null, discountLabel: null, isActive: true },
  { id: "3m", label: "3 هەیڤ", price: 12000, originalPrice: 15000, discountLabel: "20% داشکاندن", isActive: true },
  { id: "6m", label: "6 هەیڤ", price: 22000, originalPrice: 30000, discountLabel: "25% داشکاندن", isActive: true },
  { id: "1y", label: "1 ساڵ", price: 40000, originalPrice: 60000, discountLabel: "35% باشترین داشکاندن", isActive: true },
];

let memoryPricing: PricingPlanDuration[] = [...DEFAULT_PRICING_CONFIG];

function getDataFilePath(): string {
  return path.resolve(process.cwd(), "src", "data", "pricing.json");
}

function loadPricing(): PricingPlanDuration[] {
  try {
    const filePath = getDataFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryPricing = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to read pricing from file, using memory cache:", err);
  }
  return memoryPricing;
}

function savePricing(config: PricingPlanDuration[]): boolean {
  try {
    memoryPricing = config;
    const filePath = getDataFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to save pricing to file:", err);
    return false;
  }
}

// Initial load
loadPricing();

export const Route = createFileRoute("/api/pricing")({
  server: {
    handlers: {
      GET: async () => {
        const current = loadPricing();
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
          const body = await request.json();
          const config = body?.config || body;
          if (!Array.isArray(config) || config.length === 0) {
            return Response.json({ error: "داتای نرخەکان نادروستە" }, { status: 400 });
          }

          savePricing(config);

          return new Response(JSON.stringify({ success: true, data: config }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store, no-cache, must-revalidate",
            },
          });
        } catch (err: any) {
          console.error("Error updating pricing:", err);
          return Response.json(
            { error: "هەڵەیەک لە نوێکردنەوەی نرخەکان ڕوویدا: " + (err.message || "Unknown") },
            { status: 500 }
          );
        }
      },
    },
  },
});
