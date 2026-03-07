import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/layout/Header";
import { ToastProvider } from "@/components/ui/toast-notification";
import { SettlementNotifier } from "@/components/layout/SettlementNotifier";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Future Market - 你今天預測了嗎？",
  description:
    "預測 BTC、ETH、黃金、Nasdaq、S&P 500 每日收盤價。免費籌碼競技，每日結算，登上排行榜！",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://futuremarket-production.up.railway.app"),
  icons: {
    icon: "/icon.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "The Future Market - 你今天預測了嗎？",
    description:
      "預測 BTC、ETH、黃金、Nasdaq、S&P 500 每日收盤價。免費籌碼競技，每日結算，登上排行榜！",
    siteName: "The Future Market",
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Future Market - 你今天預測了嗎？",
    description:
      "預測 BTC、ETH、黃金、Nasdaq、S&P 500 每日收盤價。免費籌碼競技，每日結算，登上排行榜！",
  },
  other: {
    "line:title": "The Future Market - 你今天預測了嗎？",
    "line:description": "免費籌碼預測加密貨幣與期貨收盤價，每日結算！",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        style={{ backgroundColor: "#000000", color: "#f0f0f0" }}
        suppressHydrationWarning
      >
        <Providers>
          <ToastProvider>
            <Header />
            <SettlementNotifier />
            <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
