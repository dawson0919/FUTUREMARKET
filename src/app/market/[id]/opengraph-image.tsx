import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const alt = "FutureMarket 預測市場";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INSTRUMENT_COLORS: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  PAXG: "#D4AF37",
  NQ: "#00C853",
  ES: "#2196F3",
};

async function loadFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const API = `https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@700;900&text=${encodeURIComponent(text)}&display=swap`;
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

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let title = "FutureMarket Prediction Market";
  let color = "#6d5dfc";
  let yesPercent = 50;
  let hasCJK = false;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: market } = await supabase
      .from("markets")
      .select("*, instrument:instruments(*)")
      .eq("id", id)
      .single();

    if (market) {
      const inst = Array.isArray(market.instrument)
        ? market.instrument[0]
        : market.instrument;
      const symbol = inst?.symbol || "";
      color = INSTRUMENT_COLORS[symbol] || "#6d5dfc";
      const total = market.yes_pool + market.no_pool;
      yesPercent = total > 0 ? Math.round((market.yes_pool / total) * 100) : 50;

      // Try to load CJK font for market title
      const allText = `${market.title}漲跌是否免費籌碼投注立即加入預測`;
      const fontData = await loadFont(allText);
      if (fontData) {
        hasCJK = true;
        title = market.title;

        const isUpdown = title.includes("漲還是跌");

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
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: color,
                  display: "flex",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "48px",
                }}
              >
                <div
                  style={{
                    background: "#6d5dfc",
                    borderRadius: "12px",
                    width: "48px",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    fontWeight: 900,
                    color: "white",
                  }}
                >
                  FM
                </div>
                <span style={{ fontSize: "28px", fontWeight: 700, color: "#888", display: "flex" }}>
                  FutureMarket
                </span>
              </div>
              <div
                style={{
                  fontSize: "52px",
                  fontWeight: 800,
                  color: "white",
                  marginBottom: "32px",
                  textAlign: "center",
                  lineHeight: 1.3,
                  maxWidth: "900px",
                  display: "flex",
                }}
              >
                {title}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                  marginBottom: "24px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      background: "#22c55e",
                      borderRadius: "8px",
                      padding: "8px 24px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "28px", fontWeight: 800, color: "white", display: "flex" }}>
                      {isUpdown ? "漲" : "是"} {yesPercent}%
                    </span>
                  </div>
                  <div
                    style={{
                      background: "#ef4444",
                      borderRadius: "8px",
                      padding: "8px 24px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "28px", fontWeight: 800, color: "white", display: "flex" }}>
                      {isUpdown ? "跌" : "否"} {100 - yesPercent}%
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: "22px", color: "#666", display: "flex" }}>
                免費籌碼投注，立即加入預測！
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "28px",
                  display: "flex",
                  color: "#444",
                  fontSize: "16px",
                }}
              >
                futuremarket.app
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
    }
  } catch {
    // fallback to English version below
  }

  // English fallback (no CJK font needed)
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
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: color,
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              background: "#6d5dfc",
              borderRadius: "12px",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 900,
              color: "white",
            }}
          >
            FM
          </div>
          <span style={{ fontSize: "28px", fontWeight: 700, color: "#888", display: "flex" }}>
            FutureMarket
          </span>
        </div>
        <div
          style={{
            fontSize: "52px",
            fontWeight: 800,
            color: "white",
            marginBottom: "32px",
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: "900px",
            display: "flex",
          }}
        >
          Prediction Market
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                background: "#22c55e",
                borderRadius: "8px",
                padding: "8px 24px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "28px", fontWeight: 800, color: "white", display: "flex" }}>
                YES {yesPercent}%
              </span>
            </div>
            <div
              style={{
                background: "#ef4444",
                borderRadius: "8px",
                padding: "8px 24px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "28px", fontWeight: 800, color: "white", display: "flex" }}>
                NO {100 - yesPercent}%
              </span>
            </div>
          </div>
        </div>
        <div style={{ fontSize: "22px", color: "#666", display: "flex" }}>
          Free chips. Daily predictions. Join now!
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "28px",
            display: "flex",
            color: "#444",
            fontSize: "16px",
          }}
        >
          futuremarket.app
        </div>
      </div>
    ),
    { ...size }
  );
}
