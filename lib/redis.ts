import Redis from 'ioredis';
declare global { var __redis: Redis | undefined; }
export const redis: Redis = global.__redis ?? new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', { maxRetriesPerRequest: 3, enableReadyCheck: false, lazyConnect: true, retryStrategy(times) { return Math.min(times * 50, 2000); } });
if (process.env.NODE_ENV !== 'production') global.__redis = redis;

export async function cacheSet(key: string, value: unknown, ttl?: number): Promise<void> {
  const s = JSON.stringify(value);
  if (ttl) await redis.set(key, s, 'EX', ttl); else await redis.set(key, s);
}
export async function cacheGet<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key);
  return raw ? JSON.parse(raw) as T : null;
}
export async function cacheDel(key: string): Promise<void> { await redis.del(key); }
export async function cacheExists(key: string): Promise<boolean> { return (await redis.exists(key)) > 0; }
