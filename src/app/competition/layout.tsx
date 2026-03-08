import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "第一屆刀神的海期教室預測投注比賽 — 冠軍獎金 500 USDT",
  description: "2026/3/10 開始，4/10 結算。起始籌碼 100,000，預測期貨與加密貨幣收盤價，排名第一獲得 500 USDT 獎金！立即加入 The Future Market。",
  openGraph: {
    title: "第一屆刀神的海期教室預測投注比賽",
    description: "冠軍獎金 500 USDT｜3/10 開始 → 4/10 結算｜免費參加",
    type: "website",
  },
};

export default function CompetitionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
