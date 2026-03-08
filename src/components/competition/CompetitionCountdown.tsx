"use client";

import { useState, useEffect } from "react";

const COMPETITION_END = new Date("2026-04-10T00:00:00Z");

export function CompetitionCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    function calc() {
      const diff = COMPETITION_END.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        ended: false,
      });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return null;
  if (timeLeft.ended) return <span className="text-amber-400 font-bold text-sm">比賽已結束</span>;

  return (
    <div className="flex items-center gap-1">
      <TimeBlock value={timeLeft.days} label="天" />
      <Colon />
      <TimeBlock value={timeLeft.hours} label="時" />
      <Colon />
      <TimeBlock value={timeLeft.minutes} label="分" />
      <Colon />
      <TimeBlock value={timeLeft.seconds} label="秒" />
    </div>
  );
}

function Colon() {
  return <span className="text-amber-500 font-bold text-xs pb-2">:</span>;
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-black/40 border border-amber-500/30 rounded-md px-1.5 py-1 min-w-[34px]">
      <span className="text-amber-200 font-bold text-sm leading-none tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-amber-600 text-[9px] font-semibold mt-0.5">{label}</span>
    </div>
  );
}
