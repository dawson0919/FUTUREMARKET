import { ImageResponse } from "next/og";

export const alt = "FutureMarket - 你今天預測了嗎？";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Collect all Chinese characters used in the image
const ALL_TEXT = "你今天預測了嗎？免費籌碼競技每日結算登上排行榜即時賠率每日預測即時賠率排行榜競技免費籌碼";

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const API = `https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@700;900&text=${encodeURIComponent(ALL_TEXT)}&display=swap`;
    const css = await fetch(API, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    }).then((res) => res.text());

    const match = css.match(/src:\s*url\((.+?)\)\s*format/);
    if (!match) return null;

    return await fetch(match[1]).then((res) => res.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function Image() {
  const fontData = await loadFont();
  const hasCJK = !!fontData;

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
          fontFamily: hasCJK ? "'Noto Sans SC', sans-serif" : "sans-serif",
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
            }}
          >
            <span style={{ fontSize: "32px", fontWeight: 900, color: "white" }}>FM</span>
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
          {hasCJK ? "你今天預測了嗎？" : "Predict. Compete. Win."}
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
          {hasCJK
            ? "免費籌碼競技，每日結算，登上排行榜！"
            : "Free chips, daily settlement, climb the leaderboard!"}
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
          {hasCJK ? (
            <>
              <span style={{ display: "flex" }}>每日預測</span>
              <span style={{ display: "flex" }}>即時賠率</span>
              <span style={{ display: "flex" }}>排行榜競技</span>
              <span style={{ display: "flex" }}>免費籌碼</span>
            </>
          ) : (
            <>
              <span style={{ display: "flex" }}>Daily Predictions</span>
              <span style={{ display: "flex" }}>Live Odds</span>
              <span style={{ display: "flex" }}>Leaderboard</span>
              <span style={{ display: "flex" }}>Free Chips</span>
            </>
          )}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: "Noto Sans SC",
              data: fontData,
              weight: 700 as const,
              style: "normal" as const,
            },
          ]
        : [],
    }
  );
}
