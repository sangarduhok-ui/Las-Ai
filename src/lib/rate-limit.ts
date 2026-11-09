/**
 * In-memory sliding window rate limiter for API endpoints
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipMap = new Map<string, RateLimitRecord>();

// Cleanup stale records every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipMap.entries()) {
      if (now > record.resetTime) {
        ipMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}

export function getClientIp(request: Request): string {
  const headers = request.headers;
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}

/**
 * Check if the request is within rate limits
 * @param request The incoming HTTP Request
 * @param maxRequests Maximum requests per window (default 30)
 * @param windowMs Time window in milliseconds (default 1 minute)
 */
export function checkRateLimit(
  request: Request,
  maxRequests = 30,
  windowMs = 60 * 1000,
): { ok: boolean; remaining: number; resetInMs: number } {
  const ip = getClientIp(request);
  const now = Date.now();

  const record = ipMap.get(ip);

  if (!record || now > record.resetTime) {
    ipMap.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { ok: true, remaining: maxRequests - 1, resetInMs: windowMs };
  }

  if (record.count >= maxRequests) {
    return { ok: false, remaining: 0, resetInMs: Math.max(0, record.resetTime - now) };
  }

  record.count += 1;
  return { ok: true, remaining: maxRequests - record.count, resetInMs: Math.max(0, record.resetTime - now) };
}
