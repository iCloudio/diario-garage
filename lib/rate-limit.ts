"use server";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  scope: string;
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  retryAfterMs: number;
};

const globalStore = globalThis as typeof globalThis & {
  __rateLimitStore?: Map<string, RateLimitEntry>;
};

const store = globalStore.__rateLimitStore ?? new Map<string, RateLimitEntry>();

if (!globalStore.__rateLimitStore) {
  globalStore.__rateLimitStore = store;
}

function cleanupExpiredEntries(now: number) {
  for (const [key, value] of store.entries()) {
    if (value.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function checkRateLimit({
  scope,
  key,
  limit,
  windowMs,
}: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const bucketKey = `${scope}:${key}`;
  const current = store.get(bucketKey);

  if (!current || current.resetAt <= now) {
    store.set(bucketKey, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      ok: true,
      limit,
      remaining: Math.max(limit - 1, 0),
      retryAfterMs: windowMs,
    };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      limit,
      remaining: 0,
      retryAfterMs: current.resetAt - now,
    };
  }

  current.count += 1;
  store.set(bucketKey, current);

  return {
    ok: true,
    limit,
    remaining: Math.max(limit - current.count, 0),
    retryAfterMs: current.resetAt - now,
  };
}
