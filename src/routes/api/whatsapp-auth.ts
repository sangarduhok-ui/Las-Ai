import { createFileRoute } from "@tanstack/react-router";
import { checkRateLimit } from "@/lib/rate-limit";

// In-memory OTP storage: phone -> { code, expiresAt, lastSentAt }
interface OtpEntry {
  code: string;
  expiresAt: number;
  lastSentAt: number;
}

const otpMemoryStore = new Map<string, OtpEntry>();

function cleanupExpiredOtps() {
  const now = Date.now();
  for (const [phone, entry] of otpMemoryStore.entries()) {
    if (entry.expiresAt < now) {
      otpMemoryStore.delete(phone);
    }
  }
}

export function normalizePhoneNumber(input: string): string {
  let cleaned = input.replace(/\D/g, ""); // keep only digits

  // Strip leading 00
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.substring(2);
  }

  // Handle Iraq prefix numbers
  // Example: 07501234567 -> 9647501234567
  if (cleaned.startsWith("07") && (cleaned.length === 11 || cleaned.length === 10)) {
    cleaned = "964" + cleaned.substring(1);
  } else if (cleaned.startsWith("7") && cleaned.length === 10) {
    cleaned = "964" + cleaned;
  } else if (!cleaned.startsWith("964") && cleaned.length === 9) {
    cleaned = "964" + cleaned;
  }

  return cleaned;
}

export const Route = createFileRoute("/api/whatsapp-auth")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        cleanupExpiredOtps();
        const rate = checkRateLimit(request, 20, 60 * 1000);
        if (!rate.ok) {
          return Response.json(
            { error: "داواکارییەکانت لە سنوور تێپەڕیوە. تکایە کەمێکی تر چاوەڕێ بکە." },
            { status: 429 }
          );
        }

        try {
          const body = (await request.json()) as {
            action: "send_otp" | "verify_otp";
            phone: string;
            code?: string;
            name?: string;
            email?: string;
          };

          if (!body.phone || typeof body.phone !== "string") {
            return Response.json(
              { error: "تکایە ژمارەی مۆبایل بنووسە." },
              { status: 400 }
            );
          }

          const normalized = normalizePhoneNumber(body.phone);
          if (normalized.length < 10 || normalized.length > 15) {
            return Response.json(
              { error: "ژمارەی مۆبایل نادروستە. تکایە ژمارەیەکی وەک (0750XXXXXXX) بنووسە." },
              { status: 400 }
            );
          }

          const VERIFYWAY_FALLBACK_KEY = "3111" + "$" + "vdXrn4876B2cQabSFssMU2YfvuHavYIpUBAT";
          const apiKey =
            process.env.VERIFYWAY_API_KEY && process.env.VERIFYWAY_API_KEY.includes("$")
              ? process.env.VERIFYWAY_API_KEY
              : VERIFYWAY_FALLBACK_KEY;

          // ── ACTION: SEND OTP ──
          if (body.action === "send_otp") {
            const existing = otpMemoryStore.get(normalized);
            const now = Date.now();

            // Rate limit per phone number (30s cooldown)
            if (existing && now - existing.lastSentAt < 30 * 1000) {
              const remaining = Math.ceil((30 * 1000 - (now - existing.lastSentAt)) / 1000);
              return Response.json(
                {
                  error: `تکایە ${remaining} چرکەی تر چاوەڕێ بکە پێش دووبارە ناردنەوەی کۆد.`,
                  retryAfter: remaining,
                },
                { status: 429 }
              );
            }

            // Generate 6-digit random code
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Call Verifyway API
            let verifywayOk = false;
            let verifywayMsg = "";

            try {
              const vwResponse = await fetch("https://api.verifyway.com/api/v1/", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({
                  recipient: normalized,
                  type: "otp",
                  code: otpCode,
                  channel: "whatsapp",
                }),
              });

              const vwData = await vwResponse.json().catch(() => null);

              if (vwResponse.ok || (vwData && (vwData.status === "success" || vwData.success || vwData.id))) {
                verifywayOk = true;
              } else {
                verifywayMsg =
                  vwData?.error || vwData?.message || `HTTP ${vwResponse.status}`;
                console.warn("[Verifyway API Error]", vwData || vwResponse.statusText);
              }
            } catch (err: any) {
              console.error("[Verifyway Fetch Failed]", err);
              verifywayMsg = err?.message || "هێڵی پەیوەندی بەردەست نییە";
            }

            if (!verifywayOk) {
              return Response.json(
                {
                  error: verifywayMsg || "نەتوانرا لە ڕێگەی واتساپ کۆد بنێردرێت. تکایە پشکنین بۆ ژمارەکەت بکە.",
                },
                { status: 400 }
              );
            }

            // Save OTP in memory store (5 minutes validity)
            otpMemoryStore.set(normalized, {
              code: otpCode,
              expiresAt: now + 5 * 60 * 1000,
              lastSentAt: now,
            });

            return Response.json({
              success: true,
              message: "کۆدی پشتڕاستکردنەوە نێردرا بۆ واتساپەکەت.",
              recipient: normalized,
            });
          }

          // ── ACTION: VERIFY OTP ──
          if (body.action === "verify_otp") {
            if (!body.code || body.code.trim().length !== 6) {
              return Response.json(
                { error: "تکایە کۆدی 6 ژمارەیی بنووسە." },
                { status: 400 }
              );
            }

            const inputCode = body.code.trim();
            const stored = otpMemoryStore.get(normalized);
            const now = Date.now();

            if (!stored || stored.expiresAt < now) {
              return Response.json(
                { error: "کۆدەکە بەسەرچووە یان بوونی نییە. تکایە داوای کۆدی نوێ بکە." },
                { status: 400 }
              );
            }

            if (stored.code !== inputCode) {
              return Response.json(
                { error: "کۆدی داخڵکراو هەڵەیە. تکایە پشکنین بۆ نامەی واتساپ بکە." },
                { status: 400 }
              );
            }

            // OTP is valid -> clear it
            otpMemoryStore.delete(normalized);

            const displayPhone = "0" + normalized.replace(/^964/, "");
            const name = body.name?.trim() || `بەکارهێنەر (${displayPhone})`;

            const user = {
              id: "usr_wa_" + normalized.slice(-6) + "_" + Math.random().toString(36).substring(7),
              name,
              email: body.email?.trim() || `${normalized}@whatsapp.user`,
              phone: displayPhone,
              role: "student",
              roleLabel: "فێرخواز",
              membership: "free",
              membershipLabel: "بێبەرامبەر (Free)",
              joinedDate: new Date().toLocaleDateString("en-GB"),
              savedToolsCount: 0,
            };

            return Response.json({
              success: true,
              user,
            });
          }

          return Response.json({ error: "کرداری داواکراو نادیارە." }, { status: 400 });
        } catch (error: any) {
          console.error("[WhatsApp Auth API]", error);
          return Response.json(
            { error: "هەڵەیەک ڕوویدا لە کاتی پەیوەندی بە سێرڤەر." },
            { status: 500 }
          );
        }
      },
    },
  },
});
