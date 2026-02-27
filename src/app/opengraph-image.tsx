import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const alt = "FutureMarket - 你今天預測了嗎？";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fontData = readFileSync(join(process.cwd(), "src/app/fonts/NotoSansSC-Bold.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #000000 0%, #0a0a1a 50%, #111133 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Noto Sans SC', sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative grid lines */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(109,93,252,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(109,93,252,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            display: "flex",
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #6d5dfc, #22c55e, #F7931A, #ef4444)",
            display: "flex",
          }}
        />

        {/* Logo icon + text */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #6d5dfc, #4338ca)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(109,93,252,0.4)",
              fontSize: "32px",
              fontWeight: 900,
              color: "white",
            }}
          >
            FM
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "52px",
                fontWeight: 900,
                color: "white",
                letterSpacing: "-2px",
                lineHeight: 1,
              }}
            >
              FUTUREMARKET
            </span>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 500,
                color: "#6d5dfc",
                letterSpacing: "4px",
                marginTop: "4px",
              }}
            >
              PREDICTION MARKET
            </span>
          </div>
        </div>

        {/* Title - Slogan */}
        <div
          style={{
            fontSize: "48px",
            fontWeight: 900,
            color: "white",
            marginBottom: "16px",
            textAlign: "center",
            lineHeight: 1.3,
            display: "flex",
          }}
        >
          你今天預測了嗎？
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "24px",
            color: "#888",
            marginBottom: "48px",
            textAlign: "center",
            display: "flex",
          }}
        >
          免費籌碼競技，每日結算，登上排行榜！
        </div>

        {/* Instrument pills */}
        <div
          style={{
            display: "flex",
            gap: "16px",
          }}
        >
          {[
            { symbol: "BTC", color: "#F7931A" },
            { symbol: "ETH", color: "#627EEA" },
            { symbol: "PAXG", color: "#D4AF37" },
            { symbol: "NQ", color: "#00C853" },
            { symbol: "ES", color: "#2196F3" },
          ].map((inst) => (
            <div
              key={inst.symbol}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "12px 20px",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: inst.color,
                  display: "flex",
                }}
              />
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "white",
                  display: "flex",
                }}
              >
                {inst.symbol}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            display: "flex",
            gap: "24px",
            color: "#555",
            fontSize: "18px",
          }}
        >
          <span style={{ display: "flex" }}>每日預測</span>
          <span style={{ display: "flex" }}>即時賠率</span>
          <span style={{ display: "flex" }}>排行榜競技</span>
          <span style={{ display: "flex" }}>免費籌碼</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Sans SC",
          data: fontData,
          weight: 700 as const,
          style: "normal" as const,
        },
      ],
    }
  );
}
