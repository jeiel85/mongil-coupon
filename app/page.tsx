import { MainContent } from "@/components/MainContent";
import { getVisibleCodes } from "@/lib/codes";

export const dynamic = "force-dynamic";

export default async function Home() {
  const codes = await getVisibleCodes();
  return <MainContent codes={codes} />;
}
