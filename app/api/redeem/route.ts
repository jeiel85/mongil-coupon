import { NextRequest, NextResponse } from "next/server";
import { redeemCoupon } from "@/lib/netmarble";
import { RedeemRequestSchema } from "@/lib/schemas";
import { rateLimit } from "@/lib/ratelimit";

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
  return NextResponse.json(result);
}
