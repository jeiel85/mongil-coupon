import { kv } from "./kv";
import { createHash } from "crypto";

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "mongil-salt";
  return createHash("sha256").update(salt + ip).digest("hex").slice(0, 16);
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export async function rateLimit(
  type: string,
  ip: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `ratelimit:${type}:${hashIp(ip)}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSeconds;

  const pipeline = kv.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart);
  pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });
  pipeline.zcard(key);
  pipeline.expire(key, windowSeconds);

  const results = await pipeline.exec();
  const count = (results[2] as number) ?? 0;

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
  };
}

export async function checkLoginAttempts(ip: string): Promise<boolean> {
  const key = `loginblock:${hashIp(ip)}`;
  const blocked = await kv.get<number>(key);
  return blocked !== null && blocked >= 5;
}

export async function recordLoginFailure(ip: string): Promise<void> {
  const key = `loginblock:${hashIp(ip)}`;
  const current = await kv.get<number>(key);
  if (current === null) {
    await kv.set(key, 1, { ex: 900 });
  } else {
    await kv.incr(key);
  }
}

export async function clearLoginFailures(ip: string): Promise<void> {
  await kv.del(`loginblock:${hashIp(ip)}`);
}
