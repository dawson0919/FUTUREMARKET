import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const alt = "第一屆 刀神的海期教室 預測投注比賽 — 冠軍獎金 500 USDT";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fontData = readFileSync(join(process.cwd(), "src/app/fonts/NotoSansSC-Bold.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0500 0%, #1a0e00 40%, #0d0d00 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Noto Sans SC', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "600px",
            background: "radial-gradient(ellipse, rgba(251,191,36,0.12) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Gold grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(251,191,36,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.04) 1px, transparent 1px)",
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
            height: "5px",
            background: "linear-gradient(90deg, #92400e, #f59e0b, #fbbf24, #f59e0b, #92400e)",
            display: "flex",
          }}
        />

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, #92400e, #f59e0b, #fbbf24, #f59e0b, #92400e)",
            display: "flex",
          }}
        />

        {/* Site brand — top left */}
        <div
          style={{
            position: "absolute",
            top: "32px",
            left: "48px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6d5dfc, #4338ca)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 900,
              color: "white",
            }}
          >
            FM
          </div>
          <span style={{ fontSize: "18px", fontWeight: 700, color: "#888", letterSpacing: "2px", display: "flex" }}>
            THE FUTURE MARKET
          </span>
        </div>

        {/* Edition badge — top right */}
        <div
          style={{
            position: "absolute",
            top: "32px",
            right: "48px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(251,191,36,0.15)",
            border: "1px solid rgba(251,191,36,0.4)",
            borderRadius: "999px",
            padding: "8px 20px",
          }}
        >
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fbbf24", display: "flex" }} />
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#fbbf24", letterSpacing: "2px", display: "flex" }}>
            第一屆比賽
          </span>
        </div>

        {/* Trophy */}
        <div style={{ fontSize: "80px", marginBottom: "20px", display: "flex" }}>🏆</div>

        {/* Main title */}
        <div
          style={{
            fontSize: "52px",
            fontWeight: 900,
            color: "#fbbf24",
            textAlign: "center",
            lineHeight: 1.2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            marginBottom: "12px",
          }}
        >
          <span style={{ display: "flex" }}>刀神的海期教室</span>
          <span style={{ display: "flex", fontSize: "38px", color: "white" }}>預測投注比賽</span>
        </div>

        {/* Divider */}
        <div
          style={{
            width: "200px",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #f59e0b, transparent)",
            marginBottom: "32px",
            display: "flex",
          }}
        />

        {/* Info row */}
        <div style={{ display: "flex", gap: "32px", marginBottom: "36px" }}>
          {[
            { label: "比賽期間", value: "3/10 – 4/10" },
            { label: "冠軍獎金", value: "500 USDT" },
            { label: "評分依據", value: "最終籌碼排名" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(251,191,36,0.2)",
                borderRadius: "16px",
                padding: "16px 28px",
                minWidth: "180px",
              }}
            >
              <span style={{ fontSize: "13px", color: "#a16207", fontWeight: 700, letterSpacing: "1px", display: "flex" }}>
                {item.label}
              </span>
              <span style={{ fontSize: "26px", fontWeight: 900, color: "white", display: "flex" }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            background: "linear-gradient(135deg, #92400e, #b45309)",
            borderRadius: "16px",
            padding: "16px 48px",
            fontSize: "24px",
            fontWeight: 900,
            color: "white",
            letterSpacing: "2px",
            display: "flex",
          }}
        >
          立即加入 · 免費報名
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            display: "flex",
            fontSize: "16px",
            color: "#555",
          }}
        >
          futuremarket-production.up.railway.app
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
