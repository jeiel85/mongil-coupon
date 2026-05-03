import { NextRequest, NextResponse } from "next/server";
import staticCodes from "@/data/codes.json";
import { verifyAdminToken, AUTH_COOKIE } from "@/lib/auth";
import { getVisibleCodes } from "@/lib/codes";
import { kv } from "@/lib/kv";
import type { Code } from "@/lib/schemas";

export const dynamic = "force-dynamic";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value ?? "";
  return verifyAdminToken(token);
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const codes = await getVisibleCodes();
  return NextResponse.json(codes);
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const code = (body as { code?: string }).code?.trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "코드가 필요합니다." }, { status: 400 });
  }

  const community = (await kv.get<Code[]>("community_codes")) ?? [];
  const filteredCommunity = community.filter(
    (item) => item.code.toUpperCase() !== code
  );
  const removedCommunityCount = community.length - filteredCommunity.length;

  if (removedCommunityCount > 0) {
    await kv.set("community_codes", filteredCommunity);
  }

  const isStaticCode = (staticCodes as Code[]).some(
    (item) => item.code.toUpperCase() === code
  );
  if (isStaticCode) {
    await kv.sadd("expired_codes", code);
  }

  if (removedCommunityCount === 0 && !isStaticCode) {
    return NextResponse.json(
      { error: "삭제할 코드를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: isStaticCode
      ? "공식 코드를 숨김 처리했습니다."
      : "커뮤니티 코드를 삭제했습니다.",
  });
}
