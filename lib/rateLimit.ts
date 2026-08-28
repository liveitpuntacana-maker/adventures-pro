/**
 * Per-IP request throttle for the API routes that cost money to serve.
 *
 * What this is: a sliding window held in the memory of one serverless
 * instance. What it is not: a distributed rate limiter. Vercel may run several
 * instances at once, so a determined attacker spread across them gets a
 * multiple of the limit, and a cold start forgets everything.
 *
 * It is still worth having. The realistic threat here is a script hammering one
 * endpoint in a loop, and that lands on a warm instance and gets cut off. The
 * Vercel Firewall rules are the real ceiling; this is the floor underneath
 * them, and it keeps working if a firewall rule is ever edited or removed.
 */

/** Request timestamps per key, oldest first. */
const windows = new Map<string, number[]>();

/**
 * Keys tracked before the map is cleared.
 *
 * An instance is long-lived and every distinct IP adds an entry, so without a
 * ceiling the map grows until the function runs out of memory. Clearing wholesale
 * costs one window of enforcement, which is cheaper than the alternative.
 */
const MAX_TRACKED_KEYS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  /** Seconds until the caller may retry. Zero when allowed. */
  retryAfter: number;
};

export function rateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  if (windows.size > MAX_TRACKED_KEYS) windows.clear();

  const hits = (windows.get(key) ?? []).filter((time) => time > cutoff);

  if (hits.length >= limit) {
    windows.set(key, hits);
    const oldest = hits[0] ?? now;
    return { ok: false, retryAfter: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)) };
  }

  hits.push(now);
  windows.set(key, hits);
  return { ok: true, retryAfter: 0 };
}

/**
 * Caller's IP as Vercel reports it.
 *
 * `x-forwarded-for` is a comma-separated chain and the client is the first
 * entry; the rest are proxies. Falls back to a single shared bucket when no
 * header is present, which throttles harder rather than not at all.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
