import { NextRequest, NextResponse } from "next/server";
import staticCodes from "@/data/codes.json";
import { kv } from "@/lib/kv";
import { z } from "zod";
import type { Code } from "@/lib/schemas";

export const dynamic = "force-dynamic";

const CodeInputSchema = z.object({
  code: z.string().min(1).max(64),
});

export async function GET() {
  const [community, expired, overrides] = await Promise.all([
    kv.get<Code[]>("community_codes"),
    kv.smembers("expired_codes"),
    kv.hgetall<Record<string, string>>("reward_overrides"),
  ]);

  const communityCodes = (community ?? []).filter(
    (cc) =>
      !(staticCodes as Code[]).some(
        (sc) => sc.code.toUpperCase() === cc.code.toUpperCase()
      )
  );
  const expiredSet = new Set((expired ?? []).map((c) => c.toUpperCase()));
  const rewardOverrides = overrides ?? {};

  const allCodes = [...(staticCodes as Code[]), ...communityCodes]
    .filter((c) => !expiredSet.has(c.code.toUpperCase()))
    .map((c) => {
      const upper = c.code.toUpperCase();
      if (rewardOverrides[upper] && c.reward === "미확인") {
        return { ...c, reward: rewardOverrides[upper] };
      }
      return c;
    });

  return NextResponse.json(allCodes, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const parsed = CodeInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "코드가 필요합니다." }, { status: 400 });
  }

  const upper = parsed.data.code.trim().toUpperCase();

  // 이미 만료된 코드인지 확인
  const isExpired = await kv.sismember("expired_codes", upper);
  if (isExpired) {
    return NextResponse.json({ added: false, message: "이미 만료된 코드입니다." });
  }

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
