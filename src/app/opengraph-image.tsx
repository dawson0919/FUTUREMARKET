import { ImageResponse } from "next/og";

export const alt = "FutureMarket";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          position: "relative",
        }}
      >
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

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "40px",
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

        {/* Tagline */}
        <div
          style={{
            fontSize: "42px",
            fontWeight: 800,
            color: "white",
            marginBottom: "20px",
            display: "flex",
          }}
        >
          Predict. Compete. Win.
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "22px",
            color: "#888",
            marginBottom: "48px",
            display: "flex",
          }}
        >
          Free chips, daily settlement, climb the leaderboard!
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

        {/* Bottom */}
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
          <span style={{ display: "flex" }}>Daily Predictions</span>
          <span style={{ display: "flex" }}>Live Odds</span>
          <span style={{ display: "flex" }}>Leaderboard</span>
          <span style={{ display: "flex" }}>Free Chips</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
