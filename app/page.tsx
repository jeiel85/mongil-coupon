import { MainContent } from "@/components/MainContent";
import type { Code } from "@/lib/schemas";
import codesData from "@/data/codes.json";

export default function Home() {
  const codes = codesData as Code[];
  return <MainContent codes={codes} />;
}
