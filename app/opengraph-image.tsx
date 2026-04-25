import { ImageResponse } from "next/og";

export const alt = "몬길 쿠폰 자동 입력기";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css?family=Noto+Sans+KR:700",
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }
    ).then((r) => r.text());
    const url = css.match(/url\(([^)]+)\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OgImage() {
  const fontData = await loadFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0d0921",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 그라디언트 원형 */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(109,40,217,0.5) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-60px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)",
          }}
        />

        {/* 메인 컨텐츠 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            padding: "80px 100px",
            gap: "0px",
          }}
        >
          {/* 태그 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                background: "rgba(109,40,217,0.6)",
                border: "1px solid rgba(168,85,247,0.6)",
                borderRadius: "999px",
                padding: "6px 20px",
                color: "#d8b4fe",
                fontSize: "22px",
                fontFamily: fontData ? "NotoSansKR" : "sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              몬스터길들이기
            </div>
          </div>

          {/* 제목 */}
          <div
            style={{
              color: "#ffffff",
              fontSize: "80px",
              fontWeight: 700,
              fontFamily: fontData ? "NotoSansKR" : "sans-serif",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: "28px",
            }}
          >
            쿠폰 자동 입력기
          </div>

          {/* 설명 */}
          <div
            style={{
              color: "#a78bfa",
              fontSize: "30px",
              fontFamily: fontData ? "NotoSansKR" : "sans-serif",
              lineHeight: 1.5,
            }}
          >
            공개된 모든 쿠폰을 한 번에 자동으로 등록해드립니다
          </div>
        </div>

        {/* 쿠폰 점선 구분선 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 100px",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background:
                "repeating-linear-gradient(90deg, rgba(168,85,247,0.5) 0px, rgba(168,85,247,0.5) 12px, transparent 12px, transparent 22px)",
            }}
          />
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "#0d0921",
              border: "1px solid rgba(168,85,247,0.5)",
              margin: "0 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "rgba(168,85,247,0.5)",
              }}
            />
          </div>
          <div
            style={{
              flex: 1,
              height: "1px",
              background:
                "repeating-linear-gradient(90deg, rgba(168,85,247,0.5) 0px, rgba(168,85,247,0.5) 12px, transparent 12px, transparent 22px)",
            }}
          />
        </div>

        {/* URL */}
        <div
          style={{
            display: "flex",
            padding: "0 100px 56px",
            color: "rgba(255,255,255,0.4)",
            fontSize: "24px",
            fontFamily: "monospace",
            letterSpacing: "0.05em",
          }}
        >
          mongil-coupon.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
      ...(fontData
        ? {
            fonts: [
              {
                name: "NotoSansKR",
                data: fontData,
                weight: 700,
              },
            ],
          }
        : {}),
    }
  );
}
