import { MainContent } from "@/components/MainContent";
import type { Code } from "@/lib/schemas";
import staticCodes from "@/data/codes.json";
import { kv } from "@/lib/kv";

export const dynamic = "force-dynamic";

export default async function Home() {
  const community = (await kv.get<Code[]>("community_codes")) ?? [];
  const codes = [...(staticCodes as Code[]), ...community];
  return <MainContent codes={codes} />;
}
