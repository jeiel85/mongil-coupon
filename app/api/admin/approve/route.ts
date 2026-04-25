import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, AUTH_COOKIE } from "@/lib/auth";
import { kv } from "@/lib/kv";
import type { SuggestionRecord, Code } from "@/lib/schemas";
import staticCodes from "@/data/codes.json";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value ?? "";
  if (!(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { id, action } = body as { id: string; action: "approve" | "reject" };
  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "잘못된 파라미터입니다." }, { status: 400 });
  }

  const record = await kv.get<SuggestionRecord>(`suggestion:${id}`);
  if (!record || record.status !== "pending") {
    return NextResponse.json({ error: "제안을 찾을 수 없습니다." }, { status: 404 });
  }

  if (action === "reject") {
    await kv.set(`suggestion:${id}`, { ...record, status: "rejected" });
    await kv.zrem("suggestions:pending", id);
    return NextResponse.json({ ok: true, message: "거부되었습니다." });
  }

  try {
    const community = (await kv.get<Code[]>("community_codes")) ?? [];
    const allCodes = [...(staticCodes as Code[]), ...community];
    const alreadyExists = allCodes.some(
      (c) => c.code.toUpperCase() === record.code.toUpperCase()
    );
    if (!alreadyExists) {
      const newCode: Code = {
        code: record.code,
        reward: record.reward || "미확인",
        addedAt: new Date().toISOString().slice(0, 10),
        issuedAt: null,
        expiresAt: null,
        status: "active",
        source: "community",
      };
      community.push(newCode);
      await kv.set("community_codes", community);
    }
    await kv.set(`suggestion:${id}`, { ...record, status: "approved" });
    await kv.zrem("suggestions:pending", id);
    return NextResponse.json({ ok: true, message: "승인 완료." });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "저장 실패" },
      { status: 500 }
    );
  }
}
