import { SignJWT, jwtVerify } from "jose";
import { timingSafeEqual } from "crypto";
import { kv } from "./kv";

const secret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? "fallback-secret-change-me"
);

export const AUTH_COOKIE = "mongil_admin_token";

export async function signAdminToken(): Promise<string> {
  const jti = crypto.randomUUID();
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  await kv.set(`admin:session:${jti}`, "1", { ex: 60 * 60 * 24 * 7 });
  return token;
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.jti) return false;
    const valid = await kv.get(`admin:session:${payload.jti}`);
    return valid === "1";
  } catch {
    return false;
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
