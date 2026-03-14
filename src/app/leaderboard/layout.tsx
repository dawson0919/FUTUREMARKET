import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "排行榜 | The Future Market",
  description: "誰是預測之王？查看即時排行榜，免費籌碼競技，每日結算！挑戰 TOP 1 贏取 500 USDT 獎金！",
  openGraph: {
    title: "🏆 The Future Market 排行榜 — 誰是預測之王？",
    description: "免費籌碼競技，每日結算！BTC、ETH、黃金、美股期貨預測市場。挑戰 TOP 1 贏取 500 USDT！",
    type: "website",
  },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
