import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { rateLimit, hashIp } from "@/lib/ratelimit";
import { sendNotification } from "@/lib/notify";
import { SuggestionSchema, type SuggestionRecord, type Code } from "@/lib/schemas";
import { verifyAdminToken, AUTH_COOKIE } from "@/lib/auth";
import staticCodes from "@/data/codes.json";

const THRESHOLD = parseInt(process.env.SUGGESTION_THRESHOLD ?? "3", 10);

function sanitize(str: string): string {
  return str.replace(/[<>"'&]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "&": "&amp;" }[c] ?? c)
  );
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value ?? "";
  if (!(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  const ids = await kv.zrange<string[]>("suggestions:pending", 0, -1, { rev: true });
  if (!ids || ids.length === 0) return NextResponse.json([]);
  const records = await Promise.all(
    ids.map((id) => kv.get<SuggestionRecord>(`suggestion:${id}`))
  );
  return NextResponse.json(records.filter(Boolean));
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const rl = await rateLimit("suggest", ip, 5, 3600);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "제안 횟수를 초과했습니다. 1시간 후 다시 시도해 주세요." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const parsed = SuggestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "잘못된 입력입니다." },
      { status: 400 }
    );
  }

  const { code, reward } = parsed.data;
  const upperCode = code.toUpperCase();
  const cleanCode = sanitize(upperCode);
  const cleanReward = sanitize(reward ?? "");
  const ipHash = hashIp(ip);

  // 이미 등록된 코드인지 확인
  const isStatic = (staticCodes as Code[]).some(
    (c) => c.code.toUpperCase() === upperCode
  );
  const [community, isExpired] = await Promise.all([
    kv.get<Code[]>("community_codes"),
    kv.sismember("expired_codes", upperCode),
  ]);
  const isCommunity = (community ?? []).some((c) => c.code.toUpperCase() === upperCode);

  if (isExpired) {
    return NextResponse.json(
      { error: "이미 만료된 것으로 확인된 코드입니다." },
      { status: 400 }
    );
  }

  if (isStatic || isCommunity) {
    return NextResponse.json(
      { error: "이미 등록되어 있는 코드입니다." },
      { status: 400 }
    );
  }

  // 이미 제안된 동일 코드가 있으면 투표 처리
  const existingIds = await kv.zrange<string[]>("suggestions:pending", 0, -1);
  for (const id of existingIds ?? []) {
    const record = await kv.get<SuggestionRecord>(`suggestion:${id}`);
    if (record?.code === cleanCode && record.status === "pending") {
      const added = await kv.sadd(`suggestion:votes:${id}`, ipHash);
      if (added === 0) {
        return NextResponse.json({ message: "이미 투표하셨습니다." });
      }
      const newCount = record.voteCount + 1;
      await kv.set(`suggestion:${id}`, { ...record, voteCount: newCount });
      await kv.zadd("suggestions:pending", { score: newCount, member: id });
      if (newCount >= THRESHOLD) {
        await sendNotification(
          "몬길 쿠폰 제안 알림",
          `코드 "${cleanCode}" 제안이 ${newCount}표를 받았습니다. 관리자 검토가 필요합니다.`
        );
      }
      return NextResponse.json({ message: "투표가 반영되었습니다." });
    }
  }

  // 신규 제안
  const id = crypto.randomUUID();
  const record: SuggestionRecord = {
    id,
    code: cleanCode,
    reward: cleanReward,
    status: "pending",
    voteCount: 1,
    createdAt: new Date().toISOString(),
  };
  await kv.set(`suggestion:${id}`, record);
  await kv.zadd("suggestions:pending", { score: 1, member: id });
  await kv.sadd(`suggestion:votes:${id}`, ipHash);

  return NextResponse.json({ message: "제안이 등록되었습니다." }, { status: 201 });
}
