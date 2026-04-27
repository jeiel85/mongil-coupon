import { SignJWT, jwtVerify, decodeJwt } from "jose";
import { timingSafeEqual } from "crypto";
import { kv } from "./kv";

function getSecret(): Uint8Array {
  const val = process.env.ADMIN_JWT_SECRET;
  if (!val) throw new Error("ADMIN_JWT_SECRET environment variable is required");
  return new TextEncoder().encode(val);
}

export const AUTH_COOKIE = "mongil_admin_token";

export async function signAdminToken(): Promise<string> {
  const jti = crypto.randomUUID();
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  await kv.set(`admin:session:${jti}`, "1", { ex: 60 * 60 * 24 * 7 });
  return token;
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.jti) return false;
    const valid = await kv.get(`admin:session:${payload.jti}`);
    return valid !== null;
  } catch {
    return false;
  }
}

export async function revokeAdminToken(token: string): Promise<void> {
  try {
    const payload = decodeJwt(token);
    if (payload.jti) {
      await kv.del(`admin:session:${payload.jti}`);
    }
  } catch {
    // 잘못된 형식의 토큰이면 revoke할 것이 없음
  }
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || input.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(input), Buffer.from(expected));
  } catch {
    return false;
  }
}
