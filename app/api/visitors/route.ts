import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";

export async function GET() {
  const count = (await kv.get<number>("visitor_count")) ?? 0;
  return NextResponse.json({ count });
}

export async function POST() {
  const count = await kv.incr("visitor_count");
  return NextResponse.json({ count });
}
