// Minimal in-memory fixed-window rate limiter.
//
// Effective on a long-lived server (self-hosted / Docker) and a best-effort
// safety net on serverless (state is per-instance, so it won't coordinate
// across cold starts). If you need hard guarantees across serverless instances,
// back this with a durable store (e.g. Upstash Redis) — the call sites won't
// need to change, only this module.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = { ok: boolean; retryAfterSeconds: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  // Opportunistic cleanup so the map can't grow without bound.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSeconds: 0 };
}

// Best-effort client IP from proxy headers (Vercel/Nginx set these). Falls back
// to a shared bucket when unknown, which only makes the limit stricter.
export function clientIp(forwardedFor: string | null): string {
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}
