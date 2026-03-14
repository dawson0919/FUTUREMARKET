import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { getServiceSupabase } from "@/lib/supabase";

export const alt = "The Future Market 排行榜 — 誰是預測之王？";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fontData = readFileSync(join(process.cwd(), "src/app/fonts/NotoSansSC-Bold.ttf"));

  const db = getServiceSupabase();
  const { data: top5 } = await db
    .from("profiles")
    .select("username, avatar_url, chips_balance, total_trades, wins")
    .order("chips_balance", { ascending: false })
    .limit(5);

  const medals = ["🥇", "🥈", "🥉", "4", "5"];
  const medalColors = ["#fbbf24", "#c0c0c0", "#cd7f32", "#888", "#888"];

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #000000 0%, #0a0a1a 50%, #111133 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Noto Sans SC', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid bg */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(109,93,252,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(109,93,252,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            display: "flex",
          }}
        />

        {/* Top accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #6d5dfc, #fbbf24, #22c55e, #6d5dfc)",
            display: "flex",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "32px 48px 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(109,93,252,0.15)",
              border: "1px solid rgba(109,93,252,0.4)",
              borderRadius: "999px",
              padding: "8px 20px",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#a78bfa", letterSpacing: "1px", display: "flex" }}>
              LIVE LEADERBOARD
            </span>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            marginTop: "24px",
            marginBottom: "20px",
          }}
        >
          <span style={{ fontSize: "40px", display: "flex" }}>🏆</span>
          <span style={{ fontSize: "36px", fontWeight: 900, color: "white", display: "flex" }}>
            預測排行榜 TOP 5
          </span>
        </div>

        {/* Leaderboard rows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            padding: "0 60px",
          }}
        >
          {(top5 || []).map((entry, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                background: i === 0
                  ? "linear-gradient(90deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))"
                  : "rgba(255,255,255,0.04)",
                border: i === 0
                  ? "1px solid rgba(251,191,36,0.3)"
                  : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "14px 24px",
              }}
            >
              {/* Rank */}
              <div
                style={{
                  width: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: i < 3 ? "28px" : "20px",
                  fontWeight: 900,
                  color: medalColors[i],
                }}
              >
                {medals[i]}
              </div>

              {/* Avatar circle */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6d5dfc, #4338ca)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  fontWeight: 900,
                  color: "white",
                }}
              >
                {(entry.username || "?")[0]?.toUpperCase()}
              </div>

              {/* Name */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "white", display: "flex" }}>
                  {entry.username || "匿名"}
                </span>
                <span style={{ fontSize: "13px", color: "#888", display: "flex" }}>
                  {entry.total_trades} 筆交易 · 勝 {entry.wins} 場
                </span>
              </div>

              {/* Chips */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "22px", fontWeight: 900, color: "#fbbf24", display: "flex" }}>
                  {Number(entry.chips_balance).toLocaleString()}
                </span>
                <span style={{ fontSize: "14px", color: "#a16207", fontWeight: 700, display: "flex" }}>
                  chips
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "auto",
            marginBottom: "28px",
            gap: "24px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #6d5dfc, #4338ca)",
              borderRadius: "12px",
              padding: "12px 36px",
              fontSize: "20px",
              fontWeight: 900,
              color: "white",
              display: "flex",
            }}
          >
            免費加入，挑戰排行榜！
          </div>
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
