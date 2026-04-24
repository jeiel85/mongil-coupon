import { NextRequest, NextResponse } from "next/server";
import { checkPassword, signAdminToken, AUTH_COOKIE } from "@/lib/auth";
import {
  checkLoginAttempts,
  recordLoginFailure,
  clearLoginFailures,
} from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (await checkLoginAttempts(ip)) {
    return NextResponse.json(
      { error: "로그인 시도 횟수를 초과했습니다. 15분 후 다시 시도해 주세요." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const password =
    typeof body === "object" &&
    body !== null &&
    "password" in body
      ? String((body as Record<string, unknown>).password)
      : "";

  if (!checkPassword(password)) {
    await recordLoginFailure(ip);
    return NextResponse.json(
      { error: "비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  await clearLoginFailures(ip);
  const token = await signAdminToken();

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
