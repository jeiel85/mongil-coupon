import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { rateLimit } from "@/lib/ratelimit";

export async function GET() {
  const count = (await kv.get<number>("visitor_count")) ?? 0;
  return NextResponse.json({ count });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await rateLimit("visitor", ip, 1, 86400);
  if (!rl.allowed) {
    const count = (await kv.get<number>("visitor_count")) ?? 0;
    return NextResponse.json({ count });
  }
  const count = await kv.incr("visitor_count");
  return NextResponse.json({ count });
}
