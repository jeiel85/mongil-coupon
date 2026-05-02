import type { RedeemResult } from "./schemas";

const NETMARBLE_COUPON_URL = "https://coupon.netmarble.com/api/coupon/reward";

interface NetmarbleSuccessResponse {
  errorCode: 200;
  errorMessage: "SUCCESS";
  success: true;
  rewardType: string;
  groupName: string;
  resultData: Array<{
    slotNumber: number;
    products: Array<{
      productName: string;
      productImageUrl: string;
      groupProductId: string;
      quantity: number;
      userSelectionRate: number;
    }>;
  }>;
}

interface NetmarbleErrorResponse {
  errorCode: number;
  errorMessage: string;
  errorCause: string | null;
  httpStatus: number;
}

type NetmarbleResponse = NetmarbleSuccessResponse | NetmarbleErrorResponse;

export async function redeemCoupon(
  memberNo: string,
  code: string
): Promise<RedeemResult> {
  const url = new URL(NETMARBLE_COUPON_URL);
  url.searchParams.set("gameCode", "monster2");
  url.searchParams.set("couponCode", code);
  url.searchParams.set("langCd", "KO_KR");
  url.searchParams.set("pid", memberNo);

  let data: NetmarbleResponse;

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Referer: "https://coupon.netmarble.com/monster2",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });
    data = (await res.json()) as NetmarbleResponse;
  } catch {
    return { code, status: "error", message: "네트워크 오류가 발생했습니다." };
  }

  if ("success" in data && data.success) {
    const images = data.resultData?.flatMap((slot) =>
      slot.products.map((p) => p.productImageUrl)
    ) ?? [];
    return { code, status: "success", message: "등록 완료!", images };
  }

  const err = data as NetmarbleErrorResponse;
  switch (err.errorCode) {
    case 24004:
      return { code, status: "already_redeemed", message: "이미 등록된 코드입니다." };
    case 24002:
      return { code, status: "invalid_code", message: "잘못된 쿠폰 코드입니다." };
    case 24003:
      return { code, status: "expired", message: "만료된 쿠폰 코드입니다." };
    default:
      const msg = err.errorMessage || err.errorCause || "알 수 없는 오류가 발생했습니다.";
      return {
        code,
        status: "error",
        message: `${msg} (코드: ${err.errorCode ?? "unknown"})`,
      };
  }
}
