import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #3b0764 0%, #6d28d9 60%, #a855f7 100%)",
          borderRadius: "14px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "22px",
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(255,255,255,0.85)",
              borderRadius: "4px",
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
                border: "2px solid rgba(255,255,255,0.85)",
                background: "transparent",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: "3px",
              marginTop: "3px",
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: "5px",
                  height: "3px",
                  background: "rgba(255,255,255,0.7)",
                  borderRadius: "1px",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
