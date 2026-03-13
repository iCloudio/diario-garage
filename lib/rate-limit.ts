const store = new Map<string, { count: number; resetAt: number }>();

let callCount = 0;
function maybeCleanup() {
  callCount++;
  if (callCount % 200 === 0) {
    const now = Date.now();
    for (const [key, value] of store) {
      if (value.resetAt <= now) store.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { allowed: boolean } {
  maybeCleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    return { allowed: false };
  }

  entry.count++;
  return { allowed: true };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
