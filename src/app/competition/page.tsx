"use client";

import Link from "next/link";
import { Trophy, Calendar, Coins, Target, Users, TrendingUp, Award, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CompetitionCountdown } from "@/components/competition/CompetitionCountdown";

export default function CompetitionPage() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero card — screenshot-friendly */}
      <Card className="relative overflow-hidden border-amber-500/40 bg-gradient-to-br from-amber-950/80 via-yellow-950/50 to-black mb-8 p-0">
        {/* Top bar */}
        <div className="h-1.5 bg-gradient-to-r from-amber-900 via-amber-400 to-amber-900" />

        <div className="px-8 py-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-widest uppercase mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            第一屆比賽 · 進行中
          </div>

          {/* Trophy */}
          <div className="text-7xl mb-4">🏆</div>

          {/* Title */}
          <h1 className="text-3xl font-black text-amber-300 mb-1 leading-tight">
            刀神的海期教室
          </h1>
          <h2 className="text-xl font-bold text-white mb-2">預測投注比賽</h2>
          <p className="text-amber-500/80 text-sm mb-4">THE FUTURE MARKET · 第一屆</p>
          <div className="flex flex-col items-center gap-1 mb-8">
            <span className="text-xs text-amber-600 font-semibold uppercase tracking-wider">距離結束</span>
            <CompetitionCountdown />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="rounded-xl bg-black/40 border border-amber-500/20 px-3 py-4">
              <Calendar className="h-4 w-4 text-amber-500 mx-auto mb-1.5" />
              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1">比賽期間</p>
              <p className="text-sm font-bold text-white">3/10 – 4/10</p>
            </div>
            <div className="rounded-xl bg-black/40 border border-amber-400/40 px-3 py-4 ring-1 ring-amber-400/20">
              <Trophy className="h-4 w-4 text-amber-400 mx-auto mb-1.5" />
              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1">冠軍獎金</p>
              <p className="text-base font-black text-amber-300">500 USDT</p>
            </div>
            <div className="rounded-xl bg-black/40 border border-amber-500/20 px-3 py-4">
              <Coins className="h-4 w-4 text-amber-500 mx-auto mb-1.5" />
              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1">起始籌碼</p>
              <p className="text-sm font-bold text-white">100,000</p>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-bold text-base transition-all"
          >
            <TrendingUp className="h-5 w-5" />
            立即開始預測
          </Link>
        </div>

        {/* Bottom bar */}
        <div className="h-1 bg-gradient-to-r from-amber-900 via-amber-400 to-amber-900" />
      </Card>

      {/* Announcement */}
      <Card className="border-blue-500/40 bg-blue-950/30 mb-8 p-5">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-300 mb-1">公告：3/10 籌碼全面重置</p>
            <p className="text-xs text-blue-400/80 leading-relaxed">
              為確保比賽公平性，所有玩家籌碼已於 3 月 10 日統一重置為 100,000 起始籌碼。比賽正式開始，3/10 之前的籌碼變動不列入比賽排名計算。祝大家好運！
            </p>
          </div>
        </div>
      </Card>

      {/* Rules */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Target className="h-5 w-5 text-amber-400" />
          比賽規則
        </h3>

        {[
          {
            icon: <Calendar className="h-4 w-4 text-amber-400" />,
            title: "比賽時間",
            desc: "2026 年 3 月 10 日起至 4 月 10 日，台灣時間 08:00 結算"
          },
          {
            icon: <Coins className="h-4 w-4 text-amber-400" />,
            title: "起始資金",
            desc: "比賽開始當天所有參賽者籌碼統一重置為 100,000，公平起跑"
          },
          {
            icon: <TrendingUp className="h-4 w-4 text-amber-400" />,
            title: "預測標的",
            desc: "可預測 BTC、ETH、PAXG 加密貨幣，以及 NQ、ES 海期指數期貨每日收盤價"
          },
          {
            icon: <Award className="h-4 w-4 text-amber-400" />,
            title: "排名依據",
            desc: "以 4 月 10 日結算後的排行榜籌碼排名為準，第一名獲得冠軍"
          },
          {
            icon: <Users className="h-4 w-4 text-amber-400" />,
            title: "獎金發放",
            desc: "冠軍 500 USDT，由主辦方「刀神的海期教室」聯繫冠軍，以 PIONEX 派網帳號 UID 收款"
          },
          {
            icon: <Calendar className="h-4 w-4 text-amber-400" />,
            title: "領獎期限",
            desc: "冠軍須於結算後 7 日內回覆主辦方並提供 PIONEX 派網帳號 UID，逾期視為放棄獎金"
          },
        ].map((rule, i) => (
          <div key={i} className="flex gap-3 rounded-xl bg-card border border-border/50 px-4 py-3">
            <div className="flex-shrink-0 mt-0.5">{rule.icon}</div>
            <div>
              <p className="text-sm font-semibold mb-0.5">{rule.title}</p>
              <p className="text-xs text-muted-foreground">{rule.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center">
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
        >
          <Trophy className="h-4 w-4" />
          查看即時排行榜
        </Link>
      </div>
    </div>
  );
}
