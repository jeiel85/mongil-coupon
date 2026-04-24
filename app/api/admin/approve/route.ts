import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, AUTH_COOKIE } from "@/lib/auth";
import { kv } from "@/lib/kv";
import type { SuggestionRecord, Code } from "@/lib/schemas";

const GITHUB_API = "https://api.github.com";

async function getCodesFile() {
  const owner = process.env.GITHUB_OWNER!;
  const repo = process.env.GITHUB_REPO!;
  const token = process.env.GITHUB_TOKEN!;

  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/data/codes.json`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
  if (!res.ok) throw new Error("codes.json 파일을 가져오지 못했습니다.");
  const data = (await res.json()) as { content: string; sha: string };
  const codes = JSON.parse(
    Buffer.from(data.content, "base64").toString("utf-8")
  ) as Code[];
  return { codes, sha: data.sha };
}

async function updateCodesFile(codes: Code[], sha: string, message: string) {
  const owner = process.env.GITHUB_OWNER!;
  const repo = process.env.GITHUB_REPO!;
  const token = process.env.GITHUB_TOKEN!;

  const content = Buffer.from(
    JSON.stringify(codes, null, 2) + "\n"
  ).toString("base64");

  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/data/codes.json`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, content, sha }),
    }
  );
  if (!res.ok) throw new Error("codes.json 업데이트에 실패했습니다.");
}

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
    const { codes, sha } = await getCodesFile();
    const alreadyExists = codes.some(
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
      codes.push(newCode);
      await updateCodesFile(
        codes,
        sha,
        `feat: 커뮤니티 제안 코드 "${record.code}" 추가 (${record.voteCount}표)`
      );
    }
    await kv.set(`suggestion:${id}`, { ...record, status: "approved" });
    await kv.zrem("suggestions:pending", id);
    return NextResponse.json({
      ok: true,
      message: "승인 완료. Vercel 재배포가 시작됩니다.",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "GitHub 업데이트 실패" },
      { status: 500 }
    );
  }
}
