import staticCodes from "@/data/codes.json";
import { kv } from "@/lib/kv";
import type { Code } from "@/lib/schemas";

function byUpperCode(codes: Code[]): Code[] {
  return Array.from(
    new Map(codes.map((code) => [code.code.toUpperCase(), code])).values()
  );
}

export async function getVisibleCodes(): Promise<Code[]> {
  const [community, expired, overrides] = await Promise.all([
    kv.get<Code[]>("community_codes"),
    kv.smembers("expired_codes"),
    kv.hgetall<Record<string, string>>("reward_overrides"),
  ]);

  const rawCommunity = community ?? [];
  const uniqueCommunity = byUpperCode(rawCommunity);
  const staticUpperCodes = new Set(
    (staticCodes as Code[]).map((code) => code.code.toUpperCase())
  );
  const communityCodes = uniqueCommunity.filter(
    (code) => !staticUpperCodes.has(code.code.toUpperCase())
  );
  if (rawCommunity.length !== communityCodes.length) {
    await kv.set("community_codes", communityCodes);
  }

  const expiredSet = new Set((expired ?? []).map((code) => code.toUpperCase()));
  const rewardOverrides = overrides ?? {};

  return [...(staticCodes as Code[]), ...communityCodes]
    .filter((code) => !expiredSet.has(code.code.toUpperCase()))
    .map((code) => {
      const upper = code.code.toUpperCase();
      if (rewardOverrides[upper] && code.reward === "미확인") {
        return { ...code, reward: rewardOverrides[upper] };
      }
      return code;
    });
}
