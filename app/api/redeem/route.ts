import { NextRequest, NextResponse } from "next/server";
import { redeemCoupon } from "@/lib/netmarble";
import { RedeemRequestSchema, type Code } from "@/lib/schemas";
import { rateLimit } from "@/lib/ratelimit";
import { kv } from "@/lib/kv";
import staticCodes from "@/data/codes.json";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const rl = await rateLimit("redeem", ip, 15, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const parsed = RedeemRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "잘못된 입력입니다." },
      { status: 400 }
    );
  }

  const { memberNo, code } = parsed.data;
  const result = await redeemCoupon(memberNo, code);
  const upperCode = code.toUpperCase();

  // 후처리: 보상 정보 업데이트 또는 만료된 코드 삭제
  if (result.reward) {
    // 1. 커뮤니티 코드 업데이트
    const community = (await kv.get<Code[]>("community_codes")) ?? [];
    const index = community.findIndex(
      (c) => c.code.toUpperCase() === upperCode
    );
    if (index !== -1 && community[index].reward === "미확인") {
      community[index].reward = result.reward;
      await kv.set("community_codes", community);
    }

    // 2. 정적 코드 보상 오버라이드 (미확인인 경우만)
    const isStatic = (staticCodes as Code[]).some(
      (c) => c.code.toUpperCase() === upperCode && c.reward === "미확인"
    );
    if (isStatic) {
      await kv.hset("reward_overrides", { [upperCode]: result.reward });
    }
  }

  if (result.status === "expired") {
    // 만료된 코드는 블랙리스트에 추가하여 목록에서 제외되도록 함
    await kv.sadd("expired_codes", upperCode);

    const community = (await kv.get<Code[]>("community_codes")) ?? [];
    const newCommunity = community.filter(
      (c) => c.code.toUpperCase() !== upperCode
    );
    if (community.length !== newCommunity.length) {
      await kv.set("community_codes", newCommunity);
    }
  }

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
