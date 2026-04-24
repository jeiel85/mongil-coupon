import { NextResponse } from "next/server";
import codes from "@/data/codes.json";

export async function GET() {
  return NextResponse.json(codes);
}
