import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Header } from "@/components/layout/Header";
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
  title: "FutureMarket - 預測期貨與加密貨幣收盤價",
  description:
    "預測 BTC、ETH、黃金、Nasdaq、S&P 500 每日收盤價。免費籌碼競技，每日結算，登上排行榜！",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"),
  openGraph: {
    title: "FutureMarket - 預測期貨與加密貨幣收盤價",
    description:
      "預測 BTC、ETH、黃金、Nasdaq、S&P 500 每日收盤價。免費籌碼競技，每日結算，登上排行榜！",
    siteName: "FutureMarket",
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FutureMarket - 預測期貨與加密貨幣收盤價",
    description:
      "預測 BTC、ETH、黃金、Nasdaq、S&P 500 每日收盤價。免費籌碼競技，每日結算，登上排行榜！",
  },
  other: {
    // LINE specific
    "line:title": "FutureMarket - 預測市場",
    "line:description": "免費籌碼預測加密貨幣與期貨收盤價，每日結算！",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#6d5dfc",
          colorBackground: "#000000",
        },
      }}
    >
      <html lang="zh-TW" className="dark" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
          style={{ backgroundColor: "#000000", color: "#f0f0f0" }}
          suppressHydrationWarning
        >
          <Header />
          <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
