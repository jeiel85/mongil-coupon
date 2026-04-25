import { NextRequest, NextResponse } from "next/server";
import staticCodes from "@/data/codes.json";
import { kv } from "@/lib/kv";
import type { Code } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  const community = (await kv.get<Code[]>("community_codes")) ?? [];
  return NextResponse.json([...(staticCodes as Code[]), ...community]);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { code } = body as { code?: string };
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "코드가 필요합니다." }, { status: 400 });
  }

  const upper = code.trim().toUpperCase();

  const alreadyStatic = (staticCodes as Code[]).some(
    (c) => c.code.toUpperCase() === upper
  );
  if (alreadyStatic) return NextResponse.json({ added: false });

  const community = (await kv.get<Code[]>("community_codes")) ?? [];
  const alreadyCommunity = community.some((c) => c.code.toUpperCase() === upper);
  if (alreadyCommunity) return NextResponse.json({ added: false });

  const newCode: Code = {
    code: upper,
    reward: "미확인",
    addedAt: new Date().toISOString().slice(0, 10),
    issuedAt: null,
    expiresAt: null,
    status: "active",
    source: "community",
  };
  community.push(newCode);
  await kv.set("community_codes", community);

  return NextResponse.json({ added: true });
}
