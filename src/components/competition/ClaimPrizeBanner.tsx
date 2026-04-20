"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface UnclaimedPrize {
  edition: number;
  title: string;
  prize: string;
  end_date: string;
  claimed_at: string | null;
}

export function ClaimPrizeBanner() {
  const { status } = useSession();
  const [unclaimed, setUnclaimed] = useState<UnclaimedPrize[]>([]);
  const [claiming, setClaiming] = useState<number | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/prize-claim")
      .then((r) => r.json())
      .then((d) => setUnclaimed(d.unclaimed || []))
      .catch(() => {});
  }, [status]);

  async function markClaimed(edition: number) {
    setClaiming(edition);
    try {
      const res = await fetch("/api/user/prize-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edition }),
      });
      if (res.ok) {
        setUnclaimed((prev) => prev.filter((p) => p.edition !== edition));
      }
    } finally {
      setClaiming(null);
    }
  }

  if (status !== "authenticated" || unclaimed.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {unclaimed.map((p) => (
        <div
          key={p.edition}
          className="relative overflow-hidden rounded-xl border-2 border-yellow-400 bg-gradient-to-r from-yellow-600/30 via-amber-500/20 to-yellow-600/30 px-5 py-4 shadow-[0_0_30px_rgba(250,204,21,0.3)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-400/20 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-shrink-0 text-4xl animate-bounce">🏆</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-yellow-300">
                  恭喜你！冠軍獎金待領取
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/30 text-red-200 border border-red-400/40 font-bold animate-pulse">
                  未領取
                </span>
              </div>
              <p className="text-base font-bold text-yellow-50 mb-1">
                {p.title} · 獎金{" "}
                <span className="text-yellow-300 text-lg">{p.prize}</span>
              </p>
              <p className="text-sm text-yellow-100/90 leading-relaxed">
                請到
                <span className="font-bold text-yellow-200"> 明星雲學院客服 </span>
                留下你的
                <span className="font-bold text-yellow-200"> 派網（Pionex）帳號真實資料 </span>
                （註冊姓名 / UID）領取獎金。
              </p>
            </div>
            <button
              onClick={() => markClaimed(p.edition)}
              disabled={claiming === p.edition}
              className="flex-shrink-0 px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-yellow-950 font-bold text-sm transition-colors whitespace-nowrap"
            >
              {claiming === p.edition ? "處理中..." : "我已聯繫客服"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
