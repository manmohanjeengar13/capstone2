import { redis } from '@/lib/redis';
export interface RateLimitResult { allowed: boolean; retryAfter: number; remaining: number; total: number; }
export async function checkRateLimit(key: string, limit: number, windowSec: number): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  await redis.zremrangebyscore(key, 0, now - windowMs);
  const count = await redis.zcard(key);
  if (count >= limit) {
    const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES');
    const oldestTs = oldest[1] ? parseInt(oldest[1], 10) : now;
    return { allowed: false, retryAfter: Math.max(Math.ceil((oldestTs + windowMs - now) / 1000), 1), remaining: 0, total: limit };
  }
  await redis.zadd(key, now, `${now}-${Math.random().toString(36).slice(2,9)}`);
  await redis.expire(key, windowSec + 1);
  return { allowed: true, retryAfter: 0, remaining: limit - count - 1, total: limit };
}
