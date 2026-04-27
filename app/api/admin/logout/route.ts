import { NextRequest, NextResponse } from "next/server";
import { revokeAdminToken, AUTH_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value ?? "";
  if (token) await revokeAdminToken(token);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
  return res;
}
